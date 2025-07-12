# Game Development Requirements Document

This document defines the functional, architectural, and development requirements for building a 2D top-down browser-based game. This will serve as the foundational reference for the AI development assistant (Cursor), and must guide iterative implementation, task scoping, and architectural decisions.

---

## 📋 Meta Requirements for AI Agent (Cursor)

* **Iterative Implementation Required**: Do *not* attempt to implement all game features in one go. Each commit/task should reflect a single contained milestone.
* **Respect Development Phases**: Features should be implemented in the order of basic engine → controls → rendering → UI → gameplay systems → content.
* **Checklist Tracking**: Use this document as a dynamic checklist. Once a requirement is implemented, it should be marked as complete (by human or agent).
* **Preserve Modularity**: Maintain logical modularity across files. Do not cram all logic into one JS file.
* **Expose Debug APIs**: Ensure developer tools are available in the browser console for every major system.
* **Highlight Deferred Features**: Mark any long-term features that are stubbed or partially implemented clearly in the codebase.
* **Documentation Maintenance**: Proactively maintain and update documentation as features are implemented:
  * Keep step-by-step requirement documents current with completion status
  * Create dedicated documentation files for user-facing features (e.g., COMMANDS.md, CONTROLS.md)
  * Update README.md with current project status and quick start information
  * Document API interfaces and system interactions
  * Provide examples and usage patterns for all major features
* **Documentation Opportunities**: Look for opportunities to create dedicated documentation files when:
  * New command systems are implemented
  * New UI systems are added
  * New game mechanics are introduced
  * Configuration options become available
  * Debug tools are added

---

## 🎮 Game Overview

### Basic Concept

* Top-down 2D browser-based RPG game.
* Inspired heavily by *World of Warcraft*, *Realm of the Mad God*, and *Necesse*.
* Player character is always facing "up" on the screen, and the world rotates relative to character's orientation.

---

## 🎮 Core Gameplay Features

### Character Movement

* `W` = walk forward in facing direction.
* `S` = walk backward.
* `A` / `D` = rotate character (and world) left/right.
* `Shift+A` / `Shift+D` = strafe left/right.
* `Q` / `E` = strafe forward-left and forward-right (diagonals).
* Movement speed should be adjustable via a variable and later influenced by in-game factors.
* **Frame-rate independent motion**: All movement and animation must be time-delta based to ensure consistent speed regardless of frame rate.
* **Combination movement**: When moving in multiple directions (e.g., forward and strafing right), the resulting movement vector must be normalized so that the player's top speed is not exceeded (i.e., diagonal movement is not faster than straight movement).

### Perspective

* The player is always rendered as facing up; the game world rotates around the player.
* Sprites and canvas objects must handle perspective rotation.
* Some objects (trees, cliffs) use fixed-north render styles; others (bushes, ground clutter) appear truly top-down.
* **The game must support both fixed-north and player-perspective camera modes. It should be possible to switch between these modes via a variable (for debugging or player preference).**

### Collision

* Solid objects (trees, cliffs, rocks, walls) must block character movement.
* No collision with NPCs or other characters initially.
* Use an efficient system for spatial queries (quadtree or similar can be added later).

---

## 🧠 Engine Architecture

### File Organization

* `index.html`: main HTML file
* `main.js`: initializes the game
* `gameEngine.js`: core logic
* `gameLoop.js`: update/render loop
* `input.js`: keyboard & mouse input handling
* Other modules can be added later (`ui.js`, `inventory.js`, etc.)

### Canvas System

* Use `<canvas>` for rendering game world and UI as needed.
* Support both primitive shape drawing (rect, circle, line) and sprites.
* Animate sprites frame-by-frame per game loop tick.

---

## 🧱 UI & Interaction

### Action Bar

* 10-slot action bar at bottom of screen (number configurable).
* Slots can be clicked or triggered with keys 1–0.
* Support mouseover and click detection.

### Inventory

* Opened with `B` key.
* Grid layout (default configurable, e.g., 5x5).
* Supports item clicking, dragging (TBD), and future expansion (via bags, upgrades).

