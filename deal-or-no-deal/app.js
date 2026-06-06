/* ============================================================
   DEAL OR NO DEAL  —  senior-friendly group game
   Selectable number of briefcases, classic cash board,
   auto-calculated Banker offers.
   ============================================================ */

/* The classic 26-case US money board (in dollars). */
const MASTER_VALUES = [
  0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750,
  1000, 5000, 10000, 25000, 50000, 75000, 100000,
  200000, 300000, 400000, 500000, 750000, 1000000
];

const MIN_CASES = 4;
const MAX_CASES = MASTER_VALUES.length; // 26

/* ---------- State ---------- */
let setupCount = 26;
let game = null;

/* ---------- DOM helpers ---------- */
const $ = (id) => document.getElementById(id);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Choose `n` values spread across the master board, always keeping
   the smallest ($0.01) and largest ($1,000,000). */
function selectValues(n) {
  const master = MASTER_VALUES;
  if (n >= master.length) return master.slice();
  if (n <= 2) return [master[0], master[master.length - 1]].slice(0, n);
  const result = [master[0]];
  const inner = master.slice(1, master.length - 1); // 24 mid values
  const need = n - 2;
  for (let i = 0; i < need; i++) {
    const idx = Math.round((i * (inner.length - 1)) / (need - 1));
    result.push(inner[idx]);
  }
  result.push(master[master.length - 1]);
  return result;
}

/* Build the per-round schedule of how many cases to open.
   Mirrors the show: a descending run (k, k-1, ... 1) then
   extra single-case rounds for whatever is left over.
   `remaining` = total cases minus the player's own case. */
function buildSchedule(remaining) {
  let k = 0;
  while (((k + 1) * (k + 2)) / 2 <= remaining) k++;
  const sched = [];
  for (let v = k; v >= 1; v--) sched.push(v);
  let leftover = remaining - (k * (k + 1)) / 2;
  while (leftover > 0) { sched.push(1); leftover--; }
  return sched;
}

function formatMoney(v) {
  if (v < 1) return '$' + v.toFixed(2);           // $0.01
  return '$' + Math.round(v).toLocaleString('en-US');
}

/* Round a banker offer to a friendly figure. */
function roundOffer(v) {
  if (v >= 100000) return Math.round(v / 1000) * 1000;
  if (v >= 10000)  return Math.round(v / 500) * 500;
  if (v >= 1000)   return Math.round(v / 100) * 100;
  if (v >= 100)    return Math.round(v / 10) * 10;
  if (v >= 10)     return Math.round(v);
  return Math.max(1, Math.round(v));
}

/* ============================================================
   SETUP SCREEN
   ============================================================ */
function refreshSetupUI() {
  $('count-value').textContent = setupCount;
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.count) === setupCount);
  });
}

function setCount(n) {
  setupCount = Math.max(MIN_CASES, Math.min(MAX_CASES, n));
  refreshSetupUI();
}

/* ============================================================
   START A GAME
   ============================================================ */
function startGame() {
  const n = setupCount;
  const values = selectValues(n);
  const shuffledValues = shuffle(values);

  const cases = [];
  for (let i = 0; i < n; i++) {
    cases.push({ num: i + 1, value: shuffledValues[i], opened: false, held: false });
  }

  game = {
    n,
    cases,
    sortedValues: values.slice().sort((a, b) => a - b),
    heldIndex: null,
    schedule: buildSchedule(n - 1),
    roundIndex: 0,
    openedThisRound: 0,
    phase: 'pick', // pick -> open -> offer -> ... -> swap/final -> done
  };

  showScreen('game');
  renderBoards();
  renderCases();
  setInstruction('Pick the case you want to keep.');
  $('round-label').classList.add('hidden');
  $('open-counter').classList.add('hidden');
  $('held-num').textContent = '—';
  // Clear the podium from any previous game.
  const podium = $('your-case-podium');
  podium.classList.add('hidden');
  podium.classList.remove('placed');
  podium.style.opacity = '';
  document.querySelectorAll('.floating-case').forEach(n => n.remove());
}

/* ============================================================
   RENDERING
   ============================================================ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

function setInstruction(text) { $('instruction').textContent = text; }

function renderBoards() {
  const vals = game.sortedValues;
  const half = Math.ceil(vals.length / 2);
  const low = vals.slice(0, half);
  const high = vals.slice(half);

  const build = (container, list) => {
    container.innerHTML = '';
    list.forEach(v => {
      const row = document.createElement('div');
      row.className = 'board-row';
      row.dataset.value = v;
      row.textContent = formatMoney(v);
      container.appendChild(row);
    });
  };
  build($('board-left'), low);
  build($('board-right'), high.slice().reverse()); // big at top
}

function eliminateOnBoard(value) {
  document.querySelectorAll('.board-row').forEach(row => {
    if (Number(row.dataset.value) === value) row.classList.add('eliminated');
  });
}

function gridColumns(n) {
  if (n <= 9) return 3;
  if (n <= 12) return 4;
  if (n <= 20) return 5;
  return 6;
}

function renderCases() {
  const grid = $('case-grid');
  grid.innerHTML = '';
  const cols = gridColumns(game.n);
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(70px, 120px))`;

  game.cases.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'case';
    btn.dataset.index = i;
    btn.textContent = c.num;
    btn.addEventListener('click', () => onCaseClick(i));
    grid.appendChild(btn);
    c.el = btn;
  });
}

/* ============================================================
   GAMEPLAY
   ============================================================ */
