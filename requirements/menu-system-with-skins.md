# Menu System - With Skins

## Problem Statement

The game needs a comprehensive menu system that can be created dynamically through commands, with full viewport-relative scaling and support for loading images from the asset cache. The first official menu will be the skins menu, which allows users to upload and configure entity and biome images.

## Current State

After the reversion, we have no menu system at all. We need to rebuild the entire dynamic menu infrastructure from scratch, with proper viewport-relative scaling and image support.

## Solution: Dynamic Menu System with Skins

### Core Principles

1. **Dynamic Creation**: Menus created through commands with config objects
2. **Viewport-Relative Scaling**: All elements scale with viewport size
3. **Image Support**: Load images from asset cache for buttons and displays
4. **Modular Design**: Reusable components (tabs, grids, forms, buttons)
5. **Skins Integration**: First official menu for entity/biome customization

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Menu Commands  │───▶│  Menu Manager   │───▶│  Menu Instances │
│  (Console)      │    │  (Dynamic)      │    │  (Scalable)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Asset Cache    │    │  Viewport Calc  │    │  Event System   │
│  (Images)       │    │  (Scaling)      │    │  (Input)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed Requirements

### 1. Menu Manager System

#### 1.1 Core Menu Manager
- **File**: `electron/src/modules/game/menuManager.js`
- **Purpose**: Create, manage, and render dynamic menus
- **Features**: Viewport-relative positioning and scaling
- **Methods**: `createMenu(config)`, `showMenu(id)`, `hideMenu(id)`, `listMenus()`

#### 1.2 Menu Configuration Object
```javascript
const menuConfig = {
  id: 'skins-menu',
  title: 'Skins & Customization',
  viewportX: 0.1,        // 10% from left edge
  viewportY: 0.1,        // 10% from top edge
  viewportWidth: 0.8,    // 80% of viewport width
  viewportHeight: 0.8,   // 80% of viewport height
  tabs: [...],           // Tab configuration
  content: '...',        // HTML content
  buttons: [...],        // Button configuration
  gridButtons: [...],    // Grid button configuration
  radioGroups: [...]     // Radio group configuration
};
```

#### 1.3 Viewport-Relative Scaling
- **Positioning**: All positions relative to viewport size
- **Sizing**: All sizes scale with viewport dimensions
- **Fonts**: Font sizes scale with viewport
- **Spacing**: Padding and margins scale proportionally
- **Responsive**: Updates on window resize

### 2. Menu Components

#### 2.1 Tabs System
```javascript
const tabConfig = {
  name: 'Entities',
  content: '<h3>Entity Skins</h3><p>Customize entity appearances...</p>',
  buttons: [
    { text: 'Upload Tree', action: 'uploadTree' },
    { text: 'Upload Grass', action: 'uploadGrass' }
  ],
  gridButtons: [
    {
      label: 'Tree Selection',
      rows: 3,
      cols: 4,
      cellSize: 60,
      gap: 8,
      buttons: [
        { name: 'Pine Tree', imageDataUrl: 'data:image/png;base64,...' },
        { name: 'Oak Tree', imageDataUrl: 'data:image/png;base64,...' }
      ]
    }
  ]
};
```

#### 2.2 Grid Buttons
- **Purpose**: Display image-based selection grids
- **Features**: Load images from asset cache
- **Scaling**: Cell size and gap scale with viewport
- **Layout**: Responsive grid with proper spacing
- **Images**: Support for imageDataUrl from asset cache

#### 2.3 Form Elements
```javascript
const radioGroupConfig = {
  label: 'Tree Size',
  options: [
    { value: 'small', label: 'Small (16px)' },
    { value: 'medium', label: 'Medium (24px)' },
    { value: 'large', label: 'Large (32px)' }
  ],
  defaultValue: 'medium'
};
```

#### 2.4 Buttons
- **Types**: Regular buttons, image buttons, upload buttons
- **Actions**: Custom actions, file uploads, config updates
- **Styling**: Consistent with game theme
- **Scaling**: Button size and text scale with viewport

### 3. Skins Menu (First Official Menu)

#### 3.1 Menu Structure
```javascript
const skinsMenuConfig = {
  id: 'skins-menu',
  title: 'Skins & Customization',
  viewportX: 0.1,
  viewportY: 0.1,
  viewportWidth: 0.8,
  viewportHeight: 0.8,
  tabs: [
    {
      name: 'Entities',
      content: '<h3>Entity Skins</h3><p>Upload and customize entity images...</p>',
      gridButtons: [
        {
          label: 'Tree Skins',
          rows: 2,
          cols: 3,
          cellSize: 80,
          gap: 10,
          buttons: [
            { name: 'Upload Tree', action: 'uploadTree', imageDataUrl: '...' },
            { name: 'Pine Tree', imageDataUrl: '...' },
            { name: 'Oak Tree', imageDataUrl: '...' }
          ]
        },
        {
          label: 'Grass Skins',
          rows: 2,
          cols: 3,
          cellSize: 80,
          gap: 10,
          buttons: [
            { name: 'Upload Grass', action: 'uploadGrass', imageDataUrl: '...' },
            { name: 'Tall Grass', imageDataUrl: '...' },
            { name: 'Short Grass', imageDataUrl: '...' }
          ]
        }
      ]
    },
    {
      name: 'Biomes',
      content: '<h3>Biome Backgrounds</h3><p>Customize biome backgrounds...</p>',
      gridButtons: [
        {
          label: 'Background Skins',
          rows: 1,
          cols: 2,
          cellSize: 120,
          gap: 15,
          buttons: [
            { name: 'Upload Plains', action: 'uploadPlains', imageDataUrl: '...' },
            { name: 'Upload Desert', action: 'uploadDesert', imageDataUrl: '...' }
          ]
        }
      ]
    }
  ]
};
```

