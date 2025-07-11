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