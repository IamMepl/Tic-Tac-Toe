let board = [];
let currentPlayer = 'X';
let playerScore = 0;
let computerScore = 0;
let timer;
let timeLeft = 20;
let gameOver = false;
let boardSize = 3;
let difficulty = "easy";

function startGame() {
  boardSize = parseInt(document.getElementById('boardSize').value);
  difficulty = document.getElementById('difficulty').value;
  const firstMove = document.getElementById('firstMove').value;
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(''));
  currentPlayer = firstMove === "player" ? 'X' : 'O';
  gameOver = false;
  renderBoard();
  resetTimer();
  if (currentPlayer === 'O') setTimeout(computerMove, 500);
}

function renderBoard() {
  const boardDiv = document.getElementById('gameBoard');
  boardDiv.innerHTML = '';
  boardDiv.style.gridTemplateColumns = `repeat(${boardSize}, 60px)`;
  boardDiv.style.gridTemplateRows = `repeat(${boardSize}, 60px)`;
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      cellDiv.textContent = cell;
      cellDiv.onclick = () => handleMove(i, j);
      boardDiv.appendChild(cellDiv);
    });
  });
}

function handleMove(i, j) {
  if (board[i][j] || gameOver) return;
  board[i][j] = currentPlayer;
  resetTimer();
  checkWin();
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  renderBoard();
  if (currentPlayer === 'O' && !gameOver) setTimeout(computerMove, 500);
}

function computerMove() {
  if (gameOver) return;
  let move = findBestMove();
  board[move.i][move.j] = currentPlayer;
  resetTimer();
  checkWin();
  currentPlayer = 'X';
  renderBoard();
}

function findBestMove() {
  let moves = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (!board[i][j]) moves.push({i, j});
    }
  }
  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  } else if (difficulty === "medium") {
    return moves[0];
  } else {
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

function checkWin() {
  let needed = boardSize === 3 ? 3 : boardSize === 6 ? 4 : 5;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j]) {
        if (checkDirection(i, j, 1, 0, needed) || checkDirection(i, j, 0, 1, needed) || 
            checkDirection(i, j, 1, 1, needed) || checkDirection(i, j, 1, -1, needed)) {
          highlightWin(i, j);
          if (board[i][j] === 'X') playerScore++;
          else computerScore++;
          updateScore();
          shake();
          confetti();
        }
      }
    }
  }
}

function checkDirection(x, y, dx, dy, needed) {
  let count = 0;
  for (let i = 0; i < needed; i++) {
    if (board[x + i*dx] && board[x + i*dx][y + i*dy] === board[x][y]) count++;
    else break;
  }
  return count === needed;
}

function highlightWin(x, y) {
  const boardDiv = document.getElementById('gameBoard');
  const cells = boardDiv.children;
  for (let k = 0; k < cells.length; k++) {
    cells[k].classList.remove('highlight');
  }
  cells[x * boardSize + y].classList.add('highlight');
}

function updateScore() {
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('computerScore').textContent = computerScore;
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 20;
  document.getElementById('timer').textContent = `Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (currentPlayer === 'X') computerMove();
      else handleMove(findBestMove().i, findBestMove().j);
    }
  }, 1000);
}

function rematch() {
  startGame();
}

function shake() {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
}
