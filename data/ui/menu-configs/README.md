# Menu Configurations

This directory contains pre-configured menu definitions for the MenuManager system. These configurations can be loaded as scripts and used to quickly create menus with predefined layouts and functionality.

## File Structure

- `macro-menus.js` - Macro-related menus (grid layouts, macro management)
- `ui-menus.js` - General UI menus (settings, dialogs, examples)
- `skin-menus.js` - Skin selection and customization menus
- `index.js` - Main initialization file that creates the unified interface

## Loading the Menu System

Add these scripts to your HTML in the correct order:

```html
<script src="data/ui/macros/macro-menus.js"></script>
<script src="data/ui/macros/ui-menus.js"></script>
<script src="data/ui/macros/skin-menus.js"></script>
<script src="data/ui/macros/index.js"></script>
```

Or load them dynamically via your UI system:

```javascript
// Add to your module loading queue
{ name: 'menuConfigs', file: 'data/ui/macros/macro-menus.js', dependencies: [] },
{ name: 'uiMenuConfigs', file: 'data/ui/macros/ui-menus.js', dependencies: [] },
{ name: 'skinMenuConfigs', file: 'data/ui/macros/skin-menus.js', dependencies: [] },
{ name: 'menuConfigsIndex', file: 'data/ui/macros/index.js', dependencies: ['menuConfigs', 'uiMenuConfigs', 'skinMenuConfigs'] }
```

## Usage

### Access the Unified Menu System

```javascript
// Wait for the menu system to be ready
if (window.MenuConfigs) {
  // Get a specific menu configuration
  const macroGrid = window.MenuConfigs.getMenu('simple-macro-grid');

  // Create the menu using MenuManager
  const menuId = window.UI.menuManager.createMenu(macroGrid);
  window.UI.menuManager.showMenu(menuId);
} else {
  console.log('MenuConfigs not ready yet');
}
```

### Category-Specific Access

```javascript
// Access macro menus specifically
const macroMenu = window.MenuConfigs.macro.get('advanced-macro-grid');

// Access UI menus specifically
const settingsMenu = window.MenuConfigs.ui.get('advanced-settings');

// Access skin menus specifically
const skinMenu = window.MenuConfigs.skin.get('simple-skin-selector');
```

### Get Available Menus

```javascript
// Get all menu keys
const allKeys = window.MenuConfigs.getAllMenuKeys();

// Get menu keys by category
const categories = window.MenuConfigs.getMenuKeysByCategory();
console.log(categories.macro); // ['simple-macro-grid', 'advanced-macro-grid', 'macro-management']
console.log(categories.ui);    // ['test-menu', 'settings-menu', 'advanced-settings', ...]
console.log(categories.skin);  // ['simple-skin-selector', 'advanced-skin-customization', ...]
```

### Direct Access to Individual Collections

```javascript
// Access macro menus directly
const macroMenus = window.MacroMenus.menus;
const macroMenu = window.MacroMenus.get('simple-macro-grid');

// Access UI menus directly
const uiMenus = window.UIMenus.menus;
const uiMenu = window.UIMenus.get('test-menu');

// Access skin menus directly
const skinMenus = window.SkinMenus.menus;
const skinMenu = window.SkinMenus.get('simple-skin-selector');
```

## Available Menu Configurations

### Macro Menus

| Key | Description |
|-----|-------------|
| `simple-macro-grid` | Basic 2x3 macro grid with attack/heal macros |
| `advanced-macro-grid` | 3x4 combat macro grid with multiple macro types |
| `macro-management` | Tabbed interface for managing different macro categories |

### UI Menus

| Key | Description |
|-----|-------------|
| `test-menu` | Simple test menu with basic buttons |
| `settings-menu` | Game settings with radio groups |
| `advanced-settings` | Multi-tab settings with graphics, controls, data, and actions |
| `confirm-delete` | Blocking confirmation dialog |
| `info-dialog` | Information dialog with tips |
| `grid-examples` | Examples of different grid layouts |
| `menu-hierarchy` | Demonstrates nested menu hierarchy |

### Skin Menus

| Key | Description |
|-----|-------------|
| `simple-skin-selector` | Basic skin selection with preview dialogs |
| `advanced-skin-customization` | Multi-tab skin customization (character, equipment, effects) |
| `skin-unlock-system` | Challenge-based skin unlocking system |

