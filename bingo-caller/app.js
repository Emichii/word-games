/* ==========================================================
   BINGO CALLER — app.js

   VIDEO SETUP:
   Drop your 8-second Nano Banana clips into the /videos folder.
   Name them however you like, then add them to the VIDEOS array
   below. Each entry has a "src" (file path) and a "label"
   (displayed briefly as a fun subtitle).

   MUSIC SETUP:
   Drop mp3/ogg files into /music, then add <source> tags
   inside the <audio id="bg-music"> element in index.html,
   OR use the MUSIC_TRACKS array below for multiple tracks.
   ========================================================== */

// ── VIDEO CLIPS ──────────────────────────────────────────
// Add your Nano Banana videos here!
// Each clip should be ~8 seconds. The site picks one at random each call.
const VIDEOS = [
    // { src: "videos/san-francisco.mp4",  label: "Rolling through San Francisco!" },
    // { src: "videos/ocean-wave.mp4",     label: "Surfing the ocean!" },
    // { src: "videos/roller-coaster.mp4", label: "Coaster ride!" },
    // { src: "videos/space-launch.mp4",   label: "Blast off!" },
    // { src: "videos/jungle-roll.mp4",    label: "Through the jungle!" },
    // { src: "videos/city-lights.mp4",    label: "City lights!" },
];

// ── MUSIC TRACKS (optional) ─────────────────────────────
// If you want multiple tracks that rotate, list them here.
// Leave empty to use the <audio> tag in HTML instead.
const MUSIC_TRACKS = [
    // "music/fun-tune-1.mp3",
    // "music/fun-tune-2.mp3",
];

// ── BINGO RANGES ─────────────────────────────────────────
const BINGO_RANGES = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75],
};

// ── STATE ────────────────────────────────────────────────
let calledNumbers = new Set();   // e.g. "B7", "I22"
let callHistory = [];            // ordered, most recent first
let isPlaying = false;           // true while video/reveal is in progress
let musicOn = false;
let lastVideoIndex = -1;

// ── DOM REFS ─────────────────────────────────────────────
const stageEl         = document.getElementById("stage");
const videoContainer  = document.getElementById("video-container");
const videoEl         = document.getElementById("ball-video");
const numberReveal    = document.getElementById("number-reveal");
const revealLetter    = document.getElementById("reveal-letter");
const revealNumber    = document.getElementById("reveal-number");
const stagePrompt     = document.getElementById("stage-prompt");
const ballInput       = document.getElementById("ball-input");
const callBtn         = document.getElementById("call-btn");
const inputError      = document.getElementById("input-error");
const bgMusic         = document.getElementById("bg-music");
const recentCalls     = document.getElementById("recent-calls");

// Hamburger menu refs
const hamburgerBtn    = document.getElementById("hamburger-btn");
const hamburgerMenu   = document.getElementById("hamburger-menu");
const menuMusic       = document.getElementById("menu-music");
const menuNewGame     = document.getElementById("menu-new-game");

// Celebration refs
const bingoWinnerBtn  = document.getElementById("bingo-winner-btn");
const celebrationOverlay = document.getElementById("celebration-overlay");
const celebNewGame    = document.getElementById("celeb-new-game");
const confettiContainer = document.getElementById("confetti-container");

// ── INIT ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    callBtn.addEventListener("click", handleCall);
    ballInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleCall();
    });

    // Hamburger menu
    hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        hamburgerMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
        hamburgerMenu.classList.add("hidden");
    });
    hamburgerMenu.addEventListener("click", (e) => e.stopPropagation());

    menuMusic.addEventListener("click", toggleMusic);
    menuNewGame.addEventListener("click", () => {
        hamburgerMenu.classList.add("hidden");
        confirmNewGame();
    });

    // BINGO winner button
    bingoWinnerBtn.addEventListener("click", showCelebration);
    celebNewGame.addEventListener("click", () => {
        hideCelebration();
        resetGame();
    });

    // If music tracks are defined in JS, load the first one
    if (MUSIC_TRACKS.length > 0) {
        bgMusic.src = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
    }
});

