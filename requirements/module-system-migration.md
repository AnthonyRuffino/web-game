# Module System Migration Requirements

## Overview

This document outlines the requirements for transitioning from the current split initialization system (main.js + ui/init.js) to a centralized module loading and initialization system managed entirely by main.js.

## Goals

✅ **Centralized Loading**: All dynamic loading of game modules should happen only in main.js
✅ **No Global Pollution**: All modules must register themselves via `window.WebGame` only
✅ **Explicit Dependencies**: Each module must declare its dependencies in the coreModules config
✅ **Preserved Order**: Maintain the exact loading and initialization order from the previous system
✅ **Clean Architecture**: Modules must follow a consistent IIFE pattern with proper dependency injection

## Current State Analysis

### Previous System (main.js + ui/init.js)
- **main.js**: Loaded ui/init.js, then core modules, then initialized them
- **ui/init.js**: Managed UI module loading queue with dependencies, initialized UI modules
- **Global Pollution**: Modules created global variables (World, EntityRenderer, Player, etc.)

### New System (main.js only)
- **main.js**: Manages all module loading and initialization via coreModules config
- **Dependency Injection**: Modules receive resolved dependencies in their init() function
- **WebGame Namespace**: All modules register under window.WebGame

## Module Definition Requirements

### 1. IIFE Structure
Every module must wrap its logic in an IIFE (Immediately Invoked Function Expression):

```javascript
(() => {
  // Module implementation here
  
  // Export public interface
  window.WebGame.ModuleName = {
    // public methods and properties
    init: function(dependency1, dependency2) {
      // initialization logic
    }
  };
})();
```

### 2. Registration Pattern
Modules must register themselves under `window.WebGame` with a name that matches their `.self()` function in coreModules:

```javascript
// Example: ui/console.js
window.WebGame.UI = {
  console: {
    init: function() {
      // console initialization
    },
    log: function(message) {
      // logging logic
    }
  }
};
```

### 3. Dependency Injection
Modules with dependencies must accept them as parameters in their init function:

```javascript
// Example: initialize-menu-configs.js
window.WebGame.MenuConfigs = {
  initialize: async function(macroMenus, uiMenus, skinMenus) {
    // Use injected dependencies
    const allMenus = { ...macroMenus.menus, ...uiMenus.menus, ...skinMenus.menus };
    // ... rest of initialization
  }
};
```

## Core Modules Configuration

### Required Structure
The `coreModules` object in main.js must define:

```javascript
coreModules = {
  'moduleKey': {
    file: 'path/to/module.js',
    dependencies: ['dependencyKey1', 'dependencyKey2'],
    self: () => webGame.ModuleName
  }
};
```

### Module Loading Order
Based on the previous init.js system, the following order must be preserved:

#### UI Modules (from init.js moduleQueue):
1. `console` - ui/console.js
2. `input` - ui/input.js  
3. `responsiveCanvas` - ui/responsiveCanvas.js
4. `jsonPopup` - ui/jsonPopup.js
5. `actionBars` - ui/actionBars.js (depends on jsonPopup)
6. `macros` - ui/macros.js (depends on actionBars)
7. `inventory` - ui/inventory.js
8. `inputBar` - ui/inputBar.js
9. `skins` - ui/skins.js
10. `menuBar` - ui/menuBar.js (depends on actionBars)
11. `minimap` - ui/minimap.js (depends on jsonPopup)
12. `menuManager` - ui/menuManager.js

#### Core Modules (from main.js coreModules array):
1. `background` - core/background.js
2. `rock` - core/entities/rock.js
3. `tree` - core/entities/tree.js
4. `grass` - core/entities/grass.js
5. `entityRenderer` - core/entityRenderer.js
6. `world` - core/world.js
7. `persistence` - core/persistence.js
8. `collision` - core/collision.js
9. `gameEngine` - core/gameEngine.js
10. `gameLoop` - core/gameLoop.js

#### Menu Configuration Modules:
1. `ui-menus` - data/ui/menu-configs/ui-menus.js
2. `skins-menus` - data/ui/menu-configs/skins-menus.js
3. `macro-menus` - data/ui/menu-configs/macro-menus.js
4. `menu-configs` - data/ui/menu-configs/initialize-menu-configs.js (depends on above 3)

## Migration Checklist

### Phase 1: Core Infrastructure
- [x] Update main.js with new coreModules structure
- [x] Create initialize-menu-configs.js as reference implementation
- [ ] Remove ui/init.js dependency from main.js
- [ ] Update loadScript utility to track loaded scripts

