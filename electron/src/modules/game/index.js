import { CanvasManager } from './canvas.js';
import { Player } from './character.js';
import { InputManager } from './input.js';
import { DotsSystem } from './dots.js';
import { Camera } from './camera.js';

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
        this.player = new Player();
        this.inputManager = new InputManager();
        this.dotsSystem = new DotsSystem();
        this.camera = new Camera();
        
        // Debug elements
        this.fpsElement = null;
        this.positionElement = null;
        this.versionElement = null;
        this.inputElement = null;
        this.cameraElement = null;
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
            
            // Initialize camera
            this.camera.init(this.canvas.width, this.canvas.height);
            
            // Initialize input system
            this.inputManager.init();
            
            // Setup player
            this.player.centerOnCanvas(this.canvas.width, this.canvas.height);
            
            // Setup input bindings
            this.setupInputBindings();
            
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
    
    setupInputBindings() {
        // Bind input to player movement
        this.inputManager.bindAction('w', () => this.player.setKeyState('w', true));
        this.inputManager.bindAction('s', () => this.player.setKeyState('s', true));
        this.inputManager.bindAction('a', () => this.player.setKeyState('a', true));
        this.inputManager.bindAction('d', () => this.player.setKeyState('d', true));
        
        this.inputManager.bindAction('ArrowUp', () => this.player.setKeyState('arrowup', true));
        this.inputManager.bindAction('ArrowDown', () => this.player.setKeyState('arrowdown', true));
        this.inputManager.bindAction('ArrowLeft', () => this.player.setKeyState('arrowleft', true));
        this.inputManager.bindAction('ArrowRight', () => this.player.setKeyState('arrowright', true));
        
        // Handle key releases
        document.addEventListener('keyup', (event) => {
            this.player.setKeyState(event.key, false);
        });
    }
    
    setupDebugInfo(version) {
        this.fpsElement = document.getElementById('fps');
        this.positionElement = document.getElementById('position');
        this.versionElement = document.getElementById('version');
        
        // Create input debug element if it doesn't exist
        if (!document.getElementById('input')) {
            const debugInfo = document.getElementById('debug-info');
            const inputElement = document.createElement('div');
            inputElement.id = 'input';
            inputElement.textContent = 'Input: --';
            debugInfo.appendChild(inputElement);
        }
        this.inputElement = document.getElementById('input');
        
        // Create camera debug element if it doesn't exist
        if (!document.getElementById('camera')) {
            const debugInfo = document.getElementById('debug-info');
            const cameraElement = document.createElement('div');
            cameraElement.id = 'camera';
            cameraElement.textContent = 'Camera: --';
            debugInfo.appendChild(cameraElement);
        }
        this.cameraElement = document.getElementById('camera');
        
        if (this.versionElement) {
            this.versionElement.textContent = `Version: ${version}`;
        }
    }
    
    setupWindowResize() {
        window.electronAPI.onWindowResized(() => {
            this.canvasManager.resize();
            this.camera.resize(this.canvas.width, this.canvas.height);
            // Re-center player on new canvas size
            this.player.centerOnCanvas(this.canvas.width, this.canvas.height);
        });
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.inputManager.destroy();
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
        this.player.update(deltaTime);
        this.camera.update(deltaTime);
        
        // Update camera to follow player
        this.camera.follow(this.player.x, this.player.y);
        
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
        
        // Apply camera transform
        ctx.save();
        ctx.translate(-this.camera.x + width / 2, -this.camera.y + height / 2);
        
        // Draw background dots
        this.dotsSystem.render(ctx, this.camera.x, this.camera.y, width, height, this.camera.zoom);
        
        // Draw player
        this.player.render(ctx);
        
        // Restore transform
        ctx.restore();
        
        // Draw UI elements (not affected by camera)
        this.drawInstructions(ctx, width, height);
    }
    
    drawInstructions(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        const instructions = [
            'Use WASD or Arrow Keys to move',
            'Player position: (' + Math.round(this.player.x) + ', ' + Math.round(this.player.y) + ')',
            'Camera position: (' + Math.round(this.camera.x) + ', ' + Math.round(this.camera.y) + ')',
            'Moving: ' + (this.player.isMoving ? 'Yes' : 'No')
        ];
        
        let y = 30;
        instructions.forEach(instruction => {
            ctx.fillText(instruction, 10, y);
            y += 20;
        });
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
        
        if (this.inputElement) {
            const pressedKeys = this.inputManager.getPressedKeys();
            this.inputElement.textContent = `Input: ${pressedKeys.length > 0 ? pressedKeys.join(', ') : '--'}`;
        }
        
        if (this.cameraElement) {
            const cameraState = this.camera.getState();
            this.cameraElement.textContent = `Camera: (${Math.round(cameraState.position.x)}, ${Math.round(cameraState.position.y)})`;
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