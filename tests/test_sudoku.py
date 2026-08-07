import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import app
import sudoku_logic

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_new_game_endpoint(client):
    response = client.get('/new')
    assert response.status_code == 200
    data = response.get_json()
    assert 'puzzle' in data
    assert len(data['puzzle']) == 9

def test_generate_puzzle():
    puzzle, solution = sudoku_logic.generate_puzzle(35)
    assert len(puzzle) == 9
    assert len(solution) == 9

def test_unique_solution_solver():
    puzzle, solution = sudoku_logic.generate_puzzle(35)
    solutions = sudoku_logic.count_solutions(puzzle)
    assert solutions == 1