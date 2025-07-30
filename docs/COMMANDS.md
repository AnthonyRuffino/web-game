# Web Game Console Commands

This document lists all available console commands for the Web Game. Commands can be executed in the browser's developer console using the `cmd()` function.

## Quick Start

Open the browser's developer console (F12) and use:
```javascript
cmd("help")  // Show all available commands
```

## Player Movement & Control

### `teleport <x> <y>`
Move the player to specific world coordinates.
- **Usage:** `cmd("teleport 100 200")`
- **Example:** `cmd("teleport 0 0")` - Move to world origin
- **Note:** Y coordinates are flipped for north-up coordinate system

### `setspeed <value>`
Change the player's movement speed.
- **Usage:** `cmd("setspeed 300")`
- **Example:** `cmd("setspeed 100")` - Slow movement
- **Example:** `cmd("setspeed 500")` - Fast movement
- **Range:** Positive numbers only

### `stats`
Display current player statistics.
- **Usage:** `cmd("stats")`
- **Shows:** Position, angle, speed, rotation speed, size

## Camera & View Controls

### `setzoom <value>`
Set the zoom level of the camera.
- **Usage:** `cmd("setzoom 2.0")`
- **Example:** `cmd("setzoom 0.5")` - Zoom out
- **Example:** `cmd("setzoom 3.0")` - Zoom in
- **Range:** 0.5 to 3.0

### `perspective`
Toggle between camera modes.
- **Usage:** `cmd("perspective")`
- **Modes:** 
  - Fixed North: World stays oriented north (use arrow keys to rotate camera)
  - Player Perspective: World rotates with player

### `resetcamera`
Reset camera rotation to north (0 degrees) in fixed-north mode.
- **Usage:** `cmd("resetcamera")`
- **Note:** Only affects fixed-north mode

## Background Texture Controls

### `bgconfig`
Show current background texture configuration.
- **Usage:** `cmd("bgconfig")`
- **Shows:** dotSize, dotSpacing, dotColor, dotAlpha

### `bgset <property> <value>`
Set a specific background texture property.
- **Usage:** `cmd("bgset dotSize 5")`
- **Properties:**
  - `dotSize` - Size of background dots (positive number)
  - `dotSpacing` - Distance between dots (positive number)
  - `dotColor` - Color of dots (hex color, e.g., "#666666")
  - `dotAlpha` - Transparency of dots (0.0 to 1.0)

### `bgpreset <preset>`
Apply a preset background configuration.
- **Usage:** `cmd("bgpreset dense")`
- **Presets:**
  - `dense` - Small, close dots (dotSize: 1, spacing: 10, alpha: 0.4)
  - `sparse` - Large, far apart dots (dotSize: 3, spacing: 40, alpha: 0.2)
  - `bright` - Medium, bright dots (dotSize: 2, spacing: 20, alpha: 0.6)
  - `subtle` - Small, very faint dots (dotSize: 1, spacing: 30, alpha: 0.1)

## World & Chunk System

### `worldinfo`
Show world information and configuration.
- **Usage:** `cmd("worldinfo")`
- **Shows:** World size, tile dimensions, seed, starting position, traversal time

### `worldconfig`
Show detailed world configuration.
- **Usage:** `cmd("worldconfig")`
- **Shows:** All world configuration parameters

### `setseed <seed>`
Set world seed and restart the game.
- **Usage:** `cmd("setseed 42")`
- **Example:** `cmd("setseed 12345")` - Restart with specific seed
- **Note:** Player is moved to new starting position

### `restartgame`
Restart the game with a new random seed.
- **Usage:** `cmd("restartgame")`
- **Note:** Player is moved to new starting position

### `chunkinfo`
Show chunk loading information and statistics.
- **Usage:** `cmd("chunkinfo")`
- **Shows:** Chunk size, total chunks, loaded chunks, player position, visible chunks

### `worldobjects`
Show information about world objects and generation.
- **Usage:** `cmd("worldobjects")`
- **Shows:** Generation probabilities, current tile objects, nearby tile samples
- **Features:** Shows grass, trees, and rocks placement based on world seed

### `cacheinfo`
Show information about the entity image/canvas cache system.
- **Usage:** `cmd("cacheinfo")`
- **Shows:** Number of cached images/canvases, cache keys, and metadata (size, angle, offsets)
- **Notes:** Reflects both in-memory and localStorage cache state. Useful for debugging async preloading and cache issues.

## Developer Tools

### `help`
Show all available commands.
- **Usage:** `cmd("help")`

### `clear`
Clear the console output.
- **Usage:** `cmd("clear")`

### `version`
Show the current game version.
- **Usage:** `cmd("version")`

### `spawnitem <itemName>`
Spawn an item at the player's location (placeholder for future item system).
- **Usage:** `cmd("spawnitem torch")`
- **Note:** Item system not yet implemented

## UI & Input Debugging

### `inputblockinfo`
Show the current input blocking state and focused UI elements.
- **Usage:** `cmd("inputblockinfo")`
- **Shows:** Whether input is currently blocked, which element has focus, and why.

### `uidebug <component>`
Toggle debug overlays for UI components (e.g., inventory, action bar, macro UI, skins UI).
- **Usage:** `cmd("uidebug inventory")`
- **Example:** `cmd("uidebug all")` - Toggle debug overlays for all UI components

## Persistence Commands

### `save`
- **Description:** Manually save game state to localStorage
- **Usage:** `cmd("save")`

### `load`
- **Description:** Manually load game state from localStorage
- **Usage:** `cmd("load")`

### `saveinfo`
- **Description:** Show information about saved game state
- **Usage:** `cmd("saveinfo")`

### `clearsave`
- **Description:** Clear saved game state from localStorage
- **Usage:** `cmd("clearsave")`

### `persistence`
- **Description:** Show persistence system configuration
- **Usage:** `cmd("persistence")`

## Collision System Commands

### `collision`
- **Description:** Show collision system information
- **Usage:** `cmd("collision")`
- **Shows:** Enabled state, debug mode, player radius, spatial grid info

### `togglecollision`
- **Description:** Toggle collision detection on/off
- **Usage:** `cmd("togglecollision")`

### `collisiondebug`
- **Description:** Toggle collision debug visualization
- **Usage:** `cmd("collisiondebug")`
- **Visual:** Red dashed circle around player, orange circles around obstacles

### `setcollisionradius <radius>`
- **Description:** Set player collision radius
- **Usage:** `cmd("setcollisionradius 20")`
- **Range:** 5 to 50 pixels

### `updatecollision`
- **Description:** Force update collision spatial grid
- **Usage:** `cmd("updatecollision")`

## Responsive Canvas Commands

### `canvasinfo`
- **Description:** Show responsive canvas information
- **Usage:** `cmd("canvasinfo")`

## Notes

- Some commands are placeholders for future features (e.g., item system, advanced UI bindings).
- The entity image/canvas cache system is fully async and robust: all images are preloaded and cached before world rendering. Use `cacheinfo` to debug or inspect the cache state.
- For a full list of planned and in-progress features, see the README and requirements documents. 