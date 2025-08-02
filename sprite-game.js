// Fighting Game with Sprite Support - Built on Working Foundation
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game constants
const GRAVITY = 0.5;
const GROUND_Y = 350;

// Background images
const backgroundImages = {
  sky: new Image(),
  buildings: new Image()
};

// Load background images
backgroundImages.sky.src = "sprites/Assets/Environments/Urban-landscape-files/layers/Sky-layer.png";
backgroundImages.buildings.src = "sprites/Assets/Environments/Urban-landscape-files/layers/buildings-layer.png";

let backgroundsLoaded = 0;
backgroundImages.sky.onload = () => {
  backgroundsLoaded++;
  console.log("✅ Sky background loaded");
};
backgroundImages.buildings.onload = () => {
  backgroundsLoaded++;
  console.log("✅ Buildings background loaded");
};

backgroundImages.sky.onerror = () => console.warn("❌ Failed to load sky background");
backgroundImages.buildings.onerror = () => console.warn("❌ Failed to load buildings background");

// Character data with fallback support
const CHARACTER_DATA = {
  spaceMarine: {
    name: "Space Marine",
    color: "#4ECDC4",
    spriteFolder: "sprites/Assets/Characters/space-marine/Sprites",
    spritePaths: {
      idle: "Idle/sprites/idle1.png",
      run: "Run/sprites/run1.png", 
      jump: "Jump with Gun/sprites/jump-with-gun1.png",
      lightAttack: "Shoot/sprites/shoot1.png",
      heavyAttack: "Throw/sprites/throw1.png"
    },
    attacks: {
      light: { damage: 10, cooldown: 20, range: 30, sprite: "lightAttack" },
      heavy: { damage: 25, cooldown: 45, range: 40, sprite: "heavyAttack" }
    }
  },
  demon: {
    name: "Demon",
    color: "#8B0000", 
    spriteFolder: "sprites/Assets/Characters/demon-Files/Sprites",
    spritePaths: {
      idle: "Idle/idle1.png",
      run: "Idle/idle2.png", // Use idle2 for run since no run folder
      jump: "Idle/idle3.png", // Use idle3 for jump since no jump folder
      lightAttack: "DemonAttack/frame1.png",
      heavyAttack: "DemonAttackBreath/frame1.png"
    },
    attacks: {
      light: { damage: 12, cooldown: 25, range: 35, sprite: "lightAttack" },
      heavy: { damage: 30, cooldown: 50, range: 50, sprite: "heavyAttack" }
    }
  },
  knight: {
    name: "Terrible Knight",
    color: "#FF6B6B",
    spriteFolder: "sprites/Assets/Characters/Terrible Knight/sprites",
    spritePaths: {
      idle: "Idle/frame1.png",
      run: "Run/frame1.png",
      jump: "Jump/Jump1.png",
      attack: "AttackSide/attackside-export1.png"
    }
  },
  werewolf: {
    name: "Werewolf", 
    color: "#8B4513",
    spriteFolder: "sprites/Assets/Characters/WereWolf/Sprites",
    spritePaths: {
      idle: "Idle/werewolf-idle1.png",
      run: "run/werewolf-run1.png",
      jump: "jump/werewolf-jump1.png",
      attack: "Idle/werewolf-idle2.png" // Use idle2 for attack since no attack folder
    }
  }
};

// Enhanced Fighter class with sprite support
class SpriteFighter {
  constructor(x, y, characterKey, controls) {
    const charData = CHARACTER_DATA[characterKey];
    
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 100;
    this.characterKey = characterKey;
    this.name = charData.name;
    this.color = charData.color;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpPower = 15;
    this.health = 100;
    this.maxHealth = 100;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.currentAttackType = null;
    this.facing = 'right';
    this.controls = controls;
    this.isJumping = false;
    this.onGround = true;
    this.currentState = 'idle';
    
    // Attack system
    this.characterData = charData;
    this.attacks = charData.attacks || {};
    
    // Sprite system
    this.sprites = {};
    this.spriteLoaded = {};
    this.loadSprites(charData);
  }
  
  loadSprites(charData) {
    // Load sprites with fallback support
    Object.keys(charData.spritePaths).forEach(state => {
      const spritePath = `${charData.spriteFolder}/${charData.spritePaths[state]}`;
      
      this.sprites[state] = new Image();
      this.spriteLoaded[state] = false;
      
      this.sprites[state].onload = () => {
        this.spriteLoaded[state] = true;
        console.log(`✅ Loaded ${this.name} ${state} sprite`);
      };
      
      this.sprites[state].onerror = () => {
        console.warn(`❌ Failed to load ${this.name} ${state}: ${spritePath}`);
        this.spriteLoaded[state] = false;
      };
      
      this.sprites[state].src = spritePath;
    });
  }
  
  update() {
    // Apply gravity
    this.velocityY += GRAVITY;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Ground collision
    if (this.y + this.height >= GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.velocityY = 0;
      this.isJumping = false;
      this.onGround = true;
    } else {
      this.onGround = false;
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
      this.updateState();
    }
    
    // Reduce horizontal velocity (friction)
    this.velocityX *= 0.8;
    
    // Update animation state
    this.updateState();
  }
  
