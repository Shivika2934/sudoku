const SIZE = 9;
let isNoteMode = false;
let activeHighlightDigit = null;
let timerInterval = null;
let secondsElapsed = 0;
let hintsUsedCount = 0;
let isGameFinished = false; // Flag to prevent duplicate completion triggers/modal popups
let cellNotes = Array.from({ length: 81 }, () => new Set());

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-game').addEventListener('click', startNewGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-btn').addEventListener('click', fetchHint);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('note-mode-toggle').addEventListener('click', toggleNoteMode);
  document.getElementById('solve-animation-btn').addEventListener('click', runVisualSolver);

  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  buildTrackerBar();
  renderLeaderboard();
  startNewGame();
});

function toggleNoteMode() {
  isNoteMode = !isNoteMode;
  const btn = document.getElementById('note-mode-toggle');
  btn.setAttribute('aria-pressed', isNoteMode);
  btn.innerText = `✏️ Note Mode: ${isNoteMode ? 'ON' : 'OFF'}`;
}

function buildTrackerBar() {
  const bar = document.getElementById('number-tracker');
  bar.innerHTML = '';
  for (let num = 1; num <= 9; num++) {
    const btn = document.createElement('button');
    btn.className = 'tracker-btn';
    btn.id = `tracker-${num}`;
    btn.setAttribute('aria-label', `Highlight number ${num}`);
    btn.innerText = `${num} (0/9)`;
    btn.addEventListener('click', () => toggleHighlightDigit(num));
    bar.appendChild(btn);
  }
}

function updateTrackerCounts() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  const counts = Array(10).fill(0);

  inputs.forEach(inp => {
    const val = parseInt(inp.value, 10);
    if (val >= 1 && val <= 9) counts[val]++;
  });

  for (let num = 1; num <= 9; num++) {
    const btn = document.getElementById(`tracker-${num}`);
    if (btn) {
      btn.innerText = `${num} (${counts[num]}/9)`;
      btn.classList.toggle('completed', counts[num] === 9);
    }
  }
}

function toggleHighlightDigit(num) {
  activeHighlightDigit = activeHighlightDigit === num ? null : num;
  document.querySelectorAll('.tracker-btn').forEach((b, idx) => {
    b.classList.toggle('active', idx + 1 === activeHighlightDigit);
  });
  applyDigitHighlights();
}

function applyDigitHighlights() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  inputs.forEach(inp => {
    const val = parseInt(inp.value, 10);
    inp.classList.toggle('highlighted', activeHighlightDigit !== null && val === activeHighlightDigit);
  });
}

function renderPuzzle(puzzle) {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  cellNotes = Array.from({ length: 81 }, () => new Set());
  hintsUsedCount = 0;

  const msg = document.getElementById('message');
  if (msg) {
    msg.innerText = '';
    msg.className = 'status-message';
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const idx = r * SIZE + c;
      const container = document.createElement('div');
      container.className = 'sudoku-cell-container';

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = r;
      input.dataset.col = c;
      input.dataset.index = idx;
      input.setAttribute('aria-label', `Row ${r + 1} Column ${c + 1}`);

      const blockRow = Math.floor(r / 3);
      const blockCol = Math.floor(c / 3);
      if ((blockRow + blockCol) % 2 === 1) input.classList.add('block-alt');

      const notesDiv = document.createElement('div');
      notesDiv.className = 'notes-grid';
      notesDiv.id = `notes-${idx}`;

      const val = puzzle[r][c];
      if (val !== 0) {
        input.value = val;
        input.disabled = true;
        input.classList.add('prefilled');
      }

      input.addEventListener('keydown', (e) => handleKeyInput(e, idx, input));

      container.appendChild(input);
      container.appendChild(notesDiv);
      boardDiv.appendChild(container);
    }
  }
  updateTrackerCounts();
}

