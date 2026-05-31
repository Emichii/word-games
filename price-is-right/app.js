/* ============================================================
   THE PRICE IS RIGHT — APP
   ============================================================ */

// ---------- Utilities ----------
const $ = (id) => document.getElementById(id);
const fmt$ = (n) => {
  if (n >= 100) return '$' + Math.round(n).toLocaleString();
  return '$' + n.toFixed(2);
};
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function renderItemMedia(el, item) {
  el.innerHTML = '';
  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.onerror = () => { el.innerHTML = `<span class="item-emoji">${item.emoji || '🎁'}</span>`; };
    el.appendChild(img);
  } else {
    el.innerHTML = `<span class="item-emoji">${item.emoji || '🎁'}</span>`;
  }
}

function themeBadge(item) {
  if (item.theme === 'classic') return '⭐ Classic Prize';
  if (item.theme === 'nostalgic') return `🕰️ Nostalgic${item.year ? ' • ' + item.year : ''}`;
  return '🛒 Everyday';
}

// ---------- Celebration Overlay ----------
let _celebPlayAgainCb = null;

function showCelebration(config, onPlayAgain) {
  // Accept either a number (legacy Plinko dollar prize) or an object:
  //   { title, label, prizeText, subtitle }
  if (typeof config === 'number') {
    config = {
      title: 'Congratulations!',
      label: 'You won',
      prizeText: '$' + config.toLocaleString(),
      subtitle: ''
    };
  }
  const title    = config.title    || 'Congratulations!';
  const label    = config.label    || '';
  const prizeTxt = config.prizeText || '';
  const subtitle = config.subtitle || '';

  document.querySelector('.celebration-title').textContent = title;
  $('celeb-label').textContent = label;
  $('celeb-amount').textContent = prizeTxt;
  $('celeb-subtitle').textContent = subtitle;

  const overlay = $('celebration-overlay');
  _celebPlayAgainCb = onPlayAgain || null;

  // Spawn confetti
  const container = $('confetti-container');
  container.innerHTML = '';
  const colors = ['#ffd700', '#e63946', '#29b6f6', '#4caf50', '#ff8c1a', '#ff4081', '#ffffff'];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const size = 8 + Math.random() * 10;
    const duration = 2.5 + Math.random() * 3;
    const delay = Math.random() * 2.5;
    const shape = Math.random() > 0.5 ? '50%' : '0';
    piece.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${shape};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(piece);
  }

  overlay.classList.remove('hidden');
}

function hideCelebration() {
  $('celebration-overlay').classList.add('hidden');
  $('confetti-container').innerHTML = '';
  _celebPlayAgainCb = null;
}

// Hook up celebration buttons (must exist by the time this script runs)
document.addEventListener('DOMContentLoaded', () => {
  // No-op — script tags are at end of body so elements exist
});
$('celeb-play-again').addEventListener('click', () => {
  const cb = _celebPlayAgainCb;
  hideCelebration();
  if (cb) cb();
});
$('celeb-menu').addEventListener('click', () => {
  hideCelebration();
  showScreen('home');
});

// ---------- Screen Router ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $('screen-' + id);
  if (el) el.classList.add('active');
  // Reset round label
  const lbl = $('round-label');
  lbl.classList.add('hidden');
  lbl.textContent = '';
}

// ---------- Hamburger ----------
const hamMenu = $('hamburger-menu');
$('hamburger-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  hamMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!hamMenu.contains(e.target) && e.target.id !== 'hamburger-btn') {
    hamMenu.classList.add('hidden');
  }
});
$('menu-home').addEventListener('click', () => { showScreen('home'); hamMenu.classList.add('hidden'); });
$('menu-custom').addEventListener('click', () => { showCustomEditor(); hamMenu.classList.add('hidden'); });

// ---------- Home Screen ----------
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => {
    const game = card.dataset.game;
    if (game === 'contestants') startContestants();
    else if (game === 'plinko') startPlinko();
    else if (game === 'wheel') startWheel();
    else if (game === 'cliff') startCliff();
  });
});

/* ============================================================
   GAME INFO (rules shown in the setup modal)
   ============================================================ */
const GAME_INFO = {
  contestants: {
    title: "Contestants' Row",
    needsPlayers: true,
    rules: [
      "An item appears on screen — call out a price guess.",
      "Each player gives one bid; the host types it in.",
      "Closest bid to the actual price WITHOUT going over wins.",
      "If everyone guesses too high, no winner that round.",
      "Click \"New Item\" each round to keep playing."
    ]
  },
  plinko: {
    title: "Plinko",
    needsPlayers: false,
    rules: [
      "You have 5 chips to drop.",
      "Click any column at the top of the board to drop a chip.",
      "Watch it bounce off the pegs all the way down.",
      "The slot the chip lands in is your prize ($0 to $10,000).",
      "Try to land in the JACKPOT in the middle!"
    ]
  },
  wheel: {
    title: "The Big Wheel",
    needsPlayers: true,
    rules: [
      "Each player takes a turn spinning the wheel.",
      "After your first spin, choose to STAY or SPIN AGAIN.",
      "Add your two spins together — total goal is one dollar (¢100).",
      "If you go over $1, you BUST and lose your turn.",
      "Closest to ¢100 without going over wins.",
      "Land EXACTLY on $1 to get a bonus spin!"
    ]
  },
  cliff: {
    title: "Cliff Hangers",
    needsPlayers: false,
    rules: [
      "Three items will appear, one at a time.",
      "Residents shout a price guess; the host types it in.",
      "Every dollar you're off, the climber moves UP one step.",
      "The climber starts at the bottom — 25 steps to the cliff.",
      "If the climber falls off, you lose!",
      "Survive all three items to WIN the round."
    ]
  }
};

/* ============================================================
   PLAYERS (shared by Contestants' Row and Big Wheel)
   ============================================================ */
const PLAYERS_KEY = 'tpir_players_v1';
const DEFAULT_PLAYERS = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 8;

