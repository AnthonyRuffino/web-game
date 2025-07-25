// main.js
// Single entry point for the entire game (UI and core)

// Utility to dynamically load a JS file
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function startGame() {
  window.WebGame = window.WebGame || {};
  window.WebGame.UI = window.WebGame.UI || {};
  window.WebGame.MenuConfigs = {};
  window.WebGame.Entities = {};
  window.UI = window.WebGame.UI;

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // NEW SYSTEM: Load all UI modules with new dependency injection system
  console.log('[Main] Loading all UI modules with new system...');
  
  const newSystemModules = {
    'input': {file: 'ui/input.js', dependencies: [], self: () => window.WebGame?.UI?.input },
    'responsiveCanvas': {file: 'ui/responsiveCanvas.js', dependencies: [], self: () => window.WebGame?.UI?.responsiveCanvas },
    'jsonPopup': {file: 'ui/jsonPopup.js', dependencies: [], self: () => window.WebGame?.UI?.jsonPopup },
    'actionBars': {file: 'ui/actionBars.js', dependencies: ['jsonPopup'], self: () => window.WebGame?.UI?.actionBarManager },
    'macros': {file: 'ui/macros.js', dependencies: ['actionBars'], self: () => window.WebGame?.UI?.macroManager },
    'inventory': {file: 'ui/inventory.js', dependencies: [], self: () => window.WebGame?.UI?.inventory },
    'inputBar': {file: 'ui/inputBar.js', dependencies: [], self: () => window.WebGame?.UI?.inputBar },
    'skins': {file: 'ui/skins.js', dependencies: [], self: () => window.WebGame?.UI?.skinsManager },
    'menuBar': {file: 'ui/menuBar.js', dependencies: ['actionBars'], self: () => window.WebGame?.UI?.menuBar },
    'minimap': {file: 'ui/minimap.js', dependencies: ['jsonPopup'], self: () => window.WebGame?.UI?.minimapManager },
    'menuManager': {file: 'ui/menuManager.js', dependencies: [], self: () => window.WebGame?.UI?.menuManager },
    'background': {file: 'core/background.js', dependencies: [], self: () => window.WebGame?.Background },
    'rock': {file: 'core/entities/rock.js', dependencies: [], self: () => window.WebGame?.Entities?.Rock },
    'tree': {file: 'core/entities/tree.js', dependencies: [], self: () => window.WebGame?.Entities?.Tree },
    'grass': {file: 'core/entities/grass.js', dependencies: [], self: () => window.WebGame?.Entities?.Grass },
    'entityRenderer': {file: 'core/entityRenderer.js', dependencies: ['rock', 'tree', 'grass'], self: () => window.WebGame?.EntityRenderer },
    'world': {file: 'core/world.js', dependencies: [], self: () => window.WebGame?.World },
    'console': {file: 'ui/console.js', dependencies: [], self: () => window.WebGame?.UI?.console },
  };

  for (const key of Object.keys(newSystemModules)) {
    const { file, dependencies, self } = newSystemModules[key];
    await loadScript(file);
    
    const module = self();
    if (module?.init) {
      const resolvedDeps = dependencies.map(dep => newSystemModules[dep].self());
      await module.init(...resolvedDeps);
    }
  }

  // Dynamically load all core game modules in order
  const coreModules = [
    'core/persistence.js',
    'core/collision.js',
    'core/gameEngine.js',
    'core/gameLoop.js'
  ];
  for (const src of coreModules) {
    await loadScript(src);
  }

  // Now all UI and core modules are loaded and can reference each other safely!

  // Get canvas and context from responsive canvas system (check both systems)
  const canvas = window.WebGame?.UI?.responsiveCanvas?.canvas || 
                 window.UI.responsiveCanvas?.canvas || 
                 document.getElementById('gameCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  // Initialize background system
  if (window.WebGame?.Background && window.WebGame.Background.init) {
    console.log('[Main] Initializing background system (new system)');
    window.WebGame.Background.init();
  } else if (typeof Background !== 'undefined' && Background.init) {
    console.log('[Main] Initializing background system (old system)');
    Background.init();
  }

  // Initialize collision system
  if (typeof Collision !== 'undefined' && Collision.init) {
    Collision.init();
  }

  // Initialize persistence system (loads saved state if available)
  if (typeof Persistence !== 'undefined' && Persistence.init) {
    Persistence.init();
    // It will load saved state and override the default starting position if needed
    console.log('[Main] Persistence system will initialize automatically');
  }

  // Start the game loop using the new GameLoop class
  if (window.GameLoop && window.GameEngine && ctx) {
    const gameLoop = new window.GameLoop(window.GameEngine, ctx);
    gameLoop.start();
  } else {
    console.error('[Main] GameLoop, GameEngine, or ctx not available');
  }
}

startGame(); 