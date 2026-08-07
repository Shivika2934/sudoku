import copy
import random

SIZE = 9
EMPTY = 0

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def solve_sudoku(board):
    """Solves the given board in-place using backtracking."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                for num in range(1, SIZE + 1):
                    if is_safe(board, row, col, num):
                        board[row][col] = num
                        if solve_sudoku(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def remove_cells(board, clues):
    attempts = SIZE * SIZE - clues
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)

    for row, col in cells:
        if attempts <= 0:
            break
        removed_val = board[row][col]
        board[row][col] = EMPTY

        if count_solutions(board) != 1:
            board[row][col] = removed_val
        else:
            attempts -= 1

def generate_sudoku(difficulty='medium'):
    clues_map = {'easy': 40, 'medium': 34, 'hard': 28}
    clues = clues_map.get(difficulty, 34)

    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution

def count_solutions(board, limit=2):
    count = 0
    def solve(b):
        nonlocal count
        if count >= limit:
            return
        for r in range(SIZE):
            for c in range(SIZE):
                if b[r][c] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(b, r, c, num):
                            b[r][c] = num
                            solve(b)
                            b[r][c] = EMPTY
                    return
        count += 1

    board_copy = deep_copy(board)
    solve(board_copy)
    return count