function loadPlayers() {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) return [...DEFAULT_PLAYERS];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return [...DEFAULT_PLAYERS];
    return arr.slice(0, MAX_PLAYERS).map(n => (n || '').toString().trim() || 'Player');
  } catch { return [...DEFAULT_PLAYERS]; }
}
function savePlayers(arr) {
  try { localStorage.setItem(PLAYERS_KEY, JSON.stringify(arr)); } catch {}
}

// Modal state
let pmDraftCount = 4;
let pmDraftNames = [];
let pmOnSave = null;       // callback after save / start
let pmShowPlayers = true;  // whether player section is visible

function openGameSetup(gameKey, onStart) {
  const info = GAME_INFO[gameKey];
  if (!info) return;
  pmOnSave = onStart || null;
  pmShowPlayers = !!info.needsPlayers;

  // Set title
  $('pm-title').textContent = info.title;

  // Render rules
  const list = $('pm-rules-list');
  list.innerHTML = '';
  info.rules.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    list.appendChild(li);
  });

  // Show / hide player section
  $('pm-players-section').classList.toggle('hidden', !pmShowPlayers);

  // Adjust action button label
  $('pm-save').textContent = pmShowPlayers ? '✓ Start Game' : "✓ Let's Play!";

  if (pmShowPlayers) {
    // Pre-fill with saved names if any, otherwise the default "Player 1, 2..."
    // labels. Staff can hit Save as-is for a quick game, or type over them
    // with resident names.
    const current = loadPlayers();
    pmDraftCount = current.length;
    pmDraftNames = [...current];
    while (pmDraftNames.length < MAX_PLAYERS) pmDraftNames.push('');
    renderPlayerModal();
  }

  $('player-modal').classList.remove('hidden');
}

function closePlayerModal() {
  $('player-modal').classList.add('hidden');
  pmOnSave = null;
}

function renderPlayerModal() {
  $('pm-count-value').textContent = pmDraftCount;
  const wrap = $('pm-names');
  wrap.innerHTML = '';
  for (let i = 0; i < pmDraftCount; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pm-name-input';
    input.placeholder = `Player ${i + 1} name`;
    input.value = pmDraftNames[i] || '';
    input.maxLength = 20;
    input.dataset.idx = i;
    input.addEventListener('input', (e) => {
      pmDraftNames[parseInt(e.target.dataset.idx)] = e.target.value;
    });
    wrap.appendChild(input);
  }
  $('pm-minus').disabled = pmDraftCount <= MIN_PLAYERS;
  $('pm-plus').disabled = pmDraftCount >= MAX_PLAYERS;
}

$('pm-minus').addEventListener('click', () => {
  if (pmDraftCount > MIN_PLAYERS) { pmDraftCount--; renderPlayerModal(); }
});
$('pm-plus').addEventListener('click', () => {
  if (pmDraftCount < MAX_PLAYERS) { pmDraftCount++; renderPlayerModal(); }
});
$('pm-cancel').addEventListener('click', closePlayerModal);
$('pm-save').addEventListener('click', () => {
  if (pmShowPlayers) {
    // Trim, replace empties with default name
    const finalNames = pmDraftNames.slice(0, pmDraftCount).map((n, i) => {
      const t = (n || '').trim();
      return t || `Player ${i + 1}`;
    });
    savePlayers(finalNames);
  }
  const cb = pmOnSave;
  closePlayerModal();
  if (cb) cb();
});

function hasPlayersConfigured() {
  try { return !!localStorage.getItem(PLAYERS_KEY); } catch { return false; }
}

/* ============================================================
   CONTESTANTS' ROW
   ============================================================ */
let crCurrentItem = null;

function startContestants() {
  // Always show rules + player setup at start of each game session
  openGameSetup('contestants', () => {
    showScreen('contestants');
    renderBidderSlots();
    resetContestants();
  });
}

function resetContestants() {
  crCurrentItem = null;
  $('cr-item-name').textContent = 'Press "New Item" to begin';
  $('cr-item-desc').textContent = '';
  $('cr-item-theme').textContent = '';
  $('cr-item-photo').innerHTML = '<span class="item-emoji">🎁</span>';
  $('cr-reveal').classList.add('hidden');
  $('cr-reveal-btn').disabled = true;
  clearBidderInputs();
}

function renderBidderSlots() {
  const row = $('cr-bidders');
  row.innerHTML = '';
  const names = loadPlayers();
  // Adjust grid columns to fit the number of players
  const cols = Math.min(names.length, 4);
  row.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  names.forEach((name, i) => {
    const slot = document.createElement('div');
    slot.className = 'bidder-slot';
    slot.dataset.idx = i;
    slot.innerHTML = `
      <div class="bidder-name">${name}</div>
      <div class="bidder-input-row">
        <span class="dollar-sign">$</span>
        <input type="number" class="bidder-input" data-idx="${i}" placeholder="0" min="0" step="1" inputmode="decimal">
      </div>
      <div class="bidder-status"></div>
    `;
    row.appendChild(slot);
  });
}

function clearBidderInputs() {
  document.querySelectorAll('.bidder-input').forEach(i => i.value = '');
  document.querySelectorAll('.bidder-slot').forEach(s => {
    s.classList.remove('winner', 'over');
    s.querySelector('.bidder-status').textContent = '';
  });
}

$('cr-new-item').addEventListener('click', () => {
  const all = getAllItems();
  // Avoid showing the same item back-to-back
  let pick;
  do { pick = randItem(all); } while (all.length > 1 && pick === crCurrentItem);
  crCurrentItem = pick;
  $('cr-item-name').textContent = pick.name;
  $('cr-item-desc').textContent = pick.desc || '';
  $('cr-item-theme').textContent = themeBadge(pick);
  renderItemMedia($('cr-item-photo'), pick);
  $('cr-reveal').classList.add('hidden');
  $('cr-reveal-btn').disabled = false;
  clearBidderInputs();
});

