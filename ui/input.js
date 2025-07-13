// ui/input.js
// Keyboard and mouse input handling

// Ensure UI object exists
if (!window.UI) window.UI = {};

// Input system
window.UI.input = {
  state: {
    left: false,
    right: false,
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false,
    rightClick: false
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
    return window.UI && window.UI.inputBar && window.UI.inputBar.inputBarOpen;
  },

  handleKey(e, isDown) {
    // Explicitly block all movement input if the input bar is open
    if (this.isInputBlocked()) {
      console.log('[Input] Movement blocked: input bar is open');
      return;
    }
    
    let handled = false;
    
    // Track physically held keys
    if (isDown) {
      window.UI.input.heldKeys.add(e.code);
    } else {
      window.UI.input.heldKeys.delete(e.code);
    }
    
    // Handle key releases first - always process them regardless of modifiers
    if (!isDown) {
      if (e.code === 'KeyA') {
        window.UI.input.state.left = false;
        window.UI.input.state.strafeLeft = false;
        handled = true;
      }
      if (e.code === 'KeyD') {
        window.UI.input.state.right = false;
        window.UI.input.state.strafeRight = false;
        handled = true;
      }
      if (e.code === 'KeyW') {
        window.UI.input.state.forward = false;
        handled = true;
      }
      if (e.code === 'KeyS') {
        window.UI.input.state.backward = false;
        handled = true;
      }
      if (e.code === 'KeyQ') {
        window.UI.input.state.strafeLeft = false;
        handled = true;
      }
      if (e.code === 'KeyE') {
        window.UI.input.state.strafeRight = false;
        handled = true;
      }
    } else {
      // Handle key presses with modifiers
      if (window.UI.input.state.rightClick && (e.code === 'KeyA' || e.code === 'KeyD')) {
        // Right-click + A/D = strafe
        if (e.code === 'KeyA') {
          window.UI.input.state.strafeLeft = true;
          handled = true;
        }
        if (e.code === 'KeyD') {
          window.UI.input.state.strafeRight = true;
          handled = true;
        }
      } else if (e.shiftKey && (e.code === 'KeyA' || e.code === 'KeyD')) {
        // Shift+A/D = strafe
        if (e.code === 'KeyA') {
          window.UI.input.state.strafeLeft = true;
          handled = true;
        }
        if (e.code === 'KeyD') {
          window.UI.input.state.strafeRight = true;
          handled = true;
        }
      } else if (window.UI.input.keyMap[e.code]) {
        window.UI.input.state[window.UI.input.keyMap[e.code]] = true;
        handled = true;
      }
    }
    
    if (handled) {
      e.preventDefault();
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...window.UI.input.state });
      }
    }
  },

  updateHeldKeysForModifier() {
    // Update A/D keys based on current modifier state
    if (window.UI.input.heldKeys.has('KeyA')) {
      if (window.UI.input.state.rightClick) {
        window.UI.input.state.left = false;
        window.UI.input.state.strafeLeft = true;
      } else {
        window.UI.input.state.left = true;
        window.UI.input.state.strafeLeft = false;
      }
    }
    if (window.UI.input.heldKeys.has('KeyD')) {
      if (window.UI.input.state.rightClick) {
        window.UI.input.state.right = false;
        window.UI.input.state.strafeRight = true;
      } else {
        window.UI.input.state.right = true;
        window.UI.input.state.strafeRight = false;
      }
    }
  },

  handleMouse(e, isDown) {
    if (e.button === 2) { // Right mouse button
      window.UI.input.state.rightClick = isDown;
      // Update any currently held A/D keys when right-click state changes
      window.UI.input.updateHeldKeysForModifier();
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...window.UI.input.state });
      }
    }
  },

  resetInputState() {
    // Reset all input state to false
    Object.keys(window.UI.input.state).forEach(key => {
      window.UI.input.state[key] = false;
    });
    window.UI.input.heldKeys.clear();
    // Update game engine with reset state
    if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
      GameEngine.setInputState({ ...window.UI.input.state });
    }
  },

  init() {
    // Prevent double initialization
    if (window.UI.input._initialized) return;
    window.UI.input._initialized = true;
    window.addEventListener('keydown', (e) => window.UI.input.handleKey(e, true));
    window.addEventListener('keyup', (e) => window.UI.input.handleKey(e, false));
    
    // Handle mouse events on canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => window.UI.input.handleMouse(e, true));
      canvas.addEventListener('mouseup', (e) => window.UI.input.handleMouse(e, false));
    }
    
    // Handle browser focus changes to prevent stuck keys
    window.addEventListener('blur', () => {
      window.UI.input.resetInputState();
    });
    window.addEventListener('focus', () => {
      window.UI.input.resetInputState();
    });
    
    // Initialize input state in GameEngine
    if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
      GameEngine.setInputState({ ...window.UI.input.state });
    }
  }
};

// TODO: Export Input if using modules 