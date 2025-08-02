# Menu Creation System Requirements

## Vision: Comprehensive Menu Creation System

### 1. Menu Creation Menu (Main Interface)

#### Location: Menu Bar → "Menu Builder"
A powerful visual menu creation tool accessible from the main menu bar.

#### Tab Structure:
1. **Menus Tab** (Default) - Create and edit menu configurations
2. **Action Bars Tab** - Create action bar layouts and grids
3. **Examples Tab** - Pre-built examples and templates
4. **Export Tab** - Serialize and export configurations

### 2. Menus Tab Features

#### Menu Builder Interface:
- **Visual Menu Designer**: Drag-and-drop interface for menu creation
- **Component Palette**: Buttons, tabs, forms, grids, images, sub-menus
- **Property Inspector**: Edit component properties in real-time
- **Live Preview**: See changes immediately in a preview window
- **Menu Tree View**: Hierarchical view of menu structure

#### Menu Components:
- **Basic Elements**: Buttons, labels, text inputs, checkboxes, radio buttons
- **Advanced Elements**: Tabs, accordions, grids, image galleries
- **Layout Elements**: Containers, dividers, spacers, panels
- **Interactive Elements**: Dropdowns, sliders, color pickers, file inputs
- **Custom Elements**: Charts, progress bars, status indicators

#### Menu Properties:
- **Position**: x, y coordinates, z-index
- **Size**: width, height, min/max dimensions
- **Style**: background, border, padding, margin
- **Behavior**: draggable, resizable, modal, auto-close
- **Events**: onClick, onHover, onFocus, custom callbacks

### 3. Action Bars Tab Features

#### Action Bar Designer:
- **Grid Layout**: Visual grid designer for action bar slots
- **Slot Management**: Add/remove slots, configure key bindings
- **Macro Integration**: Connect slots to macros and commands
- **Visual Feedback**: Preview action bar appearance and behavior
- **Responsive Design**: Configure different layouts for different screen sizes

#### Action Bar Components:
- **Slot Types**: Regular, toggle, cooldown, charge-based
- **Visual Styles**: Icons, text, progress bars, cooldown overlays
- **Key Bindings**: Keyboard shortcuts, mouse buttons, gamepad
- **Macro Support**: Execute macros, commands, scripts
- **State Management**: Track cooldowns, charges, toggles

### 4. Examples Tab Features

#### Pre-built Examples:
- **Macro Menu Clone**: Complete recreation of current macro menu functionality
- **Skin Menu Clone**: Complete recreation of current skin menu functionality
- **Inventory System**: Grid-based inventory with drag-and-drop
- **Character Sheet**: Tabbed character information display
- **Settings Panel**: Comprehensive settings with categories
- **Chat Interface**: Multi-tab chat with emote system
- **Quest Log**: Hierarchical quest tracking interface
- **Crafting System**: Recipe browser with material requirements

#### Template Categories:
- **Game Systems**: Inventory, character, quest, crafting
- **UI Components**: Forms, dialogs, panels, toolbars
- **Data Display**: Tables, charts, lists, grids
- **Interactive**: Wizards, surveys, games, tools

### 5. Export Tab Features

#### Serialization System:
- **JSON Export**: Complete menu configuration as JSON
- **UI Skin Files**: Export as `.uiskin` files for distribution
- **Code Generation**: Generate JavaScript code for custom menus
- **Version Control**: Track changes and manage versions
- **Import/Export**: Share configurations between users

#### Export Formats:
- **Complete UI Skin**: All menus, action bars, and configurations
- **Individual Menus**: Export single menu configurations
- **Action Bar Sets**: Export action bar layouts and bindings
- **Component Libraries**: Reusable component collections
- **Documentation**: Auto-generated documentation for custom menus

### 6. Advanced Features

#### Dynamic Menu System:
- **Runtime Creation**: Create menus during gameplay
- **Player Customization**: Allow players to create their own menus
- **Plugin System**: Support for third-party menu plugins
- **Conditional Display**: Show/hide menus based on game state
- **Animation Support**: Smooth transitions and animations

#### Integration Features:
- **Game Data Binding**: Connect menus to game state
- **Event System**: React to game events and updates
- **Persistence**: Save custom menu configurations
- **Multiplayer Sync**: Share menu configurations in multiplayer
- **Accessibility**: Screen reader support, keyboard navigation

### 7. Responsive Canvas UI System ⭐ **IMPORTANT**

#### Canvas-Integrated UI Rendering:
- **Proportional Scaling**: Menus and action bars scale directly with canvas size
- **Viewport-Aware Positioning**: UI elements positioned relative to canvas dimensions
- **Aspect Ratio Support**: UI adapts to current screen ratio settings
- **Unbound Ratio Mode**: Everything renders proportional to viewport height/width ratio
- **Overlay Rendering**: UI can render directly on top of canvas or outside it

