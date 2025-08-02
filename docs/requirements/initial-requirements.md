# Game Development Requirements Document

This document defines the functional, architectural, and development requirements for building a 2D top-down browser-based game. This serves as the foundational reference for iterative implementation, task scoping, and architectural decisions.

---

## 📋 Meta Requirements for AI Agent (Cursor)

* **Iterative Implementation Required**: ✅
* **Respect Development Phases**: ✅
* **Checklist Tracking**: ✅
* **Preserve Modularity**: Partial (some files are large and need further modularization)
* **Expose Debug APIs**: ✅
* **Highlight Deferred Features**: ✅
* **Documentation Maintenance**: ✅
* **Documentation Opportunities**: ✅

---

## 🎮 Game Overview

### Basic Concept

* Top-down 2D browser-based RPG game. ✅
* Inspired by *World of Warcraft*, *Realm of the Mad God*, and *Necesse*. ✅
* Player character is always facing "up" on the screen, and the world rotates relative to character's orientation. ✅

---

## 🎮 Core Gameplay Features

### Character Movement

* `W` = walk forward in facing direction. ✅
* `S` = walk backward. ✅
* `A` / `D` = rotate character (and world) left/right. ✅
* `Shift+A` / `Shift+D` = strafe left/right. ✅
* `Q` / `E` = strafe forward-left and forward-right (diagonals). ✅
* Movement speed adjustable via variable. ✅
* **Frame-rate independent motion**: ✅
* **Combination movement**: ✅

### Perspective

* Player always rendered as facing up; world rotates around player. ✅
* Sprites and canvas objects handle perspective rotation. ✅
* Support both fixed-north and player-perspective camera modes. ✅

### Collision

* Solid objects (trees, cliffs, rocks, walls) block character movement. ✅
* No collision with NPCs or other characters initially. ✅
* Efficient system for spatial queries (spatial grid, not quadtree). ✅

---

## 🧠 Engine Architecture

### File Organization

* `index.html`: main HTML file ✅
* `main.js`: initializes the game ✅
* `gameEngine.js`: core logic ✅
* `gameLoop.js`: update/render loop ✅
* `input.js`: keyboard & mouse input handling ✅
* Other modules: `ui/`, `inventory.js`, etc. (modular, but some files are large and need further splitting) 🟡

### Canvas System

* Use `<canvas>` for rendering game world and UI. ✅
* Support both primitive shape drawing and sprites. ✅
* Animate sprites frame-by-frame per game loop tick. (Planned)

---

## 🧱 UI & Interaction

### Action Bar

* 10-slot action bar at bottom of screen (configurable). ✅
* Slots can be clicked or triggered with keys 1–0. ✅
* Support mouseover and click detection. ✅
* Dual action bars (primary and secondary) with macro support. ✅

### Inventory

* Opened with `B` key. ✅
* Grid layout (default 5x5, configurable). ✅
* Supports item clicking. ✅
* Dragging and advanced item management: (Planned)

### Crafting UI

* Shown from button inside inventory UI.
* Crafting menu lists 4 starter items:

### Macro Management UI



### Macro Management UI
* Visual macro management system accessible via UI. ✅
* Macro creation, editing, deletion, icon upload/generation, action bar binding. ✅
* Macro data saved to localStorage. ✅

---

## 🏗️ World, Building & NPCs

### World Structure & Wrapping

* **World Wrapping**: Finite rectangular area that wraps at edges. ✅
* World size: Configurable, traversable in 10-15 seconds. ✅

### Procedural Generation & Starting Position

* Deterministic starting position for each world seed. ✅
* Console command to restart game with new/random seed. ✅

### World Background & Visual Feedback

* Background texture for visual feedback. ✅
* Dots pattern rendered on canvas. ✅

### World Loading & Procedural Generation

* World divided into chunks; only nearby chunks loaded. ✅
* Deterministic, hash-based procedural generation. ✅
* Chunks pregenerated and cached before rendering. ✅
* Chunk cache uses localStorage for persistence. ✅
* Overlaying player modifications: (Planned)

### Resource Tiles & World Objects

* Grass, trees, rocks placed deterministically. ✅
* Grass tiles: visually distinct, non-interactive (Step 2). ✅
* Harvesting, removal, and placement: (Planned)

### World State Persistence

* Game state periodically saved to localStorage. ✅
* Player position and world seed persisted. ✅
* World state changes (harvesting, destruction): (Planned)
* Singleton timeout for periodic state snapshots. ✅

### Building System

* Player can place walls, floors, doors, etc.: (Planned)
* Tier-based materials: (Planned)
* Buildings have durability: (Planned)

### NPC Housing

* Room requirements, NPCs join/leave: (Planned)

---

## ⚔️ Combat System

* Tab-targeting, spells, auto-attacks, status effects: (Planned)

---

## 🕐 Time Systems

* Day/night cycle, game cycles: (Planned)

---

## 🧪 Developer Tooling

* Console-based debug commands: ✅
* Extensible command registry: ✅

---

## 🧬 Character System

* Position, orientation, speed, size: ✅
* Player rendered as triangle (default): ✅
* Custom player PNG upload: (Planned)

---

## 🖼️ Entity Rendering & Caching (NEW)

* Per-entity render mode (shape/sprite): ✅
* Async preloading and robust caching (in-memory + localStorage): ✅
* Skins UI for managing entity images, render modes, and metadata: ✅
* Metadata support (size, angle, offsets): ✅
* Hitbox decoupling: Partial
* Player PNG upload: (Planned)
* Clickable areas for grass: (Planned)

---

## 🚧 Technical Debt & Refactor Opportunities

* Entities (grass, trees, rocks) are not proper classes; extending behavior is not DRY
* Some logic is duplicated across files
* Some files are too long and need splitting/modularization
* Homegrown module system; initialization is spread across files and not fully orchestrated from `init.js`
* UI components (inventory, macro, skins) could be more modular and reusable
* No automated tests; all testing is manual

---

## ✅ Summary

- Most foundational requirements are complete.
- Some features are partial or planned (see above).
- The codebase is robust, but further modularization and refactoring will improve maintainability and extensibility.
- See README for up-to-date status and roadmap.