$('cr-reveal-btn').addEventListener('click', () => {
  if (!crCurrentItem) return;
  const inputs = [...document.querySelectorAll('.bidder-input')];
  const bids = inputs.map(i => {
    const v = parseFloat(i.value);
    return isNaN(v) ? null : v;
  });
  const actual = crCurrentItem.price;

  // Determine winner: highest bid not exceeding actual
  let winnerIdx = -1;
  let bestBid = -1;
  bids.forEach((b, i) => {
    if (b !== null && b <= actual && b > bestBid) {
      bestBid = b;
      winnerIdx = i;
    }
  });

  // Update slot styling and status
  const slots = document.querySelectorAll('.bidder-slot');
  bids.forEach((b, i) => {
    const slot = slots[i];
    const status = slot.querySelector('.bidder-status');
    slot.classList.remove('winner', 'over');
    if (b === null) {
      status.textContent = 'no bid';
      status.style.color = 'var(--text-dim)';
    } else if (b > actual) {
      slot.classList.add('over');
      const diff = b - actual;
      status.textContent = `over by ${fmt$(diff)}`;
      status.style.color = 'var(--tpir-red)';
    } else {
      const diff = actual - b;
      status.textContent = `off by ${fmt$(diff)}`;
      status.style.color = 'var(--text-light)';
    }
  });

  if (winnerIdx >= 0) {
    slots[winnerIdx].classList.add('winner', 'celebrate');
    const names = loadPlayers();
    const winnerName = names[winnerIdx] || 'Winner';
    const exact = bids[winnerIdx] === actual;
    $('cr-winner').innerHTML = exact
      ? `🎉 EXACT PRICE! ${winnerName} wins! 🎉`
      : `🎉 ${winnerName} wins! 🎉`;
  } else {
    $('cr-winner').textContent = 'Everyone went over — no winner this round!';
  }

  $('cr-actual-price').textContent = fmt$(actual);
  $('cr-reveal').classList.remove('hidden');
  $('cr-reveal-btn').disabled = true;
});

$('cr-manage-players').addEventListener('click', () => {
  openGameSetup('contestants', () => {
    // Re-render slots with new players; preserve current item if any
    renderBidderSlots();
    $('cr-reveal').classList.add('hidden');
    $('cr-reveal-btn').disabled = !crCurrentItem;
  });
});

$('cr-back').addEventListener('click', () => showScreen('home'));


/* ============================================================
   PLINKO
   ============================================================ */
const PK_SLOTS = [100, 500, 1000, 0, 10000, 0, 1000, 500, 100];
// Color = value signal (Western/traffic-light convention): red = bad, green = good.
//   $0      → red     (worst — lose your chip)
//   $100    → yellow  (lowest non-zero — "caution" yellow)
//   $500    → orange  (between yellow and red value-wise, orange visually)
//   $1,000  → green   (good!)
//   $10,000 → blue    (jackpot — kept distinct as "special")
const PK_SLOT_COLORS = ['#ffd700', '#ff8c1a', '#4caf50', '#e63946', '#29b6f6', '#e63946', '#4caf50', '#ff8c1a', '#ffd700'];
//                       $100      $500      $1000     $0        $10K     $0        $1000     $500      $100
const PK_W = 540, PK_H = 720;
const PK_COLS = 9;        // number of slots (and column positions for entry)
const PK_ROWS = 12;       // peg rows
const PK_PEG_R = 7;
const PK_CHIP_R = 16;
const PK_SLOT_H = 70;

let pkCtx = null;
let pkChipsLeft = 5;
let pkTotal = 0;
let pkAnimating = false;
let pkPegs = [];
let pkHoverCol = -1;

function pkColX(col) {
  // 9 columns, evenly spaced across width
  const margin = 30;
  const w = PK_W - margin * 2;
  return margin + (col + 0.5) * (w / PK_COLS);
}

function pkInitPegs() {
  pkPegs = [];
  const margin = 30;
  const w = PK_W - margin * 2;
  const playH = PK_H - PK_SLOT_H - 70;
  const rowSpacing = playH / (PK_ROWS + 1);

  // ===== Regular pegs (symmetric staggered layout) =====
  // ORIGINAL BUG: even rows had only 8 pegs covering columns 0-7, leaving
  // column 8 uncovered on the right. Chips dropped into column 8 fell
  // straight down with no peg to deflect them.
  // FIX: even rows now have 9 pegs (one above every slot), odd rows have
  // 9 pegs offset by half a column. Both edges are now symmetric.
  const colW = w / PK_COLS;
  for (let r = 0; r < PK_ROWS; r++) {
    const offset = (r % 2 === 0) ? 0 : colW / 2;
    const pegsInRow = (r % 2 === 0) ? PK_COLS : PK_COLS - 1;
    for (let c = 0; c < pegsInRow; c++) {
      const x = margin + offset + (c + 0.5) * colW;
      const y = 60 + (r + 1) * rowSpacing;
      if (x > margin && x < PK_W - margin) pkPegs.push({ x, y });
    }
  }

  // ===== Wall bumper pegs (safety net, flush against the walls) =====
  // Catch chips that drift toward a wall — pegs are flush against the wall
  // edge with tight vertical spacing (gap between pegs < chip diameter).
  const wallSpacing = 26;
  const startY = 50;
  const endY = PK_H - PK_SLOT_H - 30;
  for (let y = startY; y <= endY; y += wallSpacing) {
    pkPegs.push({ x: margin, y, wall: true });
    pkPegs.push({ x: PK_W - margin, y, wall: true });
  }
}

