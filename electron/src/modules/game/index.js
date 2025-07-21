import { InputManager } from './input.js';
import { Camera } from './camera.js';
import { Player } from './character.js';
import { CollisionSystem } from './collision.js';
import { InteractionSystem } from './interactions.js';
import { DotsSystem } from './dots.js';
import { World } from './world.js';
import { AssetManager } from './assets.js';
import { WorldEnhancements } from './world-enhancements.js';
import { CanvasManager } from './canvas.js';
import { PersistenceSystem } from './persistence.js';
import { MenuManager } from './menuManager.js';

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
        this.persistenceSystem = null;
        this.menuManager = null;
        
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

        this.hoveredGridCell = null;
        this.inputBlocked = false;
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
            this.persistenceSystem = new PersistenceSystem();
            this.menuManager = new MenuManager();
            
            // Initialize systems
            this.inputManager.init();
            this.world.init();
            this.persistenceSystem.init(this);
            
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

            // Setup input event listeners for advanced input handling
            this.setupAdvancedInputListeners();
            
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

        // Bind grid overlay toggle (g)
        this.inputManager.bindAction('g', () => {
            this.world.showGrid = !this.world.showGrid;
            console.log(`[Game] Grid overlay ${this.world.showGrid ? 'enabled' : 'disabled'}`);
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
                    
                case 'save':
                    const saveSuccess = this.persistenceSystem.manualSave();
                    console.log(`[Console] Manual save ${saveSuccess ? 'completed' : 'failed'}`);
                    break;
                    
                case 'load':
                    const loadSuccess = this.persistenceSystem.manualLoad();
                    console.log(`[Console] Manual load ${loadSuccess ? 'completed' : 'failed'}`);
                    break;
                    
                case 'clear':
                    const clearSuccess = this.persistenceSystem.clearSavedState();
                    console.log(`[Console] Save data ${clearSuccess ? 'cleared' : 'failed to clear'}`);
                    break;
                    
                case 'saveinfo':
                    const saveInfo = this.persistenceSystem.getSaveInfo();
                    if (saveInfo) {
                        console.log('[Console] Save info:', saveInfo);
                    } else {
                        console.log('[Console] No save data found');
                    }
                    break;
                    
                case 'setseed':
                    const seed = parseInt(args[0]);
                    if (isNaN(seed) || seed < 0) {
                        console.log('[Console] Usage: cmd("setseed", <number>)');
                    } else {
                        this.world.setSeed(seed);
                        console.log(`[Console] World seed set to: ${seed}`);
                    }
                    break;
                    
                case 'getseed':
                    const currentSeed = this.world.getSeed();
                    console.log(`[Console] Current world seed: ${currentSeed}`);
                    break;
                    
                case 'menu':
                    try {
                        const menuConfig = args[0];
                        if (!menuConfig) {
                            console.log('[Console] Usage: cmd("menu", <menuConfig>)');
                            console.log('[Console] Example: cmd("menu", {id: "test", title: "Test Menu", viewportX: 0.1, viewportY: 0.1, viewportWidth: 0.8, viewportHeight: 0.8, content: "<h3>Test Content</h3>"})');
                        } else {
                            const menuId = this.menuManager.createMenu(menuConfig);
                            this.menuManager.showMenu(menuId);
                            console.log(`[Console] Created and showed menu: ${menuId}`);
                        }
                    } catch (error) {
                        console.error('[Console] Error creating menu:', error);
                    }
                    break;
                    
                case 'menus':
                    const menuList = this.menuManager.listMenus();
                    break;
                    
                case 'close':
                    const menuId = args[0];
                    if (!menuId) {
                        console.log('[Console] Usage: cmd("close", <menuId>)');
                    } else {
                        const closed = this.menuManager.hideMenu(menuId);
                        console.log(`[Console] Menu ${menuId} ${closed ? 'closed' : 'not found'}`);
                    }
                    break;
                    
                case 'closeall':
                    this.menuManager.closeAllMenus();
                    console.log('[Console] All menus closed');
                    break;
                    
                case 'testmenu':
                    const testMenuConfig = {
                        id: 'test-menu',
                        title: 'Test Menu',
                        viewportX: 0.1,
                        viewportY: 0.1,
                        viewportWidth: 0.8,
                        viewportHeight: 0.8,
                        content: '<h3>Test Menu Content</h3><p>This is a test menu with viewport-relative positioning and scaling.</p>'
                    };
                    const testMenuId = this.menuManager.createMenu(testMenuConfig);
                    this.menuManager.showMenu(testMenuId);
                    console.log(`[Console] Created test menu: ${testMenuId}`);
                    break;
                    
                case 'testtabs':
                    const tabsMenuConfig = {
                        id: 'tabs-menu',
                        title: 'Tabs & Buttons Test',
                        viewportX: 0.05,
                        viewportY: 0.05,
                        viewportWidth: 0.9,
                        viewportHeight: 0.9,
                        tabs: [
                            {
                                name: 'Entities',
                                content: '<h3>Entity Management</h3><p>Manage entity types and their configurations.</p>',
                                buttons: [
                                    { 
                                        text: 'Upload Tree', 
                                        icon: '🌳',
                                        onClick: (e) => {
                                            console.log('[Console] Upload Tree clicked');
                                            // TODO: Implement upload functionality
                                        }
                                    },
                                    { 
                                        text: 'Upload Grass', 
                                        icon: '🌱',
                                        onClick: (e) => {
                                            console.log('[Console] Upload Grass clicked');
                                            // TODO: Implement upload functionality
                                        }
                                    },
                                    { 
                                        text: 'Upload Rock', 
                                        icon: '🪨',
                                        onClick: (e) => {
                                            console.log('[Console] Upload Rock clicked');
                                            // TODO: Implement upload functionality
                                        }
                                    }
                                ]
                            },
                            {
                                name: 'Settings',
                                content: '<h3>Game Settings</h3><p>Configure game options and preferences.</p>',
                                buttons: [
                                    { 
                                        text: 'Save Settings', 
                                        icon: '💾',
                                        onClick: (e) => {
                                            console.log('[Console] Save Settings clicked');
                                            // TODO: Implement save functionality
                                        }
                                    },
                                    { 
                                        text: 'Reset Defaults', 
                                        icon: '🔄',
                                        onClick: (e) => {
                                            console.log('[Console] Reset Defaults clicked');
                                            // TODO: Implement reset functionality
                                        }
                                    },
                                    { 
                                        text: 'Export Config', 
                                        icon: '📤',
                                        onClick: (e) => {
                                            console.log('[Console] Export Config clicked');
                                            // TODO: Implement export functionality
                                        }
                                    }
                                ]
                            },
                            {
                                name: 'Help',
                                content: '<h3>Help & Information</h3><p>Get help and view game information.</p>',
                                buttons: [
                                    { 
                                        text: 'View Controls', 
                                        icon: '⌨️',
                                        onClick: (e) => {
                                            console.log('[Console] View Controls clicked');
                                            // TODO: Show controls help
                                        }
                                    },
                                    { 
                                        text: 'About Game', 
                                        icon: 'ℹ️',
                                        onClick: (e) => {
                                            console.log('[Console] About Game clicked');
                                            // TODO: Show about dialog
                                        }
                                    },
                                    { 
                                        text: 'Report Bug', 
                                        icon: '🐛',
                                        onClick: (e) => {
                                            console.log('[Console] Report Bug clicked');
                                            // TODO: Open bug report form
                                        }
                                    }
                                ]
                            }
                        ]
                    };
                    const tabsMenuId = this.menuManager.createMenu(tabsMenuConfig);
                    this.menuManager.showMenu(tabsMenuId);
                    console.log(`[Console] Created tabs menu: ${tabsMenuId}`);
                    break;
                    
                case 'testcallbacks':
                    const callbackMenuConfig = {
                        id: 'callback-test-menu',
                        title: 'Callback System Test',
                        viewportX: 0.1,
                        viewportY: 0.1,
                        viewportWidth: 0.8,
                        viewportHeight: 0.8,
                        content: '<h3>Callback System Test</h3><p>Test the onClick and onClickMenu callback system.</p>',
                        buttons: [
                            {
                                text: 'Direct Callback',
                                icon: '🎯',
                                onClick: (e) => {
                                    console.log('[Console] Direct callback executed!');
                                    alert('Direct callback works!');
                                }
                            },
                            {
                                text: 'Open Child Menu',
                                icon: '📂',
                                onClickMenu: {
                                    id: 'child-menu',
                                    title: 'Child Menu',
                                    viewportX: 0.2,
                                    viewportY: 0.2,
                                    viewportWidth: 0.6,
                                    viewportHeight: 0.6,
                                    content: '<h3>Child Menu</h3><p>This is a child menu opened via onClickMenu callback.</p>',
                                    buttons: [
                                        {
                                            text: 'Close Child',
                                            icon: '❌',
                                            onClick: (e) => {
                                                console.log('[Console] Closing child menu');
                                                window.game.menuManager.hideMenu('child-menu');
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    };
                    const callbackMenuId = this.menuManager.createMenu(callbackMenuConfig);
                    this.menuManager.showMenu(callbackMenuId);
                    console.log(`[Console] Created callback test menu: ${callbackMenuId}`);
                    break;
                    
                case 'testresize':
                    const resizeMenuConfig = {
                        id: 'resize-test-menu',
                        title: 'Resize & Scale Test',
                        viewportX: 0.1,
                        viewportY: 0.1,
                        viewportWidth: 0.8,
                        viewportHeight: 0.8,
                        content: '<h3>Resize Test Menu</h3><p>Try resizing this menu and then resizing the viewport. The menu should maintain its position and size, and all internal elements should scale properly.</p>',
                        buttons: [
                            {
                                text: 'Test Button',
                                icon: '🧪',
                                onClick: (e) => {
                                    console.log('[Console] Test button clicked');
                                    alert('Button scaling works!');
                                }
                            }
                        ],
                        radioGroups: [
                            {
                                label: 'Test Radio Group',
                                name: 'test-radio',
                                options: [
                                    { text: 'Option 1', value: '1' },
                                    { text: 'Option 2', value: '2' },
                                    { text: 'Option 3', value: '3' }
                                ],
                                onChange: (value) => {
                                    console.log('[Console] Radio changed to:', value);
                                }
                            }
                        ],
                        gridButtons: [
                            {
                                label: 'Test Grid',
                                rows: 2,
                                cols: 3,
                                cellSize: 80,
                                gap: 10,
                                buttons: [
                                    { name: 'Cell 1', onClick: () => console.log('Cell 1 clicked') },
                                    { name: 'Cell 2', onClick: () => console.log('Cell 2 clicked') },
                                    { name: 'Cell 3', onClick: () => console.log('Cell 3 clicked') },
                                    { name: 'Cell 4', onClick: () => console.log('Cell 4 clicked') },
                                    { name: 'Cell 5', onClick: () => console.log('Cell 5 clicked') },
                                    { name: 'Cell 6', onClick: () => console.log('Cell 6 clicked') }
                                ]
                            }
                        ]
                    };
                    const resizeMenuId = this.menuManager.createMenu(resizeMenuConfig);
                    this.menuManager.showMenu(resizeMenuId);
                    console.log(`[Console] Created resize test menu: ${resizeMenuId}`);
                    console.log('[Console] Instructions:');
                    console.log('  1. Resize the menu by dragging its corner');
                    console.log('  2. Move the menu by dragging its header');
                    console.log('  3. Resize the browser window');
                    console.log('  4. The menu should maintain its position/size and scale internally');
                    break;
                    
                case 'help':
                    console.log('[Console] Available commands:');
                    console.log('  cmd("perspective") or cmd("toggle") - Toggle camera mode');
                    console.log('  cmd("reset") or cmd("resetcamera") - Reset camera rotation to north');
                    console.log('  cmd("mode") - Show current camera mode');
                    console.log('  cmd("save") - Manual save game state');
                    console.log('  cmd("load") - Manual load game state');
                    console.log('  cmd("clear") - Clear saved game state');
                    console.log('  cmd("saveinfo") - Show save information');
                    console.log('  cmd("setseed", <number>) - Set world seed');
                    console.log('  cmd("getseed") - Show current world seed');
                    console.log('  cmd("menu", <config>) - Create and show menu');
                    console.log('  cmd("menus") - List all open menus');
                    console.log('  cmd("close", <menuId>) - Close specific menu');
                    console.log('  cmd("closeall") - Close all menus');
                    console.log('  cmd("testmenu") - Create test menu');
                    console.log('  cmd("testtabs") - Create tabs menu with buttons');
                    console.log('  cmd("testcallbacks") - Test callback system');
                    console.log('  cmd("testresize") - Test resize and scaling');
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

    setupAdvancedInputListeners() {
        // --- Mouse grid cell hover/click tracking ---
        const canvas = this.canvas;
        const camera = this.camera;
        const player = this.player;
        const world = this.world;
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left);
            let y = (e.clientY - rect.top);
            // Use camera transform to get world coordinates
            const { x: worldX, y: worldY } = camera.screenToWorld(x, y, player.angle);
            const tileSize = world ? world.config.tileSize : 32;
            const tileX = Math.floor(worldX / tileSize);
            const tileY = Math.floor(worldY / tileSize);
            this.hoveredGridCell = { tileX, tileY };
        });
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left);
            let y = (e.clientY - rect.top);
            const { x: worldX, y: worldY } = camera.screenToWorld(x, y, player.angle);
            const tileSize = world ? world.config.tileSize : 32;
            const tileX = Math.floor(worldX / tileSize);
            const tileY = Math.floor(worldY / tileSize);
            console.log('[Canvas Click]', {
                canvas: { x: Math.round(x), y: Math.round(y) },
                world: { x: worldX, y: worldY },
                cell: { tileX, tileY }
            });
            // Entity lookup at clicked cell
            if (world && typeof world.loadChunk === 'function') {
                const chunkSize = world.config.chunkSize;
                const chunkX = Math.floor(tileX / chunkSize);
                const chunkY = Math.floor(tileY / chunkSize);
                const chunk = world.loadChunk(chunkX, chunkY);
                if (chunk && Array.isArray(chunk.entities)) {
                    const entitiesAtCell = chunk.entities.filter(e => e.tileX === tileX && e.tileY === tileY);
                    if (entitiesAtCell.length > 0) {
                        console.log('[Entity Click]', entitiesAtCell);
                    }
                }
            }
        });
        // --- Input blocking for text fields ---
        const blockInput = () => { this.inputBlocked = true; InputManager.setInputBlocked(true); };
        const unblockInput = () => { this.inputBlocked = false; InputManager.setInputBlocked(false); };
        const isBlockingInputElement = (el) => {
            return (
                (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) ||
                el.tagName === 'TEXTAREA'
            );
        };
        document.addEventListener('focusin', (e) => {
            if (isBlockingInputElement(e.target)) blockInput();
        });
        document.addEventListener('focusout', (e) => {
            if (isBlockingInputElement(e.target)) {
                setTimeout(() => {
                    const el = document.activeElement;
                    if (!isBlockingInputElement(el)) {
                        unblockInput();
                    }
                }, 0);
            }
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
        this.persistenceSystem.update?.(deltaTime);
        
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

        // --- Render hovered grid cell highlight ---
        if (this.hoveredGridCell && this.world) {
            const tileSize = this.world.config.tileSize;
            const { tileX, tileY } = this.hoveredGridCell;
            ctx.save();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
            ctx.restore();
        }
    }

    renderUI() {
        // UI elements that should not be affected by camera transform
        // This is called after camera.restoreTransform() in the main render method
        this.drawInstructions(this.ctx, this.canvas.width, this.canvas.height);
        
        // Render interaction text in screen space (always upright)
        this.interactionSystem.renderInteractionText(this.ctx, this.camera);
    }

    drawInstructions(ctx, width, height) {
        // No text rendering on canvas - all info moved to debug panel
        // This method is kept for potential future use but currently empty
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
            const cameraMode = this.inputManager.cameraMode;
            this.cameraElement.textContent = `Camera: ${cameraInfo.position}, ${cameraInfo.zoom}, ${cameraInfo.rotation} (${cameraMode})`;
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