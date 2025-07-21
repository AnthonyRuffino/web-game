// ui/console.js
// Console system for game commands and debugging

(() => {
  // Console system
  window.WebGame.UI.console = {
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
      console.log('[Console] Initializing console system...');
      
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
          console.log('[Console] Invalid seed value. Must be a number.');
          return;
        }
        console.log(`[Console] Setting world seed to ${seed} and restarting...`);
        // TODO: Implement world restart with new seed
        console.log('[Console] World restart not yet implemented');
      });

      // Menu system commands
      this.register('menu', 'Show available menu commands', (args) => {
        console.log('[Console] Menu Commands:');
        console.log('  menu test - Show test menu');
        console.log('  menu settings - Show settings menu');
        console.log('  menu skins - Show skin selector');
        console.log('  menu macros - Show macro grid');
      });

      this.register('menutest', 'Show test menu', (args) => {
        if (window.WebGame?.MenuConfigs) {
          const testMenu = window.WebGame.MenuConfigs.getMenu('test-menu');
          if (testMenu) {
            const menuId = window.UI.menuManager.createMenu(testMenu);
            window.UI.menuManager.showMenu(menuId);
            console.log('[Console] Test menu opened');
          } else {
            console.error('[Console] Test menu configuration not found');
          }
        } else {
          console.error('[Console] MenuConfigs system not available');
        }
      });

      this.register('menusettings', 'Show settings menu', (args) => {
        if (window.WebGame?.MenuConfigs) {
          const settingsMenu = window.WebGame.MenuConfigs.getMenu('settings-menu');
          if (settingsMenu) {
            const menuId = window.UI.menuManager.createMenu(settingsMenu);
            window.UI.menuManager.showMenu(menuId);
            console.log('[Console] Settings menu opened');
          } else {
            console.error('[Console] Settings menu configuration not found');
          }
        } else {
          console.error('[Console] MenuConfigs system not available');
        }
      });

      this.register('menuskins', 'Show skin selector', (args) => {
        if (window.WebGame?.MenuConfigs) {
          const skinMenu = window.WebGame.MenuConfigs.getMenu('simple-skin-selector');
          if (skinMenu) {
            const menuId = window.UI.menuManager.createMenu(skinMenu);
            window.UI.menuManager.showMenu(menuId);
            console.log('[Console] Skin selector opened');
          } else {
            console.error('[Console] Skin selector configuration not found');
          }
        } else {
          console.error('[Console] MenuConfigs system not available');
        }
      });

      this.register('menumacros', 'Show macro grid', (args) => {
        if (window.WebGame?.MenuConfigs) {
          const macroMenu = window.WebGame.MenuConfigs.getMenu('simple-macro-grid');
          if (macroMenu) {
            const menuId = window.UI.menuManager.createMenu(macroMenu);
            window.UI.menuManager.showMenu(menuId);
            console.log('[Console] Macro grid opened');
          } else {
            console.error('[Console] Macro grid configuration not found');
          }
        } else {
          console.error('[Console] MenuConfigs system not available');
        }
      });

      // System commands
      this.register('system', 'Show system information', (args) => {
        console.log('[Console] System Information:');
        console.log(`  User Agent: ${navigator.userAgent}`);
        console.log(`  Screen: ${screen.width}x${screen.height}`);
        console.log(`  Viewport: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`  Canvas: ${window.UI?.responsiveCanvas?.canvas?.width || 'N/A'}x${window.UI?.responsiveCanvas?.canvas?.height || 'N/A'}`);
        console.log(`  FPS: ${window.GameLoop?.fps || 'N/A'}`);
      });

      // Debug commands
      this.register('debug', 'Toggle debug mode', (args) => {
        if (typeof window.toggleDebugMode === 'function') {
          window.toggleDebugMode();
        } else {
          console.error('[Console] Debug system not available');
        }
      });

      // Performance commands
      this.register('perf', 'Show performance information', (args) => {
        if (window.performance && window.performance.memory) {
          const mem = window.performance.memory;
          console.log('[Console] Performance Information:');
          console.log(`  Used JS Heap: ${(mem.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  Total JS Heap: ${(mem.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  JS Heap Limit: ${(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
        } else {
          console.log('[Console] Performance memory information not available');
        }
      });

      console.log('[Console] Console system initialized with', Object.keys(this.commands).length, 'commands');
    }
  };

  // Also register with old system for backward compatibility during migration
  if (!window.UI) window.UI = {};
  window.UI.console = window.WebGame.UI.console;
  
})();

// Expose console to global scope for easy access
window.gameConsole = window.WebGame.UI.console;

// Global function to execute commands from browser console
window.cmd = function(command) {
  window.WebGame.UI.console.execute(command);
};

// Show welcome message and available commands
console.log('[Console] Welcome to Web Game Console!');
console.log('[Console] Use cmd("help") to see available commands');
console.log('[Console] Example: cmd("stats") to see player statistics'); 