function pkDrawBoard(highlightCol = -1, chipPos = null) {
  const ctx = pkCtx;
  ctx.clearRect(0, 0, PK_W, PK_H);

  // Background
  ctx.fillStyle = '#0a2463';
  ctx.fillRect(0, 0, PK_W, PK_H);

  // Top entry zone
  const margin = 30;
  const w = PK_W - margin * 2;
  const colW = w / PK_COLS;
  for (let c = 0; c < PK_COLS; c++) {
    const x = margin + c * colW;
    ctx.fillStyle = (c === highlightCol) ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, 12, colW - 2, 44);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 12, colW - 2, 44);
    ctx.fillStyle = (c === highlightCol) ? '#ffd700' : 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 22px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('▼', x + colW / 2, 42);
  }

  // Pegs
  pkPegs.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, PK_PEG_R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#0a2463';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Helper: shrink font until text fits within maxWidth (single line)
  function fitFontSize(text, maxWidth, fontFamily, baseSize, minSize = 8, weight = 'bold') {
    let size = baseSize;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    while (ctx.measureText(text).width > maxWidth && size > minSize) {
      size -= 1;
      ctx.font = `${weight} ${size}px ${fontFamily}`;
    }
    return size;
  }

  // Slots at bottom
  const slotY = PK_H - PK_SLOT_H;
  const slotInnerWidth = colW - 6; // small horizontal padding so text isn't flush against dividers
  for (let i = 0; i < PK_COLS; i++) {
    const x = margin + i * colW;
    ctx.fillStyle = PK_SLOT_COLORS[i];
    ctx.fillRect(x, slotY, colW - 2, PK_SLOT_H);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, slotY, colW - 2, PK_SLOT_H);

    // Dark text on light backgrounds (yellow $100, cyan jackpot),
    // white on the darker orange/red/green.
    const lightBg = (PK_SLOTS[i] === 100 || PK_SLOTS[i] === 10000);
    const textColor = lightBg ? '#0a2463' : '#fff';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';

    // Dollar amount — shrink font until it fits the slot width
    const dollarText = '$' + PK_SLOTS[i].toLocaleString();
    fitFontSize(dollarText, slotInnerWidth, 'Fredoka One, Nunito', 22);
    ctx.fillText(dollarText, x + colW / 2, slotY + 28);

    // Jackpot label — also shrink to fit
    if (PK_SLOTS[i] === 10000) {
      const jackpotText = 'JACKPOT';
      fitFontSize(jackpotText, slotInnerWidth, 'Nunito', 14, 7);
      ctx.fillStyle = textColor;
      ctx.fillText(jackpotText, x + colW / 2, slotY + 52);
    }
  }

  // Dividers between slots (extending up a bit)
  for (let i = 0; i <= PK_COLS; i++) {
    const x = margin + i * colW;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, slotY - 50);
    ctx.lineTo(x, slotY);
    ctx.stroke();
  }

  // Chip
  if (chipPos) {
    ctx.beginPath();
    ctx.arc(chipPos.x, chipPos.y, PK_CHIP_R, 0, Math.PI * 2);
    const grd = ctx.createRadialGradient(chipPos.x - 5, chipPos.y - 5, 2, chipPos.x, chipPos.y, PK_CHIP_R);
    grd.addColorStop(0, '#fff');
    grd.addColorStop(0.6, '#e63946');
    grd.addColorStop(1, '#8b0000');
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    // "P" label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Fredoka One, Nunito';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', chipPos.x, chipPos.y);
    ctx.textBaseline = 'alphabetic';
  }
}

function startPlinko() {
  openGameSetup('plinko', () => _beginPlinko());
}

function _beginPlinko() {
  showScreen('plinko');
  const canvas = $('pk-canvas');
  pkCtx = canvas.getContext('2d');
  pkInitPegs();
  pkChipsLeft = 5;
  pkTotal = 0;
  pkAnimating = false;
  updatePlinkoStats('—');
  pkDrawBoard();

  // Hover & click handlers (only attach once)
  if (!canvas.dataset.bound) {
    canvas.dataset.bound = '1';
    const getCol = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (PK_W / rect.width);
      const margin = 30;
      const w = PK_W - margin * 2;
      const colW = w / PK_COLS;
      if (x < margin || x > PK_W - margin) return -1;
      return Math.floor((x - margin) / colW);
    };
    canvas.addEventListener('mousemove', (e) => {
      if (pkAnimating || pkChipsLeft <= 0) return;
      const col = getCol(e);
      if (col !== pkHoverCol) {
        pkHoverCol = col;
        pkDrawBoard(col);
      }
    });
    canvas.addEventListener('mouseleave', () => {
      if (pkAnimating) return;
      pkHoverCol = -1;
      pkDrawBoard();
    });
    canvas.addEventListener('click', (e) => {
      if (pkAnimating || pkChipsLeft <= 0) return;
      const col = getCol(e);
      if (col >= 0 && col < PK_COLS) dropChip(col);
    });
  }
}

function updatePlinkoStats(lastTxt) {
  $('pk-chip-num').textContent = pkChipsLeft > 0 ? `${6 - pkChipsLeft} of 5` : 'Done!';
  $('pk-total').textContent = '$' + pkTotal.toLocaleString();
  $('pk-last').textContent = lastTxt;
}

