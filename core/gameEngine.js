// gameEngine.js
// Core game logic and state management

// --- Game Engine Config ---
const GAME_ENGINE_CONFIG = {
  perspectiveModes: ['fixed-north', 'player-perspective'],
  defaultPerspective: 'fixed-north',
  zoom: {
    initial: 1.0,
    min: 0.5,
    max: 3.0,
    step: 1.1 // zoom in/out multiplier
  },
  player: {
    speed: 400, // pixels per second
    rotSpeed: Math.PI * 0.8, // radians per second
    size: 30, // triangle size
    renderType: 'shape', // 'shape' or 'sprite'
    color: '#ffeb3b',
    stroke: '#333',
    strokeWidth: 3
  },
  hoveredGridCellHighlight: {
    color: 'yellow',
    opacity: 0.35
  }
};
// --- End Game Engine Config ---

// Perspective mode: 'fixed-north' or 'player-perspective'
let PERSPECTIVE_MODE = GAME_ENGINE_CONFIG.defaultPerspective; // default

// Camera rotation angle for fixed-north mode (in radians)
let CAMERA_ROTATION = 0; // 0 = north, positive = clockwise

// Make camera rotation globally accessible for entity rendering
window.CAMERA_ROTATION = CAMERA_ROTATION;

// Update perspective mode functions to use console system
window.setPerspectiveMode = function(mode) {
  if (GAME_ENGINE_CONFIG.perspectiveModes.includes(mode)) {
    PERSPECTIVE_MODE = mode;
    console.log('[Game] Perspective mode set to', mode);
  } else {
    console.warn('[Game] Invalid perspective mode:', mode);
  }
};

window.togglePerspectiveMode = function() {
  PERSPECTIVE_MODE = (PERSPECTIVE_MODE === GAME_ENGINE_CONFIG.perspectiveModes[0]) ? GAME_ENGINE_CONFIG.perspectiveModes[1] : GAME_ENGINE_CONFIG.perspectiveModes[0];
  console.log('[Game] Perspective mode toggled to', PERSPECTIVE_MODE);
};

// --- Zoom support ---
window.ZOOM = GAME_ENGINE_CONFIG.zoom.initial;
window.ZOOM_MIN = GAME_ENGINE_CONFIG.zoom.min;
window.ZOOM_MAX = GAME_ENGINE_CONFIG.zoom.max;

window.setZoom = function(z) {
  window.ZOOM = Math.max(window.ZOOM_MIN, Math.min(window.ZOOM_MAX, z));
};

window.zoomIn = function() { 
  window.setZoom(window.ZOOM * GAME_ENGINE_CONFIG.zoom.step); 
};

window.zoomOut = function() { 
  window.setZoom(window.ZOOM / GAME_ENGINE_CONFIG.zoom.step); 
};

