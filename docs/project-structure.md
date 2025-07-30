# Project Structure

## Overview
This document describes the reorganized project structure after flattening the directory hierarchy and improving organization.

## Root Directory Structure

```
web-game/
├── assets/                    # Static assets (images, etc.)
├── docs/                      # Documentation files
│   ├── COMMANDS.md
│   ├── CONTROLS.md
│   ├── TECHNICAL_DEBT.md
│   ├── future-lighting-improvements.md
│   ├── persistence-system-design.md
│   ├── persistence-phase-1-core-database-implementation.md
│   ├── persistence-phase-2-world-integration.md
│   ├── persistence-phase-3-inventory-system.md
│   ├── persistence-phase-4-advanced-features.md
│   ├── project-structure.md
│   └── sqlite-and-threading-analysis.md
├── requirements/              # Requirements documents
├── src/                       # Source code
│   └── modules/
│       └── game/             # Main game module
│           ├── index.js      # Main game entry point
│           ├── assets.js     # Asset management
│           ├── core/         # Core game systems
│           ├── entities/     # Entity definitions
│           ├── input/        # Input handling
│           ├── menus/        # Menu system
│           ├── persistence/  # Database and persistence
│           ├── rendering/    # Graphics and rendering
│           └── ui/           # User interface components
├── tests/                    # Test files
│   ├── integration/          # Integration tests
│   ├── persistence/          # Database tests
│   └── unit/                 # Unit tests
├── main.js                   # Electron main process
├── preload.js                # Electron preload script
├── package.json              # Node.js dependencies
└── README.md                 # Project overview
```

## Game Module Structure (`src/modules/game/`)

### Core Systems (`core/`)
- **character.js** - Player character management
- **collision.js** - Collision detection system
- **world.js** - World generation and management
- **world-enhancements.js** - Advanced world features

### Rendering (`rendering/`)
- **canvas.js** - Canvas management and setup
- **camera.js** - Camera system and transformations
- **dots.js** - Visual effects system
- **entityRenderer.js** - Entity rendering logic

### Input (`input/`)
- **input.js** - Input handling and key bindings

### User Interface (`ui/`)
- **menuManager.js** - Menu system management
- **menuBarElectron.js** - Menu bar component
- **inputBar.js** - Command input bar
- **interactions.js** - User interaction system

### Menus (`menus/`)
- **Menu.js** - Base menu class
- **SkinsMenu.js** - Skins management menu
- **EntitySkinConfigurationMenu.js** - Entity skin configuration

### Persistence (`persistence/`)
- **PersistenceManager.js** - Main persistence orchestrator
- **database.js** - Database connection and schema
- **ChangeTracker.js** - Track pending changes
- **WorldManager.js** - World data management
- **CellStateManager.js** - Cell state tracking
- **persistence.js** - Legacy persistence system

### Entities (`entities/`)
- **grass.js** - Grass entity definition
- **rock.js** - Rock entity definition
- **tree.js** - Tree entity definition

## Test Structure (`tests/`)

### Integration Tests (`integration/`)
- **test-basic.js** - Basic Electron app functionality

### Persistence Tests (`persistence/`)
- **test-persistence-phase1.js** - Phase 1 database tests
- **verify-database.js** - Database verification utilities

### Unit Tests (`unit/`)
- *Future unit tests will go here*

## Key Benefits of New Structure

### 1. **Flattened Hierarchy**
- Removed unnecessary `electron/` subdirectory
- All files now at appropriate levels
- Easier navigation and imports

### 2. **Logical Grouping**
- **Core**: Game logic and systems
- **Rendering**: Graphics and visual components
- **Input**: User input handling
- **UI**: User interface components
- **Persistence**: Data storage and management
- **Entities**: Game object definitions

### 3. **Test Organization**
- **Integration**: End-to-end functionality tests
- **Persistence**: Database and storage tests
- **Unit**: Individual component tests (future)

### 4. **Documentation**
- All documentation centralized in `docs/`
- Clear separation of concerns
- Easy to find and maintain

## Import Paths

### Before Reorganization
```javascript
import { InputManager } from './input.js';
import { Camera } from './camera.js';
import { World } from './world.js';
```

### After Reorganization
```javascript
import { InputManager } from './input/input.js';
import { Camera } from './rendering/camera.js';
import { World } from './core/world.js';
```

## Migration Notes

### Files Moved
- **UI Components**: `menuManager.js`, `menuBarElectron.js`, `inputBar.js`, `interactions.js` → `ui/`
- **Core Systems**: `world.js`, `character.js`, `collision.js`, `world-enhancements.js` → `core/`
- **Rendering**: `canvas.js`, `camera.js`, `dots.js`, `entityRenderer.js` → `rendering/`
- **Input**: `input.js` → `input/`
- **Persistence**: `persistence.js` → `persistence/`
- **Tests**: All test files → `tests/` with appropriate subdirectories

### Import Updates
- All import statements updated to reflect new paths
- Test files updated to use correct relative paths
- No breaking changes to functionality

## Future Considerations

### 1. **Additional Test Categories**
- **Performance**: Performance benchmarking tests
- **E2E**: End-to-end user workflow tests
- **Visual**: Visual regression tests

### 2. **Potential Subdirectories**
- **core/ai/**: AI and NPC systems
- **core/physics/**: Physics simulation
- **rendering/effects/**: Visual effects
- **ui/components/**: Reusable UI components

### 3. **Configuration Management**
- **config/**: Game configuration files
- **scripts/**: Build and deployment scripts
- **tools/**: Development utilities

## Maintenance

### Adding New Files
1. Place files in appropriate subdirectory based on functionality
2. Update import statements in dependent files
3. Add tests in appropriate test directory
4. Update this documentation if structure changes

### Moving Files
1. Update all import statements
2. Update test paths if necessary
3. Verify functionality with tests
4. Update documentation

This structure provides a clean, maintainable foundation for the game's continued development. 