// ── PARSE & VALIDATE INPUT ───────────────────────────────
function parseInput(raw) {
    const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
    // Accept formats: B7, B07, b7, 7 (if letter selected), etc.
    const match = cleaned.match(/^([BINGO])(\d{1,2})$/);
    if (!match) return null;
    const letter = match[1];
    const num = parseInt(match[2], 10);
    const [min, max] = BINGO_RANGES[letter];
    if (num < min || num > max) return null;
    return { letter, num, key: `${letter}${num}` };
}

function showError(msg) {
    inputError.textContent = msg;
    inputError.classList.remove("hidden");
    setTimeout(() => inputError.classList.add("hidden"), 3000);
}

// ── MAIN CALL HANDLER ────────────────────────────────────
function handleCall() {
    if (isPlaying) return;

    const parsed = parseInput(ballInput.value);
    if (!parsed) {
        showError("Enter a valid bingo number like B7, I22, N35, G50, O68");
        return;
    }

    if (calledNumbers.has(parsed.key)) {
        showError(`${parsed.key} has already been called!`);
        return;
    }

    // Register the call
    calledNumbers.add(parsed.key);
    callHistory.unshift(parsed);
    ballInput.value = "";
    inputError.classList.add("hidden");

    // Play the sequence
    isPlaying = true;
    callBtn.disabled = true;

    if (VIDEOS.length > 0) {
        playVideoThenReveal(parsed);
    } else {
        // No videos yet — show a fun placeholder animation, then reveal
        playPlaceholderThenReveal(parsed);
    }
}

// ── VIDEO PLAYBACK ───────────────────────────────────────
function playVideoThenReveal(parsed) {
    // Pick a random video (avoid repeating the last one if possible)
    let idx;
    if (VIDEOS.length === 1) {
        idx = 0;
    } else {
        do {
            idx = Math.floor(Math.random() * VIDEOS.length);
        } while (idx === lastVideoIndex);
    }
    lastVideoIndex = idx;

    const clip = VIDEOS[idx];
    videoEl.src = clip.src;

    stagePrompt.classList.add("hidden");
    numberReveal.classList.add("hidden");
    numberReveal.classList.remove("animate-in");
    videoContainer.classList.remove("hidden");

    videoEl.currentTime = 0;
    videoEl.play().catch(() => {
        // Autoplay blocked — skip to reveal
        revealNumber(parsed);
    });

    // When video ends (or after 8.5s safety), reveal the number
    const safety = setTimeout(() => doReveal(parsed), 8500);

    videoEl.onended = () => {
        clearTimeout(safety);
        doReveal(parsed);
    };
}

function doReveal(parsed) {
    videoContainer.classList.add("hidden");
    videoEl.pause();
    showReveal(parsed);
}

