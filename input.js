// input.js
// Keyboard and mouse input handling

const Input = {
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

  handleKey(e, isDown) {
    // Check if UI input bar or inventory is open - if so, ignore game input
    if (typeof UI !== 'undefined' && (UI.inputBarOpen || UI.inventoryOpen)) {
      return;
    }
    
    let handled = false;
    
    // Track physically held keys
    if (isDown) {
      Input.heldKeys.add(e.code);
    } else {
      Input.heldKeys.delete(e.code);
    }
    
    // Handle key releases first - always process them regardless of modifiers
    if (!isDown) {
      if (e.code === 'KeyA') {
        Input.state.left = false;
        Input.state.strafeLeft = false;
        handled = true;
      }
      if (e.code === 'KeyD') {
        Input.state.right = false;
        Input.state.strafeRight = false;
        handled = true;
      }
      if (e.code === 'KeyW') {
        Input.state.forward = false;
        handled = true;
      }
      if (e.code === 'KeyS') {
        Input.state.backward = false;
        handled = true;
      }
      if (e.code === 'KeyQ') {
        Input.state.strafeLeft = false;
        handled = true;
      }
      if (e.code === 'KeyE') {
        Input.state.strafeRight = false;
        handled = true;
      }
    } else {
      // Handle key presses with modifiers
      if (Input.state.rightClick && (e.code === 'KeyA' || e.code === 'KeyD')) {
        // Right-click + A/D = strafe
        if (e.code === 'KeyA') {
          Input.state.strafeLeft = true;
          handled = true;
        }
        if (e.code === 'KeyD') {
          Input.state.strafeRight = true;
          handled = true;
        }
      } else if (e.shiftKey && (e.code === 'KeyA' || e.code === 'KeyD')) {
        // Shift+A/D = strafe
        if (e.code === 'KeyA') {
          Input.state.strafeLeft = true;
          handled = true;
        }
        if (e.code === 'KeyD') {
          Input.state.strafeRight = true;
          handled = true;
        }
      } else if (Input.keyMap[e.code]) {
        Input.state[Input.keyMap[e.code]] = true;
        handled = true;
      }
    }
    
    if (handled) {
      e.preventDefault();
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...Input.state });
      }
    }
  },

  updateHeldKeysForModifier() {
    // Update A/D keys based on current modifier state
    if (Input.heldKeys.has('KeyA')) {
      if (Input.state.rightClick) {
        Input.state.left = false;
        Input.state.strafeLeft = true;
      } else {
        Input.state.left = true;
        Input.state.strafeLeft = false;
      }
    }
    if (Input.heldKeys.has('KeyD')) {
      if (Input.state.rightClick) {
        Input.state.right = false;
        Input.state.strafeRight = true;
      } else {
        Input.state.right = true;
        Input.state.strafeRight = false;
      }
    }
  },

  handleMouse(e, isDown) {
    if (e.button === 2) { // Right mouse button
      Input.state.rightClick = isDown;
      // Update any currently held A/D keys when right-click state changes
      Input.updateHeldKeysForModifier();
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...Input.state });
      }
    }
  },

  resetInputState() {
    // Reset all input state to false
    Object.keys(Input.state).forEach(key => {
      Input.state[key] = false;
    });
    Input.heldKeys.clear();
    // Update game engine with reset state
    if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
      GameEngine.setInputState({ ...Input.state });
    }
  },

  init() {
    window.addEventListener('keydown', (e) => Input.handleKey(e, true));
    window.addEventListener('keyup', (e) => Input.handleKey(e, false));
    
    // Handle mouse events on canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => Input.handleMouse(e, true));
      canvas.addEventListener('mouseup', (e) => Input.handleMouse(e, false));
    }
    
    // Handle browser focus changes to prevent stuck keys
    window.addEventListener('blur', () => {
      Input.resetInputState();
    });
    window.addEventListener('focus', () => {
      Input.resetInputState();
    });
    
    // Initialize input state in GameEngine
    if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
      GameEngine.setInputState({ ...Input.state });
    }
  }
};

// TODO: Export Input if using modules 