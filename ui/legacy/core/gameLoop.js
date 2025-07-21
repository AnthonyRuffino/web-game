// gameLoop.js
// Main update/render loop management

class GameLoop {
  constructor(gameEngine, ctx) {
    this.gameEngine = gameEngine;
    this.ctx = ctx;
    this.lastTime = 0;
    this.running = false;
  }

  start() {
    this.lastTime = performance.now();
    this.running = true;
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  loop(currentTime) {
    if (!this.running) return;
    const delta = (currentTime - this.lastTime) / 1000; // seconds
    this.lastTime = currentTime;

    if (this.gameEngine && this.ctx) {
      this.gameEngine.update(delta);
      this.gameEngine.render(this.ctx);
    }

    // Render minimaps
    if (window.UI && window.UI.minimapManager) {
      const minimaps = window.UI.minimapManager.minimaps;
      for (const minimapName in minimaps) {
        const minimap = minimaps[minimapName];
        if (minimap && minimap.visible) {
          minimap.render();
        }
      }
    }

    requestAnimationFrame(this.loop.bind(this));
  }
}

// Export for main.js
window.GameLoop = GameLoop; 