function onCaseClick(i) {
  const c = game.cases[i];
  if (c.opened || c.held) return;

  if (game.phase === 'pick') {
    claimCase(i);
  } else if (game.phase === 'open') {
    openCase(i);
  }
}

function claimCase(i) {
  const c = game.cases[i];
  game.heldIndex = i;
  c.held = true;
  game.phase = 'placing';
  setInstruction('That’s your case — taking it to your podium…');

  // The case lifts off the board, leaving an empty slot behind.
  const startRect = c.el.getBoundingClientRect();
  c.el.classList.add('taken');
  c.el.innerHTML = `<span class="taken-num">${c.num}</span>`;

  floatCaseToPodium(c.num, startRect, () => {
    game.phase = 'open';
    game.roundIndex = 0;
    game.openedThisRound = 0;
    $('open-counter').classList.remove('hidden');
    $('round-label').classList.remove('hidden');
    updateRoundUI();
  });
}

/* Animate a briefcase floating from the board down to the podium. */
function floatCaseToPodium(num, startRect, done) {
  const podium = $('your-case-podium');
  const podiumCase = $('podium-case');

  // Reveal the podium (invisible) so we can measure where the case should land.
  podium.classList.remove('hidden', 'placed');
  podium.style.opacity = '0';
  $('held-num').textContent = num;
  const target = podiumCase.getBoundingClientRect();

  const clone = document.createElement('div');
  clone.className = 'floating-case';
  clone.style.left = startRect.left + 'px';
  clone.style.top = startRect.top + 'px';
  clone.style.width = startRect.width + 'px';
  clone.style.height = startRect.height + 'px';
  clone.innerHTML = `<div class="fc-inner"><span class="fc-num">${num}</span></div>`;
  document.body.appendChild(clone);

  const dx = (target.left + target.width / 2) - (startRect.left + startRect.width / 2);
  const dy = (target.top + target.height / 2) - (startRect.top + startRect.height / 2);
  const scale = target.width / startRect.width;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    });
  });

  setTimeout(() => {
    clone.remove();
    podium.style.opacity = '1';
    podium.classList.add('placed'); // pop the podium case in
    done();
  }, 1250);
}

function casesLeftToOpenThisRound() {
  return game.schedule[game.roundIndex] - game.openedThisRound;
}

function updateRoundUI() {
  const roundNum = game.roundIndex + 1;
  $('round-label').textContent = `Round ${roundNum}`;
  const left = casesLeftToOpenThisRound();
  $('oc-value').textContent = left;
  setInstruction(left === 1
    ? 'Open 1 more case.'
    : `Open ${left} cases.`);
}

function openCase(i) {
  // Lock the board and play the dramatic reveal; finish up once it ends.
  game.phase = 'revealing';
  setInstruction('Opening case…');
  dramaticReveal(i, () => finishOpen(i));
}

/* The ~5-second showpiece: the case flies to center, grows, builds
   suspense, then flips open to reveal the amount inside. */
