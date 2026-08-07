# GitHub Copilot Custom Instructions: Flask Sudoku Application

This project is a modern, accessible, full-stack Sudoku web application refactored from legacy Python code into a Flask backend with a responsive vanilla JavaScript frontend. Follow these standards for all generated, refactored, or suggested code.

---

## 1. Project Architecture & Stack Boundaries
- **Backend Framework:** Python 3.10+ using Flask. Keep logic modular across `app.py` (REST routes and game session coordination) and `sudoku_logic.py` (puzzle generation, backtracking solver, unique solution validation).
- **Frontend Framework:** Plain HTML5, CSS3, and vanilla modern JavaScript (ES6+). Do NOT suggest heavy external JS frameworks (React, Vue, jQuery).
- **Testing Suite:** Python `pytest` for backend unit tests (`tests/test_sudoku.py`).

---

## 2. Python & Flask Best Practices (`app.py`, `sudoku_logic.py`)
- **PEP 8 Compliance:** Use standard `snake_case` naming conventions for functions and variables, and keep functions short and single-purpose.
- **Backtracking & Algorithmic Rigor:** Ensure any puzzle generation routine guarantees exactly **one unique solution** (`count_solutions == 1`).
- **REST Endpoints:** Standardize JSON API responses (`jsonify`) with clean HTTP status codes (`200` for successes, `400` for invalid moves/requests, `500` for internal server errors).
- **Explicit Imports & Modules:** Ensure tests and helper files resolve module paths relative to the project root directory.

---

## 3. Frontend & JavaScript Conventions (`static/main.js`)
- **Modern ES6+ Syntax:** Prefer `const`/`let`, arrow functions, `async`/`await` with `fetch()`, and clear DOM manipulation methods over direct inline event handlers.
- **State Management:** Keep game variables (e.g., active timer, note mode state, selected highlight digit) organized and scoped.
- **Client Persistence:** Store persistent application state (dark mode preference, top 10 fastest times) in `localStorage` under structured JSON keys.

---

## 4. UI, Styling & Layout Standards (`static/styles.css`)
- **CSS Custom Properties:** Maintain theme parameters via CSS variables (`:root` and `[data-theme="dark"]`) for instant light/dark mode switching.
- **Grid Structure & Scale:** Use CSS Grid for the 9x9 matrix. Enforce explicit size constraints (`max-width: 450px`, cell sizes `45px` x `45px`) so the grid remains legible on mobile screens without stretching excessively on wide viewports.
- **Subgrid Visual Hierarchy:** Emphasize 3x3 subgrid blocks using thick outer/subgrid borders (`3px`–`4px`) and alternating block background colors (`block-alt`).

---

## 5. Accessibility Requirements (WCAG 2.1 AA Standards)
- **Semantic HTML & ARIA Attributes:** Mark up interactive components with proper semantic roles and state indicators (`role="grid"`, `role="toolbar"`, `aria-label`, `aria-pressed`, `aria-live`).
- **Keyboard Navigation:** Ensure all cells, selectors, and controls are fully accessible via keyboard (`Tab` / `Shift+Tab`) with visible, high-contrast focus rings (`:focus-visible`).
- **Color Contrast:** Keep text, cell numbers, and active/error highlight backgrounds compliant with minimum visual contrast ratios (≥ 4.5:1).