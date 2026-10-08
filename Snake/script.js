/**
 * Prehistoric Snake Game Logic
 */

class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize; // 20x20
    
    this.snake = [];
    this.dx = 1;
    this.dy = 0;
    this.food = { x: 5, y: 5 };
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snake_high_score') || '0', 10);
    this.isRunning = false;
    this.gameLoop = null;
    this.speed = 110;

    this.scoreEl = document.getElementById('score');
    this.highScoreEl = document.getElementById('high-score');
    this.overlay = document.getElementById('game-overlay');
    this.overlayMsg = document.getElementById('overlay-msg');
    this.startBtn = document.getElementById('start-btn');

    this.init();
  }

  init() {
    this.highScoreEl.textContent = this.highScore;
    this.startBtn.addEventListener('click', () => this.start());

    this.setupControls();
    this.drawInitial();
  }

  drawInitial() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  start() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.scoreEl.textContent = '0';
    this.spawnFood();
    this.isRunning = true;
    this.overlay.classList.add('hidden');
    this.startBtn.textContent = 'Restart';

    this.gameLoop = setInterval(() => this.tick(), this.speed);
  }

  spawnFood() {
    let valid = false;
    while (!valid) {
      this.food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
    }
  }

  tick() {
    if (!this.isRunning) return;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      return this.gameOver();
    }

    // Self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      return this.gameOver();
    }

    this.snake.unshift(head);

    // Food eaten
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.scoreEl.textContent = this.score;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreEl.textContent = this.highScore;
        localStorage.setItem('snake_high_score', this.highScore.toString());
      }
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines subtly
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }

    // Draw food (amber glowing orb)
    this.ctx.fillStyle = '#f97316';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = '#f97316';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Draw snake
    this.snake.forEach((seg, index) => {
      this.ctx.fillStyle = index === 0 ? '#38bdf8' : '#0284c7';
      this.ctx.beginPath();
      this.ctx.roundRect(
        seg.x * this.gridSize + 1,
        seg.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
        index === 0 ? 6 : 3
      );
      this.ctx.fill();
    });
  }

  gameOver() {
    this.isRunning = false;
    clearInterval(this.gameLoop);
    this.overlayMsg.textContent = 'Game Over!';
    this.overlay.classList.remove('hidden');
    this.startBtn.textContent = 'Play Again';
  }

  setDirection(newDx, newDy) {
    if (!this.isRunning) return;
    // Prevent immediate 180 reverse
    if (this.dx === -newDx && this.dy === -newDy) return;
    this.dx = newDx;
    this.dy = newDy;
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.setDirection(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.setDirection(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this.setDirection(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        this.setDirection(1, 0);
      }
    });

    document.getElementById('dpad-up').addEventListener('click', () => this.setDirection(0, -1));
    document.getElementById('dpad-down').addEventListener('click', () => this.setDirection(0, 1));
    document.getElementById('dpad-left').addEventListener('click', () => this.setDirection(-1, 0));
    document.getElementById('dpad-right').addEventListener('click', () => this.setDirection(1, 0));
  }
}

new SnakeGame();
