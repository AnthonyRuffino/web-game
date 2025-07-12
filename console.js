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