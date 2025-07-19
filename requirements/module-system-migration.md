# Module System Migration Requirements

## Current Status: Core Module Migration Phase

### Completed ✅
- **UI Modules**: All 12 UI modules successfully migrated to new system
- **Background**: Migrated and cleaned up
- **Entities**: Rock, Tree, Grass entities migrated
- **EntityRenderer**: Migrated with proper dependencies
- **World**: Migrated and cleaned up (removed global pollution)

### Remaining Core Modules (4)
- [ ] `persistence.js` - Game state persistence and loading
- [ ] `collision.js` - Collision detection system  
- [ ] `gameEngine.js` - Core game logic and state management
- [ ] `gameLoop.js` - Game loop and timing system

## Current System Architecture

### New System (main.js)
```javascript
const newSystemModules = {
  // UI Modules (12) - ✅ COMPLETED
  'console': {file: 'ui/console.js', dependencies: [], self: () => window.WebGame?.UI?.console },
  'input': {file: 'ui/input.js', dependencies: [], self: () => window.WebGame?.UI?.input },
  'responsiveCanvas': {file: 'ui/responsiveCanvas.js', dependencies: [], self: () => window.WebGame?.UI?.responsiveCanvas },
  'jsonPopup': {file: 'ui/jsonPopup.js', dependencies: [], self: () => window.WebGame?.UI?.jsonPopup },
  'actionBars': {file: 'ui/actionBars.js', dependencies: ['jsonPopup'], self: () => window.WebGame?.UI?.actionBarManager },
  'macros': {file: 'ui/macros.js', dependencies: ['actionBars'], self: () => window.WebGame?.UI?.macroManager },
  'inventory': {file: 'ui/inventory.js', dependencies: [], self: () => window.WebGame?.UI?.inventory },
  'inputBar': {file: 'ui/inputBar.js', dependencies: [], self: () => window.WebGame?.UI?.inputBar },
  'skins': {file: 'ui/skins.js', dependencies: [], self: () => window.WebGame?.UI?.skinsManager },
  'menuBar': {file: 'ui/menuBar.js', dependencies: ['actionBars'], self: () => window.WebGame?.UI?.menuBar },
  'minimap': {file: 'ui/minimap.js', dependencies: ['jsonPopup'], self: () => window.WebGame?.UI?.minimapManager },
  'menuManager': {file: 'ui/menuManager.js', dependencies: [], self: () => window.WebGame?.UI?.menuManager },
  
  // Menu Configs - ✅ COMPLETED
  'macroMenus': {file: 'data/ui/menu-configs/macro-menus.js', dependencies: [], self: () => window.WebGame?.MenuConfigs?.macroMenus },
  'uiMenus': {file: 'data/ui/menu-configs/ui-menus.js', dependencies: [], self: () => window.WebGame?.MenuConfigs?.uiMenus },
  'skinMenus': {file: 'data/ui/menu-configs/skin-menus.js', dependencies: [], self: () => window.WebGame?.MenuConfigs?.skinMenus },
  'initializeMenuConfigs': {file: 'data/ui/menu-configs/initialize-menu-configs.js', dependencies: ['macroMenus', 'uiMenus', 'skinMenus'], self: () => window.WebGame?.MenuConfigs },
  
  // Core Modules - 🔄 IN PROGRESS
  'background': {file: 'core/background.js', dependencies: [], self: () => window.WebGame?.Background },
  'rock': {file: 'core/entities/rock.js', dependencies: [], self: () => window.WebGame?.Entities?.Rock },
  'tree': {file: 'core/entities/tree.js', dependencies: [], self: () => window.WebGame?.Entities?.Tree },
  'grass': {file: 'core/entities/grass.js', dependencies: [], self: () => window.WebGame?.Entities?.Grass },
  'entityRenderer': {file: 'core/entityRenderer.js', dependencies: ['rock', 'tree', 'grass'], self: () => window.WebGame?.EntityRenderer },
  'world': {file: 'core/world.js', dependencies: [], self: () => window.WebGame?.World },
  
  // TODO: Add remaining core modules
  'persistence': {file: 'core/persistence.js', dependencies: [], self: () => window.WebGame?.Persistence },
  'collision': {file: 'core/collision.js', dependencies: [], self: () => window.WebGame?.Collision },
  'gameEngine': {file: 'core/gameEngine.js', dependencies: [], self: () => window.WebGame?.GameEngine },
  'gameLoop': {file: 'core/gameLoop.js', dependencies: [], self: () => window.WebGame?.GameLoop }
};
```

