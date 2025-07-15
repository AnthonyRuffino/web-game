# Game Controls & Mechanics

This guide covers all the controls and game mechanics for the Web Game.

## 🎮 Basic Movement

### Primary Controls
- **W** - Move forward in facing direction
- **S** - Move backward
- **A** - Rotate left (turn counter-clockwise)
- **D** - Rotate right (turn clockwise)
- **Q** - Strafe left (move sideways left)
- **E** - Strafe right (move sideways right)

### Advanced Movement
- **Shift + A** - Strafe left (alternative to Q)
- **Shift + D** - Strafe right (alternative to E)
- **Right-click + A** - Strafe left (while holding right mouse button)
- **Right-click + D** - Strafe right (while holding right mouse button)

### Movement Tips
- **Diagonal Movement**: Moving in multiple directions (e.g., forward + strafe) is automatically normalized to maintain consistent speed
- **Frame-rate Independent**: Movement speed is consistent regardless of your computer's performance
- **Smooth Rotation**: Character rotates smoothly at a fixed rate

## 🖱️ Mouse Controls

### Camera Controls
- **Mouse Wheel Up** - Zoom in
- **Mouse Wheel Down** - Zoom out
- **Right-click** - Hold to enable strafe mode with A/D keys

### UI Interaction
- **Left-click** - Interact with UI elements, action bar slots, and dialogs
- **Hover** - Mouse over UI elements for tooltips and visual feedback

## 🎯 Camera Modes

The game supports two camera perspectives:

### Fixed North Mode (Default)
- The world stays oriented with north always pointing up
- Your character rotates and moves within the fixed world orientation
- Good for navigation and getting your bearings

### Player Perspective Mode
- The world rotates around your character
- Your character always faces "up" on the screen
- The world rotates to match your character's orientation
- More immersive for gameplay

**Toggle Camera Mode**: Use the console command `cmd("perspective")` or press F12 and type `perspective`

## 🎒 Inventory System

### Opening Inventory
- **B** - Open/close inventory

### Inventory Features
- **Grid Layout**: 5x5 grid (configurable)
- **Click to Select**: Click on inventory slots to select items
- **Visual Feedback**: Hover effects and selection indicators
- **Item Management**: Drag and drop support (future feature)

## ⚡ Action Bar

### Action Bar Controls
- **Number Keys 1-0** - Activate action bar slots
- **Shift + Number Keys 1-0** - Activate secondary action bar slots
- **Mouse Click** - Click on action bar slots to activate
- **10 Slots**: Configurable action bar with 10 slots by default

### Action Bar Features
- **Item/Action Binding**: Bind items, tools, spells, or macros to slots
- **Visual Feedback**: Hover and click effects
- **Keyboard Shortcuts**: Quick access to frequently used actions
- **Macro Support**: Bind macros to action bar slots via the Macro UI

## 🛠️ Crafting System

### Accessing Crafting
- Open inventory with **B**
- Click the crafting button in the inventory interface

### Available Recipes (Step 2)
1. **Crafting Table** - Basic crafting station
2. **Torch** - Light source for dark areas
3. **Furnace** - Metal smelting and advanced crafting
4. **Wooden Spear** - Basic weapon for combat

### Crafting Process
- Select a recipe from the crafting menu
- View required materials and quantities
- Click "Craft" button to create the item
- Success/failure feedback is provided
- Crafted items appear in your inventory

## 🌍 World Interaction

### World Features
- **Procedural Generation**: Every world is unique based on a seed
- **World Wrapping**: Travel east to reach west, north to reach south
- **Finite World**: World size allows edge-to-edge traversal in 10-15 seconds
- **Deterministic**: Same seed always produces the same world layout

### World Objects
- **Grass Tiles**: Harvestable resources (non-interactive in Step 2)
- **Trees & Rocks**: Solid obstacles that block movement
- **Background Texture**: Dots pattern provides visual movement reference

