// Simple Fighting Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game constants
const GRAVITY = 0.5;
const GROUND_Y = 350;

// Fighter class
class Fighter {
  constructor(x, y, color, controls) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 100;
    this.color = color;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpPower = 15;
    this.health = 100;
    this.maxHealth = 100;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.facing = 'right';
    this.controls = controls;
    this.isJumping = false;
  }
  
  update() {
    // Apply gravity
    this.velocityY += GRAVITY;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Ground collision
    if (this.y + this.height > GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.velocityY = 0;
      this.isJumping = false;
    }
    
    // Screen boundaries
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // Reset attack state
    if (this.isAttacking && this.attackCooldown <= 20) {
      this.isAttacking = false;
    }
  }
  
  draw() {
    // Draw body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw face direction indicator
    ctx.fillStyle = 'white';
    if (this.facing === 'right') {
      ctx.fillRect(this.x + this.width - 10, this.y + 20, 5, 5);
    } else {
      ctx.fillRect(this.x + 5, this.y + 20, 5, 5);
    }
    
    // Draw attack box when attacking
    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
      const attackX = this.facing === 'right' ? this.x + this.width : this.x - 30;
      ctx.fillRect(attackX, this.y + 30, 30, 40);
    }
    
    // Draw health bar
    const barWidth = 50;
    const barHeight = 5;
    const barX = this.x;
    const barY = this.y - 15;
    
    // Background
    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health
    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, (this.health / this.maxHealth) * barWidth, barHeight);
  }
  
  moveLeft() {
    this.velocityX = -this.speed;
    this.facing = 'left';
  }
  
  moveRight() {
    this.velocityX = this.speed;
    this.facing = 'right';
  }
  
  stop() {
    this.velocityX = 0;
  }
  
  jump() {
    if (!this.isJumping) {
      this.velocityY = -this.jumpPower;
      this.isJumping = true;
    }
  }
  
  attack() {
    if (this.attackCooldown === 0) {
      this.isAttacking = true;
      this.attackCooldown = 30;
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }
  
  getAttackBox() {
    if (!this.isAttacking) return null;
    
    const attackX = this.facing === 'right' ? this.x + this.width : this.x - 30;
    return {
      x: attackX,
      y: this.y + 30,
      width: 30,
      height: 40
    };
  }
}

// Create players
const player1 = new Fighter(100, 200, '#FF6B6B', {
  left: 'a',
  right: 'd',
  jump: 'w',
  attack: ' '
});

const player2 = new Fighter(600, 200, '#4ECDC4', {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  jump: 'ArrowUp',
  attack: 'Enter'
});

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Handle player input
function handleInput(player) {
  if (keys[player.controls.left]) {
    player.moveLeft();
  } else if (keys[player.controls.right]) {
    player.moveRight();
  } else {
    player.stop();
  }
  
  if (keys[player.controls.jump]) {
    player.jump();
  }
  
  if (keys[player.controls.attack]) {
    player.attack();
  }
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Check attack hits
function checkAttacks() {
  // Player 1 attack
  const p1Attack = player1.getAttackBox();
  if (p1Attack) {
    const p2Box = {
      x: player2.x,
      y: player2.y,
      width: player2.width,
      height: player2.height
    };
    
    if (checkCollision(p1Attack, p2Box)) {
      player2.takeDamage(10);
      player1.isAttacking = false; // Hit lands, stop attack
    }
  }
  
  // Player 2 attack
  const p2Attack = player2.getAttackBox();
  if (p2Attack) {
    const p1Box = {
      x: player1.x,
      y: player1.y,
      width: player1.width,
      height: player1.height
    };
    
    if (checkCollision(p2Attack, p1Box)) {
      player1.takeDamage(10);
      player2.isAttacking = false; // Hit lands, stop attack
    }
  }
}

// Update UI
function updateUI() {
  document.getElementById('p1-health').textContent = player1.health;
  document.getElementById('p2-health').textContent = player2.health;
}

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw ground
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
  
  // Handle input
  handleInput(player1);
  handleInput(player2);
  
  // Update players
  player1.update();
  player2.update();
  
  // Check attacks
  checkAttacks();
  
  // Draw players
  player1.draw();
  player2.draw();
  
  // Update UI
  updateUI();
  
  // Check game over
  if (player1.health <= 0 || player2.health <= 0) {
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    
    if (player1.health <= 0) {
      ctx.fillText('Player 2 Wins!', canvas.width / 2, canvas.height / 2 + 60);
    } else {
      ctx.fillText('Player 1 Wins!', canvas.width / 2, canvas.height / 2 + 60);
    }
    return;
  }
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();