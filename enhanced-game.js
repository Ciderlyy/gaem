// Enhanced Fighting Game with Sprites
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game constants
const GRAVITY = 0.5;
const GROUND_Y = 350;

// Character data
const CHARACTER_DATA = {
  spaceMarine: {
    name: "Space Marine",
    spriteBasePath: "sprites/Assets/Characters/space-marine/Sprites",
    color: "#4ECDC4",
    health: 120,
    speed: 5,
    jumpPower: 16
  },
  terribleKnight: {
    name: "Terrible Knight", 
    spriteBasePath: "sprites/Assets/Characters/Terrible Knight/sprites",
    color: "#FF6B6B",
    health: 100,
    speed: 4,
    jumpPower: 14
  },
  demon: {
    name: "Demon",
    spriteBasePath: "sprites/Assets/Characters/demon-Files/Sprites",
    color: "#8B0000",
    health: 110,
    speed: 6,
    jumpPower: 15
  },
  werewolf: {
    name: "Werewolf",
    spriteBasePath: "sprites/Assets/Characters/WereWolf/Sprites",
    color: "#8B4513",
    health: 95,
    speed: 7,
    jumpPower: 17
  }
};

// Game state
let gameState = 'characterSelect'; // 'characterSelect', 'playing', 'gameOver'
let selectedP1 = null;
let selectedP2 = null;
let player1 = null;
let player2 = null;

// Character selection
let characterKeys = Object.keys(CHARACTER_DATA);
let p1Selection = 0;
let p2Selection = 1;

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  handleCharacterSelection(e.key);
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Character selection logic
function handleCharacterSelection(key) {
  if (gameState !== 'characterSelect') return;
  
  switch(key) {
    case 'a':
    case 'A':
      p1Selection = (p1Selection - 1 + characterKeys.length) % characterKeys.length;
      break;
    case 'd':
    case 'D':
      p1Selection = (p1Selection + 1) % characterKeys.length;
      break;
    case 'ArrowLeft':
      p2Selection = (p2Selection - 1 + characterKeys.length) % characterKeys.length;
      break;
    case 'ArrowRight':
      p2Selection = (p2Selection + 1) % characterKeys.length;
      break;
    case ' ':
      selectedP1 = characterKeys[p1Selection];
      break;
    case 'Enter':
      selectedP2 = characterKeys[p2Selection];
      break;
  }
  
  // Start game if both players selected
  if (selectedP1 && selectedP2) {
    startGame();
  }
}

function startGame() {
  gameState = 'playing';
  
  // Create players with selected characters
  const p1Data = CHARACTER_DATA[selectedP1];
  const p2Data = CHARACTER_DATA[selectedP2];
  
  player1 = new SpriteFighter({
    x: 100,
    y: 200,
    width: 64,
    height: 64,
    color: p1Data.color,
    name: p1Data.name,
    health: p1Data.health,
    speed: p1Data.speed,
    jumpPower: p1Data.jumpPower,
    spriteBasePath: p1Data.spriteBasePath,
    controls: {
      left: 'a',
      right: 'd',
      jump: 'w',
      attack: ' '
    }
  });
  
  player2 = new SpriteFighter({
    x: 600,
    y: 200,
    width: 64,
    height: 64,
    color: p2Data.color,
    name: p2Data.name,
    health: p2Data.health,
    speed: p2Data.speed,
    jumpPower: p2Data.jumpPower,
    spriteBasePath: p2Data.spriteBasePath,
    controls: {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      jump: 'ArrowUp',
      attack: 'Enter'
    }
  });
}

// Handle player input during game
function handleGameInput(player) {
  if (!player || gameState !== 'playing') return;
  
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
  if (!player1 || !player2) return;
  
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
      player2.takeDamage(15);
      player1.isAttacking = false;
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
      player1.takeDamage(15);
      player2.isAttacking = false;
    }
  }
}

// Draw character selection screen
function drawCharacterSelect() {
  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SELECT YOUR FIGHTER', canvas.width / 2, 60);
  
  // Player 1 section
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FF6B6B';
  ctx.fillText('PLAYER 1', canvas.width / 4, 120);
  
  // Player 2 section
  ctx.fillStyle = '#4ECDC4';
  ctx.fillText('PLAYER 2', (canvas.width / 4) * 3, 120);
  
  // Draw character options
  const startY = 160;
  const spacing = 40;
  
  characterKeys.forEach((key, index) => {
    const character = CHARACTER_DATA[key];
    const y = startY + (index * spacing);
    
    // Player 1 selection
    ctx.fillStyle = p1Selection === index ? '#FFD700' : '#666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillRect(50, y - 15, 20, 20);
    ctx.fillStyle = p1Selection === index ? '#FFD700' : 'white';
    ctx.fillText(character.name, 80, y);
    
    // Selected indicator
    if (selectedP1 === key) {
      ctx.fillStyle = '#00FF00';
      ctx.fillText('✓', 25, y);
    }
    
    // Player 2 selection
    ctx.fillStyle = p2Selection === index ? '#FFD700' : '#666';
    ctx.fillRect(canvas.width - 270, y - 15, 20, 20);
    ctx.fillStyle = p2Selection === index ? '#FFD700' : 'white';
    ctx.textAlign = 'left';
    ctx.fillText(character.name, canvas.width - 240, y);
    
    // Selected indicator
    if (selectedP2 === key) {
      ctx.fillStyle = '#00FF00';
      ctx.fillText('✓', canvas.width - 295, y);
    }
  });
  
  // Controls
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Player 1: A/D to select, SPACE to confirm', canvas.width / 4, canvas.height - 60);
  ctx.fillText('Player 2: ←/→ to select, ENTER to confirm', (canvas.width / 4) * 3, canvas.height - 60);
  
  if (selectedP1 && selectedP2) {
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('FIGHT!', canvas.width / 2, canvas.height - 20);
  }
}

// Update UI
function updateUI() {
  if (!player1 || !player2) return;
  
  document.getElementById('p1-health').textContent = player1.health;
  document.getElementById('p2-health').textContent = player2.health;
}

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (gameState === 'characterSelect') {
    drawCharacterSelect();
  } else if (gameState === 'playing') {
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Handle input
    handleGameInput(player1);
    handleGameInput(player2);
    
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
      gameState = 'gameOver';
    }
  } else if (gameState === 'gameOver') {
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Draw players (frozen)
    if (player1) player1.draw();
    if (player2) player2.draw();
    
    // Game over text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    
    if (player1.health <= 0) {
      ctx.fillText(`${player2.name} Wins!`, canvas.width / 2, canvas.height / 2 + 60);
    } else {
      ctx.fillText(`${player1.name} Wins!`, canvas.width / 2, canvas.height / 2 + 60);
    }
    
    ctx.font = '24px Arial';
    ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 120);
  }
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();