### Collision System
- **Solid Objects**: Trees, rocks, and other obstacles block movement
- **Visual Feedback**: Player stops when hitting obstacles
- **Perspective Support**: Collision works in both camera modes

## 🖥️ UI Dialogs & Input Blocking

### UI Dialogs
- **Inventory**: B to open/close
- **Crafting**: Button in inventory
- **Macro UI**: Manage macros, icons, and bindings
- **Skins UI**: Manage entity images, render modes, and metadata

### Input Blocking (Focus-Based)
- **Input is blocked whenever a text input, textarea, or number input is focused** (e.g., in macro/skin dialogs)
- **Escape**: Closes the currently open dialog or input bar
- **Tab**: Moves focus between fields in dialogs
- **Enter**: Confirms dialog actions (where applicable)
- **Mouse Click**: Clicking outside a dialog or on a close button will close the dialog

### UI Interaction Best Practices
- **Always use Escape to close dialogs or exit input mode**
- **Focus is managed automatically**: Input is only blocked when a UI element is focused
- **No stuck input**: Input is released when focus is lost or dialog is closed
- **Consistent UI**: All dialogs and menus follow the same input blocking and closing conventions

## 🔧 Console Commands

Press **F12** to open the browser console and access debugging commands:

### Essential Commands
- `cmd("help")` - Show all available commands
- `cmd("stats")` - Display player position and stats
- `cmd("teleport x y")` - Move to specific coordinates
- `cmd("setspeed value")` - Change movement speed
- `cmd("setzoom value")` - Set zoom level
- `cmd("perspective")` - Toggle camera mode
- `cmd("cacheinfo")` - Show entity image/canvas cache state
- `cmd("inputblockinfo")` - Show input blocking state

### Background Customization
- `cmd("bgconfig")` - Show background settings
- `cmd("bgset property value")` - Change background properties
- `cmd("bgpreset dense")` - Apply preset background patterns

See [COMMANDS.md](COMMANDS.md) for complete command reference.

## 🎮 Game Mechanics

### Character System
- **Position**: Tracked in world coordinates
- **Orientation**: Character faces in the direction of movement
- **Speed**: Configurable movement speed (default: 200 pixels/second)
- **Size**: Character rendered as a triangle pointing in facing direction

### World Coordinates
- **Grid System**: World divided into tiles (40x40 pixels each)
- **Starting Position**: Red 'X' marks the world origin
- **Coordinate System**: Y increases northward (up on screen)
- **Wrapping**: Coordinates wrap around at world edges

### Persistence
- **Auto-Save**: Game state automatically saved to browser storage
- **Position Persistence**: Player position saved across browser sessions
- **World Seed**: World layout preserved across sessions
- **Resume**: Game continues exactly where you left off

## 🎯 Tips for New Players

1. **Start Moving**: Use WASD to explore the world and get familiar with movement
2. **Try Both Perspectives**: Switch between camera modes to find your preference
3. **Experiment with Zoom**: Use mouse wheel to find comfortable zoom level
4. **Check Your Stats**: Use `cmd("stats")` to see your current position and settings
5. **Explore the World**: Walk to the edges to experience world wrapping
6. **Customize Background**: Try different background presets with `cmd("bgpreset")`
7. **Open Inventory**: Press B to see the inventory system
8. **Try Crafting**: Access crafting through the inventory interface
9. **Use Escape**: Always use Escape to close dialogs or exit input mode
10. **Check Cache**: Use `cmd("cacheinfo")` to ensure all entity images are preloaded

## 🚧 Future Features

The following features are planned for future development:
- **Resource Harvesting**: Tools to gather grass, wood, stone, etc.
- **Advanced Crafting**: More recipes and crafting stations
- **Combat System**: Weapons, enemies, and combat mechanics
- **Building System**: Place walls, floors, and structures
- **NPCs**: Non-player characters and housing system
- **Multiplayer**: Play with other players in shared worlds

---

*For technical details and development information, see the requirements documents in the `requirements/` folder.* 