### Crafting UI

* Shown from button inside inventory UI.
* Crafting menu lists 4 starter items:

  * Crafting Table
  * Torch
  * Furnace
  * Wooden Spear
* Additional crafting stations unlock more recipes:

  * Crafting Table → tools & weapons
  * Forge, Anvil, Stove, etc. unlock tiers like stone/iron/diamond.
* Recipes, tiers, and tool effectiveness must be extensible.

---

## 🏗️ World, Building & NPCs

### World Structure & Wrapping

* **World Wrapping**: The game world is a finite rectangular area that wraps around at the edges.
  * Moving east eventually leads to the west side of the world.
  * Moving west eventually leads to the east side of the world.
  * Moving north eventually leads to the south side of the world.
  * Moving south eventually leads to the north side of the world.
  * Initial world size should be small enough that a player can traverse from edge to edge in approximately 10-15 seconds at normal movement speed.
  * World size should be configurable and expandable for future development.

### Procedural Generation & Starting Position

* **Deterministic Starting Position**: For each world seed, the procedural generation algorithm must deterministically select a starting position for the player.
  * The starting position should be chosen so that the initial grid (with the red 'X') is visible to the player.
  * Starting position should be consistent across game sessions with the same seed.
  * Console command to restart the game with a new random seed.
  * Future: Menu system for seed selection and character creation.

### World Background & Visual Feedback

* **Background Texture**: The entire playable world must have a background texture to provide visual feedback for player movement.
  * When a world tile lacks any objects or tiles, it should display a background texture instead of the void of the black canvas.
  * Background texture should be simple and lightweight (e.g., dots pattern rendered on canvas).
  * Texture should be consistent across the entire world to provide relative motion reference.
  * Background texture is purely aesthetic and does not require complex procedural generation.

### World Loading & Procedural Generation

* The world must be divided into **chunks**; only chunks near the player are loaded into memory at any time.
* The entire game world must support **true procedural generation**:
  * World generation is deterministic, based on a seed and consistent hashing—no random number generation at runtime.
  * Chunks are pregenerated and cached before the player enters their view (preloading to avoid pop-in).
  * Cached chunks must be invalidated and removed from memory/cache when far from the player.
  * Since the world is editable (e.g., buildings, harvesting, collecting, destruction, entities and creatures which perish, etc.), the chunk cache must support overlaying player modifications on top of procedural data.
  * Chunk caching should utilize the browser's localStorage for persistence.

### Resource Tiles & World Objects

* **Grass Tiles**: Procedural generation should place grass tiles at deterministic coordinates throughout the world.
  * Grass tiles should be harvestable resources (later called "grass-patch" in inventory).
  * Grass tiles should be removable and placeable by players (requires tools like shovels).
  * Grass tile (and in later iterations this will also apply to tree chopping, rock breaking, etc.) placement and removal must be part of world state determination logic before render time (i.e. either loaded from in memory cache objects or localStorage (on browser refresh) or generated as needed and the persistent changes (if any) applied and then recahced before render time)
  * Grass tiles should be visually distinct from background texture.

* **World Objects**: Procedural generation should place various objects:
  * Trees, rocks, and other natural obstacles.
  * NPCs and creatures (rabbits, etc.).
  * All objects should be deterministically placed based on world seed.
  * Objects should be harvestable, destructible, or interactive based on their type.

### World State Persistence

* **Local Storage Persistence**: Game state must be periodically saved to browser localStorage.
  * Player position and world seed should be persisted (Step 2).
  * World state changes (harvested resources, destroyed objects) should be persisted (later steps).
  * Game world tick number should be persisted to resume exactly where left off.
  * Singleton timeout function for periodic state snapshots to localStorage.

