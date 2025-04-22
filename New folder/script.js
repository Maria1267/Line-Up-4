const ROWS = 6;
const COLS = 7;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "red";

const boardDiv = document.getElementById("board");

let redScore = 0;
let yellowScore = 0;

const redScoreSpan = document.getElementById("red-score");
const yellowScoreSpan = document.getElementById("yellow-score");


function updateBoard() {
    console.log("Updating board..."); // Afișează în consola că funcția este apelată
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        cell.classList.remove("red", "yellow");

        if (board[r][c]) {
            cell.classList.add(board[r][c]);
        }
    });
}

function updateScore() {
    console.log("Updating score..."); // Afișează în consola că scorul este actualizat
    redScoreSpan.textContent = redScore;
    yellowScoreSpan.textContent = yellowScore;
}






// Ia numele jucătorului din URL și îl afișează în pagina
window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const playerName = params.get("player") || "Jucător";

    const playerNameEl = document.getElementById("player-name");
    if (playerNameEl) {
        playerNameEl.textContent = playerName;
    }

    // Apelează și updateScore dacă vrei să actualizezi scorul la început
    updateScore();
});


function createBoard() {
    boardDiv.innerHTML = "";

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener("click", () => placePiece(c));
            boardDiv.appendChild(cell);
        }
    }
}

function placePiece(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) {
            board[r][col] = currentPlayer;
            updateBoard();

            if (checkWinner(r, col)) {
                setTimeout(() => {
                    alert(`${currentPlayer.toUpperCase()} a câștigat!`);
                    if (currentPlayer === "red") redScore++;
                    else yellowScore++;
                    updateScore();
                    resetGame();
                }, 100);
                return;
            }
            

            if (isBoardFull()) {
                setTimeout(() => alert("Egalitate! Tabla este plină."), 100);
                return;
            }

            switchPlayer();
            return;
        }
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === "red" ? "yellow" : "red";

    if (currentPlayer === "yellow") {
        setTimeout(botMove, 300);
    }
}

function botMove() {
    const col = getBestMove();
    placePiece(col);
}

// === BOT HARDCORE CU MINIMAX ===

function getBestMove() {
    let bestScore = -Infinity;
    let move = 0;

    for (let col = 0; col < COLS; col++) {
        let row = getAvailableRow(col);
        if (row !== -1) {
            board[row][col] = "yellow";
            let score = minimax(2, false); // adâncime 2
            board[row][col] = null;

            if (score > bestScore) {
                bestScore = score;
                move = col;
            }
        }
    }

    return move;
}

function minimax(depth, isMaximizing) {
    if (checkAnyWinner("yellow")) return 1000;
    if (checkAnyWinner("red")) return -1000;
    if (depth === 0 || isBoardFull()) return evaluateBoard();

    if (isMaximizing) {
        let best = -Infinity;
        for (let col = 0; col < COLS; col++) {
            let row = getAvailableRow(col);
            if (row !== -1) {
                board[row][col] = "yellow";
                best = Math.max(best, minimax(depth - 1, false));
                board[row][col] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let col = 0; col < COLS; col++) {
            let row = getAvailableRow(col);
            if (row !== -1) {
                board[row][col] = "red";
                best = Math.min(best, minimax(depth - 1, true));
                board[row][col] = null;
            }
        }
        return best;
    }
}

function evaluateBoard() {
    let score = 0;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = board[r][c];
            if (!cell) continue;

            const value = (cell === "yellow") ? 1 : -1;

            score += evaluateDirection(r, c, 1, 0, value);  // vertical
            score += evaluateDirection(r, c, 0, 1, value);  // orizontal
            score += evaluateDirection(r, c, 1, 1, value);  // diagonală /
            score += evaluateDirection(r, c, 1, -1, value); // diagonală \
        }
    }

    return score;
}

function evaluateDirection(r, c, dr, dc, value) {
    let count = 0;

    for (let i = 0; i < 4; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;

        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (board[nr][nc] === board[r][c]) {
                count++;
            } else if (board[nr][nc] !== null) {
                return 0;
            }
        } else {
            return 0;
        }
    }

    if (count === 3) return 100 * value;
    if (count === 2) return 10 * value;
    if (count === 4) return 1000 * value;
    return 0;
}

function getAvailableRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) return r;
    }
    return -1;
}

function checkWinner(r, c) {
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    for (let [dr, dc] of directions) {
        let count = 1;
        count += countDirection(r, c, dr, dc);
        count += countDirection(r, c, -dr, -dc);
        if (count >= 4) return true;
    }
    return false;
}

function countDirection(r, c, dr, dc) {
    let count = 0;
    let color = board[r][c];
    let nr = r + dr;
    let nc = c + dc;

    while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === color) {
        count++;
        nr += dr;
        nc += dc;
    }

    return count;
}

function checkAnyWinner(color) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === color && checkWinner(r, c)) {
                return true;
            }
        }
    }
    return false;
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell !== null));
}

function updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        cell.classList.remove("red", "yellow");

        if (board[r][c]) {
            cell.classList.add(board[r][c]);
        }
    });
}


function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentPlayer = "red";
    updateBoard();
    updateScore();
}


createBoard();















