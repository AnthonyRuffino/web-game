// gameEngine.js
// Core game logic and state management

// Config: shape or sprite rendering
const RENDER_MODE = 'shape'; // 'shape' or 'sprite'

// Player object
const Player = {
  x: 400, // center of canvas
  y: 300,
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
    if (RENDER_MODE === 'shape') {
      // Draw triangle pointing in facing direction
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
    } else if (RENDER_MODE === 'sprite') {
      // TODO: Draw player sprite (future)
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
    Player.render(ctx);
  },
  // For input.js to update input state
  setInputState(newState) {
    inputState = newState;
  }
};

// TODO: Export GameEngine if using modules 