* **Future Server Architecture**: Design should support future client-server model:
  * Server as source of truth for world state.
  * Persistent database storage with configurable write intervals.
  * Streaming architecture (Kafka/Redis Streams) for state change events.
  * ACID transactions for critical items (PostgreSQL).  Potentially leveraging Postgres over Kafka where possible (ideal achitecture is supported by redis and postgres only)
  * Non-persistent streams for respawning resources (berries, etc.).
  * Client-side caching and messaging patterns that can port to server-client model.

### Building System

* Player can place walls, floors, doors, furniture, light sources.
* Tier-based materials (e.g., wood, stone, iron).
* Buildings have durability and strength properties.

### NPC Housing

* Like Terraria/Necesse:

  * Room = enclosed by walls, has floor, door, bed, chair, light.
  * Configurable requirements for room suitability.
  * NPCs join if room is suitable and eventually leave if it becomes unsuitable.
  * Timer/delay for moving out is configurable.

---

## ⚔️ Combat System

* Tab-targeting system.
* Spells can have cast times, cooldowns, AoEs.
* Auto-attacks (melee and ranged).
* Actions trigger animated sprites or particle effects.
* Should be extensible for status effects, cooldowns, resistances, etc.

---

## 🕐 Time Systems

* Real-time day/night cycle.
* Weekly, monthly, and yearly game cycles.
* Cycles should influence gameplay elements (light levels, events, NPC behavior) later.

---

## 🧪 Developer Tooling

* Console-based debug commands (via browser devtools):

  * `teleport(x, y)`
  * `setSpeed(value)`
  * `printPlayerStats()`
  * `spawnItem("torch")`
  * `restartGame(seed)` - Restart with new seed
  * `setZoom(value)`
  * `togglePerspective()`
* Easily extensible command registry.

---

## 🧬 Character System

* RPG-style attributes: strength, agility, intelligence, etc.
* Affects combat stats, crafting ability, movement speed, etc.
* Progression system TBD.
* Character creation and naming system (future).
* Character and world selection/launch menu to staring game (future) after a browser refresh.
* Starting classes or attribute selection like DnD with point spread (future).

---

## 🛠️ Deferred Features (Not for Early Implementation)

Mark these as placeholders or TODOs:

* Multiplayer support
* Quest system
* Advanced procedural terrain generation
* Mob spawning and AI
* Farming / fishing / cooking systems
* Mounts / taming
* Weather
* Mini-map / compass
* Equipment / armor slots
* Dialogue / NPC shops
* World map & fast travel
* Configurable mods/plugins
* Resource harvesting tools (shovels, axes, etc.)
* Advanced world state management
* Server-client architecture implementation

---

## ✅ First Iteration Checklist

Cursor should prioritize the following tasks before moving to advanced features:

1. Set up file structure (`index.html`, `main.js`, `gameEngine.js`, `input.js`, `gameLoop.js`)
2. Implement basic canvas setup and game loop
3. Add character with top-down movement and rotation controls
4. Implement world-relative rendering (character always "up")
5. Allow switching between shape-based and sprite-based rendering
6. Add basic obstacle and collision detection
7. Implement console commands for teleporting and stat changes
8. Add basic UI with inventory toggle and click detection
9. Implement action bar with 10 slots and keybindings
10. Add crafting UI and recipes for 4 starter items

Once this is complete, proceed to:

* Animation systems
* Resource gathering and crafting expansion
* Building placement
* Tiered crafting & equipment
* Combat & spells

### World Coordinate System & Procedural Generation

* The game world uses a coordinate grid system; each tile is the smallest unit of world coordinates.
* Sub-tile rendering is supported: multiple small objects (e.g., apples) can be rendered within a single tile using a sub-coordinate system (e.g., quarters of a tile).
* Procedural generation logic must, for each world seed, place a red 'X' at the player's starting coordinates.
* The rendering system must support geometric shapes, sprites, and text at any position in the world.

### Camera & Input Enhancements

* The game must support zooming in and out with the mouse scroll wheel, with upper and lower zoom limits.
* The default browser right-click context menu must be disabled on the game canvas.
* Input should be robust to browser focus changes (e.g., releasing keys when focus is lost to prevent stuck movement/rotation).

