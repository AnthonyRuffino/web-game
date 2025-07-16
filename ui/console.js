// ui/console.js
// Console system for game commands and debugging

// Console system
window.UI.console = {
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

    // Reset camera rotation command
    this.register('resetcamera', 'Reset camera rotation to north (0 degrees)', (args) => {
      if (typeof CAMERA_ROTATION !== 'undefined') {
        CAMERA_ROTATION = 0;
        window.CAMERA_ROTATION = CAMERA_ROTATION;
        console.log('[Console] Camera rotation reset to north (0 degrees)');
      } else {
        console.error('[Console] Camera rotation system not found');
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
        const info = window.UI.responsiveCanvas.getInfo();
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
        if (UI.macroManager) {
          console.log(`  Macros: ${Object.keys(UI.macroManager.macros).length} created`);
          if (Object.keys(UI.macroManager.macros).length > 0) {
            console.log('  Macro Bindings:');
            const bars = UI.actionBarManager.listActionBars();
            bars.forEach(barName => {
              const bar = UI.actionBarManager.getActionBar(barName);
              if (bar) {
                Object.keys(bar.macroBindings).forEach(slot => {
                  console.log(`    ${barName} Slot ${slot}: ${bar.macroBindings[slot]}`);
                });
              }
            });
          }
        }
      } else {
        console.error('[Console] UI system not available');
      }
    });

    // Action bar commands
    this.register('actionbar', 'Action bar management commands', (args) => {
      if (args.length === 0) {
        console.log('[Console] Action bar commands:');
        console.log('  actionbar list - List all action bars');
        console.log('  actionbar create <name> <config> - Create new action bar');
        console.log('  actionbar remove <name> - Remove action bar');
        console.log('  actionbar config <name> <property> <value> - Configure action bar');
        return;
      }

      const subCommand = args[0].toLowerCase();
      
      switch (subCommand) {
        case 'list':
          if (UI.actionBarManager) {
            const bars = UI.actionBarManager.listActionBars();
            if (bars.length === 0) {
              console.log('[Console] No action bars found');
            } else {
              console.log('[Console] Action bars:');
              bars.forEach(name => {
                const bar = UI.actionBarManager.getActionBar(name);
                console.log(`  ${name}: ${bar.slots} slots, ${bar.orientation} orientation`);
              });
            }
          } else {
            console.error('[Console] Action bar manager not available');
          }
          break;

        case 'create':
          if (args.length < 2) {
            console.error('[Console] Usage: actionbar create <name>');
            return;
          }
          if (UI.actionBarManager) {
            try {
              UI.actionBarManager.createActionBar({
                name: args[1],
                orientation: 'horizontal',
                position: { left: 20, bottom: 100 },
                slots: 10,
                slotSize: 60,
                spacing: 4,
                zIndex: 998,
                opacity: 0.95
              });
              console.log(`[Console] Created action bar '${args[1]}'`);
            } catch (error) {
              console.error(`[Console] Failed to create action bar: ${error.message}`);
            }
          } else {
            console.error('[Console] Action bar manager not available');
          }
          break;

        case 'remove':
          if (args.length < 2) {
            console.error('[Console] Usage: actionbar remove <name>');
            return;
          }
          if (UI.actionBarManager) {
            UI.actionBarManager.removeActionBar(args[1]);
            console.log(`[Console] Removed action bar '${args[1]}'`);
          } else {
            console.error('[Console] Action bar manager not available');
          }
          break;

        default:
          console.error(`[Console] Unknown action bar command: ${subCommand}`);
          console.log('[Console] Use "actionbar" for help');
          break;
      }
    });

    // Macro system commands
    this.register('macro', 'Macro system commands', (args) => {
      if (args.length === 0) {
        console.log('[Console] Macro system commands:');
        console.log('  macro create <name>=<command> - Create a new macro');
        console.log('  macro assign <barName-slotIndex> <name> - Assign macro to action bar slot');
        console.log('  macro remove <barName-slotIndex> - Remove macro from action bar slot');
        console.log('  macro list - List all macros');
        console.log('  macro info <name> - Show macro information');
        console.log('  macro delete <name> - Delete a macro');
        console.log('  macro clear - Clear all macros');
        console.log('  Examples:');
        console.log('    macro assign mainBar-0 persistence');
        console.log('    macro assign secondaryBar-3 teleport');
        return;
      }

      const subCommand = args[0].toLowerCase();
      
      switch (subCommand) {
        case 'create':
          if (args.length < 2) {
            console.error('[Console] Usage: macro create <name>=<command>');
            return;
          }
          const createParts = args[1].split('=');
          if (createParts.length !== 2) {
            console.error('[Console] Usage: macro create <name>=<command>');
            return;
          }
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            UI.macroManager.createMacro(createParts[0], createParts[1]);
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        case 'assign':
          if (args.length < 3) {
            console.error('[Console] Usage: macro assign <barName-slotIndex> <name>');
            console.log('[Console] Example: macro assign mainBar-0 persistence');
            return;
          }
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            UI.macroManager.assignMacro(args[1], args[2]);
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        case 'remove':
          if (args.length < 2) {
            console.error('[Console] Usage: macro remove <barName-slotIndex>');
            console.log('[Console] Example: macro remove mainBar-0');
            return;
          }
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            UI.macroManager.removeMacro(args[1]);
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        case 'list':
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            const macroNames = UI.macroManager.listMacros();
            if (macroNames.length === 0) {
              console.log('[Console] No macros found');
            } else {
              console.log('[Console] Available macros:');
              macroNames.forEach(name => {
                const macro = UI.macroManager.getMacro(name);
                console.log(`  ${name}: ${macro.command}`);
              });
            }
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        case 'info':
          if (args.length < 2) {
            console.error('[Console] Usage: macro info <name>');
            return;
          }
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            const macro = UI.macroManager.getMacro(args[1]);
            if (macro) {
              console.log(`[Console] Macro: ${macro.name}`);
              console.log(`  Command: ${macro.command}`);
              console.log(`  Created: ${new Date(macro.created).toLocaleString()}`);
            } else {
              console.error(`[Console] Macro '${args[1]}' not found`);
            }
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        case 'delete':
          if (args.length < 2) {
            console.error('[Console] Usage: macro delete <name>');
            return;
          }
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            UI.macroManager.deleteMacro(args[1]);
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        case 'clear':
          if (UI.macroManager && UI.macroManager.ensureMacroManager()) {
            UI.macroManager.clearAllMacros();
          } else {
            console.error('[Console] Macro manager not available');
          }
          break;

        default:
          console.error(`[Console] Unknown macro command: ${subCommand}`);
          console.log('[Console] Use "macro" for help');
          break;
      }
    });

    // Macro management UI command
    this.register('macro', 'Open the macro management UI, or use subcommands: create, assign', (args) => {
      if (!args || args.length === 0) {
        if (window.UI.macroManager && typeof window.UI.macroManager.openMacroUI === 'function') {
          window.UI.macroManager.openMacroUI();
        } else {
          console.error('[Console] Macro manager UI not available');
        }
        return;
      }
      const sub = args[0].toLowerCase();
      if (sub === 'create') {
        // Parse args: name=... command=...
        let name = null, command = null;
        for (let i = 1; i < args.length; i++) {
          if (args[i].startsWith('name=')) name = args[i].slice(5);
          if (args[i].startsWith('command=')) command = args[i].slice(8);
        }
        if (!name || !command) {
          console.log("Usage: /macro create name=macroName command=yourCommand");
          return;
        }
        if (window.UI.macroManager.macros[name]) {
          console.log(`[Console] Macro '${name}' already exists.`);
          return;
        }
        // Create macro with random icon
        window.UI.macroManager.macros[name] = {
          name: name,
          command: command,
          created: Date.now()
        };
        window.UI.macroManager.generateMacroIcon(name);
        window.UI.macroManager.saveMacros();
        console.log(`[Console] Macro '${name}' created with random icon.`);
        return;
      }
      if (sub === 'assign') {
        // Usage: /macro assign bar-slot macroName
        if (args.length !== 3) {
          console.log("Usage: /macro assign bar-slot macroName");
          return;
        }
        const barSlot = args[1];
        const macroName = args[2];
        if (!window.UI.macroManager.macros[macroName]) {
          console.log(`[Console] Macro '${macroName}' does not exist.`);
          return;
        }
        const ok = window.UI.macroManager.assignMacro(barSlot, macroName);
        if (ok) {
          window.UI.macroManager.saveMacros();
          console.log(`[Console] Macro '${macroName}' assigned to ${barSlot}.`);
        }
        return;
      }
      // Fallback: open UI
      if (window.UI.macroManager && typeof window.UI.macroManager.openMacroUI === 'function') {
        window.UI.macroManager.openMacroUI();
      } else {
        console.error('[Console] Macro manager UI not available');
      }
    });

    // Skins management command
    this.register('skins', 'Open the skins management UI to manage entity images and preferences', (args) => {
      if (window.UI.skinsManager && typeof window.UI.skinsManager.openSkinsUI === 'function') {
        window.UI.skinsManager.openSkinsUI();
      } else {
        console.error('[Console] Skins manager not available');
      }
    });

    // Test entity creation command
    this.register('testtree', 'Create a test tree entity to verify caching', (args) => {
      if (typeof EntityRenderer !== 'undefined' && EntityRenderer.createTree) {
        const tree = EntityRenderer.createTree({
          isSprite: false,
          size: 24,
          trunkColor: '#5C4033',
          foliageColor: '#1B5E20',
          trunkWidth: 12,
          foliageRadius: 12,
          opacity: 1.0
        });
        console.log('[Console] Test tree created:', tree);
        console.log('[Console] Tree cache key:', tree.cacheKey);
        console.log('[Console] Tree render type:', tree.renderType);
      } else {
        console.error('[Console] EntityRenderer or createTree not available');
      }
    });

    // Test grass entity creation command
    this.register('testgrass', 'Create a test grass entity to verify caching', (args) => {
      if (typeof EntityRenderer !== 'undefined' && EntityRenderer.createGrass) {
        const grass = EntityRenderer.createGrass({
          isSprite: false,
          size: 32,
          bladeColor: '#81C784',
          bladeWidth: 1.5,
          clusterCount: 3,
          bladeCount: 5,
          bladeLength: 10,
          bladeAngleVariation: 30,
          opacity: 1.0
        });
        console.log('[Console] Test grass created:', grass);
        console.log('[Console] Grass cache key:', grass.cacheKey);
        console.log('[Console] Grass render type:', grass.renderType);
      } else {
        console.error('[Console] EntityRenderer or createGrass not available');
      }
    });

    // Toggle grid overlay command
    this.register('grid', 'Toggle world grid overlay on/off', (args) => {
      window.RENDER_GRID = !window.RENDER_GRID;
      console.log(`[Console] World grid overlay is now ${window.RENDER_GRID ? 'ON' : 'OFF'}`);
      if (window.GameEngine && window.GameEngine.render && window.UI && window.UI.responsiveCanvas && window.UI.responsiveCanvas.ctx) {
        window.GameEngine.render(window.UI.responsiveCanvas.ctx);
      }
    });
    this.register('togglegrid', 'Alias for grid command', (args) => {
      window.cmd('grid');
    });

    // Minimap commands
    this.register('minimap', 'Minimap management commands', (args) => {
      if (args.length === 0) {
        console.log('[Console] Minimap commands:');
        console.log('  minimap list - List all minimaps');
        console.log('  minimap create <name> - Create new minimap');
        console.log('  minimap remove <name> - Remove minimap');
        console.log('  minimap config <name> - Show minimap configuration');
        return;
      }

      const subCommand = args[0].toLowerCase();
      
      switch (subCommand) {
        case 'list':
          if (UI.minimapManager) {
            const minimaps = UI.minimapManager.listMinimaps();
            if (minimaps.length === 0) {
              console.log('[Console] No minimaps found');
            } else {
              console.log('[Console] Minimaps:');
              minimaps.forEach(name => {
                const minimap = UI.minimapManager.getMinimap(name);
                console.log(`  ${name}: ${minimap.width}x${minimap.height}, position: ${JSON.stringify(minimap.position)}`);
              });
            }
          } else {
            console.error('[Console] Minimap manager not available');
          }
          break;

        case 'create':
          if (args.length < 2) {
            console.error('[Console] Usage: minimap create <name> [corner]');
            console.log('[Console] Corners: bottomLeft (default), topRight');
            return;
          }
          if (UI.minimapManager) {
            try {
              const corner = args[2] || 'bottomLeft';
              const config = {
                name: args[1],
                width: 200,
                height: 150,
                position: { right: 20, top: 20 },
                zIndex: 997,
                opacity: 0.9
              };
              
              // Add corner-specific configuration
              if (corner === 'topRight') {
                config.handleCorner = 'topRight';
                config.handlePosition = { dx: 4, dy: 4 }; // top right corner
              }
              
              UI.minimapManager.createMinimap(config);
              console.log(`[Console] Created minimap '${args[1]}' with handle in ${corner} corner`);
            } catch (error) {
              console.error(`[Console] Failed to create minimap: ${error.message}`);
            }
          } else {
            console.error('[Console] Minimap manager not available');
          }
          break;

        case 'remove':
          if (args.length < 2) {
            console.error('[Console] Usage: minimap remove <name>');
            return;
          }
          if (UI.minimapManager) {
            UI.minimapManager.removeMinimap(args[1]);
            console.log(`[Console] Removed minimap '${args[1]}'`);
          } else {
            console.error('[Console] Minimap manager not available');
          }
          break;

        case 'config':
          if (args.length < 2) {
            console.error('[Console] Usage: minimap config <name>');
            return;
          }
          if (UI.minimapManager) {
            const minimap = UI.minimapManager.getMinimap(args[1]);
            if (minimap) {
              console.log(`[Console] Minimap '${args[1]}' configuration:`, minimap._getSerializableConfig());
            } else {
              console.error(`[Console] Minimap '${args[1]}' not found`);
            }
          } else {
            console.error('[Console] Minimap manager not available');
          }
          break;

        default:
          console.error(`[Console] Unknown minimap command: ${subCommand}`);
          console.log('[Console] Use "minimap" for help');
          break;
      }
    });

    console.log('[Console] Console system initialized with', Object.keys(this.commands).length, 'commands');
  }
};

// Initialize console system
window.UI.console.init();

// Expose console to global scope for easy access
window.gameConsole = window.UI.console;

// Global function to execute commands from browser console
window.cmd = function(command) {
  window.UI.console.execute(command);
};

// Show welcome message and available commands
console.log('[Console] Welcome to Web Game Console!');
console.log('[Console] Use cmd("help") to see available commands');
console.log('[Console] Example: cmd("stats") to see player statistics'); 