  updateState() {
    let newState = 'idle';
    
    if (this.isAttacking && this.currentAttackType) {
      // Use the specific attack sprite based on attack type
      const attackData = this.attacks[this.currentAttackType];
      if (attackData && attackData.sprite) {
        newState = attackData.sprite;
      } else {
        newState = 'lightAttack'; // fallback to light attack
      }
    } else if (!this.onGround) {
      newState = 'jump';
    } else if (Math.abs(this.velocityX) > 0.5) {
      newState = 'run';
    }
    
    // If the desired sprite isn't loaded, try fallback states
    if (!this.spriteLoaded[newState]) {
      if (newState === 'jump' && this.spriteLoaded['idle']) {
        newState = 'idle'; // Use idle for jump if jump sprite not available
      } else if (newState === 'run' && this.spriteLoaded['idle']) {
        newState = 'idle'; // Use idle for run if run sprite not available
      } else if ((newState === 'lightAttack' || newState === 'heavyAttack') && this.spriteLoaded['idle']) {
        newState = 'idle'; // Use idle for attack if attack sprite not available
      }
    }
    
    this.currentState = newState;
  }
  
  draw() {
    // Try to draw sprite first, fallback to colored rectangle
    const sprite = this.sprites[this.currentState];
    if (sprite && this.spriteLoaded[this.currentState] && sprite.complete) {
      try {
        ctx.save();
        
        // Handle sprite flipping for left-facing
        if (this.facing === 'left') {
          ctx.scale(-1, 1);
          ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
        } else {
          ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
      } catch (error) {
        console.warn(`Error drawing sprite for ${this.name}:`, error);
        this.drawFallback();
      }
    } else {
      this.drawFallback();
    }
    
    // Draw attack box when attacking
    if (this.isAttacking && this.currentAttackType) {
      const attackBox = this.getAttackBox();
      if (attackBox) {
        // Different colors for different attack types
        if (this.currentAttackType === 'light') {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.6)'; // Yellow for light attack
        } else if (this.currentAttackType === 'heavy') {
          ctx.fillStyle = 'rgba(255, 100, 100, 0.7)'; // Red for heavy attack
        }
        ctx.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
        
        // Draw damage number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${attackBox.damage}`, attackBox.x + attackBox.width / 2, attackBox.y + 15);
      }
    }
    
    // Draw health bar
    this.drawHealthBar();
    
    // Draw name and state info
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 30);
    
    // Show current state for debugging
    ctx.fillStyle = 'yellow';
    ctx.font = '10px Arial';
    ctx.fillText(this.currentState, this.x + this.width / 2, this.y - 18);
  }
  
  drawFallback() {
    // Draw colored rectangle as fallback
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw face direction indicator (arrow)
    ctx.fillStyle = 'white';
    if (this.facing === 'right') {
      // Right arrow
      ctx.fillRect(this.x + this.width - 15, this.y + 20, 8, 2);
      ctx.fillRect(this.x + this.width - 10, this.y + 18, 2, 6);
    } else {
      // Left arrow
      ctx.fillRect(this.x + 7, this.y + 20, 8, 2);
      ctx.fillRect(this.x + 7, this.y + 18, 2, 6);
    }
    
    // Add state indicator with better visibility
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.currentState.toUpperCase(), this.x + this.width / 2, this.y + this.height / 2);
    
    // Add outline for text visibility
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText(this.currentState.toUpperCase(), this.x + this.width / 2, this.y + this.height / 2);
    ctx.fillText(this.currentState.toUpperCase(), this.x + this.width / 2, this.y + this.height / 2);
  }
  
  drawHealthBar() {
    const barWidth = this.width;
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
  
  jump() {
    if (this.onGround) {
      this.velocityY = -this.jumpPower;
      this.isJumping = true;
      this.onGround = false;
    }
  }
  
  lightAttack() {
    if (this.attackCooldown === 0 && this.attacks.light) {
      this.isAttacking = true;
      this.currentAttackType = 'light';
      this.attackCooldown = this.attacks.light.cooldown;
      console.log(`${this.name} performs light attack! Cooldown: ${this.attackCooldown}`);
    } else {
      console.log(`${this.name} light attack failed - cooldown: ${this.attackCooldown}, has light attack: ${!!this.attacks.light}`);
    }
  }
  
  heavyAttack() {
    if (this.attackCooldown === 0 && this.attacks.heavy) {
      this.isAttacking = true;
      this.currentAttackType = 'heavy';
      this.attackCooldown = this.attacks.heavy.cooldown;
      console.log(`${this.name} performs heavy attack! Cooldown: ${this.attackCooldown}`);
    } else {
      console.log(`${this.name} heavy attack failed - cooldown: ${this.attackCooldown}, has heavy attack: ${!!this.attacks.heavy}`);
    }
  }
  
  // Legacy attack method for backward compatibility
  attack() {
    this.lightAttack();
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }
  
  getAttackBox() {
    if (!this.isAttacking || !this.currentAttackType) return null;
    
    const attackData = this.attacks[this.currentAttackType];
    if (!attackData) return null;
    
    const range = attackData.range;
    const attackX = this.facing === 'right' ? this.x + this.width : this.x - range;
    return {
      x: attackX,
      y: this.y + 30,
      width: range,
      height: 40,
      damage: attackData.damage,
      type: this.currentAttackType
    };
  }
}

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
  keys[e.code] = true;
  handleCharacterSelection(e.key);
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  keys[e.code] = false;
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
  console.log(`Starting game: ${CHARACTER_DATA[selectedP1].name} vs ${CHARACTER_DATA[selectedP2].name}`);
  
  // Create players with selected characters
  player1 = new SpriteFighter(100, 200, selectedP1, {
    left: 'a',
    right: 'd', 
    jump: 'w',
    lightAttack: ' ',      // Space for light attack
    heavyAttack: 's'       // S for heavy attack
  });
  
  player2 = new SpriteFighter(600, 200, selectedP2, {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'ArrowUp', 
    lightAttack: 'Enter',  // Enter for light attack
    heavyAttack: 'ArrowDown' // Down arrow for heavy attack
  });
}

