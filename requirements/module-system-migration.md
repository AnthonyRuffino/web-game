# Module System Migration Requirements

## Goals

✅ **Single Namespace**: All modules register under `window.WebGame` only
✅ **No Global Pollution**: No modules create global variables outside `window.WebGame`
✅ **Dependency Injection**: Modules receive dependencies as init() parameters
✅ **Centralized Loading**: main.js manages all module loading and initialization
✅ **Gradual Migration**: Keep game working during transition

## Current State

- **main.js**: Loads ui/init.js, then core modules, initializes them
- **ui/init.js**: Manages UI module loading queue, initializes UI modules
- **Problem**: Modules create global variables (World, EntityRenderer, Player, etc.)

## New System

- **main.js**: Manages all module loading via coreModules config
- **Dependency Injection**: Dependencies passed to init() functions
- **WebGame Namespace**: All modules under window.WebGame

## Module Structure

### IIFE Pattern
```javascript
(() => {
  // Module implementation
  
  window.WebGame.ModuleName = {
    init: function(dependency1, dependency2) {
      // initialization logic
    }
  };
})();
```

### Registration Example
```javascript
// ui/console.js
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
```

### Dependency Injection Example
```javascript
// initialize-menu-configs.js
window.WebGame.MenuConfigs = {
  initialize: async function(macroMenus, uiMenus, skinMenus) {
    const allMenus = { ...macroMenus.menus, ...uiMenus.menus, ...skinMenus.menus };
    // ... rest of initialization
  }
};
```

## Core Modules Configuration

```javascript
coreModules = {
  'moduleKey': {
    file: 'path/to/module.js',
    dependencies: ['dependencyKey1', 'dependencyKey2'],
    self: () => webGame.ModuleName
  }
};
```

## Migration Strategy

### Phase 1: Gradual Migration (Current)
- Load all ui/init.js modules first (to prevent breaking)
- Then load new system modules
- Keep both systems running during transition

### Phase 2: Complete Migration
- Move all modules to main.js coreModules
- Remove ui/init.js dependency
- All modules use dependency injection

### Phase 3: Optimize Loading
- Load all JS files in parallel
- Call init() functions in dependency order

## Module Loading Order

### UI Modules (from init.js):
1. console, 2. input, 3. responsiveCanvas, 4. jsonPopup, 5. actionBars, 6. macros, 7. inventory, 8. inputBar, 9. skins, 10. menuBar, 11. minimap, 12. menuManager

### Core Modules:
1. background, 2. rock, 3. tree, 4. grass, 5. entityRenderer, 6. world, 7. persistence, 8. collision, 9. gameEngine, 10. gameLoop

## Migration Checklist

### Phase 1: Core Infrastructure
- [x] Update main.js with coreModules structure
- [x] Create initialize-menu-configs.js as reference
- [x] Add first 4 UI modules to main.js (console, input, responsiveCanvas, jsonPopup)
- [ ] Remove ui/init.js dependency when all modules migrated

### Phase 2: UI Module Migration
- [ ] Migrate remaining 8 UI modules to window.WebGame.UI.*
- [ ] Update coreModules config for each migrated module

### Phase 3: Core Module Migration
- [ ] Migrate 10 core modules to window.WebGame.*
- [ ] Update coreModules config for each migrated module

### Phase 4: Testing
- [ ] Verify no global variables outside window.WebGame
- [ ] Test all functionality works identically
- [ ] Remove ui/init.js dependency

## Example Migrations

### Simple Module (console.js)
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

### Module with Dependencies (actionBars.js)
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
        this.jsonPopup = jsonPopup;
        console.log('[ActionBarManager] Initialized');
      }
    }
  };
})();
```

## Success Criteria

1. **No Global Pollution**: Only window.WebGame exists globally
2. **Preserved Functionality**: All game features work identically
3. **Clean Architecture**: All modules use IIFE + dependency injection
4. **Centralized Management**: main.js is single source of truth
5. **Explicit Dependencies**: All dependencies declared and injected

## Technical Requirements

- **Gradual Migration**: Load ui/init.js modules first to prevent breaking
- **Dependency Order**: coreModules order must match init() function parameters
- **Parallel Loading**: Eventually load all JS files in parallel, init in order
- **Reference Files**: main.js and initialize-menu-configs.js are templates 