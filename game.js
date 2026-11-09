"use strict";

// Class competition settings: distances are canvas pixels; speeds are pixels/second.
const SETTINGS = {
  width: 600,
  height: 500,
  playerWidth: 64,
  playerHeight: 18,
  playerBottomGap: 28,
  playerSpeed: 340,
  blockSize: 30,
  blockSpeed: 1000,
  maxTimeStep: 1 / 120
};

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const overlay = document.getElementById("game-overlay");
const overlayLabel = document.getElementById("overlay-label");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const overlayHint = document.getElementById("overlay-hint");
const playButton = document.getElementById("play-button");
const gameStatus = document.getElementById("game-status");
const scoreForm = document.getElementById("score-form");
const nicknameInput = document.getElementById("nickname");
const submitButton = document.getElementById("submit-button");
const submissionStatus = document.getElementById("submission-status");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardTable = document.getElementById("leaderboard-table");
const emptyLeaderboard = document.getElementById("empty-leaderboard");

let gameState = "instructions";
let score = 0;
let completedGame = null;
let previousTime = null;
const pressedKeys = new Set();
const touchDirections = new Map();
const player = { x: 0, y: SETTINGS.height - SETTINGS.playerBottomGap - SETTINGS.playerHeight };
const block = { x: 0, y: -SETTINGS.blockSize };

// Gameplay: one animation loop is shared by every round.
function spawnBlock() {
  block.x = Math.random() * (SETTINGS.width - SETTINGS.blockSize);
  block.y = -SETTINGS.blockSize;
}

function clearMovement() {
  pressedKeys.clear();
  touchDirections.clear();
  document.querySelectorAll(".touch-controls button").forEach(button => button.classList.remove("is-held"));
}

function startGame() {
  score = 0;
  completedGame = null;
  player.x = (SETTINGS.width - SETTINGS.playerWidth) / 2;
  spawnBlock();
  clearMovement();
  previousTime = null;
  gameState = "playing";
  scoreDisplay.textContent = "0";
  overlay.hidden = true;
  scoreForm.hidden = true;
  submissionStatus.textContent = "";
  gameStatus.textContent = "Round in progress. Dodge each falling block.";
  canvas.focus({ preventScroll: true });
}

function hasCollision() {
  return player.x < block.x + SETTINGS.blockSize &&
    player.x + SETTINGS.playerWidth > block.x &&
    player.y < block.y + SETTINGS.blockSize &&
    player.y + SETTINGS.playerHeight > block.y;
}

function endGame() {
  gameState = "gameover";
  completedGame = { score: score, submitted: false };
  clearMovement();
  overlayLabel.textContent = "GAME OVER";
  overlayTitle.textContent = "NICE RUN.";
  overlayMessage.textContent = `Final score: ${score}. Save your score in the leaderboard.`;
  overlayHint.textContent = "Press R or choose Play Again.";
  playButton.textContent = "Play Again";
  overlay.hidden = false;
  scoreForm.hidden = false;
  submitButton.disabled = false;
  nicknameInput.value = "";
  nicknameInput.setCustomValidity("");
  gameStatus.textContent = `Game over. Final score: ${score}.`;
  submissionStatus.textContent = "Enter a nickname to save this round once.";
}

function updateGameplay(elapsedSeconds) {
  const leftHeld = pressedKeys.has("arrowleft") || pressedKeys.has("a") || [...touchDirections.values()].includes("left");
  const rightHeld = pressedKeys.has("arrowright") || pressedKeys.has("d") || [...touchDirections.values()].includes("right");
  const direction = Number(rightHeld) - Number(leftHeld);
  player.x += direction * SETTINGS.playerSpeed * elapsedSeconds;
  player.x = Math.max(0, Math.min(SETTINGS.width - SETTINGS.playerWidth, player.x));
  block.y += SETTINGS.blockSpeed * elapsedSeconds;

  if (hasCollision()) {
    endGame();
  } else if (block.y >= SETTINGS.height) {
    score += 1;
    scoreDisplay.textContent = String(score);
    spawnBlock();
  }
}

// Rendering uses the fixed 600 × 500 canvas; CSS handles visual scaling.
function renderGame() {
  context.fillStyle = "#0b0e16";
  context.fillRect(0, 0, SETTINGS.width, SETTINGS.height);
  context.strokeStyle = "#192031";
  context.lineWidth = 1;
  for (let x = 0; x <= SETTINGS.width; x += 50) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, SETTINGS.height); context.stroke();
  }
  for (let y = 0; y <= SETTINGS.height; y += 50) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(SETTINGS.width, y); context.stroke();
  }
  context.fillStyle = "#ed5667";
  context.fillRect(block.x, block.y, SETTINGS.blockSize, SETTINGS.blockSize);
  context.strokeStyle = "#ffb6bf";
  context.strokeRect(block.x + 3, block.y + 3, SETTINGS.blockSize - 6, SETTINGS.blockSize - 6);
  context.fillStyle = "#479dff";
  context.fillRect(player.x, player.y, SETTINGS.playerWidth, SETTINGS.playerHeight);
  context.fillStyle = "#cae6ff";
  context.fillRect(player.x + 6, player.y + 4, SETTINGS.playerWidth - 12, 3);
}