function handleKeyInput(e, idx, input) {
  if (isGameFinished) return;

  if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
    e.preventDefault();
    const num = parseInt(e.key, 10);

    if (isNoteMode && !input.disabled) {
      input.value = '';
      if (cellNotes[idx].has(num)) cellNotes[idx].delete(num);
      else cellNotes[idx].add(num);
      renderNotes(idx);
    } else if (!input.disabled) {
      cellNotes[idx].clear();
      renderNotes(idx);
      input.value = num;

      validateRealtimeConflicts();
      updateTrackerCounts();
      applyDigitHighlights();
      checkAutoCompletion();
    }
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    if (!input.disabled) {
      cellNotes[idx].clear();
      renderNotes(idx);
      input.value = '';
      validateRealtimeConflicts();
      updateTrackerCounts();
      applyDigitHighlights();
    }
  }
}

function renderNotes(idx) {
  const notesDiv = document.getElementById(`notes-${idx}`);
  if (!notesDiv) return;
  notesDiv.innerHTML = '';
  for (let i = 1; i <= 9; i++) {
    const span = document.createElement('span');
    span.className = 'note-num';
    span.innerText = cellNotes[idx].has(i) ? i : '';
    notesDiv.appendChild(span);
  }
}

function validateRealtimeConflicts() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  const msg = document.getElementById('message');

  inputs.forEach(inp => inp.classList.remove('conflict'));

  const grid = Array.from({ length: 9 }, () => Array(9).fill(null));

  inputs.forEach(inp => {
    const r = parseInt(inp.dataset.row, 10);
    const c = parseInt(inp.dataset.col, 10);
    const val = inp.value ? parseInt(inp.value, 10) : null;
    grid[r][c] = { val, element: inp };
  });

  let hasConflict = false;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const current = grid[r][c];
      if (!current.val) continue;

      let isConflicting = false;

      for (let i = 0; i < 9; i++) {
        if (i !== c && grid[r][i].val === current.val) {
          grid[r][i].element.classList.add('conflict');
          isConflicting = true;
        }
        if (i !== r && grid[i][c].val === current.val) {
          grid[i][c].element.classList.add('conflict');
          isConflicting = true;
        }
      }

      const startRow = Math.floor(r / 3) * 3;
      const startCol = Math.floor(c / 3) * 3;
      for (let br = startRow; br < startRow + 3; br++) {
        for (let bc = startCol; bc < startCol + 3; bc++) {
          if ((br !== r || bc !== c) && grid[br][bc].val === current.val) {
            grid[br][bc].element.classList.add('conflict');
            isConflicting = true;
          }
        }
      }

      if (isConflicting) {
        current.element.classList.add('conflict');
        hasConflict = true;
      }
    }
  }

  if (msg) {
    if (hasConflict) {
      msg.innerText = '⚠️ Invalid move: Conflicting number in row, column, or 3x3 block!';
      msg.className = 'status-message error-text';
    } else {
      msg.innerText = '';
      msg.className = 'status-message';
    }
  }
}

async function checkAutoCompletion() {
  if (isGameFinished) return;

  const inputs = document.querySelectorAll('.sudoku-cell');
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  let isFilled = true;

  inputs.forEach(inp => {
    const r = parseInt(inp.dataset.row, 10);
    const c = parseInt(inp.dataset.col, 10);
    if (!inp.value) isFilled = false;
    board[r][c] = inp.value ? parseInt(inp.value, 10) : 0;
  });

  const conflicts = document.querySelectorAll('.sudoku-cell.conflict');
  if (isFilled && conflicts.length === 0) {
    const res = await fetch('/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board })
    });
    const data = await res.json();

    if (data.is_complete) {
      isGameFinished = true;
      clearInterval(timerInterval);
      showCongratulatoryModal(secondsElapsed);
    }
  }
}

