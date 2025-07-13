# Step 2: Advanced Features

> **Note:** World wrapping functionality has been temporarily skipped to focus on improving world generation and entity rendering. The world is now large enough that wrapping issues occur less frequently.

## Overview

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
- **Current Status:** World structure implemented, wrapping system skipped for now
- **Implemented Features:**
  - Finite rectangular world with edge wrapping ✅
  - Moving east leads to west side, west to east, north to south, south to north ✅
  - Initial world size: player can traverse edge-to-edge in 10-15 seconds ✅
  - Configurable world size for future expansion ✅
  - Handle coordinate wrapping in movement and rendering systems ✅
  - Deterministic starting position based on world seed ✅
  - Console commands for world management (`worldinfo`, `setseed`, `restartgame`) ✅
- **World Configuration:**
  - 100x100 tile world (4000x4000 pixels) ✅
  - ~20 second traversal time at default speed ✅
  - Red boundary line shows world edges ✅
  - Grid system for tile-based operations ✅
  - Coordinate wrapping prevents out-of-bounds movement ✅
  - Configurable via gridWidth/gridHeight in world.js ✅

### 3. Grass Tiles & Basic World Objects ✅ (COMPLETED)
- **Current Status:** Procedural generation system fully implemented
- **Implemented Features:**
  - Procedural placement of grass tiles at deterministic coordinates ✅
  - Grass tiles visually distinct from background texture (green clusters) ✅
  - Grass tiles are non-interactive in Step 2 (no harvesting yet) ✅
  - Basic world objects (trees, rocks) for collision testing ✅
  - All objects deterministically placed based on world seed ✅
- **Generation System:**
  - Grass: 15% of tiles with natural cluster rendering ✅
  - Trees: 5% of tiles with trunk and foliage ✅
  - Rocks: 3% of tiles with gray circular appearance ✅
  - Deterministic hash-based placement algorithm ✅
  - Console command `worldobjects` for generation info ✅
  - Natural grass blade clusters with varied directions ✅
  - Tree rendering with brown trunk and green foliage ✅
  - Rock rendering with gray fill and dark outline ✅

### 4. Procedural Generation & Starting Position ✅ (COMPLETED)
- **Current Status:** Procedural generation and starting position system fully implemented
- **Implemented Features:**
  - Deterministic starting position selection based on world seed ✅
  - Starting position ensures initial grid (red 'X') is visible ✅
  - Consistent starting position across game sessions with same seed ✅
  - Console command `restartGame(seed)` to restart with new seed ✅
  - Procedural generation algorithm for deterministic world layout ✅
- **Generation System:**
  - Hash-based deterministic starting position calculation ✅
  - Starting position avoids world edges for visibility ✅
  - Console command `setseed <seed>` for manual seed setting ✅
  - Console command `restartgame` for random seed restart ✅
  - Console command `worldinfo` shows starting position ✅
  - Chunk cache clearing when seed changes ✅
  - Consistent world layout across sessions with same seed ✅

### 5. Basic Persistence System ✅ (COMPLETED)
- **Current Status:** Persistence system fully implemented
- **Implemented Features:**
  - Periodic saving of player position and world seed to localStorage ✅
  - Singleton timeout function for state snapshots ✅
  - Game world tick number persistence ✅
  - Resume game exactly where left off after browser refresh ✅
  - No world state changes to persist yet (harvesting comes later) ✅
- **Persistence System:**
  - Automatic saving every 5 seconds ✅
  - Manual save/load commands (`save`, `load`) ✅
  - Save information display (`saveinfo`) ✅
  - Save management (`clearsave`, `persistence`) ✅
  - State validation and error handling ✅
  - Beforeunload event saving ✅
  - Configurable save interval and auto-save toggle ✅
  - Player position, angle, speed persistence ✅
  - World seed persistence ✅
  - Game settings (perspective, zoom) persistence ✅

### 6. Obstacles and Collision Detection ✅ (COMPLETED)
- **Current Status:** Collision detection system fully implemented
- **Implemented Features:**
  - Collision detection between player and world objects (trees, rocks) ✅
  - Solid obstacles that block player movement ✅
  - Collision detection works in both perspective modes ✅
  - Visual feedback for collision (debug circles) ✅
  - Support for different collision types (solid, passable) ✅
  - Spatial partitioning for efficient collision detection ✅