function animate(currentTime) {
  if (gameState === "playing" && !document.hidden) {
    if (previousTime !== null) {
      let remainingTime = (currentTime - previousTime) / 1000;
      // Small steps prevent blocks from jumping through the player on slow frames.
      while (remainingTime > 0 && gameState === "playing") {
        const step = Math.min(remainingTime, SETTINGS.maxTimeStep);
        updateGameplay(step);
        remainingTime -= step;
      }
    }
    previousTime = currentTime;
  } else {
    previousTime = null;
  }
  renderGame();
  requestAnimationFrame(animate);
}

// Leaderboard data: memory only. Replace these two async functions in a later lesson.
const leaderboardEntries = [];

async function getLeaderboard() {
  return leaderboardEntries.slice().sort((first, second) => second.score - first.score).slice(0, 10);
}

async function submitScore(name, score) {
  leaderboardEntries.push({ name: name, score: score });
}

async function renderLeaderboard() {
  const entries = await getLeaderboard();
  leaderboardBody.replaceChildren();
  entries.forEach((entry, index) => {
    const row = document.createElement("tr");
    [index + 1, entry.name, entry.score].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = String(value); // Nicknames are text, never HTML.
      row.appendChild(cell);
    });
    leaderboardBody.appendChild(row);
  });
  emptyLeaderboard.hidden = entries.length > 0;
  leaderboardTable.hidden = entries.length === 0;
}

scoreForm.addEventListener("submit", async event => {
  event.preventDefault();
  const name = nicknameInput.value.trim();
  if (name.length < 1 || name.length > 20) {
    nicknameInput.setCustomValidity("Enter a nickname with 1–20 characters after trimming spaces.");
    nicknameInput.reportValidity();
    return;
  }
  if (!completedGame || completedGame.submitted) return;
  const round = completedGame;
  round.submitted = true; // Lock this round before awaiting to prevent double submissions.
  submitButton.disabled = true;
  await submitScore(name, round.score);
  await renderLeaderboard();
  if (completedGame === round) {
    scoreForm.hidden = true;
    submissionStatus.textContent = `Saved ${round.score} points for ${name}. Play again to submit another score.`;
  }
});

nicknameInput.addEventListener("input", () => nicknameInput.setCustomValidity(""));

// Input: keyboard and pointer controls work without interfering with nickname entry.
playButton.addEventListener("click", startGame);
document.addEventListener("keydown", event => {
  if (event.target instanceof HTMLElement && event.target.matches("input, textarea, [contenteditable]")) return;
  const key = event.key.toLowerCase();
  if (gameState === "playing" && ["arrowleft", "arrowright", "a", "d"].includes(key)) {
    event.preventDefault();
    pressedKeys.add(key);
  }
  if (gameState === "gameover" && key === "r" && !event.repeat) {
    event.preventDefault();
    startGame();
  }
});
document.addEventListener("keyup", event => pressedKeys.delete(event.key.toLowerCase()));

function setupTouchControl(buttonId, direction) {
  const button = document.getElementById(buttonId);
  button.addEventListener("pointerdown", event => {
    if (gameState !== "playing") return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    touchDirections.set(event.pointerId, direction);
    button.classList.add("is-held");
  });
  function releasePointer(event) {
    touchDirections.delete(event.pointerId);
    button.classList.toggle("is-held", [...touchDirections.values()].includes(direction));
  }
  button.addEventListener("pointerup", releasePointer);
  button.addEventListener("pointercancel", releasePointer);
  button.addEventListener("lostpointercapture", releasePointer);
}

setupTouchControl("move-left", "left");
setupTouchControl("move-right", "right");
window.addEventListener("blur", clearMovement);
document.addEventListener("visibilitychange", () => {
  previousTime = null;
  clearMovement();
  if (gameState === "playing") {
    gameStatus.textContent = document.hidden ? "Paused while this tab is hidden." : "Round resumed. Keep dodging!";
  }
});

player.x = (SETTINGS.width - SETTINGS.playerWidth) / 2;
renderLeaderboard();
requestAnimationFrame(animate);
