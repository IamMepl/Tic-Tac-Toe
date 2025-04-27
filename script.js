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
const targetScore = 3;
let score = { X: 0, O: 0 };

const sounds = {
  click: new Audio('audio/klik.mp3'),
  win: new Audio('audio/win.mp3'),
  lose: new Audio('audio/lose.mp3')
};

// Event Listeners
startButton.addEventListener('click', startGame);
backHomeButton.addEventListener('click', () => showScreen(homeScreen));
rematchButton.addEventListener('click', startGame);
homeButton.addEventListener('click', () => showScreen(homeScreen));

function showScreen(screen) {
  homeScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function startGame() {
  boardSize = parseInt(boardSizeSelect.value);
  winCondition = boardSize === 3 ? 3 : (boardSize === 6 ? 4 : 5);
  difficulty = difficultySelect.value;
  score.X = 0;
  score.O = 0;
  showScreen(gameScreen);
  startNewRound();
}

function startNewRound() {
  board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
  boardElement.classList.add('zoomIn');
  renderBoard();
  playerTurn = (firstPlayerSelect.value === "player");
  updateTurnStyle();

  countdownStart(() => {
    if (playerTurn) {
      turnInfo.innerText = "Your Turn";
      startTimer();
    } else {
      turnInfo.innerText = "Computer's Turn...";
      setTimeout(computerMove, 1000);
    }
  });
}

function countdownStart(callback) {
  const countdown = document.createElement('div');
  countdown.id = 'countdown';
  gameScreen.appendChild(countdown);

  let count = 3;
  countdown.innerText = count;
  const interval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(interval);
      countdown.remove();
      callback();
    } else {
      countdown.innerText = count;
    }
  }, 700);
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

function playerMove(event) {
  if (!playerTurn) return;

  const row = event.target.dataset.row;
  const col = event.target.dataset.col;
  if (board[row][col] !== '') return;

  board[row][col] = 'X';
  sounds.click.play();
  playerTurn = false;
  renderBoard();
  clearInterval(timer);
  updateTurnStyle();

  checkAfterMove('X');
}

function computerMove() {
  let move = getRandomMove();
  board[move.i][move.j] = 'O';
  renderBoard();
  const cellElement = document.querySelector(`.cell[data-row="${move.i}"][data-col="${move.j}"]`);
  cellElement.classList.add('computer-move');
  setTimeout(() => cellElement.classList.remove('computer-move'), 2000);
  playerTurn = true;
  updateTurnStyle();

  checkAfterMove('O');
}

function getRandomMove() {
  const empty = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === '') empty.push({i,j});
    }
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

function checkAfterMove(player) {
  const win = checkWin(player);
  if (win) {
    highlightWinningCells(win);
    score[player]++;
    if (score[player] >= targetScore) {
      setTimeout(() => endGame(player === 'X' ? 'You Win!' : 'Computer Wins!'), 1000);
    } else {
      setTimeout(startNewRound, 1500);
    }
    sounds[player === 'X' ? 'win' : 'lose'].play();
    confettiEffect();
    return;
  }

  if (checkDraw()) {
    setTimeout(startNewRound, 1500);
    return;
  }

  if (player === 'O') {
    turnInfo.innerText = "Your Turn";
    startTimer();
  } else {
    turnInfo.innerText = "Computer's Turn...";
    setTimeout(computerMove, 800);
  }
}

function checkWin(player) {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      if (Array.from({length: winCondition}, (_, k) => board[i][j+k]).every(v => v === player))
        return Array.from({length: winCondition}, (_, k) => ({row: i, col: j+k}));
    }
  }
  for (let j = 0; j < boardSize; j++) {
    for (let i = 0; i <= boardSize - winCondition; i++) {
      if (Array.from({length: winCondition}, (_, k) => board[i+k][j]).every(v => v === player))
        return Array.from({length: winCondition}, (_, k) => ({row: i+k, col: j}));
    }
  }
  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      if (Array.from({length: winCondition}, (_, k) => board[i+k][j+k]).every(v => v === player))
        return Array.from({length: winCondition}, (_, k) => ({row: i+k, col: j+k}));
    }
  }
  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = winCondition - 1; j < boardSize; j++) {
      if (Array.from({length: winCondition}, (_, k) => board[i+k][j-k]).every(v => v === player))
        return Array.from({length: winCondition}, (_, k) => ({row: i+k, col: j-k}));
    }
  }
  return null;
}

function checkDraw() {
  return board.every(row => row.every(cell => cell !== ''));
}

function highlightWinningCells(winningCells) {
  winningCells.forEach(cell => {
    document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`).classList.add('winning-cell');
  });
}

function endGame(message) {
  clearInterval(timer);
  resultText.innerText = message;
  showScreen(resultScreen);
}

function updateTurnStyle() {
  gameScreen.classList.toggle('player-turn', playerTurn);
  gameScreen.classList.toggle('computer-turn', !playerTurn);
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
      computerMove();
    }
  }, 1000);
}

function updateTimerUI() {
  timerElement.innerText = `Time Left: ${timeLeft}s`;
  timerBar.style.width = `${(timeLeft / 20) * 100}%`;
}

function confettiEffect() {
}
