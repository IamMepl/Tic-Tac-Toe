const homeScreen = document.getElementById('home');
const gameScreen = document.getElementById('game');
const resultScreen = document.getElementById('result');
const boardElement = document.getElementById('board');
const boardSizeSelect = document.getElementById('boardSize');
const firstPlayerSelect = document.getElementById('firstPlayer');
const difficultySelect = document.getElementById('difficulty');
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
let winCondition = 3;
let difficulty = "easy";
let roundScore = { player: 0, computer: 0 };
const ROUNDS_TO_WIN = 3;

const roundScoreElement = document.createElement('div');
roundScoreElement.className = 'round-score';
document.body.appendChild(roundScoreElement);

// Event Listeners
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

// Core Functions
function showScreen(screen) {
  homeScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function startGame() {
  boardSize = parseInt(boardSizeSelect.value);
  winCondition = boardSize === 3 ? 3 : boardSize === 6 ? 4 : 5;
  difficulty = difficultySelect.value;
  
  board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
  playerTurn = (firstPlayerSelect.value === "player");
  renderBoard();
  showScreen(gameScreen);
  updateRoundScore();

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

// Game Logic
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
    handleWin('player');
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
  let move;
  
  if (difficulty === "medium") {
    move = findStrategicMove('O', 'X') || findSecondaryMove('O') || getRandomMove();
  } 
  else if (difficulty === "hard") {
    move = findOptimalMove('O') || findStrategicMove('O', 'X') || getRandomMove();
  }
  else {
    move = getRandomMove();
  }

  board[move.i][move.j] = 'O';
  renderBoard();
  
  const computerCell = document.querySelector(`.cell[data-row="${move.i}"][data-col="${move.j}"]`);
  computerCell.classList.add('computer-move');
  setTimeout(() => computerCell.classList.remove('computer-move'), 500);

  if (checkWin('O')) {
    handleWin('computer');
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

// AI Functions
function getRandomMove() {
  const emptyCells = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') {
        emptyCells.push({ i, j });
      }
    }
  }
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function findStrategicMove(player, opponent) {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') {
        board[i][j] = player;
        if (checkWin(player)) {
          board[i][j] = '';
          return { i, j };
        }
        board[i][j] = '';
      }
    }
  }
  
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') {
        board[i][j] = opponent;
        if (checkWin(opponent)) {
          board[i][j] = '';
          return { i, j };
        }
        board[i][j] = '';
      }
    }
  }
  return null;
}

function findOptimalMove(player) {
  const opponent = player === 'O' ? 'X' : 'O';
  let move = findStrategicMove(player, opponent);
  if (move) return move;

  const forkMoves = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') {
        board[i][j] = player;
        if (checkPotentialLines(i, j, player) >= 2) {
          forkMoves.push({ i, j });
        }
        board[i][j] = '';
      }
    }
  }
  if (forkMoves.length > 0) return forkMoves[Math.floor(Math.random() * forkMoves.length)];

  if (boardSize % 2 === 1) {
    const center = Math.floor(boardSize/2);
    if (board[center][center] === '') return { i: center, j: center };
  }
  
  return null;
}

function checkPotentialLines(row, col, player) {
  let count = 0;
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dx, dy] of directions) {
    let lineLength = 1;
    for (let i = 1; i < winCondition; i++) {
      const x = row + dx*i, y = col + dy*i;
      if (x >= boardSize || y >= boardSize || y < 0) break;
      if (board[x][y] === player || (board[x][y] === '' && player === 'O')) lineLength++;
      else break;
    }
    for (let i = 1; i < winCondition; i++) {
      const x = row - dx*i, y = col - dy*i;
      if (x < 0 || y < 0 || y >= boardSize) break;
      if (board[x][y] === player || (board[x][y] === '' && player === 'O')) lineLength++;
      else break;
    }
    if (lineLength >= winCondition) count++;
  }
  return count;
}

// Win/Draw Checks
function checkWin(player) {
  // Horizontal
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      if (board[i].slice(j, j + winCondition).every(cell => cell === player)) {
        highlightWin(i, j, 0, 1);
        return true;
      }
    }
  }

  // Vertical
  for (let j = 0; j < boardSize; j++) {
    for (let i = 0; i <= boardSize - winCondition; i++) {
      const col = Array.from({length: winCondition}, (_, k) => board[i + k][j]);
      if (col.every(cell => cell === player)) {
        highlightWin(i, j, 1, 0);
        return true;
      }
    }
  }

  // Diagonals
  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      const diag1 = Array.from({length: winCondition}, (_, k) => board[i + k][j + k]);
      if (diag1.every(cell => cell === player)) {
        highlightWin(i, j, 1, 1);
        return true;
      }
    }
  }

  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = winCondition - 1; j < boardSize; j++) {
      const diag2 = Array.from({length: winCondition}, (_, k) => board[i + k][j - k]);
      if (diag2.every(cell => cell === player)) {
        highlightWin(i, j, 1, -1);
        return true;
      }
    }
  }

  return false;
}

function highlightWin(startRow, startCol, dx, dy) {
  for (let i = 0; i < winCondition; i++) {
    const row = startRow + dx*i;
    const col = startCol + dy*i;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('winning-cell');
  }
  shakeCamera();
}

function checkDraw() {
  return board.every(row => row.every(cell => cell !== ''));
}

// Game Flow
function handleWin(winner) {
  if (winner === 'player') roundScore.player++;
  else roundScore.computer++;
  
  updateRoundScore();
  
  if (roundScore.player >= ROUNDS_TO_WIN || roundScore.computer >= ROUNDS_TO_WIN) {
    const finalMessage = roundScore.player >= ROUNDS_TO_WIN ? 
      'You Won the Match!' : 'Computer Won the Match!';
    resultText.innerHTML = `${finalMessage}<br>Final Score: ${roundScore.player}-${roundScore.computer}`;
    roundScore = { player: 0, computer: 0 };
    endGame(finalMessage);
  } else {
    endGame(`${winner === 'player' ? 'You' : 'Computer'} Win This Round!`);
  }
}

function updateRoundScore() {
  roundScoreElement.textContent = `Player ${roundScore.player} - ${roundScore.computer} Computer`;
}

function endGame(message) {
  clearInterval(timer);
  resultText.innerHTML = `${message}<br>Current Score: ${roundScore.player}-${roundScore.computer}`;
  showScreen(resultScreen);
}

// Effects
function shakeCamera() {
  gameScreen.classList.add('shake');
  setTimeout(() => gameScreen.classList.remove('shake'), 500);
}

// Timer Functions
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

function autoPlayerMove() {
  const move = getRandomMove();
  board[move.i][move.j] = 'X';
  playerTurn = false;
  renderBoard();

  if (checkWin('X')) {
    handleWin('player');
    return;
  }

  if (checkDraw()) {
    endGame('Draw!');
    return;
  }

  turnInfo.innerText = "Computer's Turn...";
  setTimeout(computerMove, 700);
        }
