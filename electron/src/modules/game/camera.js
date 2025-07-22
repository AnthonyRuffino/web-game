export class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        this.zoomSpeed = 0.1;
        this.followSpeed = 0.1;
        this.targetZoom = 1;
        
        // Camera mode support
        this.mode = 'fixed-angle'; // 'fixed-angle' or 'player-perspective'
        this.rotation = 0; // Camera rotation for fixed-angle mode (radians)
        this.rotationSpeed = Math.PI * 0.8; // radians per second
    }

    // Set camera mode
    setMode(mode) {
        if (mode === 'fixed-angle' || mode === 'player-perspective') {
            this.mode = mode;
            console.log(`[Camera] Mode set to: ${mode}`);
        }
    }

    // Toggle between camera modes
    toggleMode() {
        this.mode = this.mode === 'fixed-angle' ? 'player-perspective' : 'fixed-angle';
        console.log(`[Camera] Mode toggled to: ${this.mode}`);
        return this.mode;
    }

    // Rotate camera in fixed-angle mode
    rotateCamera(deltaRotation) {
        if (this.mode === 'fixed-angle') {
            this.rotation += deltaRotation;
            // Keep rotation in reasonable bounds
            while (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;
            while (this.rotation < 0) this.rotation += Math.PI * 2;
        }
    }

    // Reset camera rotation to north (0 degrees)
    resetRotation() {
        this.rotation = 0;
        console.log('[Camera] Rotation reset to north');
    }

    // Handle mouse wheel zoom
    handleZoom(delta) {
        // Calculate zoom change based on wheel delta
        // delta > 0 means scroll down (zoom out), delta < 0 means scroll up (zoom in)
        const zoomChange = delta > 0 ? 0.9 : 1.1;
        this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomChange));
    }

    // Update zoom with smooth transitions
    update(deltaTime) {
        // Smooth zoom transition
        if (Math.abs(this.zoom - this.targetZoom) > 0.01) {
            this.zoom += (this.targetZoom - this.zoom) * this.zoomSpeed;
        }
    }

    // Follow a target with smooth movement
    follow(targetX, targetY) {
        this.x += (targetX - this.x) * this.followSpeed;
        this.y += (targetY - this.y) * this.followSpeed;
    }

    // Apply camera transform to context
    applyTransform(ctx) {
        ctx.save();
        
        // Apply zoom and translation
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(this.zoom, this.zoom);
        
        if (this.mode === 'player-perspective') {
            // In player-perspective mode, we'll apply rotation in the game render loop
            // based on player angle, so we just translate here
            ctx.translate(-this.x, -this.y);
        } else {
            // Fixed-angle mode: apply camera rotation
            ctx.rotate(-this.rotation);
            ctx.translate(-this.x, -this.y);
        }
    }

    // Apply player-perspective transform (called from game render loop)
    applyPlayerPerspectiveTransform(ctx, playerAngle) {
        if (this.mode === 'player-perspective') {
            // Rotate the entire world around the player's position
            // First translate to player position, rotate, then translate back
            ctx.translate(this.x, this.y);
            ctx.rotate(-playerAngle);
            ctx.translate(-this.x, -this.y);
        }
    }

    // Restore camera transform
    restoreTransform(ctx) {
        ctx.restore();
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY, playerAngle = 0) {
        let worldX, worldY;
        
        // Undo zoom and center translation
        const x = (screenX - this.width / 2) / this.zoom;
        const y = (screenY - this.height / 2) / this.zoom;
        const undoAngle = this.mode == 'player-perspective' ? playerAngle : this.rotation;
        
        // Undo rotation
        const cos = Math.cos(undoAngle);
        const sin = Math.sin(undoAngle);
        worldX = x * cos - y * sin + this.x;
        worldY = x * sin + y * cos + this.y;
        
        return { x: worldX, y: worldY };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY, playerAngle = 0) {
        let screenX, screenY;
        
        // Translate to camera-relative coordinates
        const x = worldX - this.x;
        const y = worldY - this.y;
        const angle = this.mode === 'player-perspective' ? playerAngle : this.rotation; 

        const cos = Math.cos(-angle);
            const sin = Math.sin(-angle);
            screenX = (x * cos - y * sin) * this.zoom + this.width / 2;
            screenY = (x * sin + y * cos) * this.zoom + this.height / 2;
        
        return { x: screenX, y: screenY };
    }

    // Get camera bounds in world coordinates
    getBounds() {
        const halfWidth = this.width / (2 * this.zoom);
        const halfHeight = this.height / (2 * this.zoom);
        
        return {
            left: this.x - halfWidth,
            right: this.x + halfWidth,
            top: this.y - halfHeight,
            bottom: this.y + halfHeight,
            width: this.width / this.zoom,
            height: this.height / this.zoom
        };
    }

    // Resize camera for new window size
    resize(width, height) {
        this.width = width;
        this.height = height;
        console.log('[Camera] Camera resized:', { width, height });
    }

    // Get camera info for debugging
    getInfo() {
        return {
            position: `(${this.x.toFixed(1)}, ${this.y.toFixed(1)})`,
            zoom: `${this.zoom.toFixed(2)}x`,
            mode: this.mode,
            rotation: `${(this.rotation * 180 / Math.PI).toFixed(1)}°`,
            bounds: this.getBounds()
        };
    }
} 