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
            
            // Initialize canvas
            this.canvasManager = new CanvasManager();
            this.canvas = this.canvasManager.canvas;
            this.ctx = this.canvas.getContext('2d');
            
            // Initialize systems
            this.inputManager = new InputManager();
            this.camera = new Camera(this.canvas.width, this.canvas.height);
            this.player = new Player(0, 0);
            this.dotsSystem = new DotsSystem();
            this.world = new World();
            this.collisionSystem = new CollisionSystem();
            this.interactionSystem = new InteractionSystem();
            this.worldEnhancements = new WorldEnhancements();
            this.assetManager = new AssetManager();
            
            // Initialize systems
            this.inputManager.init();
            this.world.init();
            
            // Load assets
            await this.assetManager.initializeImages();
            
            // Setup input bindings
            this.setupInputBindings();
            
            // Setup debug info
            this.setupDebugInfo('1.0.0');
            
            // Setup window resize handling
            this.setupWindowResize();
            
            // Setup console commands
            this.setupConsoleCommands();
            
            // Start the game
            this.start();
            
            console.log('[Game] Game initialized successfully');
        } catch (error) {
            console.error('[Game] Failed to initialize game:', error);
            this.showError(error.message);
            throw error;
        }
    }

    setupInputBindings() {
        // Bind camera mode toggle
        this.inputManager.bindAction('p', () => {
            const newMode = this.inputManager.toggleCameraMode();
            this.camera.setMode(newMode);
            console.log(`[Game] Camera mode toggled to: ${newMode}`);
        });
        
        // Bind camera rotation reset
        this.inputManager.bindAction('r', () => {
            this.camera.resetRotation();
            console.log('[Game] Camera rotation reset to north');
        });
        
        // Handle interaction input
        this.inputManager.bindAction('e', () => {
            this.interactionSystem.handleInput(this.world, this.player, 'e');
        });
        
        // Bind debug info toggle (Ctrl + `)
        this.inputManager.bindAction('`', () => {
            this.toggleDebugInfo();
        });
    }

    setupConsoleCommands() {
        // Make console commands available globally
        window.cmd = (command, ...args) => {
            switch (command) {
                case 'perspective':
                case 'toggle':
                    const newMode = this.inputManager.toggleCameraMode();
                    this.camera.setMode(newMode);
                    console.log(`[Console] Camera mode toggled to: ${newMode}`);
                    break;
                    
                case 'reset':
                case 'resetcamera':
                    this.camera.resetRotation();
                    console.log('[Console] Camera rotation reset to north');
                    break;
                    
                case 'mode':
                    console.log(`[Console] Current camera mode: ${this.inputManager.cameraMode}`);
                    break;
                    
                case 'help':
                    console.log('[Console] Available commands:');
                    console.log('  cmd("perspective") or cmd("toggle") - Toggle camera mode');
                    console.log('  cmd("reset") or cmd("resetcamera") - Reset camera rotation to north');
                    console.log('  cmd("mode") - Show current camera mode');
                    console.log('  cmd("help") - Show this help');
                    break;
                    
                default:
                    console.log(`[Console] Unknown command: ${command}. Use cmd("help") for available commands.`);
                    break;
            }
        };
        
        console.log('[Game] Console commands available. Use cmd("help") for list of commands.');
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
            { id: 'time', text: 'Time: --' },
            { id: 'weather', text: 'Weather: --' },
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
        this.timeElement = document.getElementById('time');
        this.weatherElement = document.getElementById('weather');
        this.enhancementsElement = document.getElementById('enhancements');
        this.assetsElement = document.getElementById('assets');
        
        if (this.versionElement) {
            this.versionElement.textContent = `Version: ${version}`;
        }
        
        // Update debug info immediately
        this.updateDebugInfo();
    }

    toggleDebugInfo() {
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.classList.toggle('hidden');
            console.log('[Game] Debug info toggled');
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
        
        // Handle camera rotation in fixed-angle mode
        const input = this.inputManager.getMovementInput();
        if (this.inputManager.cameraMode === 'fixed-angle') {
            if (input.cameraLeft) this.camera.rotateCamera(-this.camera.rotationSpeed * (deltaTime / 1000));
            if (input.cameraRight) this.camera.rotateCamera(this.camera.rotationSpeed * (deltaTime / 1000));
        }
        
        // Update camera
        this.camera.update(deltaTime);
        
        // Update player with proper input and collision
        this.player.update(deltaTime, this.inputManager, this.collisionSystem);
        
        // Update camera to follow player
        this.camera.follow(this.player.x, this.player.y);
        
        // Update other systems
        this.dotsSystem.update?.(deltaTime);
        this.world.update?.(deltaTime);
        this.collisionSystem.update(deltaTime, this.world, this.player);
        this.interactionSystem.update?.(deltaTime);
        this.worldEnhancements.update?.(deltaTime);
        
        // Update debug info
        this.updateDebugInfo();
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
        
        // Apply player-perspective transform if in that mode
        if (this.inputManager.cameraMode === 'player-perspective') {
            this.camera.applyPlayerPerspectiveTransform(ctx, this.player.angle);
        }
        
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
        
        // Render interaction text in screen space (always upright)
        this.interactionSystem.renderInteractionText(this.ctx, this.camera);
    }

    drawInstructions(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        const cameraMode = this.inputManager.cameraMode;
        
        const instructions = [
            `Camera Mode: ${cameraMode} (Press P to toggle)`,
            `Debug Info: Ctrl + \` to toggle`,
            '',
            cameraMode === 'fixed-angle' ? 
                'Fixed-Angle Mode Controls:' :
                'Player-Perspective Mode Controls:',
            cameraMode === 'fixed-angle' ?
                'WASD: Move in fixed directions' :
                'A/D: Rotate player',
            cameraMode === 'fixed-angle' ?
                'Arrow Keys: Rotate camera view' :
                'W: Move forward, S: Move backward (half speed)',
            cameraMode === 'fixed-angle' ?
                'Q/E: Strafe left/right' :
                'Q/E: Strafe left/right',
            '',
            'R: Reset camera rotation to north',
            'E: Interact with nearby objects',
            'Mouse Wheel: Zoom in/out'
        ];
        
        let y = 30;
        instructions.forEach(instruction => {
            if (instruction === '') {
                y += 10; // Extra spacing for empty lines
            } else {
                ctx.fillText(instruction, 10, y);
                y += 20;
            }
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
        
        if (this.timeElement) {
            const timeOfDay = this.worldEnhancements.getTimeOfDay();
            const timeRemaining = this.worldEnhancements.getTimeRemaining();
            this.timeElement.textContent = `Time: ${timeOfDay} (${timeRemaining}s remaining)`;
        }
        
        if (this.weatherElement) {
            this.weatherElement.textContent = `Weather: ${this.worldEnhancements.weather}`;
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