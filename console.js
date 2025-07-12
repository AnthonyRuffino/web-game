// console.js
// Developer console and debugging tools

const Console = {
  commands: {},
  history: [],
  maxHistory: 50,

  // Register a new command
  register(name, description, handler) {
    this.commands[name] = {
      description,
      handler,
      name
    };
    console.log(`[Console] Registered command: ${name}`);
  },

  // Execute a command
  execute(input) {
    const parts = input.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands[commandName]) {
      try {
        this.commands[commandName].handler(args);
        this.addToHistory(input);
      } catch (error) {
        console.error(`[Console] Error executing ${commandName}:`, error);
      }
    } else {
      console.warn(`[Console] Unknown command: ${commandName}`);
      console.log(`[Console] Type 'help' for available commands`);
    }
  },

  // Add command to history
  addToHistory(input) {
    this.history.push(input);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  },

  // Get command history
  getHistory() {
    return [...this.history];
  },

  // Initialize built-in commands
  init() {
    // Help command
    this.register('help', 'Show available commands', (args) => {
      console.log('[Console] Available commands:');
      Object.values(this.commands).forEach(cmd => {
        console.log(`  ${cmd.name} - ${cmd.description}`);
      });
    });

    // Teleport command
    this.register('teleport', 'Move player to coordinates (x, y)', (args) => {
      if (args.length !== 2) {
        console.log('[Console] Usage: teleport <x> <y>');
        return;
      }
      const x = parseFloat(args[0]);
      const y = parseFloat(args[1]);
      if (isNaN(x) || isNaN(y)) {
        console.log('[Console] Invalid coordinates. Usage: teleport <x> <y>');
        return;
      }
      if (typeof Player !== 'undefined') {
        Player.x = x;
        // Flip Y coordinate: larger Y should move north (up)
        Player.y = (World.height * World.tileSize) - y;
        console.log(`[Console] Teleported to (${x}, ${y}) - Y flipped for north-up coordinate system`);
      } else {
        console.error('[Console] Player object not found');
      }
    });

    // Set speed command
    this.register('setspeed', 'Set player movement speed', (args) => {
      if (args.length !== 1) {
        console.log('[Console] Usage: setspeed <value>');
        return;
      }
      const speed = parseFloat(args[0]);
      if (isNaN(speed) || speed < 0) {
        console.log('[Console] Invalid speed value. Must be a positive number.');
        return;
      }
      if (typeof Player !== 'undefined') {
        Player.speed = speed;
        console.log(`[Console] Player speed set to ${speed}`);
      } else {
        console.error('[Console] Player object not found');
      }
    });

    // Print player stats
    this.register('stats', 'Display player statistics', (args) => {
      if (typeof Player !== 'undefined') {
        console.log('[Console] Player Statistics:');
        console.log(`  Position: (${Player.x.toFixed(2)}, ${Player.y.toFixed(2)})`);
        console.log(`  Angle: ${(Player.angle * 180 / Math.PI).toFixed(2)}°`);
        console.log(`  Speed: ${Player.speed}`);
        console.log(`  Rotation Speed: ${Player.rotSpeed}`);
        console.log(`  Size: ${Player.size}`);
      } else {
        console.error('[Console] Player object not found');
      }
    });

    // Set zoom command
    this.register('setzoom', 'Set zoom level', (args) => {
      if (args.length !== 1) {
        console.log('[Console] Usage: setzoom <value>');
        return;
      }
      const zoom = parseFloat(args[0]);
      if (isNaN(zoom)) {
        console.log('[Console] Invalid zoom value.');
        return;
      }
      if (typeof window.setZoom === 'function') {
        window.setZoom(zoom);
      } else {
        console.error('[Console] Zoom system not available');
      }
    });

    // Toggle perspective command
    this.register('perspective', 'Toggle between camera modes', (args) => {
      if (typeof window.togglePerspectiveMode === 'function') {
        window.togglePerspectiveMode();
      } else {
        console.error('[Console] Perspective system not available');
      }
    });

    // Spawn item command (placeholder for future item system)
    this.register('spawnitem', 'Spawn an item at player location', (args) => {
      if (args.length !== 1) {
        console.log('[Console] Usage: spawnitem <itemName>');
        return;
      }
      const itemName = args[0];
      console.log(`[Console] Spawning ${itemName} at player location (item system not yet implemented)`);
      // TODO: Implement when item system is added
    });

    // Clear console command
    this.register('clear', 'Clear console output', (args) => {
      console.clear();
    });

    // Version command
    this.register('version', 'Show game version', (args) => {
      console.log('[Console] Web Game v1.0.0 - Step 2 Development');
    });

    // Background texture commands
    this.register('bgconfig', 'Show background texture configuration', (args) => {
      if (typeof Background !== 'undefined') {
        console.log('[Console] Background configuration:', Background.getConfig());
      } else {
        console.error('[Console] Background system not available');
      }
    });

    this.register('bgset', 'Set background texture property (property value)', (args) => {
      if (args.length !== 2) {
        console.log('[Console] Usage: bgset <property> <value>');
        console.log('[Console] Properties: dotSize, dotSpacing, dotColor, dotAlpha');
        return;
      }
      if (typeof Background !== 'undefined') {
        const property = args[0];
        const value = args[1];
        const config = {};
        config[property] = value;
        Background.setConfig(config);
        console.log(`[Console] Set ${property} to ${value}`);
      } else {
        console.error('[Console] Background system not available');
      }
    });

    this.register('bgpreset', 'Apply preset background configurations (dense, sparse, bright, subtle)', (args) => {
      if (args.length !== 1) {
        console.log('[Console] Usage: bgpreset <preset>');
        console.log('[Console] Presets: dense, sparse, bright, subtle');
        return;
      }
      if (typeof Background !== 'undefined') {
        const preset = args[0].toLowerCase();
        const presets = {
          dense: { dotSize: 1, dotSpacing: 10, dotColor: '#333333', dotAlpha: 0.4 },
          sparse: { dotSize: 3, dotSpacing: 40, dotColor: '#333333', dotAlpha: 0.2 },
          bright: { dotSize: 2, dotSpacing: 20, dotColor: '#666666', dotAlpha: 0.6 },
          subtle: { dotSize: 1, dotSpacing: 30, dotColor: '#222222', dotAlpha: 0.1 }
        };
        
        if (presets[preset]) {
          Background.setConfig(presets[preset]);
          console.log(`[Console] Applied ${preset} preset`);
        } else {
          console.log('[Console] Unknown preset. Available: dense, sparse, bright, subtle');
        }
      } else {
        console.error('[Console] Background system not available');
      }
    });

    // World system commands
    this.register('worldinfo', 'Show world information and configuration', (args) => {
      if (typeof World !== 'undefined') {
        const info = World.getInfo();
        console.log('[Console] World Information:');
        console.log(`  Size: ${info.size}`);
        console.log(`  Tiles: ${info.tiles}`);
        console.log(`  Tile Size: ${info.tileSize} pixels`);
        console.log(`  Seed: ${info.seed}`);
        console.log(`  Starting Position: (${info.startingPosition.x.toFixed(1)}, ${info.startingPosition.y.toFixed(1)})`);
        console.log(`  Traversal Time: ~${info.traversalTime} seconds`);
      } else {
        console.error('[Console] World system not available');
      }
    });

    this.register('setseed', 'Set world seed and restart game', (args) => {
      if (args.length !== 1) {
        console.log('[Console] Usage: setseed <seed>');
        return;
      }
      const seed = parseInt(args[0]);
      if (isNaN(seed)) {
        console.log('[Console] Invalid seed. Must be a number.');
        return;
      }
      if (typeof World !== 'undefined') {
        const startPos = World.setSeed(seed);
        if (typeof Player !== 'undefined') {
          Player.x = startPos.x;
          Player.y = startPos.y;
          console.log(`[Console] World restarted with seed ${seed}`);
          console.log(`[Console] Player moved to starting position (${startPos.x.toFixed(1)}, ${startPos.y.toFixed(1)})`);
        }
      } else {
        console.error('[Console] World system not available');
      }
    });

    this.register('restartgame', 'Restart game with new random seed', (args) => {
      const seed = Math.floor(Math.random() * 10000);
      if (typeof World !== 'undefined') {
        const startPos = World.setSeed(seed);
        if (typeof Player !== 'undefined') {
          Player.x = startPos.x;
          Player.y = startPos.y;
          console.log(`[Console] Game restarted with random seed ${seed}`);
          console.log(`[Console] Player moved to starting position (${startPos.x.toFixed(1)}, ${startPos.y.toFixed(1)})`);
        }
      } else {
        console.error('[Console] World system not available');
      }
    });

    this.register('worldconfig', 'Show world configuration', (args) => {
      if (typeof World !== 'undefined') {
        console.log('[Console] World configuration:', World.getConfig());
      } else {
        console.error('[Console] World system not available');
      }
    });

    this.register('chunkinfo', 'Show chunk loading information', (args) => {
      if (typeof World !== 'undefined') {
        const info = World.getInfo();
        const playerTile = World.pixelToTile(Player.x, Player.y);
        const playerChunk = World.worldToChunk(playerTile.x, playerTile.y);
        
        console.log('[Console] Chunk Information:');
        console.log(`  Chunk Size: ${info.chunkSize}x${info.chunkSize} tiles`);
        console.log(`  Total Chunks: ${info.chunks}`);
        console.log(`  Loaded Chunks: ${info.loadedChunks}`);
        console.log(`  Player Tile: (${playerTile.x}, ${playerTile.y})`);
        console.log(`  Player Chunk: (${playerChunk.x}, ${playerChunk.y})`);
        
        // Show visible chunks
        const cameraWidth = 800 / 1.0; // Approximate camera width
        const cameraHeight = 600 / 1.0; // Approximate camera height
        const visibleChunks = World.getVisibleChunks(Player.x, Player.y, cameraWidth, cameraHeight);
        console.log(`  Visible Chunks: ${visibleChunks.length}`);
        visibleChunks.forEach((chunk, index) => {
          console.log(`    ${index + 1}. Chunk (${chunk.x}, ${chunk.y})`);
        });
      } else {
        console.error('[Console] World system not available');
      }
    });

    this.register('worldobjects', 'Show information about world objects and generation', (args) => {
      if (typeof World !== 'undefined') {
        const info = World.getInfo();
        const playerTile = World.pixelToTile(Player.x, Player.y);
        
        console.log('[Console] World Objects Information:');
        console.log(`  World Seed: ${info.seed}`);
        console.log(`  Player Tile: (${playerTile.x}, ${playerTile.y})`);
        
        // Show generation probabilities
        console.log('  Generation Probabilities:');
        console.log('    Grass: 15% of tiles');
        console.log('    Trees: 5% of tiles');
        console.log('    Rocks: 3% of tiles');
        
        // Show sample generation for current tile
        const grassHere = World.shouldPlaceGrass(playerTile.x, playerTile.y);
        const treeHere = World.shouldPlaceTree(playerTile.x, playerTile.y);
        const rockHere = World.shouldPlaceRock(playerTile.x, playerTile.y);
        
        console.log('  Current Tile Objects:');
        console.log(`    Grass: ${grassHere ? 'Yes' : 'No'}`);
        console.log(`    Tree: ${treeHere ? 'Yes' : 'No'}`);
        console.log(`    Rock: ${rockHere ? 'Yes' : 'No'}`);
        
        // Show sample generation for nearby tiles
        console.log('  Nearby Tiles (sample):');
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const checkTileX = playerTile.x + dx;
            const checkTileY = playerTile.y + dy;
            const grass = World.shouldPlaceGrass(checkTileX, checkTileY);
            const tree = World.shouldPlaceTree(checkTileX, checkTileY);
            const rock = World.shouldPlaceRock(checkTileX, checkTileY);
            
            if (grass || tree || rock) {
              const objects = [];
              if (grass) objects.push('G');
              if (tree) objects.push('T');
              if (rock) objects.push('R');
              console.log(`    (${checkTileX}, ${checkTileY}): ${objects.join('')}`);
            }
          }
        }
      } else {
        console.error('[Console] World system not available');
      }
    });

    // Persistence system commands
    this.register('save', 'Manually save game state', (args) => {
      if (typeof Persistence !== 'undefined') {
        const success = Persistence.saveGameState();
        if (success) {
          console.log('[Console] Game state saved successfully');
        } else {
          console.error('[Console] Failed to save game state');
        }
      } else {
        console.error('[Console] Persistence system not available');
      }
    });

    this.register('load', 'Manually load game state', (args) => {
      if (typeof Persistence !== 'undefined') {
        const success = Persistence.loadGameState();
        if (success) {
          console.log('[Console] Game state loaded successfully');
        } else {
          console.log('[Console] No saved game state found or load failed');
        }
      } else {
        console.error('[Console] Persistence system not available');
      }
    });

    this.register('saveinfo', 'Show information about saved game state', (args) => {
      if (typeof Persistence !== 'undefined') {
        const saveInfo = Persistence.getSaveInfo();
        if (saveInfo) {
          console.log('[Console] Save Information:');
          console.log(`  Version: ${saveInfo.version}`);
          console.log(`  Last Saved: ${new Date(saveInfo.timestamp).toLocaleString()}`);
          console.log(`  Player Position: (${saveInfo.playerPosition.x.toFixed(1)}, ${saveInfo.playerPosition.y.toFixed(1)})`);
          console.log(`  World Seed: ${saveInfo.worldSeed}`);
        } else {
          console.log('[Console] No saved game state found');
        }
      } else {
        console.error('[Console] Persistence system not available');
      }
    });

    this.register('clearsave', 'Clear saved game state', (args) => {
      if (typeof Persistence !== 'undefined') {
        const success = Persistence.clearSavedState();
        if (success) {
          console.log('[Console] Saved game state cleared');
        } else {
          console.error('[Console] Failed to clear saved game state');
        }
      } else {
        console.error('[Console] Persistence system not available');
      }
    });

    this.register('persistence', 'Show persistence system configuration', (args) => {
      if (typeof Persistence !== 'undefined') {
        const config = Persistence.getConfig();
        console.log('[Console] Persistence Configuration:');
        console.log(`  Auto Save: ${config.autoSave ? 'Enabled' : 'Disabled'}`);
        console.log(`  Save Interval: ${config.saveInterval}ms`);
        console.log(`  Storage Key: ${config.storageKey}`);
        console.log(`  Last Save: ${Persistence.lastSaveTime ? new Date(Persistence.lastSaveTime).toLocaleString() : 'Never'}`);
      } else {
        console.error('[Console] Persistence system not available');
      }
    });

    // Collision system commands
    this.register('collision', 'Show collision system information', (args) => {
      if (typeof Collision !== 'undefined') {
        const info = Collision.getInfo();
        console.log('[Console] Collision System Information:');
        console.log(`  Enabled: ${info.enabled}`);
        console.log(`  Debug Mode: ${info.debug}`);
        console.log(`  Player Radius: ${info.playerRadius}px`);
        console.log(`  Spatial Grid Size: ${info.spatialGridSize}px`);
        console.log(`  Grid Cells: ${info.gridCellCount}`);
        console.log(`  Tracked Entities: ${info.totalEntities}`);
      } else {
        console.error('[Console] Collision system not available');
      }
    });

    this.register('togglecollision', 'Toggle collision detection on/off', (args) => {
      if (typeof Collision !== 'undefined') {
        Collision.toggleCollision();
      } else {
        console.error('[Console] Collision system not available');
      }
    });

    this.register('collisiondebug', 'Toggle collision debug visualization', (args) => {
      if (typeof Collision !== 'undefined') {
        Collision.toggleDebug();
      } else {
        console.error('[Console] Collision system not available');
      }
    });

    this.register('setcollisionradius', 'Set player collision radius', (args) => {
      if (typeof Collision !== 'undefined') {
        const radius = parseFloat(args[0]);
        if (!isNaN(radius) && radius > 0) {
          Collision.setPlayerRadius(radius);
        } else {
          console.error('[Console] Invalid radius. Usage: setcollisionradius <radius>');
        }
      } else {
        console.error('[Console] Collision system not available');
      }
    });

    this.register('updatecollision', 'Force update collision spatial grid', (args) => {
      if (typeof Collision !== 'undefined') {
        Collision.updateSpatialGrid();
        const info = Collision.getInfo();
        console.log(`[Console] Spatial grid updated: ${info.gridCellCount} cells, ${info.totalEntities} entities`);
      } else {
        console.error('[Console] Collision system not available');
      }
    });

    // Responsive canvas commands
    this.register('canvasinfo', 'Show responsive canvas information', (args) => {
      if (typeof ResponsiveCanvas !== 'undefined') {
        const info = ResponsiveCanvas.getInfo();
        console.log('[Console] Responsive Canvas Information:');
        console.log(`  Canvas Size: ${info.width}x${info.height}`);
        console.log(`  Viewport Size: ${info.viewportWidth}x${info.viewportHeight}`);
        console.log(`  Aspect Ratio: ${info.aspectRatioName} (${info.aspectRatio.toFixed(3)})`);
        console.log(`  Target Ratio: ${info.targetAspectRatio.toFixed(3)}`);
        console.log(`  Min Size: ${info.config.minWidth}x${info.config.minHeight}`);
        console.log(`  Max Size: ${info.config.maxWidth}x${info.config.maxHeight}`);
      } else {
        console.error('[Console] Responsive canvas system not available');
      }
    });

    this.register('setaspectratio', 'Set canvas aspect ratio', (args) => {
      if (typeof ResponsiveCanvas !== 'undefined') {
        const ratio = parseFloat(args[0]);
        if (!isNaN(ratio) && ratio > 0) {
          ResponsiveCanvas.setAspectRatio(ratio);
        } else {
          console.error('[Console] Invalid ratio. Usage: setaspectratio <ratio>');
          console.log('[Console] Common ratios: 1.777 (16:9), 1.333 (4:3), 2.333 (21:9)');
        }
      } else {
        console.error('[Console] Responsive canvas system not available');
      }
    });

    this.register('toggleaspectratio', 'Toggle between common aspect ratios', (args) => {
      if (typeof ResponsiveCanvas !== 'undefined') {
        ResponsiveCanvas.toggleAspectRatio();
        const info = ResponsiveCanvas.getInfo();
        console.log(`[Console] Aspect ratio changed to ${info.aspectRatioName}`);
      } else {
        console.error('[Console] Responsive canvas system not available');
      }
    });

    this.register('resizecanvas', 'Force canvas resize', (args) => {
      if (typeof ResponsiveCanvas !== 'undefined') {
        ResponsiveCanvas.updateCanvasSize();
        const info = ResponsiveCanvas.getInfo();
        console.log(`[Console] Canvas resized to ${info.width}x${info.height}`);
      } else {
        console.error('[Console] Responsive canvas system not available');
      }
    });

    // UI system commands
    this.register('uihistory', 'Show command history information', (args) => {
      if (typeof UI !== 'undefined') {
        console.log('[Console] UI Command History:');
        console.log(`  Max History Size: ${UI.config.maxHistorySize}`);
        console.log(`  Current History: ${UI.commandHistory.length} commands`);
        if (UI.commandHistory.length > 0) {
          console.log('  Recent Commands:');
          UI.commandHistory.slice(-5).forEach((cmd, index) => {
            console.log(`    ${UI.commandHistory.length - 4 + index}: ${cmd}`);
          });
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('setuihistory', 'Set maximum command history size', (args) => {
      if (typeof UI !== 'undefined') {
        const size = parseInt(args[0]);
        if (!isNaN(size)) {
          UI.setMaxHistorySize(size);
        } else {
          console.error('[Console] Invalid size. Usage: setuihistory <size>');
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('clearuihistory', 'Clear command history', (args) => {
      if (typeof UI !== 'undefined') {
        UI.clearCommandHistory();
        console.log('[Console] Command history cleared');
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('inventory', 'Toggle inventory open/closed', (args) => {
      if (typeof UI !== 'undefined') {
        UI.toggleInventory();
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('setinventorysize', 'Set inventory grid size', (args) => {
      if (typeof UI !== 'undefined') {
        const size = parseInt(args[0]);
        if (!isNaN(size)) {
          UI.setInventoryGridSize(size);
        } else {
          console.error('[Console] Invalid size. Usage: setinventorysize <size>');
          console.log('[Console] Valid range: 3-10');
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('setinventoryopacity', 'Set inventory opacity', (args) => {
      if (typeof UI !== 'undefined') {
        const opacity = parseFloat(args[0]);
        if (!isNaN(opacity)) {
          UI.setInventoryOpacity(opacity);
        } else {
          console.error('[Console] Invalid opacity. Usage: setinventoryopacity <opacity>');
          console.log('[Console] Valid range: 0.1-1.0');
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('setitemopacity', 'Set item icon opacity', (args) => {
      if (typeof UI !== 'undefined') {
        const opacity = parseFloat(args[0]);
        if (!isNaN(opacity)) {
          UI.setItemIconOpacity(opacity);
        } else {
          console.error('[Console] Invalid opacity. Usage: setitemopacity <opacity>');
          console.log('[Console] Valid range: 0.1-1.0');
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('uiinfo', 'Show UI system information', (args) => {
      if (typeof UI !== 'undefined') {
        console.log('[Console] UI System Information:');
        console.log(`  Input Bar: ${UI.inputBarOpen ? 'Open' : 'Closed'}`);
        console.log(`  Inventory: ${UI.inventoryOpen ? 'Open' : 'Closed'}`);
        console.log(`  Inventory Grid: ${UI.config.inventoryGridSize}x${UI.config.inventoryGridSize}`);
        console.log(`  Inventory Opacity: ${UI.config.inventoryOpacity}`);
        console.log(`  Item Icon Opacity: ${UI.config.itemIconOpacity}`);
        console.log(`  Action Bar Slots: ${UI.config.actionBarSlots}`);
        console.log(`  Action Bar Opacity: ${UI.config.actionBarOpacity}`);
        console.log(`  Action Bar 2 Slots: ${UI.config.actionBarSlots}`);
        console.log(`  Command History: ${UI.commandHistory.length}/${UI.config.maxHistorySize}`);
        if (UI.selectedSlot) {
          console.log(`  Selected Slot: ${UI.selectedSlot.row * UI.config.inventoryGridSize + UI.selectedSlot.col + 1} (row ${UI.selectedSlot.row}, col ${UI.selectedSlot.col})`);
        }
        if (UI.activeActionSlot !== null) {
          const slotNumber = UI.activeActionSlot === 9 ? '0' : (UI.activeActionSlot + 1).toString();
          console.log(`  Active Action Slot: ${slotNumber} (index ${UI.activeActionSlot})`);
        }
        if (UI.activeActionSlot2 !== null) {
          const slotNumber = UI.activeActionSlot2 === 9 ? '0' : (UI.activeActionSlot2 + 1).toString();
          console.log(`  Active Action Bar 2 Slot: Shift+${slotNumber} (index ${UI.activeActionSlot2})`);
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    // Action bar commands
    this.register('setactionbarslots', 'Set action bar slot count', (args) => {
      if (typeof UI !== 'undefined') {
        const slots = parseInt(args[0]);
        if (!isNaN(slots)) {
          UI.setActionBarSlots(slots);
        } else {
          console.error('[Console] Invalid slot count. Usage: setactionbarslots <count>');
          console.log('[Console] Valid range: 5-20');
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    this.register('setactionbaropacity', 'Set action bar opacity', (args) => {
      if (typeof UI !== 'undefined') {
        const opacity = parseFloat(args[0]);
        if (!isNaN(opacity)) {
          UI.setActionBarOpacity(opacity);
        } else {
          console.error('[Console] Invalid opacity. Usage: setactionbaropacity <opacity>');
          console.log('[Console] Valid range: 0.1-1.0');
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    console.log('[Console] Console system initialized with', Object.keys(this.commands).length, 'commands');
  }
};

// Initialize console system
Console.init();

// Expose console to global scope for easy access
window.gameConsole = Console;

// Global function to execute commands from browser console
window.cmd = function(command) {
  Console.execute(command);
};

// Show welcome message and available commands
console.log('[Console] Welcome to Web Game Console!');
console.log('[Console] Use cmd("help") to see available commands');
console.log('[Console] Example: cmd("stats") to see player statistics'); 