- **Collision System:**
  - Circular collision detection with configurable radii ✅
  - Player collision radius: 15px (configurable) ✅
  - Tree collision radius: 18px ✅
  - Rock collision radius: 12px ✅
  - Spatial grid optimization for performance ✅
  - Console commands for collision management ✅
  - Debug visualization with collision circles ✅
  - Toggle collision detection on/off ✅

### 7. Responsive Full-Screen Canvas System ✅ (COMPLETED)
- **Current Status:** Responsive canvas system fully implemented
- **Implemented Features:**
  - Canvas takes up entire browser window when maximized ✅
  - Responsive to viewport size changes (window resize, dev tools, etc.) ✅
  - Maintains gaming aspect ratios (16:9 or 4:3) regardless of viewport ✅
  - Canvas size adjusts but game world view remains consistent ✅
  - Proper rendering with aspect ratio constraints ✅
  - Black bars when viewport doesn't match target aspect ratio ✅
  - Smooth transitions during resize events ✅
- **Responsive System:**
  - Automatic canvas sizing based on viewport dimensions ✅
  - Aspect ratio preservation with black bars ✅
  - Debounced resize events for performance ✅
  - Support for multiple aspect ratios (16:9, 4:3, 21:9) ✅
  - Console commands for canvas management ✅
  - Minimum and maximum size constraints ✅
  - Centered canvas positioning ✅

### 8. Console Commands and Developer Tools ✅ (COMPLETED)
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

### 9. Basic UI System ✅ (COMPLETED)
- **Chat & Command Input Bar:**
  - Pressing the `Enter` key opens a text input bar at the bottom of the screen, similar to MMORPGs (e.g., World of Warcraft). ✅
  - While the input bar is open, all kegit sy presses are captured as text input and do not trigger game world actions. ✅
  - Submitting the input (by pressing `Enter` again):
    - If the text starts with `/`, it is interpreted as a console command and executed via the command system.  ✅
    - If the text does not start with `/`, it is considered as the character "speaking" in the game world (for now, this is a placeholder; in the future, this could display as a speech bubble above the character or trigger interactions with NPCs/entities). ✅
  - Closing the input bar (e.g., pressing `Escape`) returns control to normal game input. ✅
  - Command history with Up/Down arrow navigation ✅
  - Configurable history size with localStorage persistence ✅
- **Inventory System:**
  - Inventory toggle with `B` key ✅
  - Grid-based inventory layout (configurable, default 5x5) ✅
  - Click detection for inventory slots ✅
  - Visual feedback for hover and selection ✅
  - Inventory state management (open/closed) ✅
  - Configurable grid size (3x3 to 10x10) ✅
  - Console commands for inventory management ✅
  - Positioned at bottom-right of screen (leaving space for action bars) ✅
  - Configurable opacity for inventory background ✅
  - Configurable opacity for item icons (placeholder for future) ✅
  - Press `B` again to close inventory ✅
- **Action Bar System:**
  - 10-slot action bar at bottom of screen ✅
  - Number keys 1-0 to trigger slots ✅
  - Mouse click support for slot activation ✅
  - Visual feedback for hover and click ✅
  - Configurable slot count (5-20) ✅
  - Support for future item/spell binding ✅
  - Responsive scaling based on viewport size ✅
  - Console commands for action bar management ✅

### 10. Action Bar Implementation ✅ (COMPLETED)
- **Current Status:** Dual action bar system with macro support fully implemented
- **Implemented Features:**
  - Dual 10-slot action bars at bottom-left corner ✅
  - Primary action bar: Number keys 1-0 to trigger slots ✅
  - Secondary action bar: Shift+Number keys 1-0 to trigger slots ✅
  - Mouse click support for slot activation ✅
  - Visual feedback for hover and temporary click/key press ✅
  - Configurable slot count ✅
  - Full macro system with command-based creation and management ✅
  - Dynamic icon generation for macros ✅
  - Macro binding to action bar slots ✅
- **Action Bar System:**
  - Dual action bars positioned at bottom-left corner ✅
  - Responsive scaling based on viewport size ✅
  - Visual feedback for hover and temporary active states ✅
  - Number key activation (1-0 keys) for primary bar ✅
  - Shift+Number key activation (Shift+1-0) for secondary bar ✅
  - Mouse click activation with proper scaling ✅
  - Configurable opacity and styling with lower opacity empty cells ✅
  - Console commands for action bar management ✅
  - Inventory positioned to avoid overlapping with dual action bars ✅
  - Temporary highlighting (only during mouse press or key hold) ✅
