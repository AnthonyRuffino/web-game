# Step 3: Entity Rendering, Sprites, and Hitboxes

## Overview

This step introduces a flexible, per-entity rendering system for the game world. Each entity (player, tree, rock, grass, etc.) can be rendered as a shape or a sprite (PNG), with configurable hitboxes and support for pre-rendering shapes for performance. The player character will support custom PNG uploads, and the groundwork will be laid for dynamic equipment visuals in the future.

---

## Per-Entity Rendering Mode
- There is no longer a global RENDER_MODE. Each entity (player, tree, rock, grass, etc.) can independently be rendered as a shape or a sprite (PNG).
- The rendering method (shape or sprite) is a property of the entity, not a global setting.

## Hitbox & Collision Decoupling
- Collision detection is independent of the visual representation.
- Each entity has a configurable hitbox (size, shape, and type: circle, rectangle, etc.).
- The hitbox can be set to match the PNG dimensions, the shape, or be custom.
- Grass and similar entities do NOT block movement, but may need a clickable/collision area for harvesting or interaction in the future.

## Pre-rendering for Shapes
- If an entity uses a shape (draw method), the result should be pre-rendered to an offscreen canvas (in-memory, not localStorage).
- This pre-rendered image is then drawn to the main canvas, improving performance.
- All entities of the same type (e.g., all grass blades) can share the same pre-rendered image if their shape is identical.

## Sprite/PNG Support
- Entities can specify a PNG image to use as their sprite.
- The player’s character should support uploading a PNG to use as their appearance (instead of the triangle).
- In the future, the player’s image should be dynamically composable (e.g., add a hat, change armor color, show a staff, etc.).
- The system should support loading the correct image based on the player’s character selection and equipment.

## No World Item Drops
- There are no plans to support dropping items in the world (to avoid lag).
- Loot, chests, and trade windows will handle item transfers.

## Grass and Non-blocking Entities
- Grass does not impede movement (no collision for movement).
- Grass and similar entities may need a clickable area for future harvesting/interactions, but this is separate from the movement collision system.

---

## Implementation Steps (Planned)
1. Entity Rendering Refactor: Remove global RENDER_MODE, add per-entity renderType and sprite/drawShape properties.
2. Pre-rendering System: Implement offscreen canvas pre-rendering for shape-based entities, cache and reuse images.
3. Hitbox System: Add hitbox property to all entities, ensure collision uses hitbox not visual.
4. Player PNG Upload: Add support for uploading a PNG for the player character, use for rendering.
5. Clickable Areas: Add support for defining clickable areas for entities like grass.
6. Documentation: Update requirements and design docs with these details.

---

## Detailed Breakdown and Task List

### Step 1: Entity Rendering Refactor
**Goal:** Remove global RENDER_MODE and add per-entity rendering properties.

#### 1.1 Remove Global RENDER_MODE
- **File:** `core/gameEngine.js`
- **Task:** Remove the global `RENDER_MODE` variable and all references to it.
- **Details:** 
  - Delete `const RENDER_MODE = 'shape';` line
  - Remove any conditional rendering logic based on global RENDER_MODE

#### 1.2 Add Entity Rendering Properties
- **Files:** `core/gameEngine.js`, `core/world.js`
- **Task:** Add `renderType` and `sprite` properties to all entities.
- **Details:**
  - Add `renderType: 'shape' | 'sprite'` property to Player object
  - Add `sprite: Image | null` property to Player object
  - Add `renderType` and `sprite` properties to world entities (trees, rocks, grass)
  - Update entity creation in `generateChunk()` to include these properties

#### 1.3 Update Entity Draw Methods
- **Files:** `core/gameEngine.js`, `core/world.js`
- **Task:** Modify entity draw methods to check `renderType` and render accordingly.
- **Details:**
  - Update `Player.render()` to check `renderType` and draw sprite or shape
  - Update world entity draw functions to check `renderType`
  - Add fallback to shape rendering if sprite is not available

### Step 2: Pre-rendering System
**Goal:** Implement offscreen canvas pre-rendering for shape-based entities.

#### 2.1 Create Pre-rendering Manager
- **File:** `core/preRendering.js` (new file)
- **Task:** Create a system to pre-render shapes to offscreen canvases.
- **Details:**
  - Create `PreRenderingManager` class
  - Implement cache for pre-rendered images using entity type as key
  - Add methods to render shape to offscreen canvas and return image data
  - Add cleanup methods for memory management

#### 2.2 Integrate Pre-rendering with Entity System
- **Files:** `core/gameEngine.js`, `core/world.js`
- **Task:** Modify entity rendering to use pre-rendered images for shapes.
- **Details:**
  - Check if entity type has pre-rendered image in cache
  - If not, create pre-rendered image and cache it
  - Draw pre-rendered image instead of calling shape draw method
  - Handle cases where shape parameters vary (e.g., different grass blade angles)

#### 2.3 Performance Optimization
- **File:** `core/preRendering.js`
- **Task:** Optimize pre-rendering for performance and memory usage.
- **Details:**
  - Implement LRU cache for pre-rendered images
  - Add size limits to prevent memory bloat
  - Add debug logging for cache hits/misses
  - Consider different cache strategies for static vs. dynamic entities

### Step 3: Hitbox System
**Goal:** Add configurable hitbox property to all entities, decoupled from visuals.

