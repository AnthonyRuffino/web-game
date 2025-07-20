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
        ctx.translate(-this.x, -this.y);
    }

    // Restore camera transform
    restoreTransform(ctx) {
        ctx.restore();
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.width / 2) / this.zoom + this.x;
        const worldY = (screenY - this.height / 2) / this.zoom + this.y;
        return { x: worldX, y: worldY };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.x) * this.zoom + this.width / 2;
        const screenY = (worldY - this.y) * this.zoom + this.height / 2;
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
            bounds: this.getBounds()
        };
    }
} 