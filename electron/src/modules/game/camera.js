export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.zoom = 1;
        this.targetX = 0;
        this.targetY = 0;
        this.followSpeed = 0.1; // Smooth following speed
    }
    
    // Initialize camera with canvas dimensions
    init(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.targetX = this.x;
        this.targetY = this.y;
        
        console.log('[Camera] Camera initialized:', { width: this.width, height: this.height });
    }
    
    // Update camera position (called each frame)
    update(deltaTime) {
        // Smooth follow target
        const dt = deltaTime / 1000;
        const speed = this.followSpeed * dt * 60; // Normalize to 60 FPS
        
        this.x += (this.targetX - this.x) * speed;
        this.y += (this.targetY - this.y) * speed;
    }
    
    // Set camera to follow a target (like the player)
    follow(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
    }
    
    // Set camera position directly
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }
    
    // Get camera bounds for rendering calculations
    getBounds() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        return {
            left: this.x - halfWidth,
            right: this.x + halfWidth,
            top: this.y - halfHeight,
            bottom: this.y + halfHeight,
            width: this.width,
            height: this.height
        };
    }
    
    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x + this.width / 2,
            y: worldY - this.y + this.height / 2
        };
    }
    
    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x - this.width / 2,
            y: screenY + this.y - this.height / 2
        };
    }
    
    // Check if a world position is visible in the camera view
    isVisible(worldX, worldY, margin = 0) {
        const bounds = this.getBounds();
        return worldX >= bounds.left - margin &&
               worldX <= bounds.right + margin &&
               worldY >= bounds.top - margin &&
               worldY <= bounds.bottom + margin;
    }
    
    // Resize camera for new canvas dimensions
    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        console.log('[Camera] Camera resized:', { width: this.width, height: this.height });
    }
    
    // Set zoom level
    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(5, zoom)); // Clamp between 0.1 and 5
    }
    
    // Get camera state for debugging
    getState() {
        return {
            position: { x: this.x, y: this.y },
            target: { x: this.targetX, y: this.targetY },
            dimensions: { width: this.width, height: this.height },
            zoom: this.zoom,
            bounds: this.getBounds()
        };
    }
} 