// ── PLACEHOLDER (no videos yet) ──────────────────────────
function playPlaceholderThenReveal(parsed) {
    stagePrompt.classList.add("hidden");
    numberReveal.classList.add("hidden");
    numberReveal.classList.remove("animate-in");

    // Show a quick rolling animation in the stage
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder-roll";
    placeholder.innerHTML = `
        <div class="rolling-ball letter-${parsed.letter}">
            <span class="ball-inner">?</span>
        </div>
    `;
    stageEl.appendChild(placeholder);

    // Add the styles dynamically if not already present
    if (!document.getElementById("placeholder-styles")) {
        const style = document.createElement("style");
        style.id = "placeholder-styles";
        style.textContent = `
            .placeholder-roll {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 5;
                background: var(--stage-bg);
            }
            .rolling-ball {
                width: 140px;
                height: 140px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Fredoka One', cursive;
                font-size: 4rem;
                color: #fff;
                animation: rollBounce 1.5s ease-in-out;
                box-shadow: 0 0 40px rgba(255,255,255,0.4);
            }
            .rolling-ball.letter-B { background: var(--col-b); }
            .rolling-ball.letter-I { background: var(--col-i); color: #1a1a2e; }
            .rolling-ball.letter-N { background: var(--col-n); }
            .rolling-ball.letter-G { background: var(--col-g); }
            .rolling-ball.letter-O { background: var(--col-o); }
            .ball-inner {
                animation: spin 1.5s ease-in-out;
            }
            @keyframes rollBounce {
                0%   { transform: translateX(-400px) scale(0.6) rotate(-360deg); opacity: 0; }
                30%  { transform: translateX(40px) scale(1.1) rotate(0deg); opacity: 1; }
                50%  { transform: translateX(-20px) scale(0.95) rotate(15deg); }
                70%  { transform: translateX(10px) scale(1.02) rotate(-5deg); }
                100% { transform: translateX(0) scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes spin {
                0%   { transform: rotate(-720deg); }
                100% { transform: rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // After the roll animation, reveal the number
    setTimeout(() => {
        placeholder.remove();
        showReveal(parsed);
    }, 1800);
}

// ── NUMBER REVEAL ────────────────────────────────────────
function showReveal(parsed) {
    revealLetter.textContent = parsed.letter;
    revealNumber.textContent = parsed.num;
    const ball = document.getElementById("reveal-ball");
    ball.className = `reveal-ball bg-${parsed.letter.toLowerCase()}`;

    numberReveal.classList.remove("hidden");
    // Trigger animation
    numberReveal.classList.remove("animate-in");
    void numberReveal.offsetWidth; // force reflow
    numberReveal.classList.add("animate-in");

    stagePrompt.classList.add("hidden");

    // Update the board and history
    addToBoard(parsed);
    updateRecentStrip();

    // Unlock input after reveal settles
    setTimeout(() => {
        isPlaying = false;
        callBtn.disabled = false;
        ballInput.focus();
    }, 1200);
}

// ── BOARD UPDATE ─────────────────────────────────────────
function addToBoard(parsed) {
    const col = document.getElementById(`col-${parsed.letter}`);
    const ball = document.createElement("div");
    ball.className = `called-number col-${parsed.letter.toLowerCase()}`;
    ball.textContent = parsed.num;
    ball.dataset.num = parsed.num;
    ball.dataset.letter = parsed.letter;
    ball.title = "Click to remove";
    ball.addEventListener("click", () => undoCall(parsed.letter, parsed.num));

    // Sorted insertion: find first existing ball with larger number, insert before it
    const existing = Array.from(col.children);
    const insertBefore = existing.find(
        (child) => parseInt(child.dataset.num, 10) > parsed.num
    );
    if (insertBefore) {
        col.insertBefore(ball, insertBefore);
    } else {
        col.appendChild(ball);
    }

    applyCompactMode();
}

// ── UNDO A CALL ──────────────────────────────────────────
function undoCall(letter, num) {
    const key = `${letter}${num}`;
    if (!calledNumbers.has(key)) return;

    calledNumbers.delete(key);
    callHistory = callHistory.filter((p) => !(p.letter === letter && p.num === num));

    // Remove the matching ball from the DOM
    const col = document.getElementById(`col-${letter}`);
    const ball = Array.from(col.children).find(
        (child) => parseInt(child.dataset.num, 10) === num
    );
    if (ball) ball.remove();

    updateRecentStrip();
    applyCompactMode();
    ballInput.focus();
}

// ── COMPACT MODE — auto-shrink balls only when actually overflowing ──
function applyCompactMode() {
    const board = document.getElementById("called-board");
    board.classList.remove("compact", "ultra-compact");

    // Force a layout pass, then check if any column's last ball
    // extends past the board's content area. If yes, escalate.
    void board.offsetHeight;
    if (boardOverflows()) {
        board.classList.add("compact");
        void board.offsetHeight;
        if (boardOverflows()) {
            board.classList.remove("compact");
            board.classList.add("ultra-compact");
        }
    }
}

function boardOverflows() {
    const board = document.getElementById("called-board");
    const boardRect = board.getBoundingClientRect();
    const padBottom = parseFloat(getComputedStyle(board).paddingBottom) || 0;
    const limit = boardRect.bottom - padBottom;
    for (const letter of ["B", "I", "N", "G", "O"]) {
        const col = document.getElementById(`col-${letter}`);
        const last = col.lastElementChild;
        if (!last) continue;
        if (last.getBoundingClientRect().bottom > limit) return true;
    }
    return false;
}

// ── RECENT STRIP ─────────────────────────────────────────
function updateRecentStrip() {
    recentCalls.innerHTML = "";
    const show = callHistory.slice(0, 2);
    show.forEach((p) => {
        const el = document.createElement("span");
        el.className = `recent-ball col-${p.letter.toLowerCase()}`;
        el.textContent = `${p.letter}${p.num}`;
        recentCalls.appendChild(el);
    });
}

// ── MUSIC ────────────────────────────────────────────────
function toggleMusic() {
    musicOn = !musicOn;
    if (musicOn) {
        bgMusic.play().catch(() => {
            musicOn = false;
            menuMusic.textContent = "\u266B Music Off";
            menuMusic.classList.remove("music-active");
        });
        menuMusic.innerHTML = "&#9835; Music On";
        menuMusic.classList.add("music-active");
    } else {
        bgMusic.pause();
        menuMusic.innerHTML = "&#9835; Music Off";
        menuMusic.classList.remove("music-active");
    }
}

// ── CELEBRATION ──────────────────────────────────────────
function showCelebration() {
    // Generate confetti pieces
    confettiContainer.innerHTML = "";
    const colors = ["var(--col-b)", "var(--col-i)", "var(--col-n)", "var(--col-g)", "var(--col-o)", "#ffd700", "#fff"];
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const size = 0.5 + Math.random() * 1;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;
        const shape = Math.random() > 0.5 ? "50%" : "0";
        piece.style.cssText = `
            left: ${left}%;
            width: ${size}vw;
            height: ${size}vw;
            background: ${color};
            border-radius: ${shape};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;
        confettiContainer.appendChild(piece);
    }

    celebrationOverlay.classList.remove("hidden");
}

