// Canvas management and responsive handling

export class CanvasManager {
    constructor(canvas = null) {
        // Find or create canvas element
        this.canvas = canvas || this.findOrCreateCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.isResizing = false;
        
        // Ensure canvas has proper dimensions
        this.initializeCanvas();
        
        // Setup resize handling
        this.setupResizeHandling();
    }

    findOrCreateCanvas() {
        // First try to find existing canvas
        let canvas = document.getElementById('game-canvas');
        
        if (!canvas) {
            // Create canvas element
            canvas = document.createElement('canvas');
            canvas.id = 'game-canvas';
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            
            // Find a suitable container
            const container = document.getElementById('game-container') || document.body;
            container.appendChild(canvas);
            
            console.log('[CanvasManager] Created new canvas element');
        }
        
        return canvas;
    }

    initializeCanvas() {
        if (!this.canvas) {
            console.error('[CanvasManager] Canvas element is null');
            return;
        }

        // Get the container dimensions
        const container = this.canvas.parentElement || document.body;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to match container
        this.canvas.width = containerRect.width || 1200;
        this.canvas.height = containerRect.height || 800;
        
        console.log(`[CanvasManager] Initialized canvas: ${this.canvas.width}x${this.canvas.height}`);
    }

    setupResizeHandling() {
        // Debounced resize handler
        let resizeTimeout;
        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            
            resizeTimeout = setTimeout(() => {
                this.resize();
            }, 100);
        };

        // Listen for window resize
        window.addEventListener('resize', handleResize);
        
        // Listen for container resize
        if (this.canvas.parentElement) {
            const resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(this.canvas.parentElement);
        }
    }

    resize() {
        if (this.isResizing) return;
        
        this.isResizing = true;
        
        try {
            // Get the container dimensions
            const container = this.canvas.parentElement || document.body;
            const containerRect = container.getBoundingClientRect();
            
            // Set new canvas size
            const newWidth = containerRect.width || 1200;
            const newHeight = containerRect.height || 800;
            
            if (newWidth > 0 && newHeight > 0) {
                this.canvas.width = newWidth;
                this.canvas.height = newHeight;
                
                console.log(`[CanvasManager] Resized canvas to: ${newWidth}x${newHeight}`);
                
                // Notify other systems about the resize
                this.onResize(newWidth, newHeight);
            }
        } catch (error) {
            console.error('[CanvasManager] Error during resize:', error);
        } finally {
            this.isResizing = false;
        }
    }

    onResize(width, height) {
        // This can be overridden by the game to handle resize events
        if (window.game && window.game.camera) {
            window.game.camera.resize(width, height);
        }
    }

    update(deltaTime) {
        // Handle any canvas-specific updates
        // Currently just a placeholder for future features
    }

    // Get current canvas dimensions
    getDimensions() {
        return {
            width: this.canvas ? this.canvas.width : 1200,
            height: this.canvas ? this.canvas.height : 800
        };
    }

    // Check if canvas is properly initialized
    isInitialized() {
        return this.canvas && this.canvas.width > 0 && this.canvas.height > 0;
    }
} 