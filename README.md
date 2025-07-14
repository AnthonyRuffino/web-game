# Web Game - 2D Top-Down RPG

A browser-based 2D top-down RPG inspired by *World of Warcraft*, *Realm of the Mad God*, and *Necesse*. Experience a procedurally generated world with infinite exploration, resource gathering, crafting, and building systems.

## 🎮 Game Vision

**Ultimate Goal:** A fully-featured multiplayer RPG with persistent worlds, complex crafting systems, and dynamic player interactions.

### Core Gameplay
- **Infinite Exploration**: Procedurally generated worlds that wrap around at the edges
- **Resource Gathering**: Harvest grass, wood, stone, and other materials from the environment
- **Crafting & Building**: Create tools, weapons, buildings, and crafting stations
- **Character Progression**: RPG-style attributes and skill development
- **Multiplayer Support**: Shared worlds with other players (future feature)
- **Flexible Rendering**: All entities (player, trees, rocks, grass, etc.) can be rendered as shapes or sprites (PNGs).
- **Configurable Hitboxes**: Hitboxes for collision and interaction are configurable and independent of the visual representation. Grass and similar entities are non-blocking but may be interactable in the future.
- **Custom Player Sprites**: The player character can use a custom PNG image for appearance, with future support for dynamic equipment visuals.

### World Features
- **Procedural Generation**: Every world is unique based on a seed, but consistent across sessions
- **Dynamic Environment**: Resources respawn, weather changes, day/night cycles
- **Building System**: Construct houses, workshops, and entire settlements
- **NPCs & Housing**: Attract NPCs by building suitable housing for them
- **Flexible Entity Rendering**: Trees, rocks, grass, and all world objects can be rendered as shapes or sprites. Hitboxes are decoupled from visuals for accurate collision and interaction.

## �� Current Status

**Step 2 Complete** - The game now features a solid foundation with:

### ✅ Implemented Features
- **Movement & Controls**: Smooth WASD movement with rotation and strafing
- **World Structure**: Finite rectangular world with edge wrapping (10-15 second traversal)
- **Visual Feedback**: Background texture system for movement reference
- **Camera System**: Dual perspective modes (fixed-north and player-perspective)
- **Zoom Controls**: Mouse wheel zoom with configurable limits
- **Console Commands**: Comprehensive debugging and configuration tools
- **Collision Detection**: Solid obstacles and world boundaries
- **Basic UI**: Inventory system and action bar
- **Crafting System**: 4 starter recipes (Crafting Table, Torch, Furnace, Wooden Spear)
- **Persistence**: Game state saved to browser localStorage

### 🎯 Immediate Roadmap
- **Step 3**: Resource harvesting tools and mechanics
- **Step 4**: Advanced world state management
- **Step 5**: Animation systems and visual polish
- **Step 6**: Combat system implementation
- **Step 7**: Multiplayer foundation

## 🎮 Getting Started

1. **Open the Game**: Simply open `index.html` in your web browser
2. **Learn Controls**: See [CONTROLS.md](CONTROLS.md) for complete control guide
3. **Try Commands**: Press F12 and use `cmd("help")` to see available console commands
4. **Explore**: Use WASD to move, mouse wheel to zoom, and discover the world!

## 📚 Documentation

- **[CONTROLS.md](CONTROLS.md)** - Complete player control guide and game mechanics
- **[COMMANDS.md](COMMANDS.md)** - Console commands and debugging tools

- **[requirements/initial-requirements.md](requirements/initial-requirements.md)** - Full game requirements and vision
- **[requirements/step-1-the-basics.md](requirements/step-1-the-basics.md)** - The basics
- **[requirements/step-2-advanced-features.md](requirements/step-2-advanced-features.md)** - Advanced Features

## 🛠️ Technical Details

- **Engine**: Pure JavaScript with HTML5 Canvas
- **Architecture**: Modular design with separate systems for input, rendering, world management, etc.
- **Performance**: 60 FPS target with frame-rate independent movement
- **Storage**: Browser localStorage for game state persistence
- **Future**: Designed for server-client architecture with PostgreSQL and Redis

## 🎯 Multiplayer Vision

The game is architected to support:
- **Shared Worlds**: Multiple players in the same procedurally generated world
- **Real-time Interaction**: Live player movement and actions
- **Persistent State**: Server-side world state with client-side caching
- **Scalable Architecture**: Chunk-based world loading and streaming updates
- **ACID Transactions**: Critical items and progress protected by database transactions

## 🚧 Development Status

This is an active development project. Features are implemented iteratively with each step building upon the previous foundation. The current focus is on establishing core gameplay systems before expanding to multiplayer features.

---

*Built with ❤️ using modern web technologies*

# Entity Rendering System: Current State

## Features
- Per-entity render mode (shape or sprite)
- Pre-rendering and caching for shapes and sprites
- Skins UI for managing entity images and preferences
- Dynamic switching of render mode and skin at runtime
- Cache key hashing for efficient storage
- Async initialization of caches and preferences
- Tab-based UI for skin management

## New/Planned Features
- **Skin image auto-resize**: Uploaded images are automatically resized to match the intended entity size; cache stores size metadata.
- **Fixed-angle (screen-relative) rendering**: Entities can be rendered at a fixed angle relative to the screen, with support for draw offsets.
- **Cache metadata**: All cached images include metadata (size, angle, offsets, etc.) for correct rendering and alignment.

## Status
- Most core features are complete.
- Hitbox decoupling is partial; a full hitbox/interaction system is planned.
- Player PNG upload and clickable areas for grass are not yet started.
- See `requirements/step-3-entity-rendering.md` for a detailed checklist and implementation plan.