function hideCelebration() {
    celebrationOverlay.classList.add("hidden");
    confettiContainer.innerHTML = "";
}

// ── NEW GAME ─────────────────────────────────────────────
function confirmNewGame() {
    // Simple confirmation overlay
    const overlay = document.createElement("div");
    overlay.id = "confirm-overlay";
    overlay.innerHTML = `
        <div class="confirm-box">
            <p>Start a new game?<br>This clears all called numbers.</p>
            <button class="btn confirm-yes">Yes, New Game!</button>
            <button class="btn confirm-no">Cancel</button>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".confirm-yes").addEventListener("click", () => {
        resetGame();
        overlay.remove();
    });
    overlay.querySelector(".confirm-no").addEventListener("click", () => {
        overlay.remove();
    });
}

function resetGame() {
    calledNumbers.clear();
    callHistory = [];
    lastVideoIndex = -1;

    // Clear board columns
    ["B", "I", "N", "G", "O"].forEach((letter) => {
        document.getElementById(`col-${letter}`).innerHTML = "";
    });

    // Reset compact mode
    applyCompactMode();

    // Clear recent strip
    recentCalls.innerHTML = "";

    // Reset stage
    videoContainer.classList.add("hidden");
    numberReveal.classList.add("hidden");
    numberReveal.classList.remove("animate-in");
    stagePrompt.classList.remove("hidden");

    isPlaying = false;
    callBtn.disabled = false;
    ballInput.value = "";
    ballInput.focus();
}
