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
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // Dynamically load the UI system (ui/init.js)
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

  // Initialize responsive canvas system
  if (window.UI.responsiveCanvas && window.UI.responsiveCanvas.init) {
    window.UI.responsiveCanvas.init();
  }

  // Get canvas and context from responsive canvas system
  const canvas = window.UI.responsiveCanvas ? window.UI.responsiveCanvas.canvas : document.getElementById('gameCanvas');
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
    // Persistence.init() is called automatically when DOM loads
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