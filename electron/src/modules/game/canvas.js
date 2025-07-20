export class CanvasManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.targetWidth = 1200;
        this.targetHeight = 800;
        this.aspectRatio = this.targetWidth / this.targetHeight;
    }
    
    async init() {
        try {
            // Get canvas element
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Get 2D context
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get 2D context');
            }
            
            // Set initial size
            this.resize();
            
            // Setup canvas properties
            this.setupCanvas();
            
            console.log('[CanvasManager] Canvas initialized successfully');
            console.log(`[CanvasManager] Canvas size: ${this.width}x${this.height}`);
            
        } catch (error) {
            console.error('[CanvasManager] Failed to initialize canvas:', error);
            throw error;
        }
    }
    
    setupCanvas() {
        // Set canvas properties for better rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Set canvas style properties
        this.canvas.style.display = 'block';
        this.canvas.style.margin = 'auto';
    }
    
    resize() {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate new size maintaining aspect ratio
        let newWidth = containerWidth;
        let newHeight = containerWidth / this.aspectRatio;
        
        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * this.aspectRatio;
        }
        
        // Set canvas size
        this.width = Math.floor(newWidth);
        this.height = Math.floor(newHeight);
        
        // Update canvas dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Update canvas style
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        
        console.log(`[CanvasManager] Canvas resized to ${this.width}x${this.height}`);
    }
    
    clear() {
        if (!this.ctx) return;
        
        // Clear the entire canvas with a dark background to prevent smearing
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    clearWithColor(color = '#000000') {
        if (!this.ctx) return;
        
        // Fill canvas with specified color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    update(deltaTime) {
        // Update canvas-related systems
        // This will be expanded as we add more features
    }
    
    // Utility methods for drawing
    drawRect(x, y, width, height, color = '#ffffff') {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    drawCircle(x, y, radius, color = '#ffffff') {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawText(text, x, y, font = '16px Arial', color = '#ffffff', align = 'left') {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
    
    // Get canvas center coordinates
    getCenter() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }
    
    // Check if coordinates are within canvas bounds
    isInBounds(x, y) {
        return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
    }
} 