## Console Testing

You can test these menus directly in the browser console:

```javascript
// Check if menu system is ready
if (window.MenuConfigs) {
  // Create a simple test menu
  const testMenu = window.MenuConfigs.getMenu('test-menu');
  const menuId = window.UI.menuManager.createMenu(testMenu);
  window.UI.menuManager.showMenu(menuId);
  
  // List all available menus
  console.log('Available menus:', window.MenuConfigs.getAllMenuKeys());
} else {
  console.log('MenuConfigs not ready yet. Make sure all menu scripts are loaded.');
}
```

## Menu Features

All menu configurations support the following features:

- **Non-modal operation** - Menus don't block interaction with other UI elements
- **Draggable and resizable** - Users can move and resize menus
- **Z-index management** - Most recently opened menu appears on top
- **Click-to-front** - Clicking a menu brings it to the front
- **Escape key handling** - ESC closes only the top menu
- **Child menu spawning** - Buttons can spawn child menus with `onClickMenu`
- **Tab support** - Multi-tab interfaces for complex menus
- **Radio groups** - Selection controls with change callbacks
- **Grid layouts** - Configurable button grids with empty slot handling
- **Blocking overlays** - Optional blocking behavior for critical dialogs

## Customization

You can modify any menu configuration before creating it:

```javascript
const baseMenu = window.MenuConfigs.getMenu('settings-menu');

// Customize the menu
const customMenu = {
  ...baseMenu,
  id: 'my-custom-settings',
  title: 'My Custom Settings',
  content: baseMenu.content + '<p>Additional custom content</p>'
};

// Add custom buttons
customMenu.buttons.push({
  text: 'Custom Action',
  onClick: () => console.log('Custom action executed!')
});

// Create the customized menu
const menuId = window.UI.menuManager.createMenu(customMenu);
```

## Menu Configuration Structure

Each menu configuration follows this structure:

```javascript
{
  id: "unique-menu-id",           // Required unique identifier
  title: "Menu Title",           // Menu title
  content: "<p>HTML content</p>", // Optional HTML content
  isBlocking: false,             // Optional: make menu blocking
  destroyOnClose: false,         // Optional: destroy menu when closed
  
  // Optional: tabbed interface
  tabs: [
    {
      name: "Tab Name",
      content: "<p>Tab content</p>",
      buttons: [...],            // Tab-specific buttons
      radioGroups: [...],        // Tab-specific radio groups
      gridButtons: [...]         // Tab-specific grid buttons
    }
  ],
  
  // Optional: buttons at bottom of menu
  buttons: [
    {
      text: "Button Text",
      onClick: () => console.log("clicked"),
      onClickMenu: {...}         // Optional: spawn child menu
    }
  ],
  
  // Optional: radio button groups
  radioGroups: [
    {
      label: "Group Label",
      options: [
        { text: "Option 1", value: "val1", checked: true },
        { text: "Option 2", value: "val2" }
      ],
      onChange: (value) => console.log(value)
    }
  ],
  
  // Optional: grid button layouts
  gridButtons: [
    {
      label: "Grid Label",
      rows: 2,
      cols: 3,
      cellSize: 60,              // Optional: custom cell size
      gap: 10,                   // Optional: custom gap
      buttons: [
        {
          name: "Button Name",
          imageDataUrl: "data:image/...", // Optional: button image
          tooltip: "Button tooltip",      // Optional: tooltip
          onClick: () => console.log("clicked"),
          onClickMenu: {...}              // Optional: spawn child menu
        }
      ],
      onEmptyClick: (index) => console.log(`Empty slot ${index} clicked`)
    }
  ]
}
```

## Integration with UI System

To integrate with your existing UI system, add the menu configuration files to your module loading queue in `ui/init.js`:

```javascript
// Add to moduleQueue array
{ name: 'macroMenus', file: 'data/ui/macros/macro-menus.js', dependencies: [] },
{ name: 'uiMenus', file: 'data/ui/macros/ui-menus.js', dependencies: [] },
{ name: 'skinMenus', file: 'data/ui/macros/skin-menus.js', dependencies: [] },
{ name: 'menuConfigs', file: 'data/ui/macros/index.js', dependencies: ['macroMenus', 'uiMenus', 'skinMenus'] }
```

This ensures the menu configurations are loaded in the correct order and available when your UI system initializes. 