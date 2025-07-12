# Step 2: Advanced Game Features and Systems

This document outlines the next phase of development, building upon the solid foundation established in Step 1. Step 2 focuses on implementing core gameplay systems, collision detection, UI elements, world structure, and developer tools.

---

## 🎯 Step 2 Overview

**Goal:** Transform the basic movement prototype into a functional game with world structure, obstacles, UI, and core systems.

**Prerequisites:** Step 1 must be 100% complete (✅ Confirmed)

---

## 🧱 Core Systems Implementation

### 1. World Background & Visual Feedback ✅ (COMPLETED)
- **Current Status:** Background texture system fully implemented
- **Implemented Features:**
  - Background texture for entire playable world (replaces black void) ✅
  - Simple, lightweight texture (dots pattern rendered on canvas) ✅
  - Consistent texture across world for relative motion reference ✅
  - Background texture is purely aesthetic (no complex proc gen needed) ✅
  - Dots fixed in world coordinates (player moves past them) ✅
  - Console commands for configuration (`bgconfig`, `bgset`, `bgpreset`) ✅
- **Configuration System:**
  - Dot size, spacing, color, and alpha are fully configurable ✅
  - Type conversion and validation for all properties ✅
  - Preset configurations (dense, sparse, bright, subtle) ✅
  - Dots are placed at fixed world coordinates regardless of zoom ✅
  - Provides proper visual feedback for player movement ✅

### 2. World Structure & Wrapping ✅ (COMPLETED)
- **Current Status:** World structure and wrapping system fully implemented
- **Implemented Features:**
  - Finite rectangular world with edge wrapping ✅
  - Moving east leads to west side, west to east, north to south, south to north ✅
  - Initial world size: player can traverse edge-to-edge in 10-15 seconds ✅
  - Configurable world size for future expansion ✅
  - Handle coordinate wrapping in movement and rendering systems ✅
  - Deterministic starting position based on world seed ✅
  - Console commands for world management (`worldinfo`, `setseed`, `restartgame`) ✅
- **World Configuration:**
  - 100x100 tile world (4000x4000 pixels)
  - ~20 second traversal time at default speed
  - Red boundary line shows world edges
  - Grid system for tile-based operations
  - Coordinate wrapping prevents out-of-bounds movement
  - Configurable via gridWidth/gridHeight in world.js

### 3. Procedural Generation & Starting Position
- **Requirements:**
  - Deterministic starting position selection based on world seed
  - Starting position ensures initial grid (red 'X') is visible
  - Consistent starting position across game sessions with same seed
  - Console command `restartGame(seed)` to restart with new seed
  - Procedural generation algorithm for deterministic world layout

### 4. Grass Tiles & Basic World Objects
- **Requirements:**
  - Procedural placement of grass tiles at deterministic coordinates
  - Grass tiles visually distinct from background texture
  - Grass tiles are non-interactive in Step 2 (no harvesting yet)
  - Basic world objects (trees, rocks) for collision testing
  - All objects deterministically placed based on world seed

### 5. Basic Persistence System
- **Requirements:**
  - Periodic saving of player position and world seed to localStorage
  - Singleton timeout function for state snapshots
  - Game world tick number persistence
  - Resume game exactly where left off after browser refresh
  - No world state changes to persist yet (harvesting comes later)

### 6. Obstacles and Collision Detection
- **Current Status:** Basic grid system exists
- **Requirements:**
  - Implement collision detection between player and world objects
  - Add solid obstacles (trees, rocks, walls) that block movement
  - Ensure collision detection works in both perspective modes
  - Add visual feedback for collision (optional: player stops, visual indicator)
  - Support for different collision types (solid, passable, etc.)

### 7. Console Commands and Developer Tools ✅ (COMPLETED)
- **Current Status:** Full console system implemented
- **Implemented Commands:**
  - `teleport(x, y)` - Move player to specific world coordinates ✅
  - `setspeed(value)` - Change player movement speed ✅
  - `stats` - Display current player position, angle, speed ✅
  - `setzoom(value)` - Control zoom level programmatically ✅
  - `perspective` - Toggle between camera modes ✅
  - `spawnitem(itemName)` - Spawn items at player location (placeholder) ✅
  - `clear` - Clear console output ✅
  - `version` - Show game version ✅
  - `help` - Show available commands ✅
