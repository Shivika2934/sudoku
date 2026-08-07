import threading
import streamlit as st
from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Global game state store
CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'medium'
}

DIFFICULTY_CLUES = {
    'easy': 45,
    'medium': 35,
    'hard': 28
}

# --- Flask Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new', methods=['GET'])
def new_game():
    difficulty = request.args.get('difficulty', 'medium')
    
    # Generate the puzzle and solution
    puzzle, solution = sudoku_logic.generate_sudoku(difficulty)

    # Save to global state for /hint and /check
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty

    return jsonify({
        'puzzle': puzzle,
        'solution': solution
    })

@app.route('/hint', methods=['GET'])
def get_hint():
    solution = CURRENT.get('solution')
    puzzle = CURRENT.get('puzzle')
    if not solution or not puzzle:
        return jsonify({'error': 'No active game'}), 400
        
    empty_cells = []
    for r in range(sudoku_logic.SIZE):
        for c in range(sudoku_logic.SIZE):
            if puzzle[r][c] == 0:
                empty_cells.append((r, c))
                
    if not empty_cells:
        return jsonify({'error': 'No empty cells remaining'}), 400
        
    import random
    r, c = random.choice(empty_cells)
    val = solution[r][c]
    puzzle[r][c] = val  # Update puzzle memory
    
    return jsonify({'row': r, 'col': c, 'val': val})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
        
    incorrect = []
    is_complete = True
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] == 0:
                is_complete = False
            elif board[i][j] != solution[i][j]:
                incorrect.append([i, j])
                is_complete = False
                
    return jsonify({'incorrect': incorrect, 'is_complete': is_complete})

# --- Streamlit Cloud Deployment Wrapper ---

def run_flask():
    # Running with debug=False and use_reloader=False prevents background thread signal errors
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)

# Start Flask in a background thread once per Streamlit session
if "flask_thread" not in st.session_state:
    thread = threading.Thread(target=run_flask, daemon=True)
    thread.start()
    st.session_state["flask_thread"] = thread

# Streamlit Page Config & Embedded Frame
st.set_page_config(page_title="Sudoku Game", layout="wide")
st.components.v1.iframe("http://127.0.0.1:5000", height=850, scrolling=True)