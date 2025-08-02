// Enhanced Fighter with Sprite Support
class SpriteFighter {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || 64;
    this.height = config.height || 64;
    this.color = config.color || 'red';
    this.name = config.name || 'Fighter';
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = config.speed || 5;
    this.jumpPower = config.jumpPower || 15;
    this.health = config.health || 100;
    this.maxHealth = config.maxHealth || 100;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.facing = 'right';
    this.controls = config.controls;
    this.isJumping = false;
    
    // Sprite properties
    this.sprites = {};
    this.currentSprite = 'idle';
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.frameSpeed = config.frameSpeed || 8;
    this.scale = config.scale || 2;
    
    // Animation states
    this.animations = {
      idle: { frames: [], frameCount: 0 },
      run: { frames: [], frameCount: 0 },
      jump: { frames: [], frameCount: 0 },
      attack: { frames: [], frameCount: 0 }
    };
    
    // Load sprites
    this.spriteBasePath = config.spriteBasePath;
    this.loadSprites();
  }
  
  loadSprites() {
    if (!this.spriteBasePath) return;
    
    // Load idle sprites
    this.loadAnimation('idle', `${this.spriteBasePath}/Idle/sprites`, ['idle1.png', 'idle2.png', 'idle3.png', 'idle4.png']);
    
    // Load run sprites
    this.loadAnimation('run', `${this.spriteBasePath}/Run/sprites`, ['run1.png', 'run2.png', 'run3.png', 'run4.png', 'run5.png', 'run6.png']);
    
    // Load jump sprites (if available, otherwise use idle)
    this.loadAnimation('jump', `${this.spriteBasePath}/Jump/sprites`, ['jump1.png', 'jump2.png'], true);
    
    // Load attack sprites
    this.loadAnimation('attack', `${this.spriteBasePath}/Shoot/sprites`, ['shoot1.png', 'shoot2.png', 'shoot3.png'], true);
  }
  
  loadAnimation(animName, basePath, fileNames, optional = false) {
    this.animations[animName].frames = [];
    this.animations[animName].frameCount = fileNames.length;
    
    fileNames.forEach((fileName, index) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Loaded ${animName} frame ${index + 1}`);
      };
      img.onerror = () => {
        if (!optional) {
          console.warn(`Failed to load ${animName} frame: ${fileName}`);
        }
      };
      img.src = `${basePath}/${fileName}`;
      this.animations[animName].frames.push(img);
    });
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
      this.switchAnimation('idle');
    }
    
    // Update animation frame
    this.updateAnimation();
  }
  
  updateAnimation() {
    this.frameCounter++;
    if (this.frameCounter >= this.frameSpeed) {
      this.frameCounter = 0;
      this.currentFrame++;
      
      const currentAnim = this.animations[this.currentSprite];
      if (this.currentFrame >= currentAnim.frameCount) {
        this.currentFrame = 0;
      }
    }
  }
  
  switchAnimation(animName) {
    if (this.currentSprite !== animName && this.animations[animName]) {
      this.currentSprite = animName;
      this.currentFrame = 0;
      this.frameCounter = 0;
    }
  }
  
  draw() {
    ctx.save();
    
    // Flip sprite if facing left
    if (this.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-this.x - this.width, 0);
    }
    
    // Draw sprite or fallback to colored rectangle
    const currentAnim = this.animations[this.currentSprite];
    if (currentAnim && currentAnim.frames.length > 0 && currentAnim.frames[this.currentFrame]) {
      const sprite = currentAnim.frames[this.currentFrame];
      if (sprite.complete) {
        ctx.drawImage(
          sprite,
          this.facing === 'left' ? this.x : this.x,
          this.y,
          this.width,
          this.height
        );
      } else {
        this.drawFallback();
      }
    } else {
      this.drawFallback();
    }
    
    ctx.restore();
    
    // Draw attack box when attacking
    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
      const attackX = this.facing === 'right' ? this.x + this.width : this.x - 30;
      ctx.fillRect(attackX, this.y + 30, 30, 40);
    }
    
    // Draw health bar
    this.drawHealthBar();
    
    // Draw name
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 25);
  }
  
  drawFallback() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw face direction indicator
    ctx.fillStyle = 'white';
    if (this.facing === 'right') {
      ctx.fillRect(this.x + this.width - 10, this.y + 20, 5, 5);
    } else {
      ctx.fillRect(this.x + 5, this.y + 20, 5, 5);
    }
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
    if (!this.isAttacking) {
      this.switchAnimation('run');
    }
  }
  
  moveRight() {
    this.velocityX = this.speed;
    this.facing = 'right';
    if (!this.isAttacking) {
      this.switchAnimation('run');
    }
  }
  
  stop() {
    this.velocityX = 0;
    if (!this.isAttacking && !this.isJumping) {
      this.switchAnimation('idle');
    }
  }
  
  jump() {
    if (!this.isJumping) {
      this.velocityY = -this.jumpPower;
      this.isJumping = true;
      this.switchAnimation('jump');
    }
  }
  
  attack() {
    if (this.attackCooldown === 0) {
      this.isAttacking = true;
      this.attackCooldown = 30;
      this.switchAnimation('attack');
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