### Phase 2: UI Module Migration
- [ ] Migrate ui/console.js to window.WebGame.UI.console
- [ ] Migrate ui/input.js to window.WebGame.UI.input
- [ ] Migrate ui/responsiveCanvas.js to window.WebGame.UI.responsiveCanvas
- [ ] Migrate ui/jsonPopup.js to window.WebGame.UI.jsonPopup
- [ ] Migrate ui/actionBars.js to window.WebGame.UI.actionBarManager
- [ ] Migrate ui/macros.js to window.WebGame.UI.macroManager
- [ ] Migrate ui/inventory.js to window.WebGame.UI.inventory
- [ ] Migrate ui/inputBar.js to window.WebGame.UI.inputBar
- [ ] Migrate ui/skins.js to window.WebGame.UI.skinsManager
- [ ] Migrate ui/menuBar.js to window.WebGame.UI.menuBar
- [ ] Migrate ui/minimap.js to window.WebGame.UI.minimapManager
- [ ] Migrate ui/menuManager.js to window.WebGame.UI.menuManager

### Phase 3: Core Module Migration
- [ ] Migrate core/background.js to window.WebGame.Background
- [ ] Migrate core/entities/rock.js to window.WebGame.Entities.Rock
- [ ] Migrate core/entities/tree.js to window.WebGame.Entities.Tree
- [ ] Migrate core/entities/grass.js to window.WebGame.Entities.Grass
- [ ] Migrate core/entityRenderer.js to window.WebGame.EntityRenderer
- [ ] Migrate core/world.js to window.WebGame.World
- [ ] Migrate core/persistence.js to window.WebGame.Persistence
- [ ] Migrate core/collision.js to window.WebGame.Collision
- [ ] Migrate core/gameEngine.js to window.WebGame.GameEngine
- [ ] Migrate core/gameLoop.js to window.WebGame.GameLoop

### Phase 4: Menu Configuration Migration
- [x] Migrate data/ui/menu-configs/ui-menus.js to window.UIMenus
- [x] Migrate data/ui/menu-configs/skins-menus.js to window.SkinMenus
- [x] Migrate data/ui/menu-configs/macro-menus.js to window.MacroMenus
- [x] Create initialize-menu-configs.js as unified interface

### Phase 5: Integration and Testing
- [ ] Update all module references to use window.WebGame namespace
- [ ] Test dependency injection for all modules
- [ ] Verify initialization order is preserved
- [ ] Test that no global variables are created outside window.WebGame
- [ ] Update any remaining hardcoded references to old global variables

## Module Migration Process

### Step 1: Analyze Current Module
1. Identify the module's current global registration
2. List its dependencies (if any)
3. Identify its init function and parameters
4. Note any global variables it creates

### Step 2: Create New Module Structure
1. Wrap entire module in IIFE
2. Move global registration to window.WebGame
3. Update init function to accept dependencies as parameters
4. Remove any global variable declarations

### Step 3: Update coreModules Configuration
1. Add module entry to coreModules in main.js
2. Specify file path
3. List dependencies
4. Create .self() function that returns the module

### Step 4: Update References
1. Find all references to the old global variable
2. Update them to use window.WebGame.ModuleName
3. Update any dependency references in other modules

## Example Migrations

### Example 1: Simple Module (console.js)
```javascript
// Before
window.UI = {
  console: {
    log: function(message) { console.log(message); }
  }
};

// After
(() => {
  window.WebGame.UI = {
    console: {
      init: function() {
        console.log('[Console] Initialized');
      },
      log: function(message) {
        console.log(message);
      }
    }
  };
})();
```

### Example 2: Module with Dependencies (actionBars.js)
```javascript
// Before
window.UI.actionBarManager = {
  init: function() {
    // Uses window.JsonPopup internally
  }
};

// After
(() => {
  window.WebGame.UI = {
    actionBarManager: {
      init: function(jsonPopup) {
        // jsonPopup is injected dependency
        this.jsonPopup = jsonPopup;
        console.log('[ActionBarManager] Initialized');
      }
    }
  };
})();
```

## Testing Requirements

### Unit Testing
- [ ] Each module loads without errors
- [ ] Each module registers correctly under window.WebGame
- [ ] Dependencies are properly injected
- [ ] Init functions execute without errors

### Integration Testing
- [ ] All modules load in correct order
- [ ] Dependencies are resolved correctly
- [ ] No global variables are created outside window.WebGame
- [ ] Game starts successfully with new system

### Regression Testing
- [ ] All existing functionality works as before
- [ ] UI components initialize correctly
- [ ] Game loop starts properly
- [ ] No console errors or warnings

## Success Criteria

1. **No Global Pollution**: Only window.WebGame and its properties exist globally
2. **Preserved Functionality**: All existing game features work identically
3. **Clean Architecture**: All modules follow the IIFE + dependency injection pattern
4. **Centralized Management**: main.js is the single source of truth for module loading
5. **Explicit Dependencies**: All module dependencies are clearly declared and injected
6. **Maintainable Code**: New modules can be easily added following the established pattern

## Notes

- main.js and initialize-menu-configs.js serve as reference implementations
- Do not modify these files unless bugs or mismatches are discovered
- The migration should be done incrementally, testing each module after migration
- All global variable references must be updated throughout the codebase
- The Player object appears to be a special case and may need special handling 