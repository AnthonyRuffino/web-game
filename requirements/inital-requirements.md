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

### World Loading & Procedural Generation

* The world must be divided into **chunks**; only chunks near the player are loaded into memory at any time.
* The entire game world must support **true procedural generation**:
  * World generation is deterministic, based on a seed and consistent hashing—no random number generation at runtime.
  * Chunks are pregenerated and cached before the player enters their view (preloading to avoid pop-in).
  * Cached chunks must be invalidated and removed from memory/cache when far from the player.
  * Since the world is editable (e.g., buildings), the chunk cache must support overlaying player modifications on top of procedural data.
  * Chunk caching should utilize the browser's local cache/storage for persistence.

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
* Easily extensible command registry.

---

## 🧬 Character System

* RPG-style attributes: strength, agility, intelligence, etc.
* Affects combat stats, crafting ability, movement speed, etc.
* Progression system TBD.

---

## 🛠️ Deferred Features (Not for Early Implementation)

Mark these as placeholders or TODOs:

* Multiplayer support
* Quest system
* World saving/loading
* Procedural terrain generation
* Mob spawning and AI
* Farming / fishing / cooking systems
* Mounts / taming
* Weather
* Mini-map / compass
* Equipment / armor slots
* Dialogue / NPC shops
* World map & fast travel
* Save game system (browser local storage or server-backed)
* Configurable mods/plugins

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

