export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 200; // pixels per second
        this.size = 20;
        this.velocity = { x: 0, y: 0 };
        this.isMoving = false;
        this.keyStates = new Map();
        this.collisionRadius = 10; // Collision radius for the player
    }

    setKeyState(key, isPressed) {
        this.keyStates.set(key.toLowerCase(), isPressed);
    }

    update(deltaTime) {
        // Calculate movement based on key states
        let moveX = 0;
        let moveY = 0;

        if (this.keyStates.get('w') || this.keyStates.get('arrowup')) moveY -= 1;
        if (this.keyStates.get('s') || this.keyStates.get('arrowdown')) moveY += 1;
        if (this.keyStates.get('a') || this.keyStates.get('arrowleft')) moveX -= 1;
        if (this.keyStates.get('d') || this.keyStates.get('arrowright')) moveX += 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/√2
            moveY *= 0.707;
        }

        // Calculate new position
        const newX = this.x + moveX * this.speed * (deltaTime / 1000);
        const newY = this.y + moveY * this.speed * (deltaTime / 1000);

        // Check collision before moving (if collision system is available)
        if (window.game && window.game.collisionSystem) {
            const collisionResponse = window.game.collisionSystem.getCollisionResponse(
                this.x, this.y, newX, newY, this.collisionRadius
            );
            
            // Only move if not blocked
            if (!collisionResponse.blocked) {
                this.x = collisionResponse.x;
                this.y = collisionResponse.y;
            }
        } else {
            // Fallback: move without collision detection
            this.x = newX;
            this.y = newY;
        }

        // Update velocity for rendering
        this.velocity.x = moveX * this.speed;
        this.velocity.y = moveY * this.speed;

        // Update movement state
        this.isMoving = moveX !== 0 || moveY !== 0;
    }

    render(ctx) {
        ctx.save();

        // Draw player body
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw player border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw direction indicator when moving
        if (this.isMoving) {
            const angle = Math.atan2(this.velocity.y, this.velocity.x);
            const indicatorLength = this.size / 2 + 5;
            const endX = this.x + Math.cos(angle) * indicatorLength;
            const endY = this.y + Math.sin(angle) * indicatorLength;

            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        ctx.restore();
    }

    centerOnCanvas(width, height) {
        this.x = width / 2;
        this.y = height / 2;
    }
} 