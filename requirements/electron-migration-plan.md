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

## Phase 4: Dots System (Iteration 4) ✅ **COMPLETE**
**Goal**: Background dots system with camera-relative rendering

### 4.1 Dots Module ✅
```javascript
// src/modules/game/dots.js ✅
export class DotsSystem {
  constructor() {
    this.config = {
      dotSize: 4,
      dotSpacing: 32,
      dotColor: '#ffffff',
      dotAlpha: 0.8
    };
  }
  
  render(ctx, cameraX, cameraY, cameraWidth, cameraHeight, zoom) {
    // Render dots in a grid pattern at fixed world coordinates
    // Camera-relative rendering for infinite world feel
  }
}
```

### 4.2 Camera Module ✅
```javascript
// src/modules/game/camera.js ✅
export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.followSpeed = 0.1;
  }
  
  follow(targetX, targetY) {
    // Smooth camera following with lerp
  }
  
  applyTransform(ctx) {
    // Apply camera transform to context
  }
}
```

### 4.3 Implementation Steps ✅
1. **Dots system** ✅
   - Port background.js dots rendering to ES6 module
   - Camera-relative rendering for infinite world feel
   - Configurable dot size, spacing, color, and alpha
   - Grid-based pattern for consistent visual reference

2. **Camera system** ✅
   - Basic camera following player with smooth movement
   - World coordinate system with proper transforms
   - Zoom support for future features
   - Viewport calculations and coordinate conversions

### 4.4 Current Features ✅
- ✅ Background dots render in infinite grid pattern
- ✅ Camera smoothly follows player with configurable speed
- ✅ Dots move relative to camera position
- ✅ Configurable dot appearance and spacing
- ✅ Test mode for debugging dot rendering
- ✅ Proper coordinate transformations

## Phase 5: World System (Iteration 5) ✅ **COMPLETE**
**Goal**: World generation with chunk loading, biome rendering, and entity generation

### 5.1 World Module ✅
```javascript
// src/modules/game/world.js ✅
export class World {
  constructor() {
    this.config = {
      seed: 12345,
      chunkSize: 64,
      tileSize: 32,
      chunkCount: 64,
      biomePlainsFraction: 0.5,
      keepDistance: 1
    };
    this.chunkCache = new Map();
    this.chunkBiomeMap = new Map();
  }
  
  loadChunk(chunkX, chunkY) {
    // Load or generate chunk with entities
  }
  
  generateChunk(chunkX, chunkY) {
    // Generate chunk data with biome and entities
  }
  
  render(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
    // Render visible chunks with proper layering
  }
}
```

### 5.2 Entity System ✅
```javascript
// src/modules/game/entities/
// ├── grass.js ✅
// ├── tree.js ✅
// └── rock.js ✅

export class GrassEntity {
  static create(config) {
    // Create grass entity with SVG generation
  }
}

export class TreeEntity {
  static create(config) {
    // Create tree entity with SVG generation
  }
}

export class RockEntity {
  static create(config) {
    // Create rock entity with SVG generation
  }
}
```

### 5.3 Image Asset Management ✅
```javascript
// src/modules/game/assets.js ✅
export class AssetManager {
  constructor() {
    this.assetDir = path.join(os.homedir(), '.mygame/assets');
  }
  
  async loadGameImage(type, imageName) {
    // 3-tier fallback: filesystem → localStorage → procedural generation
  }
  
  async generateAndCacheImage(type, imageName, svgData) {
    // Generate SVG → raster → cache to localStorage
  }
}
```

### 5.4 Implementation Steps ✅
1. **World generation system** ✅
   - Port world.js chunk loading and generation logic
   - Implement biome classification (plains/desert)
   - Chunk caching and cleanup system
   - World coordinate management and wrapping

2. **Entity generation** ✅
   - Port grass.js, tree.js, rock.js to ES6 modules
   - SVG-only procedural generation (no canvas art)
   - Deterministic entity placement using hash functions
   - Entity rendering with proper layering

3. **Image asset management** ✅
   - Implement 3-tier fallback system:
     - Filesystem: `~/.mygame/assets/<imageName>.png`
     - localStorage: `image:{type}-{imageName}` (one key per image)
     - Procedural generation: SVG → raster → cache
   - AssetManager class for unified image loading
   - Proper key naming convention: `image:entity-tree`, `image:biome-desert_tile_1`

4. **Biome rendering** ✅
   - Generate biome background images (plains/desert)
   - Cache biome images in localStorage
   - Render biome backgrounds per chunk
   - Support for biome-specific entity placement

5. **Integration** ✅
   - Integrate world system with camera and dots
   - Proper entity layering (grass → entities → trees)
   - Chunk loading based on camera view
   - Performance optimization with chunk cleanup

