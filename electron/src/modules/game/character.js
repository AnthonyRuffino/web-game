export class Player {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.speed = 200; // pixels per second
        this.size = 20;
        this.color = '#00ff00';
        this.velocity = { x: 0, y: 0 };
        this.isMoving = false;
        
        // Movement state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }
    
    update(deltaTime) {
        // Convert deltaTime from milliseconds to seconds
        const dt = deltaTime / 1000;
        
        // Reset velocity
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Calculate movement based on pressed keys
        if (this.keys.up) this.velocity.y -= this.speed;
        if (this.keys.down) this.velocity.y += this.speed;
        if (this.keys.left) this.velocity.x -= this.speed;
        if (this.keys.right) this.velocity.x += this.speed;
        
        // Normalize diagonal movement
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            this.velocity.x *= 0.707; // 1/√2
            this.velocity.y *= 0.707;
        }
        
        // Update position
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;
        
        // Update movement state
        this.isMoving = this.velocity.x !== 0 || this.velocity.y !== 0;
    }
    
    render(ctx) {
        // Save context state
        ctx.save();
        
        // Draw player as a circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add direction indicator if moving
        if (this.isMoving) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.velocity.x * 0.1, this.y + this.velocity.y * 0.1);
            ctx.stroke();
        }
        
        // Restore context state
        ctx.restore();
    }
    
    // Input handling methods
    setKeyState(key, pressed) {
        switch (key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = pressed;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = pressed;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = pressed;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = pressed;
                break;
        }
    }
    
    // Get player bounds for collision detection
    getBounds() {
        return {
            left: this.x - this.size,
            right: this.x + this.size,
            top: this.y - this.size,
            bottom: this.y + this.size
        };
    }
    
    // Check if player is within canvas bounds
    isInBounds(canvasWidth, canvasHeight) {
        const bounds = this.getBounds();
        return bounds.left >= 0 && bounds.right <= canvasWidth &&
               bounds.top >= 0 && bounds.bottom <= canvasHeight;
    }
    
    // Center player on canvas
    centerOnCanvas(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
    }
} 