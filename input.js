// input.js
// Keyboard and mouse input handling

const Input = {
  state: {
    left: false,
    right: false,
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false
  },

  keyMap: {
    'KeyA': 'left',
    'KeyD': 'right',
    'KeyW': 'forward',
    'KeyS': 'backward',
    'KeyQ': 'strafeLeft',
    'KeyE': 'strafeRight'
  },

  handleKey(e, isDown) {
    let handled = false;
    if (e.shiftKey && (e.code === 'KeyA' || e.code === 'KeyD')) {
      // Shift+A/D = strafe
      if (e.code === 'KeyA') {
        Input.state.strafeLeft = isDown;
        handled = true;
      }
      if (e.code === 'KeyD') {
        Input.state.strafeRight = isDown;
        handled = true;
      }
    } else if (Input.keyMap[e.code]) {
      Input.state[Input.keyMap[e.code]] = isDown;
      handled = true;
    }
    if (handled) {
      e.preventDefault();
      if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
        GameEngine.setInputState({ ...Input.state });
      }
    }
  },

  init() {
    window.addEventListener('keydown', (e) => Input.handleKey(e, true));
    window.addEventListener('keyup', (e) => Input.handleKey(e, false));
    // Initialize input state in GameEngine
    if (typeof GameEngine !== 'undefined' && GameEngine.setInputState) {
      GameEngine.setInputState({ ...Input.state });
    }
  }
};

// TODO: Export Input if using modules 