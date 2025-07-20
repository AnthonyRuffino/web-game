// Persistence system for Electron game
// Handles saving and loading game state

export class PersistenceSystem {
    constructor() {
        this.config = {
            saveInterval: 5000, // Save every 5 seconds
            storageKey: 'electronGameState',
            autoSave: true
        };
        
        this.lastSaveTime = 0;
        this.saveTimeout = null;
        this.game = null;
    }

    // Initialize persistence system
    init(game) {
        this.game = game;
        console.log('[Persistence] Persistence system initialized');
        
        // Load saved state on startup
        this.loadGameState();
        
        // Start periodic saving if enabled
        if (this.config.autoSave) {
            this.startPeriodicSaving();
        }
        
        // Save state when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
    }

    // Save current game state to localStorage
    saveGameState() {
        if (!this.game) return false;
        
        try {
            const gameState = {
                version: '1.0',
                timestamp: Date.now(),
                player: {
                    x: this.game.player.x,
                    y: this.game.player.y,
                    angle: this.game.player.angle,
                    speed: this.game.player.speed,
                    rotSpeed: this.game.player.rotSpeed,
                    size: this.game.player.size,
                    collisionRadius: this.game.player.collisionRadius
                },
                camera: {
                    mode: this.game.inputManager.cameraMode,
                    rotation: this.game.camera.rotation,
                    zoom: this.game.camera.zoom
                },
                world: {
                    seed: this.game.world.getSeed()
                }
            };

            localStorage.setItem(this.config.storageKey, JSON.stringify(gameState));
            this.lastSaveTime = Date.now();
            
            console.log('[Persistence] Game state saved');
            return true;
        } catch (error) {
            console.error('[Persistence] Failed to save game state:', error);
            return false;
        }
    }

    // Load game state from localStorage
    loadGameState() {
        if (!this.game) return false;
        
        try {
            const savedState = localStorage.getItem(this.config.storageKey);
            if (!savedState) {
                console.log('[Persistence] No saved game state found, starting fresh');
                return false;
            }

            const gameState = JSON.parse(savedState);
            
            // Validate state structure
            if (!gameState.player || !gameState.camera) {
                console.warn('[Persistence] Invalid saved state structure, starting fresh');
                return false;
            }

            // Restore world state first (before player position)
            if (gameState.world && gameState.world.seed) {
                this.game.world.setSeed(gameState.world.seed);
                console.log(`[Persistence] World seed restored: ${gameState.world.seed}`);
            } else {
                console.log('[Persistence] No saved world seed, using default');
            }

            // Restore player state
            if (gameState.player) {
                this.game.player.x = gameState.player.x || 0;
                this.game.player.y = gameState.player.y || 0;
                this.game.player.angle = gameState.player.angle || 0;
                this.game.player.speed = gameState.player.speed || 50;
                this.game.player.rotSpeed = gameState.player.rotSpeed || Math.PI * 2;
                this.game.player.size = gameState.player.size || 20;
                this.game.player.collisionRadius = gameState.player.collisionRadius || 10;
            }

            // Restore camera state
            if (gameState.camera) {
                this.game.inputManager.setCameraMode(gameState.camera.mode || 'fixed-angle');
                this.game.camera.setMode(gameState.camera.mode || 'fixed-angle');
                this.game.camera.rotation = gameState.camera.rotation || 0;
                this.game.camera.zoom = gameState.camera.zoom || 1;
            }

            console.log('[Persistence] Game state loaded successfully');
            console.log(`[Persistence] Player position: (${this.game.player.x.toFixed(1)}, ${this.game.player.y.toFixed(1)})`);
            console.log(`[Persistence] Camera mode: ${this.game.inputManager.cameraMode}`);
            console.log(`[Persistence] World seed: ${this.game.world.getSeed()}`);
            console.log(`[Persistence] Last saved: ${new Date(gameState.timestamp).toLocaleString()}`);
            
            return true;
        } catch (error) {
            console.error('[Persistence] Failed to load game state:', error);
            return false;
        }
    }

    // Start periodic saving
    startPeriodicSaving() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            this.saveGameState();
            this.startPeriodicSaving(); // Schedule next save
        }, this.config.saveInterval);
        
        console.log('[Persistence] Periodic saving started');
    }

    // Stop periodic saving
    stopPeriodicSaving() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
            console.log('[Persistence] Periodic saving stopped');
        }
    }

    // Clear saved game state
    clearSavedState() {
        try {
            localStorage.removeItem(this.config.storageKey);
            console.log('[Persistence] Saved game state cleared');
            return true;
        } catch (error) {
            console.error('[Persistence] Failed to clear saved state:', error);
            return false;
        }
    }

    // Get save information
    getSaveInfo() {
        try {
            const savedState = localStorage.getItem(this.config.storageKey);
            if (!savedState) {
                return null;
            }

            const gameState = JSON.parse(savedState);
            return {
                timestamp: gameState.timestamp,
                playerPosition: gameState.player ? { x: gameState.player.x, y: gameState.player.y } : null,
                cameraMode: gameState.camera ? gameState.camera.mode : null,
                worldSeed: gameState.world ? gameState.world.seed : null,
                version: gameState.version
            };
        } catch (error) {
            console.error('[Persistence] Failed to get save info:', error);
            return null;
        }
    }

    // Update configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Restart periodic saving if interval changed
        if (this.config.autoSave && this.saveTimeout) {
            this.stopPeriodicSaving();
            this.startPeriodicSaving();
        }
        
        console.log('[Persistence] Configuration updated:', this.config);
    }

    // Get current configuration
    getConfig() {
        return { ...this.config };
    }

    // Manual save trigger
    manualSave() {
        const success = this.saveGameState();
        if (success) {
            console.log('[Persistence] Manual save completed');
        }
        return success;
    }

    // Manual load trigger
    manualLoad() {
        const success = this.loadGameState();
        if (success) {
            console.log('[Persistence] Manual load completed');
        }
        return success;
    }
} 