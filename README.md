# Web Game - 2D Top-Down RPG

A browser-based 2D top-down RPG inspired by *World of Warcraft*, *Realm of the Mad God*, and *Necesse*. Experience a procedurally generated world with exploration, resource gathering, crafting, and building systems.

## 🎮 Game Vision

**Ultimate Goal:** A fully-featured multiplayer RPG with persistent worlds, complex crafting systems, and dynamic player interactions.

### Core Gameplay
- **Exploration**: Procedurally generated, finite world with edge wrapping
- **Resource Gathering**: Harvest grass, wood, stone, and other materials
- **Crafting & Building**: Create tools, weapons, buildings, and crafting stations
- **Character Progression**: RPG-style attributes and skill development (planned)
- **Multiplayer Support**: Shared worlds with other players (future feature)
- **Flexible Rendering**: All entities (player, trees, rocks, grass, etc.) can be rendered as shapes or sprites (PNGs)
- **Configurable Hitboxes**: Hitboxes for collision and interaction are configurable and independent of the visual representation (partial)
- **Custom Player Sprites**: Player character can use a custom PNG image (planned)

### World Features
- **Procedural Generation**: Unique, deterministic worlds based on a seed
- **Dynamic Environment**: Resources respawn, weather, day/night cycles (planned)
- **Building System**: Construct houses, workshops, and settlements (planned)
- **NPCs & Housing**: Attract NPCs by building suitable housing (planned)
- **Flexible Entity Rendering**: All world objects can be rendered as shapes or sprites; hitboxes are decoupled from visuals for accurate collision and interaction

## 🚦 Current Status

### ✅ Implemented Features
- **Movement & Controls**: Smooth WASD movement, rotation, strafing
- **World Structure**: Finite rectangular world with edge wrapping
- **Visual Feedback**: Background texture system for movement reference
- **Camera System**: Dual perspective modes (fixed-north and player-perspective)
- **Zoom Controls**: Mouse wheel zoom with configurable limits
- **Console Commands**: Debugging and configuration tools
- **Collision Detection**: Solid obstacles and world boundaries
- **Basic UI**: Inventory, action bar, macro management, and skins UI
- **Crafting System**: 4 starter recipes (Crafting Table, Torch, Furnace, Wooden Spear)
- **Persistence**: Game state saved to browser localStorage
- **Entity Rendering System**: Per-entity render mode (shape/sprite), async preloading and caching (in-memory + localStorage), robust cache key hashing, metadata support
- **Skins UI**: Manage entity images, upload/delete/export/import skins, set per-entity render mode, edit metadata (size, angle, offsets)
- **Macro UI**: Visual macro management, icon upload/generation, action bar binding
- **Input Blocking**: Robust, focus-based input blocking for all UI dialogs

### 🟡 Partially Implemented / In Progress
- **Hitbox Decoupling**: Some entities have collision, but not a full hitbox system
- **UI Modularity**: Some UI components are modular (action bars), but others (inventory, macro, skins) could be further refactored for reuse
- **Entity System**: Entities are not yet proper classes; extending behavior is not DRY
- **Dependency Management**: Homegrown module system; initialization is spread across files and not fully orchestrated from `init.js`

### 🛣️ Immediate Roadmap
- **Resource Harvesting**: Tools and mechanics for gathering resources
- **Advanced World State**: Editable world, persistent changes
- **Animation & Visual Polish**: Entity and UI animations
- **Combat System**: Weapons, enemies, and combat mechanics
- **Multiplayer Foundation**: Networking and shared world state
- **Player PNG Upload**: Custom player sprites
- **Clickable Areas for Grass**: Interactable non-blocking entities
- **UI Refactor**: More modular, reusable UI components

## 📚 Documentation

- **[CONTROLS.md](CONTROLS.md)** - Player controls and mechanics
- **[COMMANDS.md](COMMANDS.md)** - Console commands and debugging tools
- **[requirements/initial-requirements.md](requirements/initial-requirements.md)** - Full game requirements and vision
- **[requirements/step-1-the-basics.md](requirements/step-1-the-basics.md)** - The basics
- **[requirements/step-2-advanced-features.md](requirements/step-2-advanced-features.md)** - Advanced Features
- **[requirements/step-3-entity-rendering.md](requirements/step-3-entity-rendering.md)** - Entity Rendering

## 🛠️ Technical Details

- **Engine**: Pure JavaScript with HTML5 Canvas
- **Architecture**: Modular design with separate systems for input, rendering, world management, UI, etc.
- **Performance**: 60 FPS target with frame-rate independent movement
- **Storage**: Browser localStorage for game state and cache persistence
- **Async Preloading**: All entity images/canvases are preloaded and cached (in-memory and localStorage) before world rendering
- **Future**: Designed for server-client architecture with PostgreSQL and Redis

## 🚧 Technical Debt & Refactor Opportunities

- **Entity Classes**: Grass, trees, rocks, etc. are not proper classes; extending behavior is not DRY
- **Repeated Logic**: Some logic is duplicated across files (e.g., entity rendering, UI event handling)
- **File Size & Modularity**: Some files are too long and should be split up and moved to the module system
- **Module System**: Homegrown dependency management; initialization is spread over multiple files and not orchestrated from `init.js`
- **UI Reuse**: UI components (inventory, macro, skins) do not share code; more modularization and reuse is needed
- **Testing**: No automated tests; all testing is manual

## 🎯 Multiplayer Vision

The game is architected to support:
- **Shared Worlds**: Multiple players in the same procedurally generated world
- **Real-time Interaction**: Live player movement and actions
- **Persistent State**: Server-side world state with client-side caching
- **Scalable Architecture**: Chunk-based world loading and streaming updates
- **ACID Transactions**: Critical items and progress protected by database transactions

## 🚧 Development Status

This is an active development project. Features are implemented iteratively with each step building upon the previous foundation. The current focus is on core gameplay systems, entity rendering, and UI modularity before expanding to multiplayer features.

---

*Built with ❤️ using modern web technologies*
