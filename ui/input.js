// ui/input.js
// Input handling system

(() => {
  // Input system
  window.WebGame.UI.input = {
    state: {
      left: false,
      right: false,
      forward: false,
      backward: false,
      strafeLeft: false,
      strafeRight: false,
      rightClick: false,
      cameraLeft: false,
      cameraRight: false
    },

    keyMap: {
      'KeyA': 'left',
      'KeyD': 'right',
      'KeyW': 'forward',
      'KeyS': 'backward',
      'KeyQ': 'strafeLeft',
      'KeyE': 'strafeRight'
    },

    // Track which keys are physically held down
    heldKeys: new Set(),

    // Check if input should be blocked
    isInputBlocked() {
      return window.UI && typeof window.UI.isInputBlocked === 'function' && window.UI.isInputBlocked();
    },

    handleKey(e, isDown) {
      // Explicitly block all movement input if the input bar is open
      if (this.isInputBlocked()) {
        return;
      }
      
      let handled = false;
      
      // Track physically held keys
      if (isDown) {
        window.WebGame.UI.input.heldKeys.add(e.code);
      } else {
        window.WebGame.UI.input.heldKeys.delete(e.code);
      }
      
      // Handle key releases first - always process them regardless of modifiers
      if (!isDown) {
        if (e.code === 'KeyA') {
          window.WebGame.UI.input.state.left = false;
          window.WebGame.UI.input.state.strafeLeft = false;
          handled = true;
        }
        if (e.code === 'KeyD') {
          window.WebGame.UI.input.state.right = false;
          window.WebGame.UI.input.state.strafeRight = false;
          handled = true;
        }
        if (e.code === 'KeyW') {
          window.WebGame.UI.input.state.forward = false;
          handled = true;
        }
        if (e.code === 'KeyS') {
          window.WebGame.UI.input.state.backward = false;
          handled = true;
        }
        if (e.code === 'KeyQ') {
          window.WebGame.UI.input.state.strafeLeft = false;
          handled = true;
        }
        if (e.code === 'KeyE') {
          window.WebGame.UI.input.state.strafeRight = false;
          handled = true;
        }
        if (e.code === 'ArrowLeft') {
          window.WebGame.UI.input.state.cameraLeft = false;
          handled = true;
        }
        if (e.code === 'ArrowRight') {
          window.WebGame.UI.input.state.cameraRight = false;
          handled = true;
        }
      } else {
        // Handle key presses with modifiers
        if (window.WebGame.UI.input.state.rightClick && (e.code === 'KeyA' || e.code === 'KeyD')) {
          // Right-click + A/D = strafe
          if (e.code === 'KeyA') {
            window.WebGame.UI.input.state.strafeLeft = true;
            handled = true;
          }
          if (e.code === 'KeyD') {
            window.WebGame.UI.input.state.strafeRight = true;
            handled = true;
          }
        } else if (e.shiftKey && (e.code === 'KeyA' || e.code === 'KeyD')) {
          // Shift+A/D = strafe
          if (e.code === 'KeyA') {
            window.WebGame.UI.input.state.strafeLeft = true;
            handled = true;
          }
          if (e.code === 'KeyD') {
            window.WebGame.UI.input.state.strafeRight = true;
            handled = true;
          }
        } else if (e.code === 'ArrowLeft') {
          window.WebGame.UI.input.state.cameraLeft = true;
          handled = true;
        } else if (e.code === 'ArrowRight') {
          window.WebGame.UI.input.state.cameraRight = true;
          handled = true;
        } else if (window.WebGame.UI.input.keyMap[e.code]) {
          window.WebGame.UI.input.state[window.WebGame.UI.input.keyMap[e.code]] = true;
          handled = true;
        }
      }
      
      if (handled) {
        e.preventDefault();
        if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
          GameEngine.setInputState({ ...window.WebGame.UI.input.state });
        }
      }
    },

    updateHeldKeysForModifier() {
      // Update A/D keys based on current modifier state
      if (window.WebGame.UI.input.heldKeys.has('KeyA')) {
        if (window.WebGame.UI.input.state.rightClick) {
          window.WebGame.UI.input.state.left = false;
          window.WebGame.UI.input.state.strafeLeft = true;
        } else {
          window.WebGame.UI.input.state.left = true;
          window.WebGame.UI.input.state.strafeLeft = false;
        }
      }
      if (window.WebGame.UI.input.heldKeys.has('KeyD')) {
        if (window.WebGame.UI.input.state.rightClick) {
          window.WebGame.UI.input.state.right = false;
          window.WebGame.UI.input.state.strafeRight = true;
        } else {
          window.WebGame.UI.input.state.right = true;
          window.WebGame.UI.input.state.strafeRight = false;
        }
      }
    },

    handleMouse(e, isDown) {
      if (e.button === 2) { // Right mouse button
        window.WebGame.UI.input.state.rightClick = isDown;
        // Update any currently held A/D keys when right-click state changes
        window.WebGame.UI.input.updateHeldKeysForModifier();
        if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
          GameEngine.setInputState({ ...window.WebGame.UI.input.state });
        }
      }
    },

    resetInputState() {
      // Reset all input state to false
      Object.keys(window.WebGame.UI.input.state).forEach(key => {
        window.WebGame.UI.input.state[key] = false;
      });
      window.WebGame.UI.input.heldKeys.clear();
      // Update game engine with reset state
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...window.WebGame.UI.input.state });
      }
    },

    init() {
      // Prevent double initialization
      if (window.WebGame.UI.input._initialized) return;
      window.WebGame.UI.input._initialized = true;
      window.addEventListener('keydown', (e) => window.WebGame.UI.input.handleKey(e, true));
      window.addEventListener('keyup', (e) => window.WebGame.UI.input.handleKey(e, false));
      
      // Handle mouse events on canvas
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        canvas.addEventListener('mousedown', (e) => window.WebGame.UI.input.handleMouse(e, true));
        canvas.addEventListener('mouseup', (e) => window.WebGame.UI.input.handleMouse(e, false));
        // Track mousemove for grid cell highlighting
        canvas.addEventListener('mousemove', (e) => {
          // Get canvas bounding rect and mouse position
          const rect = canvas.getBoundingClientRect();
          let x = (e.clientX - rect.left);
          let y = (e.clientY - rect.top);
          // Adjust for responsive canvas scaling
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          x *= scaleX;
          y *= scaleY;
          // Undo camera transforms (center, zoom, perspective)
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          // Centered
          x -= canvasWidth / 2;
          y -= canvasHeight / 2;
          // Undo zoom
          x /= window.ZOOM;
          y /= window.ZOOM;
          // Undo world rotation/translation
          let worldX, worldY;
          if (PERSPECTIVE_MODE === 'player-perspective') {
            // Rotate by +player angle to undo world rotation
            const angle = Player ? Player.angle : 0;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const rx = x * cos - y * sin;
            const ry = x * sin + y * cos;
            worldX = rx + (Player ? Player.x : 0);
            worldY = ry + (Player ? Player.y : 0);
          } else {
            // Fixed-north mode: undo camera rotation first, then translate
            const cameraRotation = typeof CAMERA_ROTATION !== 'undefined' ? CAMERA_ROTATION : 0;
            const cos = Math.cos(cameraRotation);
            const sin = Math.sin(cameraRotation);
            const rx = x * cos + y * sin;
            const ry = -x * sin + y * cos;
            worldX = rx + (Player ? Player.x : 0);
            worldY = ry + (Player ? Player.y : 0);
          }
          // Convert to grid cell
          const tileSize = window.World ? window.World.config.tileSize : 32;
          const tileX = Math.floor(worldX / tileSize);
          const tileY = Math.floor(worldY / tileSize);
          window.UI.hoveredGridCell = { tileX, tileY };

        });
        // Log world and cell coordinates on click
        canvas.addEventListener('click', (e) => {
          const rect = canvas.getBoundingClientRect();
          let x = (e.clientX - rect.left);
          let y = (e.clientY - rect.top);
          // Adjust for responsive canvas scaling
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          x *= scaleX;
          y *= scaleY;
          // Undo camera transforms (center, zoom, perspective)
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          // Centered
          x -= canvasWidth / 2;
          y -= canvasHeight / 2;
          // Undo zoom
          x /= window.ZOOM;
          y /= window.ZOOM;
          // Undo world rotation/translation
          let worldX, worldY;
          if (PERSPECTIVE_MODE === 'player-perspective') {
            const angle = Player ? Player.angle : 0;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const rx = x * cos - y * sin;
            const ry = x * sin + y * cos;
            worldX = rx + (Player ? Player.x : 0);
            worldY = ry + (Player ? Player.y : 0);
          } else {
            // Fixed-north mode: undo camera rotation first, then translate
            const cameraRotation = typeof CAMERA_ROTATION !== 'undefined' ? CAMERA_ROTATION : 0;
            const cos = Math.cos(cameraRotation);
            const sin = Math.sin(cameraRotation);
            const rx = x * cos + y * sin;
            const ry = -x * sin + y * cos;
            worldX = rx + (Player ? Player.x : 0);
            worldY = ry + (Player ? Player.y : 0);
          }
          // Convert to grid cell
          const tileSize = window.World ? window.World.config.tileSize : 32;
          const tileX = Math.floor(worldX / tileSize);
          const tileY = Math.floor(worldY / tileSize);
          console.log('[Canvas Click]', {
            canvas: { x: Math.round(x), y: Math.round(y) },
            world: { x: worldX, y: worldY },
            cell: { tileX, tileY }
          });
          // Entity lookup at clicked cell
          if (window.World && typeof window.World.loadChunk === 'function') {
            const chunkSize = window.World.config.chunkSize;
            const chunkX = Math.floor(tileX / chunkSize);
            const chunkY = Math.floor(tileY / chunkSize);
            const chunk = window.World.loadChunk(chunkX, chunkY);
            if (chunk && Array.isArray(chunk.entities)) {
              const entitiesAtCell = chunk.entities.filter(e => e.tileX === tileX && e.tileY === tileY);
              if (entitiesAtCell.length > 0) {
                console.log('[Entity Click]', entitiesAtCell);
              }
            }
          }
        });
      }
      
      // Handle browser focus changes to prevent stuck keys
      window.addEventListener('blur', () => {
        window.WebGame.UI.input.resetInputState();
      });
      window.addEventListener('focus', () => {
        window.WebGame.UI.input.resetInputState();
      });
      
      // Initialize input state in GameEngine
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...window.WebGame.UI.input.state });
      }
    }
  };

  // Also register with old system for backward compatibility during migration
  if (!window.UI) window.UI = {};
  window.UI.input = window.WebGame.UI.input;
  
})();

// --- Input blocking for text fields and number spinners ---
(function setupTextInputBlocker() {
  function blockInput() {
    window.UI._textInputBlocked = true;
  }
  function unblockInput() {
    window.UI._textInputBlocked = false;
  }
  function isBlockingInputElement(el) {
    return (
      (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) ||
      el.tagName === 'TEXTAREA'
    );
  }
  document.addEventListener('focusin', (e) => {
    if (isBlockingInputElement(e.target)) {
      blockInput();
    }
  });
  document.addEventListener('focusout', (e) => {
    if (isBlockingInputElement(e.target)) {
      // Delay to allow focus to move to another input
      setTimeout(() => {
        const el = document.activeElement;
        if (!isBlockingInputElement(el)) {
          unblockInput();
        }
      }, 0);
    }
  });
})();

// Patch isInputBlocked to check text input blocker
window.UI.isInputBlocked = function() {
  return !!window.UI._textInputBlocked;
};

// TODO: Export Input if using modules 