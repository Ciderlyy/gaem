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

// Character data with expanded roster
const CHARACTER_DATA = {
  spaceMarine: {
    name: "Space Marine",
    color: "#4ECDC4",
    spriteFolder: "sprites/Assets/Characters/space-marine/Sprites",
    spritePaths: {
      // Basic states
      idle: "Idle/sprites/idle1.png",
      idleGun: "Idle Gun/sprites/idle-gun1.png",
      run: "Run/sprites/run1.png",
      runGun: "Run with Gun/sprites/run-with-gun1.png",
      jump: "Jump with Gun/sprites/jump-with-gun1.png",
      jumpNoGun: "Jump no Gun/sprites/jump1.png",
      
      // Combat states
      lightAttack: "Shoot/sprites/shoot1.png",
      heavyAttack: "Throw/sprites/throw1.png",
      crouchShoot: "Crouch Shoot/sprites/crouch-shoot1.png",
      
      // Special states
      crouch: "Crouch/sprites/crouch1.png",
      crawl: "Crawl/sprites/crawl1.png",
      climb: "Climb/sprites/climb1.png",
      death: "Die/sprites/die1.png",
      
      // Multi-frame animations
      idleGunFrames: ["Idle Gun/sprites/idle-gun1.png", "Idle Gun/sprites/idle-gun2.png", "Idle Gun/sprites/idle-gun3.png", "Idle Gun/sprites/idle-gun4.png"],
      runGunFrames: ["Run with Gun/sprites/run-with-gun1.png", "Run with Gun/sprites/run-with-gun2.png", "Run with Gun/sprites/run-with-gun3.png", "Run with Gun/sprites/run-with-gun4.png", "Run with Gun/sprites/run-with-gun5.png", "Run with Gun/sprites/run-with-gun6.png"],
      crawlFrames: ["Crawl/sprites/crawl1.png", "Crawl/sprites/crawl2.png", "Crawl/sprites/crawl3.png", "Crawl/sprites/crawl4.png", "Crawl/sprites/crawl5.png", "Crawl/sprites/crawl6.png"],
      climbFrames: ["Climb/sprites/climb1.png", "Climb/sprites/climb2.png", "Climb/sprites/climb3.png", "Climb/sprites/climb4.png", "Climb/sprites/climb5.png", "Climb/sprites/climb6.png"],
      deathFrames: ["Die/sprites/die1.png", "Die/sprites/die2.png", "Die/sprites/die3.png"]
    },
    attacks: {
      light: { damage: 10, cooldown: 20, range: 30, sprite: "lightAttack" },
      heavy: { damage: 25, cooldown: 45, range: 40, sprite: "heavyAttack" },
      crouch: { damage: 8, cooldown: 15, range: 25, sprite: "crouchShoot" }
    },
    specialMoves: {
      canCrouch: true,
      canCrawl: true,
      canClimb: true,
      hasGunVariants: true
    }
  },
  demon: {
    name: "Demon",
    color: "#8B0000", 
    spriteFolder: "sprites/Assets/Characters/demon-Files/Sprites",
    spritePaths: {
      idle: "Idle/idle1.png",
      run: "Idle/idle2.png",
      jump: "Idle/idle3.png",
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
    color: "#C41E3A",
    spriteFolder: "sprites/Assets/Characters/Terrible Knight/sprites",
    spritePaths: {
      idle: "Idle/frame1.png",
      run: "Run/frame1.png",
      jump: "Jump/Jump1.png",
      lightAttack: "AttackSide/attackside-export1.png",
      heavyAttack: "SwordSlash/frame1.png"
    },
    attacks: {
      light: { damage: 15, cooldown: 30, range: 25, sprite: "lightAttack" },
      heavy: { damage: 35, cooldown: 60, range: 30, sprite: "heavyAttack" }
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
      lightAttack: "Idle/werewolf-idle2.png",
      heavyAttack: "Idle/werewolf-idle3.png"
    },
    attacks: {
      light: { damage: 8, cooldown: 15, range: 20, sprite: "lightAttack" },
      heavy: { damage: 20, cooldown: 35, range: 25, sprite: "heavyAttack" }
    }
  },
  bridgeHeroine: {
    name: "Bridge Heroine",
    color: "#FF69B4",
    spriteFolder: "sprites/Assets/Characters/Bridge Heroine/Heroine base/Sprites",
    spritePaths: {
      idle: "idle/idle1.png",
      run: "run/run1.png",
      jump: "jump/jump1.png",
      lightAttack: "player-attack/attack1.png",
      heavyAttack: "player-attack/attack2.png"
    },
    attacks: {
      light: { damage: 11, cooldown: 22, range: 28, sprite: "lightAttack" },
      heavy: { damage: 28, cooldown: 48, range: 35, sprite: "heavyAttack" }
    }
  },
  cyberpunkDetective: {
    name: "Cyberpunk Detective",
    color: "#00CED1",
    spriteFolder: "sprites/Assets/Characters/cyberpunk-detective/sprites",
    spritePaths: {
      idle: "walk/walk1.png", // Using walk as idle
      run: "walk/walk2.png",
      jump: "walk/walk3.png",
      lightAttack: "shot/shot1.png",
      heavyAttack: "punch/punch1.png"
    },
    attacks: {
      light: { damage: 9, cooldown: 18, range: 35, sprite: "lightAttack" },
      heavy: { damage: 22, cooldown: 40, range: 25, sprite: "heavyAttack" }
    }
  },
  ogre: {
    name: "Ogre",
    color: "#556B2F",
    spriteFolder: "sprites/Assets/Characters/Ogre/Sprites",
    spritePaths: {
      idle: "Idle/idle1.png",
      run: "walk/walk1.png",
      jump: "Idle/idle2.png",
      lightAttack: "Attack/attack1.png",
      heavyAttack: "Attack/attack2.png"
    },
    attacks: {
      light: { damage: 18, cooldown: 35, range: 30, sprite: "lightAttack" },
      heavy: { damage: 40, cooldown: 70, range: 40, sprite: "heavyAttack" }
    }
  },
  hellBeast: {
    name: "Hell Beast",
    color: "#DC143C",
    spriteFolder: "sprites/Assets/Characters/Hell-Beast-Files",
    spritePaths: {
      idle: "Idle/idle1.png",
      run: "Idle/idle2.png",
      jump: "Idle/idle3.png",
      lightAttack: "Breath/breath1.png",
      heavyAttack: "Fireball/fireball1.png"
    },
    attacks: {
      light: { damage: 14, cooldown: 28, range: 45, sprite: "lightAttack" },
      heavy: { damage: 32, cooldown: 55, range: 60, sprite: "heavyAttack" }
    }
  },
  mechUnit: {
    name: "Mech Unit",
    color: "#708090",
    spriteFolder: "sprites/Assets/Characters/mech-unit/sprites",
    spritePaths: {
      idle: "mech-unit-export1.png",
      run: "mech-unit-export2.png",
      jump: "mech-unit-export3.png",
      lightAttack: "mech-unit-export4.png",
      heavyAttack: "mech-unit-export5.png"
    },
    attacks: {
      light: { damage: 13, cooldown: 25, range: 32, sprite: "lightAttack" },
      heavy: { damage: 29, cooldown: 50, range: 45, sprite: "heavyAttack" }
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
    
    // Enhanced state system
    this.isCrouching = false;
    this.isCrawling = false;
    this.isClimbing = false;
    this.hasGun = true; // Space Marine starts with gun
    this.frameCounter = 0;
    this.animationFrame = 0;
    
    // Attack system
    this.characterData = charData;
    this.attacks = charData.attacks || {};
    this.specialMoves = charData.specialMoves || {};
    
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
    
    // Enhanced state logic for Space Marine
    if (this.health <= 0) {
      newState = 'death';
    } else if (this.isAttacking && this.currentAttackType) {
      // Use the specific attack sprite based on attack type
      const attackData = this.attacks[this.currentAttackType];
      if (attackData && attackData.sprite) {
        newState = attackData.sprite;
      } else {
        newState = 'lightAttack';
      }
    } else if (this.isCrouching) {
      newState = 'crouch';
    } else if (this.isCrawling) {
      newState = 'crawl';
    } else if (!this.onGround) {
      // Choose jump variant based on gun status for Space Marine
      if (this.characterKey === 'spaceMarine') {
        newState = this.hasGun ? 'jump' : 'jumpNoGun';
      } else {
        newState = 'jump';
      }
    } else if (Math.abs(this.velocityX) > 0.5) {
      // Choose run variant based on gun status for Space Marine
      if (this.characterKey === 'spaceMarine') {
        newState = this.hasGun ? 'runGun' : 'run';
      } else {
        newState = 'run';
      }
    } else {
      // Choose idle variant based on gun status for Space Marine
      if (this.characterKey === 'spaceMarine') {
        newState = this.hasGun ? 'idleGun' : 'idle';
      } else {
        newState = 'idle';
      }
    }
    
    // If the desired sprite isn't loaded, try fallback states
    if (!this.spriteLoaded[newState]) {
      if (newState === 'jump' && this.spriteLoaded['idle']) {
        newState = 'idle';
      } else if (newState === 'run' && this.spriteLoaded['idle']) {
        newState = 'idle';
      } else if ((newState === 'lightAttack' || newState === 'heavyAttack') && this.spriteLoaded['idle']) {
        newState = 'idle';
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
    let stateText = this.currentState;
    if (this.isAttacking && this.currentAttackType) {
      stateText += ` (${this.currentAttackType})`;
    }
    ctx.fillText(stateText, this.x + this.width / 2, this.y - 18);
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
  
  crouchAttack() {
    if (this.attackCooldown === 0 && this.attacks.crouch) {
      this.isAttacking = true;
      this.currentAttackType = 'crouch';
      this.attackCooldown = this.attacks.crouch.cooldown;
      this.isCrouching = true;
      console.log(`${this.name} performs crouch attack!`);
      
      // Auto-uncrouch after attack
      setTimeout(() => {
        this.isCrouching = false;
      }, 500);
    }
  }
  
  toggleCrouch() {
    if (this.specialMoves.canCrouch) {
      this.isCrouching = !this.isCrouching;
      console.log(`${this.name} ${this.isCrouching ? 'crouches' : 'stands up'}`);
    }
  }
  
  toggleGun() {
    if (this.specialMoves.hasGunVariants) {
      this.hasGun = !this.hasGun;
      console.log(`${this.name} ${this.hasGun ? 'draws' : 'holsters'} weapon`);
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

// AI Controller Class
class AIController {
  constructor(fighter, opponent) {
    this.fighter = fighter;
    this.opponent = opponent;
    this.state = 'idle'; // 'idle', 'approach', 'retreat', 'attack', 'defend'
    this.stateTimer = 0;
    this.reactionTime = 15; // frames to react
    this.aggressiveness = 0.7; // 0-1, how aggressive the AI is
    this.lastAction = 'none';
    this.actionCooldown = 0;
    this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
    
    // AI preferences based on character
    this.preferredRange = 60; // ideal distance from opponent
    this.retreatDistance = 40; // distance to retreat when low health
    this.attackRange = 45; // range to start attacking
  }
  
  update() {
    if (!this.fighter || !this.opponent) return;
    
    this.stateTimer++;
    this.actionCooldown = Math.max(0, this.actionCooldown - 1);
    
    // Calculate distance to opponent
    const distance = Math.abs(this.fighter.x - this.opponent.x);
    const healthRatio = this.fighter.health / this.fighter.maxHealth;
    
    // State decision making
    this.decideState(distance, healthRatio);
    
    // Execute current state
    this.executeState(distance);
  }
  
  decideState(distance, healthRatio) {
    // Low health - be more defensive
    if (healthRatio < 0.3) {
      this.aggressiveness = 0.3;
      if (distance < this.retreatDistance) {
        this.setState('retreat');
        return;
      }
    } else if (healthRatio < 0.6) {
      this.aggressiveness = 0.5;
    } else {
      this.aggressiveness = 0.7;
    }
    
    // Opponent is attacking - try to avoid or counter
    if (this.opponent.isAttacking && distance < 50) {
      if (Math.random() < 0.6) {
        this.setState('retreat');
        return;
      }
    }
    
    // Decide based on distance
    if (distance > this.attackRange + 20) {
      this.setState('approach');
    } else if (distance < this.attackRange && this.actionCooldown === 0) {
      if (Math.random() < this.aggressiveness) {
        this.setState('attack');
      } else {
        this.setState('defend');
      }
    } else if (distance < 30) {
      this.setState('retreat');
    } else {
      this.setState('idle');
    }
  }
  
  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateTimer = 0;
    }
  }
  
  executeState(distance) {
    switch(this.state) {
      case 'approach':
        this.approach();
        break;
      case 'retreat':
        this.retreat();
        break;
      case 'attack':
        this.attack(distance);
        break;
      case 'defend':
        this.defend();
        break;
      case 'idle':
        this.idle();
        break;
    }
  }
  
  approach() {
    // Move towards opponent
    if (this.fighter.x < this.opponent.x) {
      this.fighter.moveRight();
    } else {
      this.fighter.moveLeft();
    }
    
    // Occasionally jump while approaching
    if (this.stateTimer % 60 === 0 && Math.random() < 0.3) {
      this.fighter.jump();
    }
  }
  
  retreat() {
    // Move away from opponent
    if (this.fighter.x < this.opponent.x) {
      this.fighter.moveLeft();
    } else {
      this.fighter.moveRight();
    }
    
    // Jump to avoid attacks
    if (this.opponent.isAttacking && this.fighter.onGround && Math.random() < 0.7) {
      this.fighter.jump();
    }
  }
  
  attack(distance) {
    if (this.fighter.attackCooldown === 0) {
      // Choose attack type based on distance and health
      const opponentHealthRatio = this.opponent.health / this.opponent.maxHealth;
      
      // Use heavy attack if opponent is low health or far away
      if ((opponentHealthRatio < 0.4 && Math.random() < 0.6) || 
          (distance > 35 && Math.random() < 0.4)) {
        this.fighter.heavyAttack();
        this.actionCooldown = 30;
      } else {
        this.fighter.lightAttack();
        this.actionCooldown = 15;
      }
      
      this.lastAction = 'attack';
    }
  }
  
  defend() {
    // Stay still and prepare for counter-attack
    this.fighter.velocityX *= 0.5; // Reduce movement
    
    // Counter-attack when opponent's attack ends
    if (this.lastAction !== 'attack' && !this.opponent.isAttacking && 
        this.fighter.attackCooldown === 0 && Math.random() < 0.8) {
      this.setState('attack');
    }
  }
  
  idle() {
    // Reduce movement
    this.fighter.velocityX *= 0.7;
    
    // Randomly change state after some time
    if (this.stateTimer > 30 && Math.random() < 0.1) {
      const states = ['approach', 'retreat'];
      this.setState(states[Math.floor(Math.random() * states.length)]);
    }
  }
}

// Game state
let gameState = 'characterSelect'; // 'characterSelect', 'playing', 'gameOver'
let selectedP1 = null;
let selectedP2 = null;
let player1 = null;
let player2 = null;
let aiPlayer = null;

// Character selection
let characterKeys = Object.keys(CHARACTER_DATA);
let p1Selection = 0;
let p2Selection = 1;

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  keys[e.code] = true;
  console.log(`Key pressed: "${e.key}" (code: ${e.code})`);
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
    case ' ':
      selectedP1 = characterKeys[p1Selection];
      // Automatically select random AI opponent (different from player)
      do {
        selectedP2 = characterKeys[Math.floor(Math.random() * characterKeys.length)];
      } while (selectedP2 === selectedP1);
      break;
  }
  
  // Start game if player selected
  if (selectedP1) {
    startGame();
  }
}

function startGame() {
  gameState = 'playing';
  console.log(`Starting game: ${CHARACTER_DATA[selectedP1].name} vs AI ${CHARACTER_DATA[selectedP2].name}`);
  
  // Create player 1 (human player)
  player1 = new SpriteFighter(100, 200, selectedP1, {
    left: 'a',
    right: 'd', 
    jump: 'w',
    lightAttack: ' ',      // Space for light attack
    heavyAttack: 's',      // S for heavy attack
    crouchAttack: 'e',     // E for crouch attack (Space Marine)
    toggleCrouch: 'q',     // Q to toggle crouch (Space Marine)
    toggleGun: 'r'         // R to toggle gun (Space Marine)
  });
  
  // Create player 2 (AI opponent)
  player2 = new SpriteFighter(600, 200, selectedP2, {
    // AI doesn't need controls, but we'll keep them for compatibility
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'ArrowUp', 
    lightAttack: 'Enter',
    heavyAttack: 'ArrowDown'
  });
  
  // Create AI controller for player 2
  aiPlayer = new AIController(player2, player1);
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
  
  // Light Attack - handle space key specially
  const lightAttackPressed = keys[player.controls.lightAttack] || 
                            (player.controls.lightAttack === ' ' && (keys[' '] || keys['Space']));
  if (lightAttackPressed) {
    console.log(`${player.name} light attack key pressed: ${player.controls.lightAttack}`);
    player.lightAttack();
  }
  
  // Heavy Attack - use exact key matching to avoid conflicts
  if (keys[player.controls.heavyAttack]) {
    console.log(`${player.name} heavy attack key pressed: ${player.controls.heavyAttack}`);
    player.heavyAttack();
  }
  
  // Space Marine Special Controls
  if (player.characterKey === 'spaceMarine') {
    // Crouch Attack
    if (keys[player.controls.crouchAttack]) {
      console.log(`${player.name} crouch attack key pressed: ${player.controls.crouchAttack}`);
      player.crouchAttack();
    }
    
    // Toggle Crouch (only trigger once per press)
    if (keys[player.controls.toggleCrouch] && !player.lastToggleCrouch) {
      player.toggleCrouch();
      player.lastToggleCrouch = true;
    } else if (!keys[player.controls.toggleCrouch]) {
      player.lastToggleCrouch = false;
    }
    
    // Toggle Gun (only trigger once per press)
    if (keys[player.controls.toggleGun] && !player.lastToggleGun) {
      player.toggleGun();
      player.lastToggleGun = true;
    } else if (!keys[player.controls.toggleGun]) {
      player.lastToggleGun = false;
    }
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
  ctx.fillText('PLAYER', canvas.width / 4, 120);
  
  ctx.fillStyle = '#FFD700';
  ctx.fillText('VS AI OPPONENT', (canvas.width / 4) * 3, 120);
  
  // Draw character options
  const startY = 160;
  const spacing = 40;
  
  characterKeys.forEach((key, index) => {
    const character = CHARACTER_DATA[key];
    const y = startY + (index * spacing);
    
    // Player selection
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
    
    // AI opponent (show selected if player selected)
    if (selectedP2 === key) {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(canvas.width - 270, y - 15, 20, 20);
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'left';
      ctx.fillText(character.name + ' (AI)', canvas.width - 240, y);
      ctx.fillStyle = '#00FF00';
      ctx.fillText('✓', canvas.width - 295, y);
    } else {
      // Show faded for non-selected AI characters
      ctx.fillStyle = '#444';
      ctx.fillRect(canvas.width - 270, y - 15, 20, 20);
      ctx.fillStyle = '#888';
      ctx.textAlign = 'left';
      ctx.fillText(character.name, canvas.width - 240, y);
    }
  });
  
  // Controls
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('A/D to select your fighter, SPACE to start vs AI!', canvas.width / 2, canvas.height - 60);
  
  if (selectedP1) {
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('FIGHT!', canvas.width / 2, canvas.height - 20);
  }
}

// Draw AI info
function drawAIInfo() {
  if (!aiPlayer) return;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(canvas.width - 120, 10, 110, 60);
  
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('AI Status:', canvas.width - 115, 25);
  ctx.fillText(`State: ${aiPlayer.state}`, canvas.width - 115, 40);
  ctx.fillText(`Aggro: ${Math.round(aiPlayer.aggressiveness * 100)}%`, canvas.width - 115, 55);
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
    
    // Handle player 1 input (human)
    handleGameInput(player1);
    
    // Update AI for player 2
    if (aiPlayer) {
      aiPlayer.update();
    }
    
    // Update players
    player1.update();
    player2.update();
    
    // Check attacks
    checkAttacks();
    
    // Draw players
    player1.draw();
    player2.draw();
    
    // Draw AI state info
    if (aiPlayer) {
      drawAIInfo();
    }
    
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