function dropChip(col) {
  pkAnimating = true;
  pkHoverCol = -1;
  let pos = { x: pkColX(col), y: 60 };
  let vx = 0, vy = 0;
  const gravity = 0.30;
  const bounceDamp = 0.55;
  const slotY = PK_H - PK_SLOT_H;

  // Anti-stuck tracking
  let lastY = pos.y;
  let stuckFrames = 0;
  let totalFrames = 0;
  const MAX_FRAMES = 1200; // ~20 seconds at 60fps — hard ceiling

  function landAt(x) {
    const margin = 30;
    const colW = (PK_W - margin * 2) / PK_COLS;
    const landedCol = Math.max(0, Math.min(PK_COLS - 1, Math.floor((x - margin) / colW)));
    const won = PK_SLOTS[landedCol];
    pkTotal += won;
    pkChipsLeft -= 1;
    pkAnimating = false;
    updatePlinkoStats('+ $' + won.toLocaleString());
    setTimeout(() => pkDrawBoard(), 200);

    // If that was the last chip, celebrate after a short pause so the
    // final chip's settling drawing can be seen.
    if (pkChipsLeft === 0) {
      const finalTotal = pkTotal;
      setTimeout(() => {
        showCelebration(finalTotal, () => {
          // Play again — reset chips and redraw a fresh board
          pkChipsLeft = 5;
          pkTotal = 0;
          updatePlinkoStats('—');
          pkDrawBoard();
        });
      }, 1200);
    }
  }

  function step() {
    totalFrames++;
    vy += gravity;
    pos.x += vx;
    pos.y += vy;
    // Friction on horizontal
    vx *= 0.985;

    // Walls
    if (pos.x < 30 + PK_CHIP_R) { pos.x = 30 + PK_CHIP_R; vx = Math.abs(vx) * 0.7 + 0.3; }
    if (pos.x > PK_W - 30 - PK_CHIP_R) { pos.x = PK_W - 30 - PK_CHIP_R; vx = -Math.abs(vx) * 0.7 - 0.3; }

    // Peg collisions
    for (const peg of pkPegs) {
      const dx = pos.x - peg.x;
      const dy = pos.y - peg.y;
      const dist = Math.hypot(dx, dy);
      const minDist = PK_PEG_R + PK_CHIP_R;
      if (dist < minDist && dist > 0) {
        // Bounce
        const nx = dx / dist, ny = dy / dist;
        // Push out
        pos.x = peg.x + nx * minDist;
        pos.y = peg.y + ny * minDist;
        // Reflect velocity
        const dot = vx * nx + vy * ny;
        vx = (vx - 2 * dot * nx) * bounceDamp;
        vy = (vy - 2 * dot * ny) * bounceDamp;
        // Random sideways nudge for unpredictability
        vx += (Math.random() - 0.5) * 1.2;
      }
    }

    pkDrawBoard(-1, pos);

    // --- Anti-stuck: if the chip hasn't moved down meaningfully in 30 frames,
    // give it a strong downward kick + random horizontal shove to unstick it.
    if (Math.abs(pos.y - lastY) < 0.5) {
      stuckFrames++;
      if (stuckFrames >= 30) {
        vy = Math.max(vy, 4);
        vx += (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
        stuckFrames = 0;
      }
    } else {
      stuckFrames = 0;
    }
    lastY = pos.y;

    if (pos.y + PK_CHIP_R >= slotY) {
      landAt(pos.x);
      return;
    }

    // Hard safety: if we've been simulating for ~20s, just force-land it
    if (totalFrames > MAX_FRAMES) {
      landAt(pos.x);
      return;
    }

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

$('pk-new-game').addEventListener('click', () => {
  // Mid-game reset — no need to re-show rules
  pkChipsLeft = 5;
  pkTotal = 0;
  updatePlinkoStats('—');
  pkDrawBoard();
});
$('pk-back').addEventListener('click', () => showScreen('home'));


/* ============================================================
   THE BIG WHEEL
   ============================================================ */
const BW_VALUES = [100, 5, 95, 15, 80, 35, 60, 20, 40, 75, 55, 30, 85, 10, 65, 45, 70, 25, 50, 90];
// Note: values arranged like the real show (not in order)
const BW_SEGMENT_COUNT = BW_VALUES.length;
const BW_SEGMENT_ANGLE = 360 / BW_SEGMENT_COUNT;

let bwSpinners = []; // [{name, score:0|null, spins:0, busted:false, exact:false}]
let bwCurrent = 0;
let bwRotation = 0; // accumulated rotation deg
let bwSpinning = false;
let bwBonusMode = false; // tracking second-spin bonus

function buildWheelSvg() {
  const g = $('bw-wheel-group');
  g.innerHTML = '';
  const radius = 240;
  for (let i = 0; i < BW_SEGMENT_COUNT; i++) {
    const startAngle = i * BW_SEGMENT_ANGLE - 90 - BW_SEGMENT_ANGLE / 2;
    const endAngle = startAngle + BW_SEGMENT_ANGLE;
    const rad1 = startAngle * Math.PI / 180;
    const rad2 = endAngle * Math.PI / 180;
    const x1 = Math.cos(rad1) * radius;
    const y1 = Math.sin(rad1) * radius;
    const x2 = Math.cos(rad2) * radius;
    const y2 = Math.sin(rad2) * radius;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`);
    // Alternate vivid colors
    const colors = ['#e63946', '#ffd700', '#29b6f6', '#4caf50', '#ff8c1a', '#ff4081'];
    path.setAttribute('fill', colors[i % colors.length]);
    path.setAttribute('stroke', '#0a0a1f');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);
    // Label
    const midAngle = (startAngle + endAngle) / 2;
    const mrad = midAngle * Math.PI / 180;
    const tx = Math.cos(mrad) * (radius - 50);
    const ty = Math.sin(mrad) * (radius - 50);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('fill', '#0a0a1f');
    text.setAttribute('font-family', 'Fredoka One, Nunito');
    text.setAttribute('font-size', '26');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('transform', `rotate(${midAngle + 90} ${tx} ${ty})`);
    text.textContent = BW_VALUES[i] === 100 ? '$1.00' : '.' + String(BW_VALUES[i]).padStart(2, '0');
    g.appendChild(text);
  }
  // Outer ring
  const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ring.setAttribute('cx', 0);
  ring.setAttribute('cy', 0);
  ring.setAttribute('r', 246);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', '#ffd700');
  ring.setAttribute('stroke-width', '8');
  g.appendChild(ring);
}

function startWheel() {
  openGameSetup('wheel', () => _beginWheel());
}

function _beginWheel() {
  showScreen('wheel');
  $('round-label').classList.remove('hidden');
  $('round-label').textContent = 'Closest to $1';
  const names = loadPlayers();
  bwSpinners = names.map(n => ({ name: n, score: null, spins: 0, busted: false, exact: false }));
  bwCurrent = 0;
  bwRotation = 0;
  bwBonusMode = false;
  $('bw-wheel-group').style.transition = 'none';
  $('bw-wheel-group').style.transform = 'rotate(0deg)';
  buildWheelSvg();
  renderSpinners();
  // Keep result box visible with a friendly default — the host uses it
  // as the running game-state readout.
  $('bw-result').classList.remove('hidden');
  $('bw-result-label').textContent = `${bwSpinners[0].name} is up first!`;
  $('bw-spin').classList.remove('hidden');
  $('bw-spin').disabled = false;
  $('bw-spin').textContent = `🎡 ${bwSpinners[0].name}, SPIN!`;
  $('bw-second-spin').classList.add('hidden');
  $('bw-next-player').classList.add('hidden');
  $('bw-new-round').classList.add('hidden');
}

function renderSpinners() {
  const wrap = $('bw-spinners');
  wrap.innerHTML = '';
  bwSpinners.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'spinner-card';
    if (i === bwCurrent && !allDone()) div.classList.add('active');
    if (s.busted) div.classList.add('busted');
    if (s.exact) div.classList.add('winner');

    // Build status line: spin count + (optional) running score + (optional) BUSTED tag
    let status = s.spins === 0 ? "Hasn't spun" : (s.spins === 1 ? '1 spin' : '2 spins');
    let scoreHtml = '';
    if (s.score !== null) {
      scoreHtml = `<span class="spinner-score-inline">¢${s.score}</span>`;
    }
    let bustedHtml = s.busted ? '<span class="spinner-busted-tag">BUSTED</span>' : '';

    div.innerHTML = `
      <div class="spinner-name">${s.name}</div>
      <div class="spinner-status">
        <span>${status}</span>
        ${scoreHtml}
        ${bustedHtml}
      </div>
    `;
    wrap.appendChild(div);
  });
}

function allDone() {
  return bwSpinners.every(s => s.busted || s.spins === 2 || (s.score !== null && s.spins >= 1 && !bwBonusMode));
}

function spinWheel() {
  if (bwSpinning) return;
  bwSpinning = true;
  // Random landing segment
  const targetIdx = Math.floor(Math.random() * BW_SEGMENT_COUNT);
  // Add 4-6 full rotations plus angle to land targetIdx at top (pointer at top = -90°)
  const fullSpins = 4 + Math.floor(Math.random() * 3);
  const targetAngle = -(targetIdx * BW_SEGMENT_ANGLE);
  bwRotation += fullSpins * 360 + (targetAngle - (bwRotation % 360));
  const g = $('bw-wheel-group');
  g.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 1)';
  // requestAnimationFrame to ensure transition applies
  requestAnimationFrame(() => {
    g.style.transform = `rotate(${bwRotation}deg)`;
  });
  $('bw-spin').disabled = true;
  $('bw-second-spin').disabled = true;
  setTimeout(() => {
    onWheelLanded(BW_VALUES[targetIdx]);
  }, 4100);
}

function onWheelLanded(value) {
  bwSpinning = false;
  const s = bwSpinners[bwCurrent];
  s.spins += 1;

  if (bwBonusMode) {
    // Bonus spin (after exact $1)
    const bonusPlayer = bwSpinners[bwCurrent];
    let msg = `Bonus spin: ¢${value}.`;
    let bonusWon = 0;
    if (value === 100)      { msg += ' 🎉 $25,000!'; bonusWon = 25000; }
    else if (value === 5 || value === 15) { msg += ' 🎉 $10,000!'; bonusWon = 10000; }
    else                    { msg += ' No bonus.'; }
    $('bw-result-label').textContent = msg;
    $('bw-result').classList.remove('hidden');
    bwBonusMode = false;
    $('bw-spin').classList.add('hidden');
    $('bw-second-spin').classList.add('hidden');
    $('bw-next-player').classList.add('hidden');
    $('bw-new-round').classList.remove('hidden');
    // Celebrate the bonus win!
    setTimeout(() => {
      if (bonusWon > 0) {
        showCelebration({
          title: 'JACKPOT!',
          label: `${bonusPlayer.name} won`,
          prizeText: '$' + bonusWon.toLocaleString(),
          subtitle: 'Bonus spin!'
        }, () => _beginWheel());
      } else {
        // No bonus, but still won the round with exact $1
        showCelebration({
          title: 'Congratulations!',
          label: 'Winner',
          prizeText: bonusPlayer.name,
          subtitle: 'EXACT $1 — perfect spin!'
        }, () => _beginWheel());
      }
    }, 1500);
    return;
  }

  if (s.score === null) {
    s.score = value;
  } else {
    s.score += value;
    if (s.score > 100) {
      s.busted = true;
      s.score = null;
    }
  }

  renderSpinners();

  // Decide next action
  if (s.busted) {
    $('bw-result-label').textContent = `${s.name} BUSTED! Total over $1.`;
    $('bw-result').classList.remove('hidden');
    advancePlayerUI();
    return;
  }
  if (s.score === 100) {
    s.exact = true;
    $('bw-result-label').textContent = `🎉 ${s.name} hits EXACTLY $1! Bonus spin coming up!`;
    $('bw-result').classList.remove('hidden');
    renderSpinners();
    bwBonusMode = true;
    $('bw-spin').classList.add('hidden');
    $('bw-second-spin').classList.add('hidden');
    $('bw-next-player').classList.add('hidden');
    // Show a dedicated bonus button — reuse spin button
    $('bw-spin').textContent = `🎡 ${s.name}'s BONUS SPIN!`;
    $('bw-spin').classList.remove('hidden');
    $('bw-spin').disabled = false;
    return;
  }
  // Normal spin result
  if (s.spins === 1) {
    $('bw-result-label').textContent = `${s.name}: ¢${value}. Spin again or stay?`;
    $('bw-result').classList.remove('hidden');
    $('bw-spin').classList.add('hidden');
    $('bw-second-spin').classList.remove('hidden');
    $('bw-second-spin').disabled = false;
    $('bw-second-spin').textContent = 'Spin Again';
    $('bw-next-player').classList.remove('hidden');
    $('bw-next-player').textContent = 'Stay & Next Player';
  } else {
    $('bw-result-label').textContent = `${s.name}: total ¢${s.score}.`;
    $('bw-result').classList.remove('hidden');
    advancePlayerUI();
  }
}

function advancePlayerUI() {
  // Move to next player or finish round
  const nextIdx = bwCurrent + 1;
  if (nextIdx >= bwSpinners.length) {
    showWheelWinner();
  } else {
    bwCurrent = nextIdx;
    renderSpinners();
    $('bw-spin').classList.remove('hidden');
    $('bw-spin').disabled = false;
    $('bw-spin').textContent = `🎡 ${bwSpinners[bwCurrent].name}, SPIN!`;
    $('bw-second-spin').classList.add('hidden');
    $('bw-next-player').classList.add('hidden');
  }
}

function showWheelWinner() {
  // Find highest score not over 100
  let best = -1;
  let winners = [];
  bwSpinners.forEach((s, i) => {
    if (!s.busted && s.score !== null) {
      if (s.score > best) { best = s.score; winners = [i]; }
      else if (s.score === best) winners.push(i);
    }
  });
  if (winners.length === 0) {
    $('bw-result-label').textContent = 'Everyone busted!';
  } else if (winners.length === 1) {
    const w = bwSpinners[winners[0]];
    w.exact = (w.score === 100);
    $('bw-result-label').textContent = `🎉 ${w.name} wins with ¢${best}! 🎉`;
    renderSpinners();
    // Celebrate the winner!
    setTimeout(() => {
      showCelebration({
        title: 'Congratulations!',
        label: 'Winner',
        prizeText: w.name,
        subtitle: w.exact ? `EXACT $1 — perfect spin!` : `with ¢${best}`
      }, () => _beginWheel());
    }, 1200);
  } else {
    $('bw-result-label').textContent = `Tie at ¢${best} between ${winners.map(i => bwSpinners[i].name).join(' & ')} — spin-off!`;
  }
  $('bw-spin').classList.add('hidden');
  $('bw-second-spin').classList.add('hidden');
  $('bw-next-player').classList.add('hidden');
  $('bw-new-round').classList.remove('hidden');
}

$('bw-spin').addEventListener('click', spinWheel);
$('bw-second-spin').addEventListener('click', spinWheel);
$('bw-next-player').addEventListener('click', advancePlayerUI);
// "New Round" within Big Wheel — don't re-show rules; just reset and play
$('bw-new-round').addEventListener('click', _beginWheel);
$('bw-manage-players').addEventListener('click', () => {
  openGameSetup('wheel', () => _beginWheel());
});
$('bw-back').addEventListener('click', () => showScreen('home'));


/* ============================================================
   CLIFF HANGERS
   ============================================================ */
const CH_MAX_STEPS = 25;
let chRoundItems = [];
let chCurrentIdx = 0;
let chClimberSteps = 0;
let chRoundOver = false;

function startCliff() {
  openGameSetup('cliff', () => _beginCliff());
}

function _beginCliff() {
  showScreen('cliff');
  $('round-label').classList.remove('hidden');
  $('round-label').textContent = 'Keep him from falling!';
  resetCliff();
}

function resetCliff() {
  chClimberSteps = 0;
  chCurrentIdx = 0;
  chRoundOver = false;
  // Pick 3 random items, prefer items priced under $50 so guesses make sense
  const pool = getAllItems().filter(i => i.price <= 50 && i.theme !== 'classic');
  // Fall back to all items if pool too small
  const source = pool.length >= 3 ? pool : getAllItems();
  chRoundItems = shuffle(source).slice(0, 3);

  $('ch-item-name').textContent = 'Press "Start Round"';
  $('ch-item-desc').textContent = '';
  $('ch-emoji').textContent = '🎁';
  $('ch-feedback').textContent = '';
  $('ch-guess-input').value = '';
  $('ch-guess-input').disabled = true;
  $('ch-submit-guess').disabled = true;
  $('ch-start').textContent = '▶ Start Round';
  $('ch-start').disabled = false;
  updateCliffProgress();
  drawClimber();
}

function updateCliffProgress() {
  document.querySelectorAll('.ch-item-dot').forEach((dot, i) => {
    dot.classList.remove('current', 'done');
    if (i < chCurrentIdx) dot.classList.add('done');
    if (i === chCurrentIdx && !chRoundOver) dot.classList.add('current');
  });
}

function drawClimber() {
  const svg = $('ch-svg');
  // Mountain has CH_MAX_STEPS steps from bottom-left rising to top-right
  const W = 320, H = 600;
  const stepW = W / (CH_MAX_STEPS + 2);
  const stepH = H / (CH_MAX_STEPS + 3);

  let html = '';
  // Sky already from CSS gradient bg
  // Mountain triangle (silhouette)
  html += `<polygon points="0,${H} ${W},${H} ${W},${stepH * 2}" fill="#5a8754"/>`;
  // Snow cap
  html += `<polygon points="${W - stepW * 8},${stepH * 5} ${W},${stepH * 2} ${W},${stepH * 5}" fill="#fff"/>`;
  // Stairs - draw lines
  for (let i = 0; i <= CH_MAX_STEPS; i++) {
    const x = i * stepW + stepW;
    const y = H - i * stepH - 20;
    html += `<rect x="${x - 4}" y="${y}" width="${stepW + 4}" height="6" fill="#3d5a3a" stroke="#2a3f28" stroke-width="1"/>`;
    if (i % 5 === 0) {
      html += `<text x="${x - 8}" y="${y - 4}" fill="#fff" font-size="11" font-family="Nunito" font-weight="700">${i}</text>`;
    }
  }
  // Cliff edge marker at top
  const topY = H - CH_MAX_STEPS * stepH - 20;
  html += `<line x1="${(CH_MAX_STEPS + 1) * stepW - 4}" y1="${topY - 20}" x2="${(CH_MAX_STEPS + 1) * stepW - 4}" y2="${topY + 30}" stroke="#e63946" stroke-width="3" stroke-dasharray="6 4"/>`;
  html += `<text x="${(CH_MAX_STEPS + 1) * stepW + 2}" y="${topY - 6}" fill="#e63946" font-size="12" font-family="Nunito" font-weight="800">CLIFF!</text>`;

  // Climber position
  const climberX = chClimberSteps * stepW + stepW + 2;
  const climberY = H - chClimberSteps * stepH - 20 - 28;
  const fallen = chClimberSteps >= CH_MAX_STEPS;
  if (fallen) {
    // Climber falls off cliff (off-screen to right + lower)
    const fallX = climberX + 30;
    const fallY = climberY + 80;
    html += `<g transform="translate(${fallX} ${fallY}) rotate(45)">`;
    html += renderClimberSvg();
    html += `</g>`;
  } else {
    html += `<g transform="translate(${climberX} ${climberY})">`;
    html += renderClimberSvg();
    html += `</g>`;
  }

  svg.innerHTML = html;
}

function renderClimberSvg() {
  // Tiny yodeler in lederhosen — simple shapes
  return `
    <ellipse cx="0" cy="3" rx="9" ry="11" fill="#c4906b"/>  <!-- shirt -->
    <rect x="-7" y="12" width="14" height="9" fill="#3d2817"/> <!-- pants -->
    <circle cx="0" cy="-9" r="6" fill="#f4d4a8"/>  <!-- head -->
    <path d="M -6 -14 Q 0 -19 6 -14 L 5 -10 L -5 -10 Z" fill="#2a5e1a"/>  <!-- alpine hat -->
    <rect x="-2" y="-15" width="4" height="3" fill="#ffd700"/>  <!-- hat feather -->
    <circle cx="-2" cy="-9" r="0.8" fill="#000"/>
    <circle cx="2" cy="-9" r="0.8" fill="#000"/>
    <path d="M -2 -6 Q 0 -5 2 -6" stroke="#000" stroke-width="0.8" fill="none"/>
  `;
}

$('ch-start').addEventListener('click', () => {
  if (chRoundOver) { resetCliff(); return; }
  if ($('ch-start').textContent.startsWith('▶')) {
    // First time start
    $('ch-start').textContent = 'Next Item →';
    $('ch-start').disabled = true;
    presentCliffItem();
  } else {
    // Next item
    if (chCurrentIdx >= chRoundItems.length) {
      // Should not happen — handled in finishRound
    } else {
      presentCliffItem();
    }
  }
});

function presentCliffItem() {
  const item = chRoundItems[chCurrentIdx];
  $('ch-item-name').textContent = item.name;
  $('ch-item-desc').textContent = item.desc || '';
  $('ch-emoji').textContent = item.emoji || '🎁';
  $('ch-feedback').textContent = 'Residents shout out a price — type their guess.';
  $('ch-guess-input').value = '';
  $('ch-guess-input').disabled = false;
  $('ch-submit-guess').disabled = false;
  $('ch-guess-input').focus();
  $('ch-start').disabled = true;
}

$('ch-submit-guess').addEventListener('click', submitCliffGuess);
$('ch-guess-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitCliffGuess();
});

function submitCliffGuess() {
  const guess = parseFloat($('ch-guess-input').value);
  if (isNaN(guess) || guess < 0) return;
  const item = chRoundItems[chCurrentIdx];
  const actual = item.price;
  const diff = Math.abs(Math.round(guess - actual));
  // Steps the climber moves up = $ difference (rounded)
  const stepsUp = Math.max(0, diff);
  chClimberSteps = Math.min(CH_MAX_STEPS, chClimberSteps + stepsUp);
  $('ch-feedback').textContent = `Actual price: ${fmt$(actual)} — off by ${fmt$(diff)}. Climber moves ${stepsUp} step${stepsUp === 1 ? '' : 's'} up.`;
  $('ch-guess-input').disabled = true;
  $('ch-submit-guess').disabled = true;

  drawClimber();

  if (chClimberSteps >= CH_MAX_STEPS) {
    finishCliffRound(false);
  } else {
    chCurrentIdx++;
    updateCliffProgress();
    if (chCurrentIdx >= chRoundItems.length) {
      finishCliffRound(true);
    } else {
      $('ch-start').disabled = false;
      $('ch-start').textContent = 'Next Item →';
    }
  }
}

function finishCliffRound(survived) {
  chRoundOver = true;
  updateCliffProgress();
  if (survived) {
    $('ch-feedback').innerHTML = `🎉 The climber survived! Final position: ${chClimberSteps} of ${CH_MAX_STEPS}. <strong>YOU WIN!</strong>`;
  } else {
    $('ch-feedback').textContent = `💥 The climber fell off the cliff! Better luck next round.`;
  }
  $('ch-start').disabled = false;
  $('ch-start').textContent = '🔄 New Round';
}

$('ch-back').addEventListener('click', () => showScreen('home'));


/* ============================================================
   CUSTOM ITEMS EDITOR
   ============================================================ */
function showCustomEditor() {
  showScreen('custom');
  renderCustomList();
}

function renderCustomList() {
  const list = loadCustomItems();
  const wrap = $('custom-list');
  wrap.innerHTML = '';
  if (list.length === 0) {
    wrap.innerHTML = '<p style="color:var(--text-dim); padding:12px;">No custom items yet. Add some above!</p>';
    return;
  }
  list.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'custom-row';
    row.innerHTML = `
      <div class="custom-row-emoji">${item.emoji || '🎁'}</div>
      <div class="custom-row-name">${item.name}<small>${item.desc || ''} • ${item.theme}</small></div>
      <div class="custom-row-price">${fmt$(item.price)}</div>
      <button class="custom-row-delete" data-idx="${idx}">Delete</button>
    `;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('.custom-row-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const list = loadCustomItems();
      list.splice(idx, 1);
      saveCustomItems(list);
      renderCustomList();
    });
  });
}

$('cust-add').addEventListener('click', () => {
  const name = $('cust-name').value.trim();
  const desc = $('cust-desc').value.trim();
  const price = parseFloat($('cust-price').value);
  const emoji = $('cust-emoji').value.trim() || '🎁';
  const theme = $('cust-theme').value;
  if (!name || isNaN(price) || price < 0) {
    alert('Please enter a name and a price.');
    return;
  }
  const list = loadCustomItems();
  list.push({
    id: 'u' + Date.now(),
    name, desc, price, emoji, theme, image: ''
  });
  saveCustomItems(list);
  $('cust-name').value = '';
  $('cust-desc').value = '';
  $('cust-price').value = '';
  $('cust-emoji').value = '';
  renderCustomList();
});

$('cust-back').addEventListener('click', () => showScreen('home'));


// ---------- Init ----------
showScreen('home');