- **Macro System:**
  - Command-based macro creation (`/macro create name=command`) ✅
  - Dynamic PNG icon generation with random shapes and colors ✅
  - localStorage persistence for macro data and icons ✅
  - Macro placement in action bar slots (`/macro place bar-slot macroName`) ✅
  - Macro execution when action bar slots are activated ✅
  - Example: "perspective" macro bound to Shift+0 (secondary action bar slot 10) ✅

### 11. Crafting UI and Recipe System
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

### 12. Macro Management UI System (NEW)

**Extensibility Note:**
- The action bar binding system must be designed to support more than just macros in the future.
- It should allow binding spells, abilities, consumable items, and custom player controls (e.g., auto-run, open inventory, open quests dialog, toggle lock-action bars, etc.).
- The data model for bindings should be flexible enough to store different types of actions (macros, spells, items, controls, etc.).
- The invocation system should be extensible: currently it only invokes commands, but in the future it must be able to invoke spells, use items (showing item icons and greying out if unavailable), and trigger custom control actions.
- The UI should be able to display the correct icon and state for each binding type (e.g., item icons, spell icons, macro icons, greying out if not usable).

**Overview:**
- Introduce a visual macro management system accessible via the `/macro` command or a UI button.
- Users can create, edit, delete, and bind macros through a pop-up grid UI similar to the inventory.

**UI/UX Requirements:**
- Macro grid UI:
  - Launched from `/macro` command or UI button.
  - Grid layout, each cell is a macro slot (empty or filled).
  - Clicking an empty cell opens a macro creation dialog.
  - Clicking a filled cell opens an edit dialog for that macro.
- Macro creation dialog:
  - Input for macro name (required, unique). When this component has the focus, inputs should be blocked for movement and keybinds.
  - Input for macro command (required). When this component has the focus, inputs should be blocked for movement and keybinds.
  - PNG icon upload (with preview, not saved until macro is saved).
  - Button to generate a random icon (uses existing random icon logic, previewed but not saved until macro is saved).
  - Save button to create macro and persist to localStorage.
- Macro edit dialog (acceissible after clicking on an existing macro in the macro gird):
  - Edit name, command, or icon (upload or randomize).
  - Delete macro button.
  - Bind to action bar:
    - Dropdown to select action bar name.
    - Dropdown to select slot (populated based on selected bar).
    - If a slot is already bound, new macro replaces the old one.
  - Save changes button.
- Macro deletion:
  - Deleting a macro does not automatically remove its action bar binding; orphaned bindings are allowed.
  - If a macro is deleted, action bar slot may show missing icon or error on use (acceptable for now).

**Implementation Steps:**
1. Add `/macro` command to open the macro management UI.
2. Implement macro grid UI (modal/pop-up, similar to inventory grid).
3. Implement macro creation dialog:
   - Name, command, PNG upload, random icon, preview, save.
4. Implement macro edit dialog:
   - Edit/delete macro, change icon, rebind to action bar slot.
5. Integrate with existing macro storage and action bar binding logic.
6. Ensure all macro data (including icon) is only saved to localStorage on save.
7. Allow preview of uploaded or generated icon before saving.
8. Update documentation and help commands to reflect new macro UI system.

**Testing Requirements:**
- [ ] Macro grid UI opens from `/macro` command or button.
- [ ] Empty cell click opens creation dialog; filled cell click opens edit dialog.
- [ ] PNG upload and random icon generation work and preview correctly.
- [ ] Macros can be created, edited, deleted, and bound to action bar slots.
- [ ] Macro data is only saved on explicit save.
- [ ] Deleting a macro does not break the game if its slot is still bound.

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

### 3. `persistence.js` ✅ (COMPLETED)
- **Purpose:** Game state persistence and loading
- **Contents:**
  - localStorage save/load functions ✅
  - Periodic state snapshot system ✅
  - Game tick persistence ✅
  - State restoration on game start ✅

### 4. `collision.js` ✅ (COMPLETED)
- **Purpose:** Collision detection and spatial query system
- **Contents:**
  - Collision detection algorithms ✅
  - Spatial partitioning (simple grid-based for now) ✅
  - Collision response handling ✅
  - Support for different object types ✅
  - Circular collision detection with configurable radii ✅
  - Spatial grid optimization for performance ✅
  - Debug visualization system ✅
  - Console command integration ✅

