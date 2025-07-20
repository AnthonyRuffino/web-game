import { CanvasManager } from './canvas.js';
import { Player } from './character.js';
import { InputManager } from './input.js';
import { DotsSystem } from './dots.js';
import { Camera } from './camera.js';
import { World } from './world.js';
import { CollisionSystem } from './collision.js';
import { InteractionSystem } from './interactions.js';
import { WorldEnhancements } from './world-enhancements.js';
import { AssetManager } from './assets.js';

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
        this.assetManager = null;
        
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
        this.assetsElement = null;
    }

    async init() {
        try {
            console.log('[Game] Initializing game...');
            
            // Initialize canvas with proper error handling
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.canvasManager = new CanvasManager(this.canvas);
            
            // Wait for canvas to be properly initialized
            if (!this.canvasManager.isInitialized()) {
                console.log('[Game] Waiting for canvas initialization...');
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Initialize asset manager first
            this.assetManager = new AssetManager();
            await this.assetManager.initAssetDir();
            
            // Initialize all required images
            console.log('[Game] Initializing required images...');
            await this.assetManager.initializeImages();
            
            // Initialize game systems
            this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
            this.inputManager = new InputManager();
            this.dotsSystem = new DotsSystem();
            this.camera = new Camera(this.canvas.width, this.canvas.height);
            this.world = new World();
            this.collisionSystem = new CollisionSystem();
            this.interactionSystem = new InteractionSystem();
            this.worldEnhancements = new WorldEnhancements(this.world);
            
            // Make asset manager available globally for world system
            window.game = this;
            
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
            { id: 'enhancements', text: 'Enhancements: --' },
            { id: 'assets', text: 'Assets: --' }
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
        this.assetsElement = document.getElementById('assets');
        
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
        // Update input
        this.inputManager.update?.(deltaTime);
        
        // Handle mouse wheel zoom
        const wheelDelta = this.inputManager.getMouseWheelDelta();
        if (wheelDelta !== 0) {
            this.camera.handleZoom(wheelDelta);
        }
        
        // Update camera
        this.camera.update(deltaTime);
        
        // Update player
        this.player.update(deltaTime);
        
        // Update camera to follow player
        this.camera.follow(this.player.x, this.player.y);
        
        // Update other systems
        this.dotsSystem.update?.(deltaTime);
        this.world.update?.(deltaTime);
        this.collisionSystem.update(deltaTime, this.world, this.player);
        this.interactionSystem.update?.(deltaTime);
        this.worldEnhancements.update?.(deltaTime);
    }

    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transform
        this.camera.applyTransform(this.ctx);
        
        // Render game content (world space)
        this.renderGameContent();
        
        // Restore camera transform
        this.camera.restoreTransform(this.ctx);
        
        // Render UI elements (screen space)
        this.renderUI();
    }

    renderGameContent() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw background dots (dots handle their own world coordinates)
        this.dotsSystem.render(ctx, this.camera.x, this.camera.y, width, height, this.camera.zoom);
        
        // Draw world (chunks, entities, etc.) - world handles its own transforms
        // Returns fixed angle entities for rendering after player
        const fixedAngleEntities = this.world.render(ctx, this.camera.x, this.camera.y, width, height);
        
        // Draw player (player coordinates are in world space)
        this.player.render(ctx);
        
        // Draw fixed angle entities (trees) after player (matching core/world.js logic)
        if (fixedAngleEntities && Array.isArray(fixedAngleEntities)) {
            // Sort by Y position (descending - higher Y renders first)
            fixedAngleEntities.sort((a, b) => b.y - a.y);
            
            fixedAngleEntities.forEach(entity => {
                if (entity.render) {
                    ctx.save();
                    
                    // Use renderY if specified, otherwise use entity.y
                    const renderY = entity.renderY !== undefined ? entity.renderY : entity.y;
                    ctx.translate(entity.x, renderY);
                    
                    entity.render(ctx);
                    ctx.restore();
                }
            });
        }
        
        // Draw interaction indicators
        this.interactionSystem.renderInteractionIndicators(ctx, this.world, this.player);
        
        // Draw collision debug (if enabled)
        // this.collisionSystem.renderCollisionDebug(ctx, this.world, this.player);
        
        // Draw atmospheric effects (in screen space)
        this.worldEnhancements.renderAtmosphere(ctx, this.camera.x, this.camera.y, width, height);
    }

    renderUI() {
        // UI elements that should not be affected by camera transform
        // This is called after camera.restoreTransform() in the main render method
        this.drawInstructions(this.ctx, this.canvas.width, this.canvas.height);
    }

    drawInstructions(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        const timeOfDay = this.worldEnhancements.getTimeOfDay();
        const timeRemaining = this.worldEnhancements.getTimeRemaining();
        
        const instructions = [
            'Use WASD or Arrow Keys to move',
            'Press E to interact with nearby objects',
            'Player position: (' + Math.round(this.player.x) + ', ' + Math.round(this.player.y) + ')',
            'Camera position: (' + Math.round(this.camera.x) + ', ' + Math.round(this.camera.y) + ')',
            'Moving: ' + (this.player.isMoving ? 'Yes' : 'No'),
            'Loaded chunks: ' + this.world.chunkCache.size,
            'Time: ' + timeOfDay + ' (' + timeRemaining + 's remaining)',
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
            const inputState = this.inputManager.getInputState();
            this.inputElement.textContent = `Input: ${inputState.pressedKeys}`;
        }
        
        if (this.cameraElement) {
            const cameraInfo = this.camera.getInfo();
            this.cameraElement.textContent = `Camera: ${cameraInfo.position}, ${cameraInfo.zoom}`;
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
        
        if (this.assetsElement && this.assetManager) {
            const availableImages = this.assetManager.getAvailableImages();
            this.assetsElement.textContent = `Assets: ${availableImages.memory.length} cached`;
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