### 5.5 Current Features ✅
- ✅ Infinite procedurally generated world with chunks
- ✅ Biome system (plains/desert) with different entity densities
- ✅ Entity generation (grass, trees, rocks) with deterministic placement
- ✅ Chunk-based rendering with performance optimization
- ✅ Proper entity layering and collision detection
- ✅ Asset management system with 3-tier fallback
- ✅ SVG-only procedural generation for all entities
- ✅ World boundary rendering and grid overlay
- ✅ Chunk caching and cleanup system
- ✅ Debug information showing chunk loading statistics

### 5.6 Technical Requirements ✅
- **SVG-only procedural generation** (no canvas art) ✅
- **One localStorage key per image**: `image:{type}-{name}` ✅
- **Filesystem support** for user-edited assets ✅
- **Deterministic generation** using world seed ✅
- **Chunk-based rendering** for performance ✅
- **Proper entity layering** and collision detection ✅
- **Biome-specific entity placement** probabilities ✅

### 5.7 Reference Implementation ✅
Based on `core/world.js`, `core/entities/grass.js`, `core/entities/tree.js`, `core/entities/rock.js`:
- Chunk size: 64 tiles (2048 pixels) ✅
- Tile size: 32 pixels ✅
- World size: 64x64 chunks (4096x4096 tiles) ✅
- Biome split: 50% plains, 50% desert ✅
- Entity placement with hash-based deterministic generation ✅
- SVG generation for all procedural art ✅

## Phase 6: Advanced Game Systems (Iteration 6) 🚧 **IN PROGRESS**
**Goal**: Collision detection, entity interactions, and enhanced world features

### 6.1 Collision System
```javascript
// src/modules/game/collision.js
export class CollisionSystem {
  constructor() {
    this.collisionLayers = new Map();
  }
  
  checkCollision(entity1, entity2) {
    // Check collision between two entities
  }
  
  getCollisionsAt(x, y, radius) {
    // Get all entities colliding at position
  }
  
  updateCollisions(world, player) {
    // Update collision state for all entities
  }
}
```

### 6.2 Entity Interaction System
```javascript
// src/modules/game/interactions.js
export class InteractionSystem {
  constructor() {
    this.interactions = new Map();
  }
  
  registerInteraction(entityType, action) {
    // Register interaction for entity type
  }
  
  handleInteraction(player, entity) {
    // Handle player interaction with entity
  }
  
  getInteractableEntities(world, player) {
    // Get entities player can interact with
  }
}
```

### 6.3 Enhanced World Features
```javascript
// src/modules/game/world-enhancements.js
export class WorldEnhancements {
  constructor(world) {
    this.world = world;
    this.dayNightCycle = 0;
    this.weather = 'clear';
  }
  
  updateDayNightCycle(deltaTime) {
    // Update day/night cycle
  }
  
  updateWeather(deltaTime) {
    // Update weather conditions
  }
  
  renderAtmosphere(ctx, cameraX, cameraY) {
    // Render atmospheric effects
  }
}
```

### 6.4 Implementation Steps
1. **Collision detection system**
   - Implement circular collision detection
   - Collision layers for different entity types
   - Player collision with world entities
   - Collision response and blocking

2. **Entity interactions**
   - Interaction zones around entities
   - Player interaction with trees, rocks, etc.
   - Interaction feedback and UI
   - Collectible items and resources

3. **Enhanced world features**
   - Day/night cycle with lighting changes
   - Weather system (rain, fog, etc.)
   - Atmospheric rendering effects
   - Dynamic entity behavior based on time/weather

4. **Performance optimizations**
   - Spatial partitioning for collision detection
   - Culling for off-screen entities
   - Optimized rendering for large worlds
   - Memory management for entity pools

5. **Integration and testing**
   - Integrate collision system with existing entities
   - Add interaction UI and feedback
   - Test performance with large numbers of entities
   - Debug tools for collision visualization

### 6.5 Technical Requirements
- **Efficient collision detection** using spatial partitioning
- **Interaction zones** around entities with visual feedback
- **Day/night cycle** affecting world appearance and entity behavior
- **Weather effects** with atmospheric rendering
- **Performance optimization** for large numbers of entities
- **Debug visualization** for collision and interaction zones

### 6.6 Features to Implement
- **Player collision**: Prevent walking through trees and rocks
- **Interaction system**: Allow player to interact with entities
- **Day/night cycle**: Dynamic lighting and entity behavior
- **Weather effects**: Rain, fog, and atmospheric rendering
- **Resource collection**: Trees and rocks as collectible resources
- **Performance monitoring**: FPS and memory usage optimization 