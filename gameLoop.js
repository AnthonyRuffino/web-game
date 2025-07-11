// gameLoop.js
// Main update/render loop management

const GameLoop = {
  lastTime: 0,

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  },

  loop(currentTime) {
    const delta = (currentTime - this.lastTime) / 1000; // seconds
    this.lastTime = currentTime;

    if (typeof GameEngine !== 'undefined') {
      GameEngine.update(delta);
      GameEngine.render(ctx);
    }

    requestAnimationFrame(this.loop.bind(this));
  }
};

// TODO: Export GameLoop if using modules 