// Attach wheel event to canvas (after DOM loaded)
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        window.setZoom(window.ZOOM * GAME_ENGINE_CONFIG.zoom.step);
      } else if (e.deltaY > 0) {
        window.setZoom(window.ZOOM / GAME_ENGINE_CONFIG.zoom.step);
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
  speed: GAME_ENGINE_CONFIG.player.speed,
  rotSpeed: GAME_ENGINE_CONFIG.player.rotSpeed,
  size: GAME_ENGINE_CONFIG.player.size,
  renderType: GAME_ENGINE_CONFIG.player.renderType,
  sprite: null, // Image object for sprite rendering

  update(input, delta) {
    // Block movement if input bar is open
    if (typeof UI !== 'undefined' && UI.inputBar && UI.inputBar.inputBarOpen) {
      return;
    }
    
    // Movement vector
    let moveX = 0;
    let moveY = 0;
    // Rotation
    const rotationSpeed = (input.backward ? 0.5 : 1 ) * Player.rotSpeed;
    if (input.left) Player.angle -= rotationSpeed * delta;
    if (input.right) Player.angle += rotationSpeed * delta;
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
      const speed = Player.speed * (input.backward ? 0.5 : 1);
      const newX = Player.x + moveX * speed * delta;
      const newY = Player.y + moveY * speed * delta;
      
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
    
    if (Player.renderType === 'sprite' && Player.sprite) {
      // Draw sprite
      const spriteWidth = Player.sprite.width || Player.size * 2;
      const spriteHeight = Player.sprite.height || Player.size * 2;
      ctx.drawImage(
        Player.sprite,
        -spriteWidth / 2, // Center the sprite
        -spriteHeight / 2,
        spriteWidth,
        spriteHeight
      );
    } else {
      // Draw shape (triangle)
      ctx.beginPath();
      ctx.moveTo(0, -Player.size); // tip
      ctx.lineTo(Player.size * 0.6, Player.size * 0.8); // right base
      ctx.lineTo(-Player.size * 0.6, Player.size * 0.8); // left base
      ctx.closePath();
      ctx.fillStyle = GAME_ENGINE_CONFIG.player.color;
      ctx.strokeStyle = GAME_ENGINE_CONFIG.player.stroke;
      ctx.lineWidth = GAME_ENGINE_CONFIG.player.strokeWidth;
      ctx.fill();
      ctx.stroke();
    }
    
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
    
    // Update camera rotation in fixed-north mode
    if (PERSPECTIVE_MODE === 'fixed-north') {
      const rotationSpeed = Player.rotSpeed * 0.5; // Slower than player rotation
      if (inputState.cameraLeft) CAMERA_ROTATION -= rotationSpeed * delta;
      if (inputState.cameraRight) CAMERA_ROTATION += rotationSpeed * delta;
      // Update global reference for entity rendering
      window.CAMERA_ROTATION = CAMERA_ROTATION;
    }
    
    Player.update(inputState, delta);
  },
  render(ctx) {
    // Get canvas dimensions from responsive canvas system
    const canvasWidth = window.UI.responsiveCanvas ? window.UI.responsiveCanvas.currentWidth : ctx.canvas.width;
    const canvasHeight = window.UI.responsiveCanvas ? window.UI.responsiveCanvas.currentHeight : ctx.canvas.height;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Apply camera transforms
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(window.ZOOM, window.ZOOM); // Apply zoom before rotation/translation
    
    if (PERSPECTIVE_MODE === 'player-perspective') {
      // Rotate the entire world around the player
      ctx.rotate(-Player.angle);
      ctx.translate(-Player.x, -Player.y);
    } else {
      // Fixed north - apply camera rotation and translate to follow player
      ctx.rotate(-CAMERA_ROTATION);
      ctx.translate(-Player.x, -Player.y);
    }
    
    // Render background texture as part of the world
    if (typeof Background !== 'undefined') {
      const cameraWidth = canvasWidth / window.ZOOM;
      const cameraHeight = canvasHeight / window.ZOOM;
      Background.render(ctx, Player.x, Player.y, cameraWidth, cameraHeight, window.ZOOM);
    }
    
    // Render world using chunk system (includes player and trees in correct order)
    if (typeof World !== 'undefined') {
      const cameraWidth = canvasWidth / window.ZOOM;
      const cameraHeight = canvasHeight / window.ZOOM;
      World.render(ctx, Player.x, Player.y, cameraWidth, cameraHeight, Player.angle);
    }
    
    // Render collision debug information
    if (typeof Collision !== 'undefined') {
      Collision.renderDebug(ctx);
    }

    // --- Highlight hovered grid cell (always, even if grid is not rendered) ---
    if (window.UI && window.UI.hoveredGridCell && window.World) {
      const tileSize = window.World.config.tileSize;
      const { tileX, tileY } = window.UI.hoveredGridCell;
      const cellX = tileX * tileSize;
      const cellY = tileY * tileSize;
      ctx.save();
      ctx.globalAlpha = GAME_ENGINE_CONFIG.hoveredGridCellHighlight.opacity;
      ctx.fillStyle = GAME_ENGINE_CONFIG.hoveredGridCellHighlight.color;
      ctx.fillRect(cellX, cellY, tileSize, tileSize);
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
    // --- END grid cell highlight ---

    ctx.restore();
  },
  setInputState(newState) {
    inputState = newState;
  }
};

// Export GameEngine for global access
window.GameEngine = GameEngine;

// TODO: Export GameEngine if using modules