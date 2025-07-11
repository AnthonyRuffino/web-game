// gameEngine.js
// Core game logic and state management

// Config: shape or sprite rendering
const RENDER_MODE = 'shape'; // 'shape' or 'sprite'

// Perspective mode: 'fixed-north' or 'player-perspective'
let PERSPECTIVE_MODE = 'fixed-north'; // default

// Update perspective mode functions to use console system
window.setPerspectiveMode = function(mode) {
  if (mode === 'fixed-north' || mode === 'player-perspective') {
    PERSPECTIVE_MODE = mode;
    console.log('[Game] Perspective mode set to', mode);
  } else {
    console.warn('[Game] Invalid perspective mode:', mode);
  }
};

window.togglePerspectiveMode = function() {
  PERSPECTIVE_MODE = (PERSPECTIVE_MODE === 'fixed-north') ? 'player-perspective' : 'fixed-north';
  console.log('[Game] Perspective mode toggled to', PERSPECTIVE_MODE);
};

// --- Zoom support ---
let ZOOM = 1.0;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;

window.setZoom = function(z) {
  ZOOM = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
};

window.zoomIn = function() { 
  setZoom(ZOOM * 1.1); 
};

window.zoomOut = function() { 
  setZoom(ZOOM / 1.1); 
};

// Attach wheel event to canvas (after DOM loaded)
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom(ZOOM * 1.1);
      } else if (e.deltaY > 0) {
        setZoom(ZOOM / 1.1);
      }
    }, { passive: false });
  }
});

// Player object
const Player = {
  // Start at world starting position
  x: 0, // Will be set by world system
  y: 0, // Will be set by world system
  angle: 0, // radians, 0 = up
  speed: 700, // pixels per second
  rotSpeed: Math.PI, // radians per second
  size: 30, // triangle size

  update(input, delta) {
    // Movement vector
    let moveX = 0;
    let moveY = 0;
    // Rotation
    if (input.left) Player.angle -= Player.rotSpeed * delta;
    if (input.right) Player.angle += Player.rotSpeed * delta;
    // Forward/backward
    if (input.forward) {
      moveX += Math.sin(Player.angle);
      moveY -= Math.cos(Player.angle);
    }
    if (input.backward) {
      moveX -= Math.sin(Player.angle);
      moveY += Math.cos(Player.angle);
    }
    // Strafing
    if (input.strafeLeft) {
      moveX -= Math.cos(Player.angle);
      moveY -= Math.sin(Player.angle);
    }
    if (input.strafeRight) {
      moveX += Math.cos(Player.angle);
      moveY += Math.sin(Player.angle);
    }
    // Normalize vector to prevent faster diagonal movement
    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;
      
      // Calculate new position
      const newX = Player.x + moveX * Player.speed * delta;
      const newY = Player.y + moveY * Player.speed * delta;
      
      // Apply collision detection if available
      let finalX = newX;
      let finalY = newY;
      
      if (typeof Collision !== 'undefined') {
        const collisionResult = Collision.testMovement(Player.x, Player.y, newX, newY);
        finalX = collisionResult.x;
        finalY = collisionResult.y;
      }
      
      // Apply coordinate wrapping
      if (typeof World !== 'undefined') {
        const wrapped = World.wrapCoordinates(finalX, finalY);
        Player.x = wrapped.x;
        Player.y = wrapped.y;
      } else {
        Player.x = finalX;
        Player.y = finalY;
      }
    }
  },

  render(ctx) {
    // Draw player at world position, facing direction
    ctx.save();
    ctx.translate(Player.x, Player.y);
    ctx.rotate(Player.angle);
    ctx.beginPath();
    ctx.moveTo(0, -Player.size); // tip
    ctx.lineTo(Player.size * 0.6, Player.size * 0.8); // right base
    ctx.lineTo(-Player.size * 0.6, Player.size * 0.8); // left base
    ctx.closePath();
    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
};

// Input state (to be set by input.js)
let inputState = {
  left: false,
  right: false,
  forward: false,
  backward: false,
  strafeLeft: false,
  strafeRight: false
};

const GameEngine = {
  update(delta) {
    // Update collision spatial grid
    if (typeof Collision !== 'undefined') {
      Collision.updateSpatialGrid();
    }
    
    Player.update(inputState, delta);
  },
  render(ctx) {
    // Get canvas dimensions from responsive canvas system
    const canvasWidth = ResponsiveCanvas ? ResponsiveCanvas.currentWidth : ctx.canvas.width;
    const canvasHeight = ResponsiveCanvas ? ResponsiveCanvas.currentHeight : ctx.canvas.height;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Apply camera transforms
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(ZOOM, ZOOM); // Apply zoom before rotation/translation
    
    if (PERSPECTIVE_MODE === 'player-perspective') {
      // Rotate the entire world around the player
      ctx.rotate(-Player.angle);
      ctx.translate(-Player.x, -Player.y);
    } else {
      // Fixed north - just translate to follow player
      ctx.translate(-Player.x, -Player.y);
    }
    
    // Render background texture as part of the world
    if (typeof Background !== 'undefined') {
      const cameraWidth = canvasWidth / ZOOM;
      const cameraHeight = canvasHeight / ZOOM;
      Background.render(ctx, Player.x, Player.y, cameraWidth, cameraHeight, ZOOM);
    }
    
    // Render world using chunk system
    if (typeof World !== 'undefined') {
      const cameraWidth = canvasWidth / ZOOM;
      const cameraHeight = canvasHeight / ZOOM;
      World.render(ctx, Player.x, Player.y, cameraWidth, cameraHeight);
    }
    Player.render(ctx);
    
    // Render collision debug information
    if (typeof Collision !== 'undefined') {
      Collision.renderDebug(ctx);
    }
    
    ctx.restore();
  },
  setInputState(newState) {
    inputState = newState;
  }
};

// TODO: Export GameEngine if using modules