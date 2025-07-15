# Step 1: File Structure and Scaffolding

This document details the foundational file structure for the web-game project, describing the purpose and initial expectations for each file. This step ensures a modular, maintainable codebase and sets the stage for further development.

---

## 📁 Required Files

### 1. `index.html` ✅
- **Purpose:** The main HTML entry point for the game.
- **Contents:**
  - Sets up the `<canvas>` element for rendering.
  - Loads all necessary JavaScript files (`main.js`, etc.).
  - Minimal styling to center the canvas and set background color.

### 2. `main.js` ✅
- **Purpose:** Entry point for initializing the game.
- **Contents:**
  - Grabs the canvas and context from the DOM.
  - Initializes core modules (game engine, input, game loop).
  - Starts the game loop.

### 3. `gameEngine.js` ✅ (deleted, logic now modularized)
- **Purpose:** Core game logic and state management.
- **Status:** Logic has been split into modular files under `core/` and `ui/` directories.

### 4. `input.js` ✅ (deleted, logic now modularized)
- **Purpose:** Handles keyboard and mouse input.
- **Status:** Input handling is now in `core/input.js` and related modules.

### 5. `gameLoop.js` ✅ (deleted, logic now modularized)
- **Purpose:** Manages the main update/render loop.
- **Status:** Game loop logic is now in `core/gameLoop.js` and related modules.

---

## 🗂️ Directory Layout

```
web-game/
  index.html ✅
  main.js ✅
  core/  # Modularized core logic (game engine, input, rendering, etc.)
  ui/    # Modularized UI components (inventory, action bar, macro, skins, etc.)
  requirements/
    initial-requirements.md
    step-1-the-basics.md  <-- (this file)
    step-2-advanced-features.md
    step-3-entity-rendering.md
```

---

## 📝 Scaffolding Expectations
- Each JS file should export or expose its main functions/objects for modularity. ✅
- No game logic should be in `index.html`—all logic in JS modules. ✅
- Use clear comments and TODOs for unimplemented sections. ✅
- Ensure all files are referenced correctly in `index.html`. ✅
- **The codebase supports both fixed-north and player-perspective camera modes, switchable via a variable for easy testing and debugging.** ✅
- **The world uses a coordinate grid system with tiles as the smallest world unit, but sub-tile rendering is supported (e.g., multiple small objects per tile).** ✅
- **Procedural generation logic, for each world seed, places a red 'X' at the player's starting coordinates.** ✅
- **The rendering system supports geometric shapes, sprites, and text at any position.** ✅
- **The game supports zooming in and out with the mouse scroll wheel, with upper and lower zoom limits.** ✅
- **The default browser right-click context menu is disabled on the game canvas.** ✅
- **Input is robust to browser focus changes (e.g., releasing keys when focus is lost to prevent stuck movement/rotation).** ✅

---

## ✅ Completion Criteria
- All files exist with basic scaffolding and comments. ✅
- The game can be loaded in a browser, showing a blank or placeholder canvas. ✅
- No errors in the browser console. ✅
- **Step 1 is 100% complete!** All requirements have been implemented and tested.

## 🏆 Step 1 Achievements
- ✅ Complete file structure with modular architecture
- ✅ Working game loop with frame-rate independent motion
- ✅ Player movement with WASD controls and proper vector normalization
- ✅ Dual perspective modes (fixed-north and player-perspective)
- ✅ Zoom functionality with mouse wheel
- ✅ Procedural world generation with coordinate grid system
- ✅ Robust input handling with right-click strafe controls
- ✅ Browser focus handling to prevent stuck keys
- ✅ Disabled context menu on game canvas
- ✅ Console debugging functions for perspective and zoom control

## 🎮 Action Bar System (Enhanced)
- ✅ Dual action bars positioned at bottom-left corner
- ✅ Primary action bar: Number keys 1-0 (10 slots)
- ✅ Secondary action bar: Shift+Number keys 1-0 (10 slots)
- ✅ Visual styling with lower opacity interior cells
- ✅ Temporary highlighting (only during mouse press or key hold)
- ✅ Macro implementation: "perspective" command bound to Control+0
- ✅ Modularized action bar system for reuse

## 🧩 Modularity & Technical Debt
- Most foundational logic is now modularized under `core/` and `ui/` directories.
- Some files are still large and could be further split for maintainability.
- UI components (inventory, macro, skins) could be more reusable and DRY.
- Homegrown module/dependency system; initialization is not fully orchestrated from a single entry point.

## 🚦 Ready for Step 2
Step 1 has been completed successfully. The game now has a solid foundation with:
- Working player movement and controls
- Dual camera perspectives
- Zoom functionality
- Procedural world generation
- Robust input handling
- Enhanced dual action bar system with macro support
- Modular file structure for future expansion

Ready to proceed to Step 2: Advanced Game Features and Systems. 