#### 3.1 Define Hitbox Structure
- **File:** `core/hitbox.js` (new file)
- **Task:** Create hitbox system with different types and configurations.
- **Details:**
  - Define `Hitbox` class with types: 'circle', 'rectangle', 'none'
  - Add properties: type, width, height, radius, offsetX, offsetY
  - Add methods for hitbox calculations and collision detection
  - Support for clickable areas separate from movement collision

#### 3.2 Update Entity Definitions
- **Files:** `core/gameEngine.js`, `core/world.js`
- **Task:** Add hitbox property to all entities.
- **Details:**
  - Add `hitbox` property to Player object
  - Add `hitbox` property to world entities (trees, rocks, grass)
  - Set appropriate default hitboxes for each entity type
  - Trees/rocks: circular hitboxes for movement collision
  - Grass: no movement collision, but clickable area for future harvesting

#### 3.3 Update Collision System
- **File:** `core/collision.js`
- **Task:** Modify collision detection to use entity hitboxes instead of visual properties.
- **Details:**
  - Update `checkPositionCollision()` to use entity hitbox property
  - Add support for different hitbox types (circle, rectangle)
  - Separate movement collision from interaction collision
  - Update spatial grid to use hitbox dimensions

### Step 4: Player PNG Upload
**Goal:** Add support for uploading a PNG for the player character.

#### 4.1 Create Player Sprite Manager
- **File:** `core/playerSprite.js` (new file)
- **Task:** Create system to manage player sprite images.
- **Details:**
  - Create `PlayerSpriteManager` class
  - Add methods to load and validate PNG images
  - Add support for different character types (future)
  - Add image scaling and validation

#### 4.2 Add PNG Upload UI
- **File:** `ui/playerCustomization.js` (new file)
- **Task:** Create UI for uploading and managing player sprites.
- **Details:**
  - Create file upload dialog for PNG selection
  - Add image preview functionality
  - Add validation for image dimensions and format
  - Add save/load functionality for player sprite preferences

#### 4.3 Integrate with Player Rendering
- **File:** `core/gameEngine.js`
- **Task:** Update Player.render() to use uploaded sprite.
- **Details:**
  - Modify Player.render() to check for uploaded sprite
  - Fall back to shape rendering if no sprite is available
  - Handle sprite scaling and positioning
  - Add support for sprite rotation (for player direction)

### Step 5: Clickable Areas for Non-blocking Entities
**Goal:** Add support for defining clickable areas for entities like grass.

#### 5.1 Extend Hitbox System
- **File:** `core/hitbox.js`
- **Task:** Add support for interaction hitboxes separate from movement collision.
- **Details:**
  - Add `interactionHitbox` property to Hitbox class
  - Add methods for interaction detection (clicking, harvesting)
  - Support for different interaction types (harvest, examine, etc.)

#### 5.2 Add Interaction System
- **File:** `core/interaction.js` (new file)
- **Task:** Create system for handling entity interactions.
- **Details:**
  - Create `InteractionManager` class
  - Add methods for detecting clicks on entities
  - Add support for different interaction types
  - Add visual feedback for clickable entities

#### 5.3 Update World Entities
- **File:** `core/world.js`
- **Task:** Add interaction hitboxes to grass and other non-blocking entities.
- **Details:**
  - Add interaction hitboxes to grass entities
  - Set up placeholder interaction handlers for future harvesting
  - Add visual indicators for clickable entities (optional)

### Step 6: Documentation and Testing
**Goal:** Update documentation and ensure all systems work correctly.

#### 6.1 Update Documentation
- **Files:** `README.md`, `CONTROLS.md`, `COMMANDS.md`
- **Task:** Update documentation to reflect new rendering and hitbox systems.
- **Details:**
  - Update README.md with new entity rendering capabilities
  - Add documentation for PNG upload functionality
  - Update controls documentation for new interaction system
  - Add console commands for testing new features

#### 6.2 Add Console Commands
- **File:** `ui/console.js`
- **Task:** Add console commands for testing and debugging new systems.
- **Details:**
  - Add `setrender` command to change entity render type
  - Add `sethitbox` command to modify entity hitboxes
  - Add `uploadsprite` command for testing PNG upload
  - Add `preview` command to show entity hitboxes

#### 6.3 Testing and Validation
- **Task:** Test all new systems and ensure they work correctly.
- **Details:**
  - Test per-entity rendering (shape vs sprite)
  - Test pre-rendering performance improvements
  - Test hitbox collision detection accuracy
  - Test PNG upload and rendering
  - Test interaction system with non-blocking entities
  - Performance testing with multiple entities

---

## Implementation Order
1. **Step 1** (Entity Rendering Refactor) - Foundation for all other changes
2. **Step 3** (Hitbox System) - Required for proper collision detection
3. **Step 2** (Pre-rendering System) - Performance optimization
4. **Step 4** (Player PNG Upload) - User-facing feature
5. **Step 5** (Clickable Areas) - Interaction system
6. **Step 6** (Documentation and Testing) - Final polish

---

## Success Criteria
- [ ] All entities can be rendered as shapes or sprites independently
- [ ] Hitboxes are configurable and decoupled from visual representation
- [ ] Pre-rendering improves performance for shape-based entities
- [ ] Player can upload and use custom PNG sprites
- [ ] Non-blocking entities (grass) have clickable areas for future interactions
- [ ] All systems work correctly in both perspective modes
- [ ] Performance remains acceptable (60 FPS) with new rendering system 