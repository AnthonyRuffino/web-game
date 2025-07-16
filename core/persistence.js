// persistence.js
// Game state persistence and loading system

const Persistence = {
  // Configuration
  config: {
    saveInterval: 5000, // Save every 5 seconds
    storageKey: 'webGameState',
    autoSave: true
  },

  // State tracking
  lastSaveTime: 0,
  saveTimeout: null,

  // Initialize persistence system
  init() {
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
  },

  // Save current game state to localStorage
  saveGameState() {
    try {
      const gameState = {
        version: '1.0',
        timestamp: Date.now(),
        player: {
          x: Player.x,
          y: Player.y,
          angle: Player.angle,
          speed: Player.speed
        },
        world: {
          seed: World.config.seed
        },
        game: {
          tick: this.getGameTick(),
          perspective: typeof PERSPECTIVE_MODE !== 'undefined' ? PERSPECTIVE_MODE : 'fixed-north',
          zoom: typeof ZOOM !== 'undefined' ? ZOOM : 1.0,
          cameraRotation: typeof CAMERA_ROTATION !== 'undefined' ? CAMERA_ROTATION : 0
        }
      };

      localStorage.setItem(this.config.storageKey, JSON.stringify(gameState));
      this.lastSaveTime = Date.now();
      
      return true;
    } catch (error) {
      console.error('[Persistence] Failed to save game state:', error);
      return false;
    }
  },

  // Load game state from localStorage
  loadGameState() {
    try {
      const savedState = localStorage.getItem(this.config.storageKey);
      if (!savedState) {
        console.log('[Persistence] No saved game state found, starting fresh');
        return false;
      }

      const gameState = JSON.parse(savedState);
      
      // Validate state structure
      if (!gameState.player || !gameState.world) {
        console.warn('[Persistence] Invalid saved state structure, starting fresh');
        return false;
      }

      // Restore player state
      if (typeof Player !== 'undefined') {
        Player.x = gameState.player.x || 0;
        Player.y = gameState.player.y || 0;
        Player.angle = gameState.player.angle || 0;
        Player.speed = gameState.player.speed || 1000;
      }

      // Restore world state
      if (typeof World !== 'undefined' && gameState.world.seed) {
        World.setSeed(gameState.world.seed);
      }

      // Restore game settings
      if (typeof PERSPECTIVE_MODE !== 'undefined' && gameState.game.perspective) {
        PERSPECTIVE_MODE = gameState.game.perspective;
      }
      
      if (typeof ZOOM !== 'undefined' && gameState.game.zoom) {
        ZOOM = gameState.game.zoom;
      }
      
      if (typeof CAMERA_ROTATION !== 'undefined' && gameState.game.cameraRotation !== undefined) {
        CAMERA_ROTATION = gameState.game.cameraRotation;
        window.CAMERA_ROTATION = CAMERA_ROTATION;
      }

      console.log('[Persistence] Game state loaded successfully');
      console.log(`[Persistence] Player position: (${Player.x.toFixed(1)}, ${Player.y.toFixed(1)})`);
      console.log(`[Persistence] World seed: ${gameState.world.seed}`);
      console.log(`[Persistence] Last saved: ${new Date(gameState.timestamp).toLocaleString()}`);
      
      return true;
    } catch (error) {
      console.error('[Persistence] Failed to load game state:', error);
      return false;
    }
  },

  // Start periodic saving
  startPeriodicSaving() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveGameState();
      this.startPeriodicSaving(); // Schedule next save
    }, this.config.saveInterval);
    
  },

  // Stop periodic saving
  stopPeriodicSaving() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
      console.log('[Persistence] Periodic saving stopped');
    }
  },

  // Get current game tick (simple implementation)
  getGameTick() {
    // For now, use a simple timestamp-based tick
    // In the future, this could be a proper game tick counter
    return Math.floor(Date.now() / 1000);
  },

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
  },

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
        worldSeed: gameState.world ? gameState.world.seed : null,
        version: gameState.version
      };
    } catch (error) {
      console.error('[Persistence] Failed to get save info:', error);
      return null;
    }
  },

  // Update configuration
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart periodic saving if interval changed
    if (this.config.autoSave && this.saveTimeout) {
      this.stopPeriodicSaving();
      this.startPeriodicSaving();
    }
    
    console.log('[Persistence] Configuration updated:', this.config);
  },

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }
}