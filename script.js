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

let playerScore = 0;
let computerScore = 0;
const score = { X: 0, O: 0 };

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
  score.X = 0;
  score.O = 0;
  renderBoard();
  showScreen(gameScreen);

  updateScoreboard();

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

  const winningCells = checkWin('X');
  if (winningCells) {
    highlightWinningCells(winningCells);
    score.X++;
    updateScoreboard();
    setTimeout(() => endGame('You Win!'), 1000);
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
  
  if (difficulty === "easy") {
    move = getRandomMove();
  } 
  else if (difficulty === "medium") {
    move = findStrategicMove('O', 'X') || getRandomMove();
  }
  else { // hard
    move = findStrategicMove('O', 'X') || findStrategicMove('X', 'O') || getRandomMove();
  }

  board[move.i][move.j] = 'O';
  renderBoard();

  const winningCells = checkWin('O');
  if (winningCells) {
    highlightWinningCells(winningCells);
    score.O++;
    updateScoreboard();
    setTimeout(() => endGame('Computer Wins!'), 1000);
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

// Helper Functions
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
  // Try to win first
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
  
  // Block opponent's winning moves
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

function checkWin(player) {
  // Check rows
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      let win = true;
      for (let k = 0; k < winCondition; k++) {
        if (board[i][j + k] !== player) {
          win = false;
          break;
        }
      }
      if (win) return Array.from({ length: winCondition }, (_, k) => ({row: i, col: j + k}));
    }
  }

  // Check columns
  for (let j = 0; j < boardSize; j++) {
    for (let i = 0; i <= boardSize - winCondition; i++) {
      let win = true;
      for (let k = 0; k < winCondition; k++) {
        if (board[i + k][j] !== player) {
          win = false;
          break;
        }
      }
      if (win) return Array.from({ length: winCondition }, (_, k) => ({row: i + k, col: j}));
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      let win = true;
      for (let k = 0; k < winCondition; k++) {
        if (board[i + k][j + k] !== player) {
          win = false;
          break;
        }
      }
      if (win) return Array.from({ length: winCondition }, (_, k) => ({row: i + k, col: j + k}));
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = winCondition - 1; j < boardSize; j++) {
      let win = true;
      for (let k = 0; k < winCondition; k++) {
        if (board[i + k][j - k] !== player) {
          win = false;
          break;
        }
      }
      if (win) return Array.from({ length: winCondition }, (_, k) => ({row: i + k, col: j - k}));
    }
  }

  return null;
}

function checkDraw() {
  return board.every(row => row.every(cell => cell !== ''));
}

// UI Effects
function highlightWinningCells(winningCells) {
  // Highlight cells
  winningCells.forEach(cell => {
    const cellElement = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
    cellElement.classList.add('winning-cell');
  });
  
  // Get center position for effects
  const firstCell = document.querySelector(`.cell[data-row="${winningCells[0].row}"][data-col="${winningCells[0].col}"]`);
  const lastCell = document.querySelector(`.cell[data-row="${winningCells[winningCells.length-1].row}"][data-col="${winningCells[winningCells.length-1].col}"]`);
  const rect1 = firstCell.getBoundingClientRect();
  const rect2 = lastCell.getBoundingClientRect();
  const centerX = (rect1.left + rect2.left + rect1.width + rect2.width) / 2;
  const centerY = (rect1.top + rect2.top + rect1.height + rect2.height) / 2;
  
  // Add effects
  createParticles(centerX, centerY);
  shakeCamera();
}

function createParticles(x, y) {
  const particles = [];
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.pointerEvents = 'none';
    document.body.appendChild(particle);
    
    particles.push({
      element: particle,
      x: 0,
      y: 0,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * 6 - 3,
      life: 100
    });
  }
  
  const animateParticles = () => {
    let allDead = true;
    
    particles.forEach(p => {
      if (p.life > 0) {
        allDead = false;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
        p.element.style.opacity = p.life / 100;
      }
    });
    
    if (!allDead) {
      requestAnimationFrame(animateParticles);
    } else {
      particles.forEach(p => p.element.remove());
    }
  };
  
  animateParticles();
}

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

  const winningCells = checkWin('X');
  if (winningCells) {
    highlightWinningCells(winningCells);
    score.X++;
    updateScoreboard();
    setTimeout(() => endGame('You Win!'), 1000);
    return;
  }

  if (checkDraw()) {
    endGame('Draw!');
    return;
  }

  turnInfo.innerText = "Computer's Turn...";
  setTimeout(computerMove, 700);
}

// Score Functions
function updateScoreboard() {
  document.getElementById('playerScore').innerText = playerScore;
  document.getElementById('computerScore').innerText = computerScore;
  
  const matchScoreElement = document.getElementById('matchScore') || document.createElement('div');
  matchScoreElement.id = 'matchScore';
  matchScoreElement.innerHTML = `Current Match: <span class="x-score">X: ${score.X}</span> - <span class="o-score">O: ${score.O}</span>`;
  matchScoreElement.style.marginTop = '10px';
  matchScoreElement.style.fontSize = '16px';
  matchScoreElement.style.fontWeight = 'bold';
  
  if (!document.getElementById('matchScore')) {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.appendChild(matchScoreElement);
  }
}

function endGame(message) {
  clearInterval(timer);
  resultText.innerText = message;
  showScreen(resultScreen);
    }
