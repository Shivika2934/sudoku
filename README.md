# 🎲 Sudoku Web Application

An interactive, web-based Sudoku puzzle application built with **Flask** and **Python**, with full support for local development and **Streamlit Cloud** deployment. Features dynamic board generation, uniqueness verification, interactive hints, and realtime solution validation.
<img width="576" height="794" alt="image" src="https://github.com/user-attachments/assets/0aecfe8c-d5a8-4057-9757-77648a718c89" />

---

## ✨ Features

* **Dynamic Puzzle Generation:** Generates valid Sudoku boards across multiple difficulty levels (`Easy`, `Medium`, `Hard`).
* **Unique Solution Guarantee:** Ensures every generated puzzle has exactly one valid solution using a solution-counting backtracking algorithm.
* **Interactive Gameplay:**
* Realtime move validation and solution checking.
* Hint system providing accurate cell reveals based on active board state.


* **Streamlit Cloud Ready:** Configured to run seamless background threading to avoid Flask signal handler crashes in Streamlit containerized environments.

---

## 🛠️ Project Structure

```text
.
├── app.py              # Main application server (Flask + Streamlit wrapper)
├── sudoku_logic.py     # Core Sudoku algorithm (generation, solver, uniqueness checker)
├── requirements.txt    # Python dependencies
├── static/             # Static web assets (JavaScript, CSS)
│   ├── main.js
│   └── style.css
└── templates/          # HTML Templates
    └── index.html

```

---

## 🚀 Getting Started

### Prerequisites

* Python 3.10+
* `pip` package manager

### Local Setup & Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Shivika2934/sudoku.git
cd sudoku

```


2. **Create and activate a virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate

```


3. **Install dependencies:**
```bash
pip install -r requirements.txt

```


4. **Run locally:**
```bash
streamlit run app.py

```


Open your browser at `http://localhost:8501` to view the application.

---

## ☁️ Deployment

### Streamlit Community Cloud

1. Push your latest repository changes to GitHub.
2. Sign in to [Streamlit Community Cloud](https://share.streamlit.io/).
3. Click **New App**, select your repository (`Shivika2934/sudoku`), branch (`main`), and set the Main file path to `app.py`.
4. Deploy!

---

## 🔌 API Endpoints

* `GET /` — Serves the main Sudoku HTML interface.
* `GET /new?difficulty={easy|medium|hard}` — Generates a new puzzle and solution pair.
* `GET /hint` — Reveals a correct value for a random empty cell in the active game.
* `POST /check` — Validates the user's current board against the active solution state.
