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

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // NEW SYSTEM: Load first 4 UI modules with new dependency injection system
  console.log('[Main] Loading first 4 UI modules with new system...');
  
  const newSystemModules = {
    'console': {file: 'ui/console.js', dependencies: [], self: () => window.WebGame?.UI?.console },
    'input': {file: 'ui/input.js', dependencies: [], self: () => window.WebGame?.UI?.input },
    'responsiveCanvas': {file: 'ui/responsiveCanvas.js', dependencies: [], self: () => window.WebGame?.UI?.responsiveCanvas },
    'jsonPopup': {file: 'ui/jsonPopup.js', dependencies: [], self: () => window.WebGame?.UI?.jsonPopup }
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

  // OLD SYSTEM: Load remaining UI modules via ui/init.js (to prevent breaking)
  console.log('[Main] Loading remaining UI modules via old system...');
  await loadScript('ui/init.js');

  // Wait for UI system to finish loading all UI modules
  if (window.UI && window.UI.init) {
    await window.UI.init();
  } else {
    throw new Error('UI system not available');
  }

  // Dynamically load all core game modules in order
  const coreModules = [
    'core/background.js',
    'core/entities/rock.js',
    'core/entities/tree.js',
    'core/entities/grass.js',
    'core/entityRenderer.js',
    'core/world.js',
    'core/persistence.js',
    'core/collision.js',
    'core/gameEngine.js',
    'core/gameLoop.js'
  ];
  for (const src of coreModules) {
    await loadScript(src);
  }

  // Now all UI and core modules are loaded and can reference each other safely!

  // Initialize responsive canvas system (check both old and new systems)
  if (window.WebGame?.UI?.responsiveCanvas && window.WebGame.UI.responsiveCanvas.init) {
    console.log('[Main] Initializing responsive canvas (new system)');
    window.WebGame.UI.responsiveCanvas.init();
  } else if (window.UI.responsiveCanvas && window.UI.responsiveCanvas.init) {
    console.log('[Main] Initializing responsive canvas (old system)');
    window.UI.responsiveCanvas.init();
  }

  if (typeof EntityRenderer !== 'undefined' && EntityRenderer.init) {
    await EntityRenderer.init();
  }

  // Get canvas and context from responsive canvas system (check both systems)
  const canvas = window.WebGame?.UI?.responsiveCanvas?.canvas || 
                 window.UI.responsiveCanvas?.canvas || 
                 document.getElementById('gameCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  // Initialize world system
  if (typeof World !== 'undefined' && World.init) {
    World.init();
    // Set player starting position based on world seed
    if (typeof Player !== 'undefined') {
      const startPos = World.getStartingPosition();
      Player.x = startPos.x;
      Player.y = startPos.y;
      console.log(`[Main] Player positioned at (${Player.x}, ${Player.y})`);
    }
  }

  // Initialize background system
  if (typeof Background !== 'undefined' && Background.init) {
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