function formatTimeDisplay(secs) {
  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function showCongratulatoryModal(timeInSeconds) {
  const existing = document.getElementById('victory-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'victory-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" role="dialog" aria-labelledby="victory-title">
      <h2 id="victory-title">🎉 Puzzle Solved!</h2>
      <p style="font-size: 1.2rem; font-weight: bold; color: #16a34a; margin: 8px 0;">Well done!</p>
      <p style="margin: 4px 0 16px; color: var(--text-color);">Time: <strong>${formatTimeDisplay(timeInSeconds)}</strong></p>
      <p style="font-size: 0.95rem; margin-bottom: 20px; opacity: 0.9;">Add your name to leaderboard to save your rank.</p>
      <button id="claim-leaderboard-btn">Save to Leaderboard</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('claim-leaderboard-btn').addEventListener('click', () => {
    modal.remove();
    saveScore(timeInSeconds);
  });
}

function saveScore(timeInSeconds) {
  const diff = document.getElementById('difficulty').value;
  const scores = JSON.parse(localStorage.getItem('sudoku_scores') || '[]');

  const name = prompt('Well done! Enter your name for the Top 10 Leaderboard:') || 'Anonymous';
  scores.push({
    name,
    time: Number(timeInSeconds),
    formattedTime: formatTimeDisplay(timeInSeconds),
    difficulty: diff,
    hints: hintsUsedCount
  });

  scores.sort((a, b) => a.time - b.time);

  const top10 = scores.slice(0, 10);
  localStorage.setItem('sudoku_scores', JSON.stringify(top10));
  renderLeaderboard();

  // Automatically start a fresh game after adding the player's name
  startNewGame();
}

function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;

  const scores = JSON.parse(localStorage.getItem('sudoku_scores') || '[]');

  if (scores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No recorded scores yet. Solve a puzzle to enter!</td></tr>`;
    return;
  }

  tbody.innerHTML = scores.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${s.name}</td>
      <td>${s.formattedTime || formatTimeDisplay(s.time)}</td>
      <td>${s.difficulty}</td>
      <td>${s.hints !== undefined ? s.hints : 0}</td>
    </tr>
  `).join('');
}

// Copilot Suggestion Evaluation Note:
// Copilot suggested synchronous loop delays for rendering.
// REJECTED: Synchronous delays froze the UI thread. Refactored to an async/await Promise with setTimeout.
async function runVisualSolver() {
  if (isGameFinished) return;
  const inputs = document.querySelectorAll('.sudoku-cell');
  for (let inp of inputs) {
    if (!inp.value && !inp.disabled) {
      inp.value = Math.floor(Math.random() * 9) + 1;
      inp.style.backgroundColor = '#ebf8ff';
      await new Promise(r => setTimeout(r, 40));
    }
  }
  checkSolution();
}

function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const s = String(secondsElapsed % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${m}:${s}`;
  }, 1000);
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

async function startNewGame() {
  isGameFinished = false; // Reset game finished status for new game
  const diff = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${diff}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  startTimer();
}

async function fetchHint() {
  if (isGameFinished) return;
  const res = await fetch('/hint');
  const data = await res.json();
  if (data.error) return;
  const input = document.querySelector(`.sudoku-cell[data-row="${data.row}"][data-col="${data.col}"]`);
  if (input) {
    input.value = data.val;
    input.disabled = true;
    input.classList.add('hint-locked');
    hintsUsedCount++;
    validateRealtimeConflicts();
    updateTrackerCounts();
    applyDigitHighlights();
    checkAutoCompletion();
  }
}

async function checkSolution() {
  if (isGameFinished) return;

  const inputs = document.querySelectorAll('.sudoku-cell');
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  let hasEmptyCells = false;

  inputs.forEach(inp => inp.classList.remove('conflict'));

  inputs.forEach(inp => {
    const r = parseInt(inp.dataset.row, 10);
    const c = parseInt(inp.dataset.col, 10);
    if (!inp.value) {
      hasEmptyCells = true;
      inp.classList.add('conflict'); // Highlight empty/missing fields red
    }
    board[r][c] = inp.value ? parseInt(inp.value, 10) : 0;
  });

  const res = await fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board })
  });
  const data = await res.json();
  const msg = document.getElementById('message');

  let hasErrors = false;

  // Highlight incorrect values returned by server red
  if (data.incorrect && data.incorrect.length > 0) {
    hasErrors = true;
    data.incorrect.forEach(([r, c]) => {
      const cell = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
      if (cell) cell.classList.add('conflict');
    });
  }

  if (hasEmptyCells || hasErrors) {
    if (msg) {
      msg.innerText = '⚠️ Board contains errors or missing fields!';
      msg.className = 'status-message error-text';
    }
  } else if (data.is_complete) {
    isGameFinished = true; // Lock completion so it cannot trigger again in this game
    clearInterval(timerInterval);
    if (msg) {
      msg.innerText = '';
      msg.className = 'status-message';
    }
    showCongratulatoryModal(secondsElapsed);
  }
}