- **Missing for Step 2:**
  - `restartGame(seed)` - Restart game with new seed (needs world system)
- **Features:**
  - Extensible command registry ✅
  - Command history system ✅
  - Global `cmd()` function for easy access ✅
  - Error handling and validation ✅

### 8. Basic UI System
- **Requirements:**
  - Inventory toggle with `B` key
  - Grid-based inventory layout (configurable, default 5x5)
  - Click detection for inventory slots
  - Visual feedback for hover and selection
  - Inventory state management (open/closed)

### 9. Action Bar Implementation
- **Requirements:**
  - 10-slot action bar at bottom of screen
  - Number keys 1-0 to trigger slots
  - Mouse click support for slot activation
  - Visual feedback for hover and click
  - Configurable slot count
  - Support for future item/spell binding

### 10. Crafting UI and Recipe System
- **Requirements:**
  - Crafting menu accessible from inventory
  - Display 4 starter recipes:
    - Crafting Table
    - Torch
    - Furnace
    - Wooden Spear
  - Recipe requirements and materials display
  - Craft button with success/failure feedback
  - Extensible recipe system for future items

---

## 🗂️ New Files Required

### 1. `world.js` ✅ (COMPLETED)
- **Purpose:** World structure, wrapping, and procedural generation
- **Contents:**
  - World size and wrapping logic ✅
  - Procedural generation algorithm ✅
  - Starting position determination ✅
  - World coordinate system management ✅
  - Coordinate wrapping functions ✅
  - Tile/pixel coordinate conversion ✅
  - World boundary rendering ✅

### 2. `background.js` ✅ (COMPLETED)
- **Purpose:** Background texture rendering
- **Contents:**
  - Background texture generation and rendering ✅
  - World-wide texture application ✅
  - Performance optimization for large worlds ✅
  - Configuration system with validation ✅

### 3. `persistence.js`
- **Purpose:** Game state persistence and loading
- **Contents:**
  - localStorage save/load functions
  - Periodic state snapshot system
  - Game tick persistence
  - State restoration on game start

### 4. `collision.js`
- **Purpose:** Collision detection and spatial query system
- **Contents:**
  - Collision detection algorithms
  - Spatial partitioning (simple grid-based for now)
  - Collision response handling
  - Support for different object types

### 5. `ui.js`
- **Purpose:** User interface management
- **Contents:**
  - Inventory UI rendering and logic
  - Action bar rendering and interaction
  - Crafting UI rendering and logic
  - UI state management
  - Click detection and event handling

### 6. `items.js`
- **Purpose:** Item system and management
- **Contents:**
  - Item definitions and properties
  - Inventory management
  - Item spawning and collection
  - Item rendering (shapes for now, sprites later)

### 7. `crafting.js`
- **Purpose:** Crafting system and recipes
- **Contents:**
  - Recipe definitions
  - Crafting logic and validation
  - Material requirements checking
  - Crafting success/failure handling

### 8. `console.js` ✅ (COMPLETED)
- **Purpose:** Developer console and debugging tools
- **Contents:**
  - Command registry and parsing ✅
  - Built-in commands (teleport, stats, restart, etc.) ✅
  - Command history and help system ✅
  - Extensible command system ✅

---

## 📝 Implementation Priorities

### Phase 2A: World Structure (Priority 1)
1. **World Wrapping**
   - Implement finite rectangular world with edge wrapping
   - Test movement across world boundaries
   - Ensure consistent coordinate system

2. **Procedural Generation**
   - Implement deterministic starting position selection
   - Add procedural grass tile placement
   - Test consistency across game sessions

3. **Background Texture** ✅ (COMPLETED)
   - Implement simple background texture ✅
   - Apply texture across entire world ✅
   - Test performance and visual consistency ✅

### Phase 2B: Persistence & Collision (Priority 2)
4. **Basic Persistence**
   - Implement localStorage save/load for player position and seed
   - Add periodic state snapshot system
   - Test game resume functionality

5. **Collision Detection**
   - Implement collision between player and obstacles
   - Add basic world objects (trees, rocks)
   - Test collision in both perspective modes

