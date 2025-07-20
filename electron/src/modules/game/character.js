export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // radians, 0 = up (north)
        this.speed = 200; // pixels per second
        this.rotSpeed = Math.PI * 0.001; // radians per second
        this.size = 20;
        this.collisionRadius = 10;
        this.isMoving = false;
        this.colliding = false;
        this.collidingEntities = [];
    }

    update(deltaTime, inputManager, collisionSystem) {
        // Get movement input based on camera mode
        const input = inputManager.getMovementInput();
        
        // Handle movement based on camera mode
        if (inputManager.cameraMode === 'fixed-angle') {
            this.updateFixedAngleMode(input, deltaTime, collisionSystem);
        } else {
            this.updatePlayerPerspectiveMode(input, deltaTime, collisionSystem);
        }
    }

    updateFixedAngleMode(input, deltaTime, collisionSystem) {
        // Fixed-angle mode: WASD moves in fixed directions, arrow keys rotate camera
        let moveX = 0;
        let moveY = 0;

        // Get camera rotation to make controls relative to camera
        const cameraRotation = window.game?.camera?.rotation || 0;
        
        // Movement relative to camera rotation
        if (input.forward) {
            moveX += Math.sin(cameraRotation);
            moveY -= Math.cos(cameraRotation);
        }
        if (input.backward) {
            moveX -= Math.sin(cameraRotation);
            moveY += Math.cos(cameraRotation);
        }
        if (input.left) {
            moveX -= Math.cos(cameraRotation);
            moveY -= Math.sin(cameraRotation);
        }
        if (input.right) {
            moveX += Math.cos(cameraRotation);
            moveY += Math.sin(cameraRotation);
        }
        if (input.strafeLeft) {
            moveX -= Math.cos(cameraRotation);
            moveY -= Math.sin(cameraRotation);
        }
        if (input.strafeRight) {
            moveX += Math.cos(cameraRotation);
            moveY += Math.sin(cameraRotation);
        }

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/√2
            moveY *= 0.707;
        }

        // Calculate new position
        const newX = this.x + moveX * this.speed * (deltaTime / 1000);
        const newY = this.y + moveY * this.speed * (deltaTime / 1000);

        // Check collision before moving
        if (collisionSystem) {
            const collisionResponse = collisionSystem.getCollisionResponse(
                this.x, this.y, newX, newY, this.collisionRadius
            );
            
            if (!collisionResponse.blocked) {
                this.x = collisionResponse.x;
                this.y = collisionResponse.y;
            }
        } else {
            this.x = newX;
            this.y = newY;
        }

        // Update movement state
        this.isMoving = moveX !== 0 || moveY !== 0;
        
        // Update player angle based on movement direction
        if (this.isMoving) {
            this.angle = Math.atan2(moveX, -moveY);
        }
    }

    updatePlayerPerspectiveMode(input, deltaTime, collisionSystem) {
        // Player-perspective mode: A/D rotates player, W/S moves forward/backward
        let moveX = 0;
        let moveY = 0;

        // Rotation (A/D keys) - respect deltaTime properly
        const rotationAmount = this.rotSpeed * (deltaTime / 1000);
        if (input.left) this.angle -= rotationAmount;
        if (input.right) this.angle += rotationAmount;

        // Forward/backward movement (W/S keys)
        if (input.forward) {
            moveX += Math.sin(this.angle);
            moveY -= Math.cos(this.angle);
        }
        if (input.backward) {
            // Backward movement at half speed
            moveX -= Math.sin(this.angle) * 0.5;
            moveY += Math.cos(this.angle) * 0.5;
        }

        // Strafing (Q/E keys)
        if (input.strafeLeft) {
            moveX -= Math.cos(this.angle);
            moveY -= Math.sin(this.angle);
        }
        if (input.strafeRight) {
            moveX += Math.cos(this.angle);
            moveY += Math.sin(this.angle);
        }

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }

        // Calculate new position
        const newX = this.x + moveX * this.speed * (deltaTime / 1000);
        const newY = this.y + moveY * this.speed * (deltaTime / 1000);

        // Check collision before moving
        if (collisionSystem) {
            const collisionResponse = collisionSystem.getCollisionResponse(
                this.x, this.y, newX, newY, this.collisionRadius
            );
            
            if (!collisionResponse.blocked) {
                this.x = collisionResponse.x;
                this.y = collisionResponse.y;
            }
        } else {
            this.x = newX;
            this.y = newY;
        }

        // Update movement state
        this.isMoving = moveX !== 0 || moveY !== 0;
    }

    render(ctx) {
        ctx.save();

        // Draw player as triangle pointing in facing direction
        const size = this.size;
        const angle = this.angle;

        // Calculate triangle points
        const frontX = this.x + Math.sin(angle) * size / 2;
        const frontY = this.y - Math.cos(angle) * size / 2;
        const leftX = this.x + Math.sin(angle - Math.PI * 2/3) * size / 2;
        const leftY = this.y - Math.cos(angle - Math.PI * 2/3) * size / 2;
        const rightX = this.x + Math.sin(angle + Math.PI * 2/3) * size / 2;
        const rightY = this.y - Math.cos(angle + Math.PI * 2/3) * size / 2;

        // Draw player body
        ctx.fillStyle = this.colliding ? '#ff0000' : '#00ff00';
        ctx.beginPath();
        ctx.moveTo(frontX, frontY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        ctx.fill();

        // Draw player border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw movement indicator when moving
        if (this.isMoving) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(frontX, frontY);
            ctx.stroke();
        }

        ctx.restore();
    }

    centerOnCanvas(width, height) {
        this.x = width / 2;
        this.y = height / 2;
    }

    // Get player info for debugging
    getInfo() {
        return {
            position: `(${this.x.toFixed(1)}, ${this.y.toFixed(1)})`,
            angle: `${(this.angle * 180 / Math.PI).toFixed(1)}°`,
            speed: this.speed,
            isMoving: this.isMoving,
            colliding: this.colliding
        };
    }
} 