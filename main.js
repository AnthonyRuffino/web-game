// main.js
// Entry point for initializing the game

// Initialize responsive canvas system first
if (typeof ResponsiveCanvas !== 'undefined' && ResponsiveCanvas.init) {
  ResponsiveCanvas.init();
}

// Get canvas and context from responsive canvas system
const canvas = ResponsiveCanvas ? ResponsiveCanvas.canvas : document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Initialize world system first
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

// Initialize input handling
if (typeof Input !== 'undefined' && Input.init) {
  Input.init();
}

// Initialize UI system
if (typeof UI !== 'undefined' && UI.init) {
  UI.init();
}

// Initialize game engine (no explicit init needed yet)

// Start the game loop
if (typeof GameLoop !== 'undefined' && GameLoop.start) {
  GameLoop.start();
} 