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
  - Fixed North: World stays oriented north
  - Player Perspective: World rotates with player

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

**Examples:**
```javascript
cmd("bgset dotSize 3")        // Larger dots
cmd("bgset dotSpacing 30")    // More spaced out dots
cmd("bgset dotColor #666666") // Gray dots
cmd("bgset dotAlpha 0.5")     // 50% transparent dots
```

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

## Command Examples

### Basic Movement Testing
```javascript
cmd("teleport 0 0")           // Go to origin
cmd("setspeed 100")           // Slow movement
cmd("stats")                  // Check position
cmd("teleport 200 300")       // Move to new location
```

### Camera Testing
```javascript
cmd("setzoom 0.5")            // Zoom out
cmd("perspective")            // Toggle perspective mode
cmd("setzoom 2.0")            // Zoom in
cmd("perspective")            // Toggle back
```

### Background Customization
```javascript
cmd("bgpreset dense")         // Apply dense pattern
cmd("bgset dotColor #ff0000") // Make dots red
cmd("bgset dotAlpha 0.8")     // Make dots more visible
cmd("bgpreset subtle")        // Apply subtle pattern
```

### Complete Setup Example
```javascript
cmd("clear")                  // Clear console
cmd("version")                // Check version
cmd("bgpreset bright")        // Set bright background
cmd("setzoom 1.5")            // Set comfortable zoom
cmd("setspeed 250")           // Set movement speed
cmd("stats")                  // Verify settings
```

### World & Chunk Testing
```javascript
cmd("worldinfo")              // Check world configuration
cmd("chunkinfo")              // See chunk loading stats
cmd("setseed 42")             // Restart with specific seed
cmd("chunkinfo")              // Check chunks after restart
cmd("restartgame")            // Restart with random seed
cmd("worldconfig")            // View detailed configuration
```

## Tips

1. **Command History:** Use the up/down arrow keys in the console to access previous commands
2. **Error Handling:** Invalid commands will show helpful error messages
3. **Real-time Updates:** Most commands take effect immediately
4. **Coordinate System:** Y coordinates increase northward (up on screen)
5. **Background Patterns:** The background provides visual feedback for movement - dots are fixed in world coordinates

## Future Commands

The following commands are planned for future implementation:
- `restartGame <seed>` - Restart with new world seed
- `save` - Manually save game state
- `load` - Manually load game state
- `debug` - Toggle debug information display
- `fps` - Show current frame rate
- `collision` - Toggle collision detection visualization

---

*Last updated: Step 2 Development Phase* 