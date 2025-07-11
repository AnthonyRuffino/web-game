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
  console.log('[Game] Zoom set to', ZOOM);
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

// World config
const WORLD_SEED = 42; // For now, static; later, make configurable
const TILE_SIZE = 40; // pixels
const WORLD_WIDTH = 20; // tiles
const WORLD_HEIGHT = 15; // tiles

// Simple deterministic function for player start (could be seeded hash later)
function getPlayerStart(seed) {
  // For now, always center
  return { x: Math.floor(WORLD_WIDTH / 2), y: Math.floor(WORLD_HEIGHT / 2) };
}

// World object
const World = {
  seed: WORLD_SEED,
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  tileSize: TILE_SIZE,
  getStart() {
    return getPlayerStart(this.seed);
  },
  render(ctx) {
    // Draw grid
    ctx.save();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.tileSize, 0);
      ctx.lineTo(x * this.tileSize, this.height * this.tileSize);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.tileSize);
      ctx.lineTo(this.width * this.tileSize, y * this.tileSize);
      ctx.stroke();
    }
    // Draw red 'X' at player start
    const start = this.getStart();
    const cx = start.x * this.tileSize + this.tileSize / 2;
    const cy = start.y * this.tileSize + this.tileSize / 2;
    ctx.fillStyle = 'red';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', cx, cy);
    ctx.restore();
  }
};

// Player object
const Player = {
  // Start at world start tile center
  x: World.getStart().x * TILE_SIZE + TILE_SIZE / 2,
  y: World.getStart().y * TILE_SIZE + TILE_SIZE / 2,
  angle: 0, // radians, 0 = up
  speed: 200, // pixels per second
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
      Player.x += moveX * Player.speed * delta;
      Player.y += moveY * Player.speed * delta;
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
    Player.update(inputState, delta);
  },
  render(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Apply camera transforms
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.scale(ZOOM, ZOOM); // Apply zoom before rotation/translation
    
    if (PERSPECTIVE_MODE === 'player-perspective') {
      // Rotate the entire world around the player
      ctx.rotate(-Player.angle);
      ctx.translate(-Player.x, -Player.y);
    } else {
      // Fixed north - just translate to follow player
      ctx.translate(-Player.x, -Player.y);
    }
    
    // Render world and player in world coordinates
    World.render(ctx);
    Player.render(ctx);
    
    ctx.restore();
  },
  setInputState(newState) {
    inputState = newState;
  }
};

// TODO: Export GameEngine if using modules