#### 3.2 Upload Functionality
- **File Selection**: Use Electron file dialog
- **Image Processing**: Resize to entity config size
- **Validation**: Check file type and size
- **Preview**: Show preview before saving
- **Save**: Save to filesystem and update cache

#### 3.3 Config Editing
- **Real-time Updates**: Changes apply immediately
- **Size Control**: Adjust entity size
- **Rotation Control**: Set fixed screen angle
- **Offset Control**: Adjust draw offsets
- **Persistence**: Save to localStorage

### 4. Console Commands

#### 4.1 Menu Creation Commands
```javascript
// Create menu from config
cmd("menu", menuConfig)

// Create skins menu
cmd("skins")

// List all menus
cmd("menus")

// Close specific menu
cmd("close", "menu-id")

// Close all menus
cmd("closeall")
```

#### 4.2 Test Commands
```javascript
// Test basic menu
cmd("testmenu")

// Test tabs menu
cmd("testtabs")

// Test grid menu
cmd("testgrid")

// Test form menu
cmd("testform")
```

### 5. Viewport-Relative Scaling

#### 5.1 Position Calculation
```javascript
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

const left = config.viewportX * viewportWidth;
const top = config.viewportY * viewportHeight;
const width = config.viewportWidth * viewportWidth;
const height = config.viewportHeight * viewportHeight;
```

#### 5.2 Font Scaling
```javascript
const menuSize = Math.min(width, height);
const baseFontSize = Math.max(8, menuSize * 0.04);
const headerFontSize = Math.max(12, menuSize * 0.05);
const buttonFontSize = Math.max(10, menuSize * 0.035);
```

#### 5.3 Element Scaling
- **Buttons**: Size and padding scale with viewport
- **Grid Cells**: Cell size and gap scale proportionally
- **Images**: Image size scales with cell size
- **Spacing**: All margins and padding scale

### 6. Image Integration

#### 6.1 Asset Cache Loading
```javascript
// Load image from asset cache
const cachedImage = window.game.assetManager.getCachedImage('image:entity:tree');
if (cachedImage && cachedImage.image) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cachedImage.image, 0, 0, 64, 64);
  const imageDataUrl = canvas.toDataURL();
  // Use imageDataUrl in button config
}
```

#### 6.2 Image Processing
- **Resizing**: Scale images to fit grid cells
- **Format**: Convert to data URLs for display
- **Caching**: Cache processed images for performance
- **Fallbacks**: Show placeholder for missing images

### 7. Event Handling

#### 7.1 Menu Events
- **Drag**: Menus can be dragged around viewport
- **Resize**: Menus can be resized (if enabled)
- **Close**: Close button and Escape key
- **Focus**: Bring menu to front when clicked

#### 7.2 Game Integration
- **Input Isolation**: Menu events don't interfere with game
- **Pause**: Option to pause game when menu is open
- **Overlay**: Menu appears over game content
- **Transparency**: Optional background overlay

### 8. Implementation Phases

#### Phase 1: Basic Menu System
1. Create MenuManager class
2. Implement viewport-relative positioning
3. Add basic menu creation and display
4. Test with simple menu

#### Phase 2: Menu Components
1. Implement tabs system
2. Add grid buttons with image support
3. Create form elements (radio groups)
4. Test all components

#### Phase 3: Skins Menu
1. Create skins menu configuration
2. Implement upload functionality
3. Add config editing capabilities
4. Test full skins workflow

#### Phase 4: Integration
1. Integrate with asset cache
2. Add console commands
3. Test viewport scaling
4. Performance optimization

### 9. Success Criteria

#### 9.1 Functional Requirements
- ✅ Menus created dynamically through commands
- ✅ Full viewport-relative scaling
- ✅ Image loading from asset cache
- ✅ Skins menu with upload functionality
- ✅ Config editing and persistence

#### 9.2 Technical Requirements
- ✅ Responsive design
- ✅ Event isolation from game
- ✅ Performance optimization
- ✅ Error handling

#### 9.3 User Experience
- ✅ Intuitive interface
- ✅ Smooth scaling
- ✅ Fast image loading
- ✅ Easy upload process

### 10. Benefits

#### 10.1 Dynamic Menus
- **Command-Driven**: Create menus through console commands
- **Configurable**: Full customization through config objects
- **Reusable**: Components can be used in multiple menus

#### 10.2 Skins System
- **User Customization**: Players can upload their own images
- **Visual Variety**: Different styles for same entity types
- **Easy Management**: Centralized skins menu

#### 10.3 Future Extensibility
- **Mod Support**: External menu configurations
- **Plugin System**: Third-party menu components
- **Advanced Features**: Animation, transitions, themes

## Conclusion

The dynamic menu system with skins functionality will provide a powerful foundation for user customization and game management. The viewport-relative scaling ensures the interface works well on different screen sizes, while the image integration allows for rich visual content.

The skins menu will be the first official menu, demonstrating the system's capabilities and providing immediate value to users who want to customize their game experience. 