## Current Issues to Address

### Global Variable Pollution
**Problem**: Many modules use global variables without proper encapsulation:
- `PERSPECTIVE_MODE`, `CAMERA_ROTATION`, `ZOOM` in gameEngine.js
- Direct references to `Player`, `World`, `Background` across modules
- Undefined checks creating brittle dependencies

**Current Pattern**:
```javascript
// Brittle - depends on load order
if (typeof PERSPECTIVE_MODE !== 'undefined' && PERSPECTIVE_MODE === 'player-perspective') {
  // ...
}

// Better - explicit window reference
if (window.PERSPECTIVE_MODE === 'player-perspective') {
  // ...
}
```

### Circular Dependencies
**Problem**: Some modules need each other but load in different phases:
- `persistence.js` needs `gameEngine.js` for state
- `gameEngine.js` needs `persistence.js` for world loading
- Current solution: undefined checks (fragile)

## Next Phase: Global Variable Cleanup

### Step 1: Explicit Window Attachments
For the final 4 core modules, ensure all global variables are explicitly attached to window:
```javascript
// Instead of: let PERSPECTIVE_MODE = 'fixed-north';
window.PERSPECTIVE_MODE = 'fixed-north';

// Instead of: const Player = { ... };
window.Player = Player;
```

### Step 2: Update All References
Update all files to use explicit window references:
- `background.js` - Use `window.PERSPECTIVE_MODE`
- `entityRenderer.js` - Use `window.PERSPECTIVE_MODE`, `window.CAMERA_ROTATION`
- `persistence.js` - Use `window.Player`, `window.World`
- `input.js` - Use `window.PERSPECTIVE_MODE`, `window.CAMERA_ROTATION`

### Step 3: Dependency Injection Design
Plan for proper dependency injection to eliminate globals:
```javascript
// Future pattern
const GameEngine = {
  init(persistence, world, background, entityRenderer) {
    this.persistence = persistence;
    this.world = world;
    // ...
  }
};
```

## Future: Electron Migration

### Motivation
- Enable `showDirectoryPicker()` for filesystem access
- Support advanced features requiring native APIs
- Foundation for multiplayer server architecture

### Electron Architecture Plan
```javascript
// main.js (Electron main process)
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace('app://', '');
    callback({ path: path.join(__dirname, url) });
  });

  const win = new BrowserWindow({
    webPreferences: {
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('app://index.html');
});
```

### Benefits
- **Native APIs**: Access to filesystem, system dialogs
- **Security**: Proper sandboxing with preload scripts
- **Performance**: Better resource management
- **Distribution**: Standalone executable
- **Multiplayer Ready**: HTTP server integration path

### Migration Steps
1. **Setup Electron**: Configure main process and preload scripts
2. **API Bridge**: Create secure IPC communication for native features
3. **File Protocol**: Register custom protocol for asset loading
4. **Security**: Implement proper context isolation
5. **Testing**: Ensure all existing functionality works in Electron

## Success Criteria

### Current Phase
- [ ] All 4 remaining core modules migrated
- [ ] All global variables explicitly attached to window
- [ ] All cross-module references use explicit window paths
- [ ] No undefined checks for module availability
- [ ] Clean dependency injection ready for next phase

### Future Phase
- [ ] Eliminate all global variables
- [ ] Implement proper dependency injection
- [ ] Resolve circular dependencies
- [ ] Prepare for Electron migration
- [ ] Maintain backward compatibility during transition 