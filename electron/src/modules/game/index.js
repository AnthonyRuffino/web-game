import { CanvasManager } from './canvas.js';

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Initialize game systems
        this.canvasManager = new CanvasManager();
        
        // Debug elements
        this.fpsElement = null;
        this.positionElement = null;
        this.versionElement = null;
    }
    
    async init() {
        try {
            // Get app version
            const version = await window.electronAPI.getAppVersion();
            console.log(`[Game] Initializing game version ${version}`);
            
            // Initialize canvas
            await this.canvasManager.init();
            this.canvas = this.canvasManager.canvas;
            this.ctx = this.canvasManager.ctx;
            
            // Setup debug info
            this.setupDebugInfo(version);
            
            // Setup window resize handling
            this.setupWindowResize();
            
            // Mark game as ready
            document.body.classList.add('game-ready');
            
            // Start game loop
            this.start();
            
            console.log('[Game] Game initialized successfully');
            
        } catch (error) {
            console.error('[Game] Failed to initialize game:', error);
            this.showError('Failed to initialize game: ' + error.message);
        }
    }
    
    setupDebugInfo(version) {
        this.fpsElement = document.getElementById('fps');
        this.positionElement = document.getElementById('position');
        this.versionElement = document.getElementById('version');
        
        if (this.versionElement) {
            this.versionElement.textContent = `Version: ${version}`;
        }
    }
    
    setupWindowResize() {
        window.electronAPI.onWindowResized(() => {
            this.canvasManager.resize();
        });
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.updateFPS(currentTime);
        
        // Update game state
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update game systems
        this.canvasManager.update(deltaTime);
        
        // Update debug info
        this.updateDebugInfo();
    }
    
    render() {
        // Clear canvas
        this.canvasManager.clear();
        
        // Render game content
        this.renderGameContent();
    }
    
    renderGameContent() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw a simple message to show the game is working
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Web Game - Electron', width / 2, height / 2 - 50);
        
        ctx.font = '16px Arial';
        ctx.fillText('Canvas is working!', width / 2, height / 2);
        ctx.fillText('Press any key to continue...', width / 2, height / 2 + 30);
        
        // Draw a simple shape to show rendering
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(width / 2 - 25, height / 2 + 50, 50, 50);
        
        // Draw a circle
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(width / 2 + 100, height / 2 + 75, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }
    
    updateDebugInfo() {
        if (this.fpsElement) {
            this.fpsElement.textContent = `FPS: ${this.fps}`;
        }
        
        if (this.positionElement) {
            this.positionElement.textContent = `Canvas: ${this.canvas.width}x${this.canvas.height}`;
        }
    }
    
    showError(message) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = `Error: ${message}`;
            loadingMessage.style.color = '#ff0000';
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init().catch(error => {
        console.error('[Game] Failed to start game:', error);
    });
    
    // Make game globally accessible for debugging
    window.game = game;
}); 