const homeScreen = document.getElementById('home');
const gameScreen = document.getElementById('game');
const resultScreen = document.getElementById('result');

const boardElement = document.getElementById('board');
const boardSizeSelect = document.getElementById('boardSize');
const firstPlayerSelect = document.getElementById('firstPlayer');
const startButton = document.getElementById('startButton');
const backHomeButton = document.getElementById('backHome');
const turnInfo = document.getElementById('turnInfo');
const timerElement = document.getElementById('timer');
const timerBar = document.getElementById('timerBar');

const resultText = document.getElementById('resultText');
const rematchButton = document.getElementById('rematchButton');
const homeButton = document.getElementById('homeButton');

let board = [];
let boardSize = 3;
let playerTurn = true;
let timer;
let timeLeft = 20;

startButton.addEventListener('click', startGame);
backHomeButton.addEventListener('click', () => {
  clearInterval(timer);
  showScreen(homeScreen);
});
rematchButton.addEventListener('click', startGame);
homeButton.addEventListener('click', () => {
  clearInterval(timer);
  showScreen(homeScreen);
});

function showScreen(screen) {
  homeScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function startGame() {
  boardSize = parseInt(boardSizeSelect.value);
  board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
  playerTurn = (firstPlayerSelect.value === 'player');
  renderBoard();
  showScreen(gameScreen);

  if (playerTurn) {
    turnInfo.innerText = "Your Turn";
    startTimer();
  } else {
    turnInfo.innerText = "Computer's Turn...";
    setTimeout(computerMove, 1000);
  }
}

function renderBoard() {
  boardElement.innerHTML = '';
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.innerText = board[i][j];
      cell.addEventListener('click', playerMove);
      boardElement.appendChild(cell);
    }
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 20;
  updateTimerUI();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timer);
      autoPlayerMove();
    }
  }, 1000);
}

function updateTimerUI() {
  timerElement.innerText = `Time Left: ${timeLeft}s`;
  timerBar.style.width = `${(timeLeft / 20) * 100}%`;
}

function playerMove(event) {
  if (!playerTurn) return;

  const row = event.target.dataset.row;
  const col = event.target.dataset.col;

  if (board[row][col] !== '') return;

  board[row][col] = 'X';
  playerTurn = false;
  renderBoard();
  clearInterval(timer);

  if (checkWin('X')) {
    endGame('You Win!');
    return;
  }

  if (checkDraw()) {
    endGame('Draw!');
    return;
  }

  turnInfo.innerText = "Computer's Turn...";
  setTimeout(computerMove, 700);
}

function computerMove() {
  const emptyCells = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') {
        emptyCells.push({ i, j });
      }
    }
  }

  if (emptyCells.length === 0) return;

  const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[move.i][move.j] = 'O';

  renderBoard();

  if (checkWin('O')) {
    endGame('Computer Wins!');
    return;
  }

  if (checkDraw()) {
    endGame('Draw!');
    return;
  }

  playerTurn = true;
  turnInfo.innerText = "Your Turn";
  startTimer();
}

function autoPlayerMove() {
  const emptyCells = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') {
        emptyCells.push({ i, j });
      }
    }
  }

  if (emptyCells.length === 0) return;

  const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[move.i][move.j] = 'X';
  playerTurn = false;
  renderBoard();

  if (checkWin('X')) {
    endGame('You Win!');
    return;
  }

  if (checkDraw()) {
    endGame('Draw!');
    return;
  }

  turnInfo.innerText = "Computer's Turn...";
  setTimeout(computerMove, 700);
}

function checkWin(player) {
  // Check rows
  for (let i = 0; i < boardSize; i++) {
    if (board[i].every(cell => cell === player)) return true;
  }

  // Check columns
  for (let j = 0; j < boardSize; j++) {
    let win = true;
    for (let i = 0; i < boardSize; i++) {
      if (board[i][j] !== player) {
        win = false;
        break;
      }
    }
    if (win) return true;
  }

  // Check diagonals
  let winDiag1 = true;
  let winDiag2 = true;
  for (let i = 0; i < boardSize; i++) {
    if (board[i][i] !== player) winDiag1 = false;
    if (board[i][boardSize - i - 1] !== player) winDiag2 = false;
  }
  if (winDiag1 || winDiag2) return true;

  return false;
}

function checkDraw() {
  return board.every(row => row.every(cell => cell !== ''));
}

function endGame(message) {
  clearInterval(timer);
  resultText.innerText = message;
  showScreen(resultScreen);
}
  