function dramaticReveal(i, done) {
  const c = game.cases[i];
  const median = game.sortedValues[Math.floor(game.sortedValues.length / 2)];
  const isHigh = c.value >= median;

  const rect = c.el.getBoundingClientRect();
  const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.62, 440);
  const W = size, H = size * 0.84;
  const dx = (rect.left + rect.width / 2) - window.innerWidth / 2;
  const dy = (rect.top + rect.height / 2) - window.innerHeight / 2;

  const backdrop = document.createElement('div');
  backdrop.className = 'reveal-backdrop';

  const card = document.createElement('div');
  card.className = 'reveal-card';
  card.style.width = W + 'px';
  card.style.height = H + 'px';
  card.style.marginLeft = (-W / 2) + 'px';
  card.style.marginTop = (-H / 2) + 'px';
  // Start small, sitting over the clicked case.
  card.style.transform = `translate(${dx}px, ${dy}px) scale(0.18)`;
  card.innerHTML =
    '<div class="reveal-flip">' +
      `<div class="reveal-face reveal-front"><span class="reveal-num">${c.num}</span></div>` +
      `<div class="reveal-face reveal-back ${isHigh ? 'high' : 'low'}">` +
        '<span class="reveal-back-label">Inside case ' + c.num + '</span>' +
        `<span class="reveal-amount">${formatMoney(c.value)}</span>` +
      '</div>' +
    '</div>';

  document.body.appendChild(backdrop);
  document.body.appendChild(card);

  // Fly to the center and grow.
  requestAnimationFrame(() => {
    backdrop.classList.add('show');
    requestAnimationFrame(() => {
      card.style.transform = 'translate(0px, 0px) scale(1)';
    });
  });

  // Timeline (≈5.2s total).
  let sparkles = null;
  setTimeout(() => {                                      // arrive: suspense glow + sparkle burst
    card.classList.add('arrived');
    sparkles = makeSparkleLayer(size);
    document.body.appendChild(sparkles);
  }, 850);
  setTimeout(() => {                                      // flip the case open, retire the sparkles
    card.classList.add('open');
    if (sparkles) {
      const s = sparkles;
      s.classList.add('fade');
      setTimeout(() => s.remove(), 450);
      sparkles = null;
    }
  }, 2700);
  setTimeout(() => {                                      // sweep it away
    backdrop.classList.add('hide');
    card.classList.add('leaving');
  }, 4850);
  setTimeout(() => {                                      // clean up + continue
    backdrop.remove();
    card.remove();
    if (sparkles) sparkles.remove();
    done();
  }, 5300);
}

/* A layer of gold sparkles that emanate outward from the case's centre.
   Sits behind the case (lower z-index) so they peek out from its edges. */
function makeSparkleLayer(size) {
  const layer = document.createElement('div');
  layer.className = 'sparkle-layer';
  const N = 56;
  for (let k = 0; k < N; k++) {
    const p = document.createElement('div');
    const isStar = Math.random() < 0.4;
    p.className = 'sparkle' + (isStar ? ' star' : '');
    if (isStar) p.textContent = '✦';
    const angle = Math.round(Math.random() * 360);
    const dist = Math.round(size * (0.4 + Math.random() * 0.7)); // from the edge to well beyond
    const s = (isStar ? 13 : 6) + Math.random() * (isStar ? 16 : 9);
    const dur = (1.1 + Math.random() * 1.3).toFixed(2);
    const delay = (Math.random() * 1.8).toFixed(2);
    p.style.cssText =
      `--a:${angle}deg; --d:${dist}px; --s:${s.toFixed(1)}px; --dur:${dur}s; --delay:${delay}s;`;
    layer.appendChild(p);
  }
  return layer;
}

/* Mark the case opened on the board and decide what happens next. */
function finishOpen(i) {
  const c = game.cases[i];
  c.opened = true;
  game.openedThisRound++;

  c.el.classList.remove('high-val', 'low-val');
  c.el.classList.add('opened');
  const median = game.sortedValues[Math.floor(game.sortedValues.length / 2)];
  c.el.classList.add(c.value >= median ? 'high-val' : 'low-val');
  c.el.innerHTML =
    `<span class="case-open-num">#${c.num}</span>` +
    `<span class="case-open-val">${formatMoney(c.value)}</span>`;
  eliminateOnBoard(c.value);

  if (casesLeftToOpenThisRound() > 0) {
    game.phase = 'open';
    updateRoundUI();
    return;
  }

  // Round complete — Banker calls.
  game.phase = 'offer';
  setTimeout(presentOffer, 650);
}

/* Cases still in play (unopened, including the held one). */
function inPlayCases() {
  return game.cases.filter(c => !c.opened);
}

function computeOffer() {
  const vals = inPlayCases().map(c => c.value);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  // Offer grows from a lowball toward the mean as rounds progress.
  const totalRounds = game.schedule.length;
  const progress = (game.roundIndex + 1) / totalRounds; // 0..1
  const factor = 0.25 + 0.75 * progress; // 25% early -> 100% at the end
  return roundOffer(mean * factor);
}

function presentOffer() {
  const offer = computeOffer();
  game.currentOffer = offer;
  const remaining = inPlayCases().length; // includes held case
  $('banker-amount').textContent = formatMoney(offer);
  $('banker-sub').textContent =
    `${remaining} cases still in play (including yours).`;
  $('banker-overlay').classList.remove('hidden');
}

function onDeal() {
  $('banker-overlay').classList.add('hidden');
  const held = game.cases[game.heldIndex];
  game.phase = 'done';
  endGame({
    title: 'DEAL!',
    label: 'You sold your case for',
    amount: game.currentOffer,
    subtitle: `Your case (#${held.num}) actually held ${formatMoney(held.value)}.`,
  });
}

/* When all other cases are gone, reveal the held case.
   (If exactly two remained going into here we already offered the
   swap before this point.) */
