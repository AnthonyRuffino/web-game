import { CanvasManager } from './canvas.js';
import { Player } from './character.js';
import { InputManager } from './input.js';
import { DotsSystem } from './dots.js';
import { Camera } from './camera.js';
import { World } from './world.js';
import { CollisionSystem } from './collision.js';
import { InteractionSystem } from './interactions.js';
import { WorldEnhancements } from './world-enhancements.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.canvasManager = null;
        this.player = null;
        this.inputManager = null;
        this.dotsSystem = null;
        this.camera = null;
        this.world = null;
        this.collisionSystem = null;
        this.interactionSystem = null;
        this.worldEnhancements = null;
        
        this.isRunning = false;
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Debug elements
        this.fpsElement = null;
        this.positionElement = null;
        this.versionElement = null;
        this.inputElement = null;
        this.cameraElement = null;
        this.worldElement = null;
        this.collisionElement = null;
        this.interactionElement = null;
        this.enhancementsElement = null;
    }

    async init() {
        try {
            console.log('[Game] Initializing game...');
            
            // Initialize canvas
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvasManager = new CanvasManager(this.canvas);
            
            // Initialize game systems
            this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
            this.inputManager = new InputManager();
            this.dotsSystem = new DotsSystem();
            this.camera = new Camera(this.canvas.width, this.canvas.height);
            this.world = new World();
            this.collisionSystem = new CollisionSystem();
            this.interactionSystem = new InteractionSystem();
            this.worldEnhancements = new WorldEnhancements(this.world);
            
            // Setup systems
            this.inputManager.init();
            this.setupInputBindings();
            this.setupDebugInfo('1.0.0');
            this.setupWindowResize();
            
            // Hide loading message
            document.body.classList.add('game-ready');
            
            console.log('[Game] Game initialized successfully');
            
            // Start the game loop
            this.start();
            
        } catch (error) {
            console.error('[Game] Failed to initialize game:', error);
            this.showError(error.message);
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
            
            // Handle interaction input
            this.interactionSystem.handleInput(this.world, this.player, event.key);
        });
    }

    setupDebugInfo(version) {
        this.fpsElement = document.getElementById('fps');
        this.positionElement = document.getElementById('position');
        this.versionElement = document.getElementById('version');
        
        // Create debug elements if they don't exist
        const debugElements = [
            { id: 'input', text: 'Input: --' },
            { id: 'camera', text: 'Camera: --' },
            { id: 'world', text: 'World: --' },
            { id: 'collision', text: 'Collision: --' },
            { id: 'interaction', text: 'Interaction: --' },
            { id: 'enhancements', text: 'Enhancements: --' }
        ];
        
        debugElements.forEach(({ id, text }) => {
            if (!document.getElementById(id)) {
                const debugInfo = document.getElementById('debug-info');
                const element = document.createElement('div');
                element.id = id;
                element.textContent = text;
                debugInfo.appendChild(element);
            }
        });
        
        this.inputElement = document.getElementById('input');
        this.cameraElement = document.getElementById('camera');
        this.worldElement = document.getElementById('world');
        this.collisionElement = document.getElementById('collision');
        this.interactionElement = document.getElementById('interaction');
        this.enhancementsElement = document.getElementById('enhancements');
        
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
        this.worldEnhancements.update(deltaTime);
        
        // Update camera to follow player
        this.camera.follow(this.player.x, this.player.y);
        
        // Update collision system
        this.collisionSystem.updateCollisions(this.world, this.player);
        
        // Update debug info
        this.updateDebugInfo();
    }

    render() {
        // Clear canvas completely before rendering
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game content
        this.renderGameContent();
    }

    renderGameContent() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Apply camera transform for world rendering
        ctx.save();
        ctx.translate(-this.camera.x + width / 2, -this.camera.y + height / 2);
        
        // Draw background dots (dots handle their own world coordinates)
        this.dotsSystem.render(ctx, this.camera.x, this.camera.y, width, height, this.camera.zoom);
        
        // Draw world (chunks, entities, etc.) - world handles its own transforms
        this.world.render(ctx, this.camera.x, this.camera.y, width, height);
        
        // Draw player (player coordinates are in world space)
        this.player.render(ctx);
        
        // Draw interaction indicators
        this.interactionSystem.renderInteractionIndicators(ctx, this.world, this.player);
        
        // Draw collision debug (if enabled)
        // this.collisionSystem.renderCollisionDebug(ctx, this.world, this.player);
        
        // Restore camera transform
        ctx.restore();
        
        // Draw atmospheric effects (in screen space)
        this.worldEnhancements.renderAtmosphere(ctx, this.camera.x, this.camera.y, width, height);
        
        // Draw UI elements (not affected by camera) - in screen space
        this.drawInstructions(ctx, width, height);
    }

    drawInstructions(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        const instructions = [
            'Use WASD or Arrow Keys to move',
            'Press E to interact with nearby objects',
            'Player position: (' + Math.round(this.player.x) + ', ' + Math.round(this.player.y) + ')',
            'Camera position: (' + Math.round(this.camera.x) + ', ' + Math.round(this.camera.y) + ')',
            'Moving: ' + (this.player.isMoving ? 'Yes' : 'No'),
            'Loaded chunks: ' + this.world.chunkCache.size,
            'Time: ' + this.worldEnhancements.getTimeOfDay(),
            'Weather: ' + this.worldEnhancements.weather
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
        
        if (this.worldElement) {
            const worldInfo = this.world.getInfo();
            this.worldElement.textContent = `World: ${worldInfo.loadedChunks} chunks loaded`;
        }
        
        if (this.collisionElement) {
            const collisionStats = this.collisionSystem.getCollisionStats();
            this.collisionElement.textContent = `Collision: ${collisionStats.collidingEntities} entities`;
        }
        
        if (this.interactionElement) {
            const interactionStats = this.interactionSystem.getInteractionStats(this.world, this.player);
            this.interactionElement.textContent = `Interaction: ${interactionStats.totalInteractable} nearby`;
        }
        
        if (this.enhancementsElement) {
            const enhancementsStats = this.worldEnhancements.getStats();
            this.enhancementsElement.textContent = `Enhancements: ${enhancementsStats.timeOfDay}, ${enhancementsStats.weather}`;
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