// Handle player input during game
function handleGameInput(player) {
  if (!player || gameState !== 'playing') return;
  
  // Movement
  if (keys[player.controls.left] || keys['Key' + player.controls.left.toUpperCase()]) {
    player.moveLeft();
  } else if (keys[player.controls.right] || keys['Key' + player.controls.right.toUpperCase()]) {
    player.moveRight();
  }
  
  // Jumping - use exact key matching to avoid conflicts
  if (keys[player.controls.jump]) {
    player.jump();
  }
  
  // Light Attack - use exact key matching to avoid conflicts  
  if (keys[player.controls.lightAttack] || (player.controls.lightAttack === ' ' && keys['Space'])) {
    console.log(`${player.name} light attack key pressed: ${player.controls.lightAttack}`);
    player.lightAttack();
  }
  
  // Heavy Attack - use exact key matching to avoid conflicts
  if (keys[player.controls.heavyAttack]) {
    console.log(`${player.name} heavy attack key pressed: ${player.controls.heavyAttack}`);
    player.heavyAttack();
  }
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Draw background
function drawBackground() {
  // Draw sky background
  if (backgroundImages.sky.complete && backgroundImages.sky.naturalWidth > 0) {
    ctx.drawImage(backgroundImages.sky, 0, 0, canvas.width, canvas.height);
  } else {
    // Fallback gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#FFE4B5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Draw buildings in background
  if (backgroundImages.buildings.complete && backgroundImages.buildings.naturalWidth > 0) {
    // Scale buildings to fit canvas width while maintaining aspect ratio
    const scale = canvas.width / backgroundImages.buildings.naturalWidth;
    const scaledHeight = backgroundImages.buildings.naturalHeight * scale;
    // Position buildings at bottom of screen
    const yPos = canvas.height - scaledHeight;
    ctx.drawImage(backgroundImages.buildings, 0, yPos, canvas.width, scaledHeight);
  }
  
  // Draw ground
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
  
  // Add some ground details
  ctx.fillStyle = '#A0522D';
  ctx.fillRect(0, GROUND_Y, canvas.width, 10);
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
      player2.takeDamage(p1Attack.damage);
      player1.isAttacking = false;
      player1.currentAttackType = null;
      
      // Show damage effect
      console.log(`${player1.name} hits ${player2.name} with ${p1Attack.type} attack for ${p1Attack.damage} damage!`);
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
      player1.takeDamage(p2Attack.damage);
      player2.isAttacking = false;
      player2.currentAttackType = null;
      
      // Show damage effect
      console.log(`${player2.name} hits ${player1.name} with ${p2Attack.type} attack for ${p2Attack.damage} damage!`);
    }
  }
}

// Draw character selection screen
function drawCharacterSelect() {
  
  // Title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SELECT YOUR FIGHTER', canvas.width / 2, 60);
  
  // Player sections
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FF6B6B';
  ctx.fillText('PLAYER 1', canvas.width / 4, 120);
  
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
    
    if (selectedP1 === key) {
      ctx.fillStyle = '#00FF00';
      ctx.fillText('✓', 25, y);
    }
    
    // Player 2 selection
    ctx.fillStyle = p2Selection === index ? '#FFD700' : '#666';
    ctx.fillRect(canvas.width - 270, y - 15, 20, 20);
    ctx.fillStyle = p2Selection === index ? '#FFD700' : 'white';
    ctx.fillText(character.name, canvas.width - 240, y);
    
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
  if (gameState === 'characterSelect') {
    // Clear canvas with solid color for character select
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCharacterSelect();
  } else if (gameState === 'playing') {
    // Draw background
    drawBackground();
    
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
    // Draw background
    drawBackground();
    
    // Draw players (frozen)
    if (player1) player1.draw();
    if (player2) player2.draw();
    
    // Game over overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
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

// Start game
console.log('Sprite game starting...');
gameLoop();