### 5. `responsiveCanvas.js` ✅ (COMPLETED)
- **Purpose:** Responsive full-screen canvas system
- **Contents:**
  - Viewport-responsive canvas sizing ✅
  - Aspect ratio preservation with black bars ✅
  - Debounced resize event handling ✅
  - Multiple aspect ratio support (16:9, 4:3, 21:9) ✅
  - Canvas centering and positioning ✅
  - Size constraints and validation ✅
  - Console command integration ✅

### 6. `ui.js`
- **Purpose:** User interface management
- **Contents:**
  - Inventory UI rendering and logic
  - Action bar rendering and interaction
  - Crafting UI rendering and logic
  - UI state management
  - Click detection and event handling

### 7. `items.js`
- **Purpose:** Item system and management
- **Contents:**
  - Item definitions and properties
  - Inventory management
  - Item spawning and collection
  - Item rendering (shapes for now, sprites later)

### 8. `crafting.js`
- **Purpose:** Crafting system and recipes
- **Contents:**
  - Recipe definitions
  - Crafting logic and validation
  - Material requirements checking
  - Crafting success/failure handling

### 9. `console.js` ✅ (COMPLETED)
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

### Collision Testing ✅ (COMPLETED)
- [x] Player cannot move through solid obstacles
- [x] Collision works correctly in both perspective modes
- [x] Collision detection is efficient (no performance issues)
- [x] Visual feedback for collision (optional)

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
- [x] Collision detection prevents movement through obstacles
- [ ] Console commands work for teleporting, restarting, and viewing stats ✅
- [ ] Inventory can be opened/closed with `B` key
- [ ] Action bar responds to number keys 1-0

### Full Step 2 Completion
- [ ] All world structure features implemented and tested
- [ ] Complete procedural generation with grass tiles
- [ ] Full persistence system with periodic saving
- [x] Complete collision detection system
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

---

## Entity Rendering, Sprites, and Hitboxes (Planned for Step 3)

### Per-Entity Rendering Mode
- There is no longer a global RENDER_MODE. Each entity (player, tree, rock, grass, etc.) can independently be rendered as a shape or a sprite (PNG).
- The rendering method (shape or sprite) is a property of the entity, not a global setting.

### Hitbox & Collision Decoupling
- Collision detection is independent of the visual representation.
- Each entity has a configurable hitbox (size, shape, and type: circle, rectangle, etc.).
- The hitbox can be set to match the PNG dimensions, the shape, or be custom.
- Grass and similar entities do NOT block movement, but may need a clickable/collision area for harvesting or interaction in the future.

### Pre-rendering for Shapes
- If an entity uses a shape (draw method), the result should be pre-rendered to an offscreen canvas (in-memory, not localStorage).
- This pre-rendered image is then drawn to the main canvas, improving performance.
- All entities of the same type (e.g., all grass blades) can share the same pre-rendered image if their shape is identical.

### Sprite/PNG Support
- Entities can specify a PNG image to use as their sprite.
- The player’s character should support uploading a PNG to use as their appearance (instead of the triangle).
- In the future, the player’s image should be dynamically composable (e.g., add a hat, change armor color, show a staff, etc.).
- The system should support loading the correct image based on the player’s character selection and equipment.

### No World Item Drops
- There are no plans to support dropping items in the world (to avoid lag).
- Loot, chests, and trade windows will handle item transfers.

### Grass and Non-blocking Entities
- Grass does not impede movement (no collision for movement).
- Grass and similar entities may need a clickable area for future harvesting/interactions, but this is separate from the movement collision system.

### Implementation Steps (Planned)
1. Entity Rendering Refactor: Remove global RENDER_MODE, add per-entity renderType and sprite/drawShape properties.
2. Pre-rendering System: Implement offscreen canvas pre-rendering for shape-based entities, cache and reuse images.
3. Hitbox System: Add hitbox property to all entities, ensure collision uses hitbox not visual.
4. Player PNG Upload: Add support for uploading a PNG for the player character, use for rendering.
5. Clickable Areas: Add support for defining clickable areas for entities like grass.
6. Documentation: Update requirements and design docs with these details.