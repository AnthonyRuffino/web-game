// gameEngine.js
// Core game logic and state management

// Config: shape or sprite rendering
const RENDER_MODE = 'shape'; // 'shape' or 'sprite'

// Perspective mode: 'fixed-north' or 'player-perspective'
let PERSPECTIVE_MODE = 'fixed-north'; // default
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
  render(ctx, camera) {
    // camera: {x, y, angle} in world coordinates
    ctx.save();
    if (PERSPECTIVE_MODE === 'player-perspective') {
      // Center camera on player, rotate world
      ctx.translate(camera.cx, camera.cy);
      ctx.rotate(-camera.angle);
      ctx.translate(-camera.x, -camera.y);
    }
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
    ctx.restore();
    // Draw red 'X' at player start
    const start = this.getStart();
    const cx = start.x * this.tileSize + this.tileSize / 2;
    const cy = start.y * this.tileSize + this.tileSize / 2;
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', cx, cy);
    ctx.restore();
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

  render(ctx, camera) {
    if (PERSPECTIVE_MODE === 'player-perspective') {
      // Always draw player at center of canvas, facing up
      ctx.save();
      ctx.translate(camera.cx, camera.cy);
      ctx.rotate(0); // always up
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
    } else {
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
    // Camera object for world and player rendering
    const camera = {
      x: Player.x,
      y: Player.y,
      angle: Player.angle,
      cx: ctx.canvas.width / 2,
      cy: ctx.canvas.height / 2
    };
    World.render(ctx, camera);
    Player.render(ctx, camera);
  },
  // For input.js to update input state
  setInputState(newState) {
    inputState = newState;
  }
};

// TODO: Export GameEngine if using modules 