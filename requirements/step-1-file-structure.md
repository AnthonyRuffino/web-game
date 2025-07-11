# Step 1: File Structure and Scaffolding

This document details the foundational file structure for the web-game project, describing the purpose and initial expectations for each file. This step ensures a modular, maintainable codebase and sets the stage for further development.

---

## 📁 Required Files

### 1. `index.html`
- **Purpose:** The main HTML entry point for the game.
- **Contents:**
  - Sets up the `<canvas>` element for rendering.
  - Loads all necessary JavaScript files (`main.js`, etc.).
  - Minimal styling to center the canvas and set background color.

### 2. `main.js`
- **Purpose:** Entry point for initializing the game.
- **Contents:**
  - Grabs the canvas and context from the DOM.
  - Initializes core modules (game engine, input, game loop).
  - Starts the game loop.

### 3. `gameEngine.js`
- **Purpose:** Contains core game logic and state management.
- **Contents:**
  - Manages game objects (player, world, etc.).
  - Provides update and render methods for the game state.
  - Exposes hooks for developer tools and debugging.

### 4. `input.js`
- **Purpose:** Handles keyboard and mouse input.
- **Contents:**
  - Listens for keydown/keyup and mouse events.
  - Maps input to game actions (movement, rotation, UI toggles).
  - Exposes input state to the game engine.

### 5. `gameLoop.js`
- **Purpose:** Manages the main update/render loop.
- **Contents:**
  - Implements a frame-rate independent game loop using `requestAnimationFrame`.
  - Calls update and render methods on the game engine.
  - Tracks timing and delta for smooth motion.

---

## 🗂️ Directory Layout

```
web-game/
  index.html
  main.js
  gameEngine.js
  input.js
  gameLoop.js
  requirements/
    inital-requirements.md
    step-1-file-structure.md  <-- (this file)
```

---

## 📝 Scaffolding Expectations
- Each JS file should export or expose its main functions/objects for modularity.
- No game logic should be in `index.html`—all logic in JS modules.
- Use clear comments and TODOs for unimplemented sections.
- Ensure all files are referenced correctly in `index.html`.
- **The codebase should support both fixed-north and player-perspective camera modes, switchable via a variable for easy testing and debugging.**

---

## ✅ Completion Criteria
- All files exist with basic scaffolding and comments.
- The game can be loaded in a browser, showing a blank or placeholder canvas.
- No errors in the browser console.
- Ready for step 2: canvas setup and game loop implementation. 