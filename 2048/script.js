/**
 * 2048 Game Logic
 */

class Game2048 {
  constructor() {
    this.board = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('2048_best') || '0', 10);
    this.gridEl = document.getElementById('grid-board');
    this.scoreEl = document.getElementById('score');
    this.bestScoreEl = document.getElementById('best-score');
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.init();
  }

  init() {
    this.bestScoreEl.textContent = this.bestScore;
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    this.setupInputs();
    this.restart();
  }

  restart() {
    this.board = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.updateScore(0);
    this.spawnTile();
    this.spawnTile();
    this.render();
  }

  spawnTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  render() {
    this.gridEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.board[r][c];
        const cell = document.createElement('div');
        cell.className = `grid-cell ${val > 0 ? 'tile-' + val : ''}`;
        cell.textContent = val > 0 ? val : '';
        this.gridEl.appendChild(cell);
      }
    }
  }

  updateScore(add) {
    this.score += add;
    this.scoreEl.textContent = this.score;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreEl.textContent = this.bestScore;
      localStorage.setItem('2048_best', this.bestScore.toString());
    }
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      let moved = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        moved = this.moveUp();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        moved = this.moveDown();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moved = this.moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moved = this.moveRight();
      }

      if (moved) {
        e.preventDefault();
        this.spawnTile();
        this.render();
      }
    });

    // Touch swipe
    this.gridEl.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    this.gridEl.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - this.touchStartX;
      const dy = e.changedTouches[0].screenY - this.touchStartY;
      let moved = false;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 40) moved = this.moveRight();
        else if (dx < -40) moved = this.moveLeft();
      } else {
        if (dy > 40) moved = this.moveDown();
        else if (dy < -40) moved = this.moveUp();
      }

      if (moved) {
        this.spawnTile();
        this.render();
      }
    }, { passive: true });
  }

  slideAndCombine(row) {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        this.updateScore(arr[i]);
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  moveLeft() {
    let changed = false;
    for (let r = 0; r < 4; r++) {
      const orig = [...this.board[r]];
      const next = this.slideAndCombine(this.board[r]);
      this.board[r] = next;
      if (orig.some((v, i) => v !== next[i])) changed = true;
    }
    return changed;
  }

  moveRight() {
    let changed = false;
    for (let r = 0; r < 4; r++) {
      const orig = [...this.board[r]];
      const reversed = [...this.board[r]].reverse();
      const next = this.slideAndCombine(reversed).reverse();
      this.board[r] = next;
      if (orig.some((v, i) => v !== next[i])) changed = true;
    }
    return changed;
  }

  moveUp() {
    let changed = false;
    for (let c = 0; c < 4; c++) {
      const col = [this.board[0][c], this.board[1][c], this.board[2][c], this.board[3][c]];
      const next = this.slideAndCombine(col);
      for (let r = 0; r < 4; r++) {
        if (this.board[r][c] !== next[r]) changed = true;
        this.board[r][c] = next[r];
      }
    }
    return changed;
  }

  moveDown() {
    let changed = false;
    for (let c = 0; c < 4; c++) {
      const col = [this.board[3][c], this.board[2][c], this.board[1][c], this.board[0][c]];
      const next = this.slideAndCombine(col).reverse();
      for (let r = 0; r < 4; r++) {
        if (this.board[r][c] !== next[r]) changed = true;
        this.board[r][c] = next[r];
      }
    }
    return changed;
  }
}

new Game2048();