function finalReveal() {
  const held = game.cases[game.heldIndex];
  game.phase = 'done';
  setInstruction('Let’s see your case!');
  endGame({
    title: 'NO DEAL!',
    label: 'Your case held',
    amount: held.value,
    subtitle: `You turned down the Banker and kept case #${held.num}.`,
  });
}

/* Offer the classic final swap when only the held case + one other remain. */
function maybeOfferSwap() {
  const inPlay = inPlayCases();
  if (inPlay.length !== 2) return false;
  const other = inPlay.find(c => !c.held);
  $('swap-held-num').textContent = game.cases[game.heldIndex].num;
  $('swap-other-num').textContent = other.num;
  game.swapOtherIndex = game.cases.indexOf(other);
  $('swap-overlay').classList.remove('hidden');
  return true;
}

function onSwapDecision(doSwap) {
  $('swap-overlay').classList.add('hidden');
  if (doSwap) {
    const oldHeld = game.cases[game.heldIndex];
    const other = game.cases[game.swapOtherIndex];
    // Old case goes back to the board; the swapped-in case becomes yours.
    oldHeld.held = false;
    oldHeld.el.classList.remove('taken');
    oldHeld.el.textContent = oldHeld.num;
    other.held = true;
    other.el.classList.add('taken');
    other.el.innerHTML = `<span class="taken-num">${other.num}</span>`;
    game.heldIndex = game.swapOtherIndex;
    $('held-num').textContent = other.num; // update the podium
  }
  finalReveal();
}

/* ============================================================
   END GAME / CELEBRATION
   ============================================================ */
function endGame({ title, label, amount, subtitle }) {
  $('celeb-title').textContent = title;
  $('celeb-label').textContent = label;
  $('celeb-amount').textContent = formatMoney(amount);
  $('celeb-subtitle').textContent = subtitle || '';
  $('celebration-overlay').classList.remove('hidden');
  launchConfetti();
}

function launchConfetti() {
  const container = $('confetti-container');
  container.innerHTML = '';
  const colors = ['#ffd23f', '#e63946', '#2ecc71', '#ff8c1a', '#ff4081', '#29b6f6', '#ffffff'];
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = (Math.random() * 100) + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    const dur = 2.5 + Math.random() * 2.5;
    piece.style.animationDuration = dur + 's';
    piece.style.animationDelay = (Math.random() * 0.8) + 's';
    if (Math.random() > 0.5) piece.style.borderRadius = '50%';
    piece.style.width = piece.style.height = (8 + Math.random() * 10) + 'px';
    container.appendChild(piece);
  }
}

/* ============================================================
   EVENT WIRING
   ============================================================ */
function init() {
  refreshSetupUI();

  // Hamburger
  $('hamburger-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    $('hamburger-menu').classList.toggle('hidden');
  });
  document.addEventListener('click', () => $('hamburger-menu').classList.add('hidden'));
  $('hamburger-menu').addEventListener('click', (e) => e.stopPropagation());
  $('menu-home').addEventListener('click', goToSetup);

  // Setup controls
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.addEventListener('click', () => setCount(Number(b.dataset.count)));
  });
  $('count-minus').addEventListener('click', () => setCount(setupCount - 2));
  $('count-plus').addEventListener('click', () => setCount(setupCount + 2));
  $('start-game').addEventListener('click', startGame);

  // Banker
  $('btn-deal').addEventListener('click', onDeal);
  $('btn-nodeal').addEventListener('click', () => {
    $('banker-overlay').classList.add('hidden');
    game.roundIndex++;
    game.openedThisRound = 0;
    // If only the held case + one other remain, offer the classic swap.
    if (maybeOfferSwap()) return;
    // Otherwise either play the next round or reveal the held case.
    if (game.roundIndex >= game.schedule.length) {
      finalReveal();
    } else {
      game.phase = 'open';
      updateRoundUI();
    }
  });

  // Swap
  $('btn-keep').addEventListener('click', () => onSwapDecision(false));
  $('btn-swap').addEventListener('click', () => onSwapDecision(true));

  // Celebration
  $('celeb-play-again').addEventListener('click', () => {
    $('celebration-overlay').classList.add('hidden');
    startGame();
  });
  $('celeb-menu').addEventListener('click', () => {
    $('celebration-overlay').classList.add('hidden');
    goToSetup();
  });
}

function goToSetup() {
  $('hamburger-menu').classList.add('hidden');
  $('celebration-overlay').classList.add('hidden');
  $('banker-overlay').classList.add('hidden');
  $('swap-overlay').classList.add('hidden');
  $('your-case-podium').classList.add('hidden');
  document.querySelectorAll('.floating-case, .reveal-card, .reveal-backdrop, .sparkle-layer').forEach(n => n.remove());
  showScreen('setup');
}

document.addEventListener('DOMContentLoaded', init);