#### Responsive Layout Modes:
- **Canvas-Overlay Mode**: UI rendered directly on top of canvas (HTML/CSS)
- **Canvas-Integrated Mode**: UI rendered as part of canvas (WebGL/2D context)
- **Hybrid Mode**: Critical UI on canvas, secondary UI outside
- **Adaptive Mode**: Automatically switches based on viewport size

#### Canvas Scaling System:
- **Dynamic Resolution**: Canvas scales with viewport while maintaining aspect ratio
- **UI Synchronization**: All UI elements scale proportionally with canvas
- **Responsive Breakpoints**: Different UI layouts for different screen sizes
- **Performance Optimization**: Efficient rendering for both small and large viewports

#### Technical Implementation:
```javascript
// Canvas-aware UI positioning
{
  "position": {
    "mode": "canvas-relative", // or "viewport-relative", "absolute"
    "x": "10%", // percentage of canvas width
    "y": "20%", // percentage of canvas height
    "anchor": "top-left" // or "center", "bottom-right", etc.
  },
  "size": {
    "width": "25%", // percentage of canvas width
    "height": "15%", // percentage of canvas height
    "minWidth": "200px",
    "maxWidth": "400px"
  },
  "responsive": {
    "breakpoints": {
      "small": { "maxWidth": "768px", "layout": "stacked" },
      "medium": { "maxWidth": "1024px", "layout": "side-by-side" },
      "large": { "minWidth": "1025px", "layout": "expanded" }
    }
  }
}
```

#### HTML Over Canvas Best Practices:
- **Position Management**: Use `position: absolute` with `%`, `vh`, `vw` units
- **Event Handling**: Proper z-index management and pointer-events control
- **Resize Synchronization**: Shared resize handler for canvas and UI
- **Performance**: Avoid DOM scrolling conflicts with game rendering
- **Responsive Design**: CSS Grid/Flexbox for adaptive layouts

## Technical Implementation

### 1. Menu Configuration Structure
```javascript
{
  "id": "unique-menu-id",
  "type": "menu",
  "title": "Menu Title",
  "position": {
    "mode": "canvas-relative", // "canvas-relative", "viewport-relative", "absolute"
    "x": "10%", // percentage of canvas width or absolute pixels
    "y": "20%", // percentage of canvas height or absolute pixels
    "anchor": "top-left" // "top-left", "center", "bottom-right", etc.
  },
  "size": {
    "width": "25%", // percentage of canvas width or absolute pixels
    "height": "15%", // percentage of canvas height or absolute pixels
    "minWidth": "200px",
    "maxWidth": "400px",
    "aspectRatio": "16:9" // optional, maintain aspect ratio
  },
  "style": {
    "background": "#ffffff",
    "border": "1px solid #ccc",
    "borderRadius": "5px",
    "zIndex": 1000
  },
  "responsive": {
    "breakpoints": {
      "small": { "maxWidth": "768px", "layout": "stacked", "size": { "width": "90%", "height": "auto" } },
      "medium": { "maxWidth": "1024px", "layout": "side-by-side", "size": { "width": "50%", "height": "60%" } },
      "large": { "minWidth": "1025px", "layout": "expanded", "size": { "width": "30%", "height": "70%" } }
    }
  },
  "rendering": {
    "mode": "canvas-overlay", // "canvas-overlay", "canvas-integrated", "hybrid"
    "layer": "ui", // "background", "game", "ui", "overlay"
    "pointerEvents": "auto" // "auto", "none", "game-only"
  },
  "components": [
    {
      "id": "button-1",
      "type": "button",
      "text": "Click Me",
      "position": { "x": "10%", "y": "10%", "anchor": "top-left" },
      "size": { "width": "100px", "height": "30px" },
      "events": {
        "onClick": "console.log('Button clicked')"
      }
    }
  ],
  "tabs": [
    {
      "id": "tab-1",
      "label": "Tab 1",
      "components": [...]
    }
  ]
}
```

