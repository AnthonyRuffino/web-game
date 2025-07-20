# Electron Migration Plan

## Overview
Migrate the web game from browser-based script loading to Electron with proper ES6 modules, maintaining all existing code as reference while building a clean, modular architecture.

## Phase 1: Electron Foundation (Iteration 1) ✅ **COMPLETE**
**Goal**: Basic Electron app with canvas and simple message

### 1.1 Setup Electron Project Structure ✅
```
electron/
├── package.json          ✅ Electron dependencies and scripts
├── main.js              ✅ Electron main process
├── preload.js           ✅ Preload script for security
├── .gitignore           ✅ Comprehensive gitignore
├── src/
│   ├── index.html       ✅ Main HTML file with canvas
│   ├── styles/
│   │   └── main.css     ✅ Basic responsive styles
│   └── modules/
│       └── game/
│           ├── index.js ✅ Game module entry point
│           └── canvas.js ✅ Canvas management system
└── assets/
    └── images/          ✅ Game assets directory
```

### 1.2 Implementation Steps ✅
1. **Initialize Electron project** ✅
   - Created `electron/package.json` with Electron dependencies
   - Set up basic main process (`main.js`) with window management
   - Created preload script for secure IPC communication
   - Added development scripts with `--no-sandbox` for Linux

2. **Basic HTML structure** ✅
   - Created `src/index.html` with canvas element
   - Added responsive CSS for canvas sizing
   - Implemented debug information display
   - Added loading message system

3. **Canvas and Game Loop** ✅
   - Implemented CanvasManager class with responsive sizing
   - Created proper game loop with FPS counter
   - Added window resize handling
   - Implemented basic rendering pipeline

4. **Testing and Documentation** ✅
   - Created comprehensive README.md
   - Added .gitignore for proper version control
   - Created test scripts for development
   - Verified Electron app launches successfully

### 1.3 Current Features ✅
- ✅ Electron window opens and displays correctly
- ✅ Canvas renders basic shapes and text
- ✅ Responsive canvas sizing that maintains aspect ratio
- ✅ FPS counter and performance monitoring
- ✅ Debug information panel
- ✅ Window resize handling
- ✅ Clean ES6 module structure
- ✅ Proper error handling and logging

## Phase 2: Character System (Iteration 2) ✅ **COMPLETE**
**Goal**: Player character with basic movement and input handling

### 2.1 Character Module ✅
```javascript
// src/modules/game/character.js ✅
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 200; // pixels per second
    this.size = 20;
    this.velocity = { x: 0, y: 0 };
    this.isMoving = false;
  }
  
  update(deltaTime) {
    // Update position based on input with smooth movement
  }
  
  render(ctx) {
    // Render player as circle with direction indicator
  }
}
```

### 2.2 Input Module ✅
```javascript
// src/modules/game/input.js ✅
export class InputManager {
  constructor() {
    this.keys = new Map();
    this.bindings = new Map();
  }
  
  init() {
    // Set up keyboard event listeners
  }
  
  isKeyPressed(key) {
    // Check if key is pressed
  }
  
  bindAction(key, action) {
    // Bind key to action
  }
}
```

### 2.3 Implementation Steps ✅
1. **Create player character** ✅
   - Simple circle representation with border
   - Position tracking with smooth movement
   - Direction indicator when moving
   - WASD and Arrow key support

2. **Input handling** ✅
   - Keyboard event handling with proper cleanup
   - Key state tracking for smooth movement
   - Action binding system for extensibility
   - Input debugging display

3. **Integration** ✅
   - Player centered on canvas initialization
   - Input bound to player movement
   - Window resize handling with player re-centering
   - Debug information showing player position and movement state

### 2.4 Current Features ✅
- ✅ Player character renders as green circle with white border
- ✅ Smooth movement with WASD and Arrow keys
- ✅ Direction indicator (yellow line) when moving
- ✅ Diagonal movement normalization
- ✅ Player position tracking and display
- ✅ Input state debugging
- ✅ Grid background for visual reference
- ✅ Instructions displayed on screen

## Phase 3: Rendering System (Iteration 3) ✅ **COMPLETE**
**Goal**: Entity rendering with dots/particles

### 3.1 Renderer Module ✅
```javascript
// src/modules/game/renderer.js ✅
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  
  render(entities) {
    // Render all game entities
  }
  
  renderEntity(entity) {
    // Render individual entity
  }
}
```

### 3.2 Implementation Steps ✅
1. **Basic rendering** ✅
   - Entity rendering system integrated into main game loop
   - Player character rendering with visual feedback
   - Grid background rendering for spatial reference

2. **Visual feedback** ✅
   - Movement direction indicator
   - Real-time position display
   - Input state visualization
   - FPS and performance monitoring

## Phase 4: Dots System (Iteration 4) 🚧 **IN PROGRESS**
**Goal**: Background dots system with camera-relative rendering

### 4.1 Dots Module
```javascript
// src/modules/game/dots.js
export class DotsSystem {
  constructor() {
    this.config = {
      dotSize: 1,
      dotSpacing: 32,
      dotColor: '#333333',
      dotAlpha: 0.3
    };
  }
  
  render(ctx, cameraX, cameraY, cameraWidth, cameraHeight, zoom) {
    // Render dots in a grid pattern at fixed world coordinates
    // Based on background.js implementation
  }
  
  setConfig(newConfig) {
    // Update dots configuration
  }
}
```

### 4.2 Implementation Steps
1. **Dots system**
   - Port background.js dots rendering to ES6 module
   - Camera-relative rendering for infinite world feel
   - Configurable dot size, spacing, color, and alpha
   - Grid-based pattern for consistent visual reference

2. **Camera system**
   - Basic camera following player
   - World coordinate system
   - Zoom support for future features
   - Viewport calculations

### 4.3 Reference Implementation
Based on `core/background.js`:
- Dot spacing: 32 pixels (fixed in world coordinates)
- Dot size: 1 pixel
- Dot color: #333333 with 0.3 alpha
- Grid pattern starting from nearest grid position
- Camera-relative rendering area calculation 