### Phase 2C: UI & Developer Tools (Priority 3)
6. **Console Commands** ✅ (COMPLETED)
   - Implement command registry ✅
   - Add teleport, stats, restart commands ✅
   - Test command system functionality ✅

7. **Basic UI System**
   - Create UI rendering framework
   - Implement inventory toggle and basic layout
   - Add click detection for UI elements

8. **Action Bar**
   - Implement 10-slot action bar
   - Add keyboard and mouse interaction
   - Visual feedback system

### Phase 2D: Advanced Features (Priority 4)
9. **Crafting System**
   - Implement recipe definitions
   - Create crafting UI
   - Add basic crafting logic

10. **Item System**
    - Implement item definitions
    - Add inventory management
    - Item spawning and collection

---

## 🧪 Testing Requirements

### World Structure Testing
- [ ] Player can traverse from edge to edge in 10-15 seconds
- [ ] World wrapping works correctly in all directions
- [ ] Starting position is consistent for same seed
- [ ] Background texture provides visual feedback for movement ✅

### Procedural Generation Testing
- [ ] Same seed produces identical world layout
- [ ] Different seeds produce different layouts
- [ ] Starting position ensures initial grid is visible
- [ ] Grass tiles are placed deterministically

### Persistence Testing
- [ ] Player position is saved and restored correctly
- [ ] World seed is preserved across browser refresh
- [ ] Game resumes exactly where left off
- [ ] Periodic saving works without performance impact

### Collision Testing
- [ ] Player cannot move through solid obstacles
- [ ] Collision works correctly in both perspective modes
- [ ] Collision detection is efficient (no performance issues)
- [ ] Visual feedback for collision (optional)

### Console Commands Testing
- [ ] `teleport(x, y)` moves player to correct coordinates ✅
- [ ] `restartGame(seed)` restarts with new seed
- [ ] `setSpeed(value)` changes movement speed ✅
- [ ] `printPlayerStats()` displays accurate information ✅
- [ ] Commands work in both perspective modes ✅

### UI Testing
- [ ] Inventory opens/closes with `B` key
- [ ] Action bar responds to number keys 1-0
- [ ] Mouse clicks work on UI elements
- [ ] Visual feedback is clear and responsive

### Crafting Testing
- [ ] Crafting menu opens from inventory
- [ ] Recipes display correctly
- [ ] Crafting logic works as expected
- [ ] Success/failure feedback is clear

---

## ✅ Step 2 Completion Criteria

### Minimum Viable Step 2
- [ ] World wrapping allows edge-to-edge traversal
- [ ] Procedural generation creates consistent world layout
- [ ] Background texture provides visual feedback ✅
- [ ] Player position and seed persist across browser refresh
- [ ] Collision detection prevents movement through obstacles
- [ ] Console commands work for teleporting, restarting, and viewing stats ✅
- [ ] Inventory can be opened/closed with `B` key
- [ ] Action bar responds to number keys 1-0

### Full Step 2 Completion
- [ ] All world structure features implemented and tested
- [ ] Complete procedural generation with grass tiles
- [ ] Full persistence system with periodic saving
- [ ] Complete collision detection system
- [ ] Complete console command system with extensibility ✅
- [ ] Full UI system with inventory, action bar, and crafting
- [ ] Item system with spawning and collection
- [ ] All systems work correctly in both perspective modes
- [ ] Performance is acceptable (60 FPS maintained)

---

## 🚀 Post-Step 2 Roadmap

After Step 2 completion, the game will have:
- Functional world structure with wrapping
- Procedural generation with deterministic layout
- Basic persistence system
- Functional collision and obstacle system
- Complete UI framework
- Developer tools and debugging capabilities
- Foundation for item and crafting systems

**Next phases will include:**
- Resource harvesting tools and mechanics
- Advanced world state management
- Animation systems
- Building placement system
- Combat system implementation
- Server-client architecture preparation

---

## 📋 Development Notes

- **Modularity:** Each new system should be self-contained and expose clear APIs
- **Performance:** Maintain 60 FPS during development
- **Testing:** Test all features in both perspective modes
- **Extensibility:** Design systems to be easily expandable
- **Debugging:** Maintain console access for all major systems
- **Persistence:** Design persistence system to support future server-client model
- **World State:** Keep world state management simple in Step 2 (no harvesting yet)