### 2. Action Bar Configuration
```javascript
{
  "id": "action-bar-1",
  "type": "actionBar",
  "position": {
    "mode": "canvas-relative",
    "x": "50%", // center of canvas
    "y": "90%", // bottom of canvas
    "anchor": "bottom-center"
  },
  "size": {
    "width": "60%", // percentage of canvas width
    "height": "8%", // percentage of canvas height
    "minWidth": "400px",
    "maxWidth": "800px"
  },
  "layout": "grid",
  "gridSize": { "columns": 12, "rows": 1 },
  "responsive": {
    "breakpoints": {
      "small": { "gridSize": { "columns": 6, "rows": 2 }, "size": { "width": "95%", "height": "12%" } },
      "medium": { "gridSize": { "columns": 10, "rows": 1 }, "size": { "width": "80%", "height": "10%" } },
      "large": { "gridSize": { "columns": 12, "rows": 1 }, "size": { "width": "60%", "height": "8%" } }
    }
  },
  "rendering": {
    "mode": "canvas-overlay",
    "layer": "ui",
    "pointerEvents": "auto"
  },
  "slots": [
    {
      "id": "slot-1",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 1, "height": 1 },
      "keyBinding": "Key1",
      "macro": "macro-id-1",
      "visual": {
        "icon": "sword.png",
        "cooldown": true,
        "charges": false,
        "scale": "proportional" // "proportional", "fixed", "adaptive"
      }
    }
  ]
}
```

### 3. File Structure
```
data/ui/
├── menu-configs/
│   ├── menu-builder-menus.js      # Menu builder interface
│   ├── action-bar-builder-menus.js # Action bar builder
│   ├── examples-menus.js          # Example menus
│   └── export-menus.js            # Export interface
├── components/
│   ├── button.js                  # Button component
│   ├── tab.js                     # Tab component
│   ├── grid.js                    # Grid component
│   └── form.js                    # Form component
└── templates/
    ├── macro-menu-template.js     # Macro menu template
    ├── skin-menu-template.js      # Skin menu template
    └── inventory-template.js      # Inventory template
```

## Implementation Phases

### Phase 1: Bug Fix & Foundation
- [ ] Fix `handleEscape` reference error in skins.js
- [ ] Create basic menu builder interface
- [ ] Implement component system foundation
- [ ] Implement responsive canvas positioning system
- [ ] Add canvas-aware UI rendering modes

### Phase 2: Core Menu Builder
- [ ] Visual menu designer
- [ ] Component palette
- [ ] Property inspector
- [ ] Live preview
- [ ] Canvas-responsive layout tools

### Phase 3: Action Bar Builder
- [ ] Grid layout designer
- [ ] Slot management
- [ ] Key binding system
- [ ] Macro integration
- [ ] Responsive action bar positioning

### Phase 4: Canvas Integration
- [ ] Canvas-overlay rendering system
- [ ] Canvas-integrated rendering system
- [ ] Hybrid rendering mode
- [ ] Responsive breakpoint system
- [ ] Performance optimization for canvas UI

### Phase 5: Examples & Templates
- [ ] Macro menu clone
- [ ] Skin menu clone
- [ ] Additional example menus
- [ ] Template library
- [ ] Responsive canvas examples

### Phase 6: Export System
- [ ] JSON serialization
- [ ] UI skin file format
- [ ] Import/export functionality
- [ ] Version control
- [ ] Canvas configuration export

### Phase 7: Advanced Features
- [ ] Dynamic menu creation
- [ ] Player customization
- [ ] Plugin system
- [ ] Multiplayer support
- [ ] Advanced responsive features

## Success Criteria

### Functional Requirements
- [ ] Fix the handleEscape bug completely
- [ ] Create functional menu builder interface
- [ ] Successfully clone existing macro and skin menus
- [ ] Export/import menu configurations
- [ ] Support all current menu functionality
- [ ] Implement responsive canvas UI positioning
- [ ] Support multiple rendering modes (overlay, integrated, hybrid)
- [ ] Handle viewport scaling and aspect ratio changes

### Technical Requirements
- [ ] Clean, maintainable code structure
- [ ] Proper error handling and validation
- [ ] Performance optimization for complex menus
- [ ] Backward compatibility with existing menus
- [ ] Extensible architecture for future features
- [ ] Efficient canvas-UI synchronization
- [ ] Responsive breakpoint system
- [ ] Event handling coordination between canvas and UI layers

### User Experience Requirements
- [ ] Intuitive drag-and-drop interface
- [ ] Real-time preview and feedback
- [ ] Comprehensive documentation and help
- [ ] Smooth animations and transitions
- [ ] Accessibility compliance
- [ ] Seamless canvas integration
- [ ] Responsive design across all screen sizes
- [ ] Consistent UI scaling with canvas

## Future Enhancements

### Advanced Features
- **AI-Powered Suggestions**: Suggest menu layouts based on content
- **Collaborative Editing**: Multiple users editing the same menu
- **Marketplace**: Share and sell custom menu configurations
- **Analytics**: Track menu usage and performance
- **Mobile Support**: Touch-friendly interface for mobile devices

### Integration Possibilities
- **Game Engine Integration**: Direct integration with game systems
- **Third-Party APIs**: Connect to external services and APIs
- **Real-time Collaboration**: Live collaboration on menu design
- **Version History**: Complete history of menu changes
- **Rollback System**: Revert to previous menu versions 