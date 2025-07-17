# Step 4: Unified Menu System Requirements

## Overview

Create a unified, configurable menu system to replace the current skins and macro menus. The new system will use a single `Menu` class that can be configured to create any type of menu, while preserving all existing functionality and business logic.

## Core Requirements

### 1. **Menu Class Architecture**

#### **Static Configuration**
- `Menu.DEFAULT_CONFIG` - Base configuration with all default values
- Configurable properties that can be overridden via constructor
- Comprehensive styling, layout, and behavior defaults

#### **Constructor-Based Configuration**
- All UI aspects controlled via config object passed to constructor
- No hardcoded UI elements - everything configurable
- Support for complex nested configurations (tabs, buttons, forms, etc.)

### 2. **Preserve Existing Systems**

#### **No Changes to Current Code**
- Leave existing `ui/skins.js` and `ui/macros.js` completely unchanged
- Copy business logic from existing menus but don't modify source files
- Ensure all current functionality remains available in new implementation

#### **Business Logic Preservation**
- All skin management features (image upload, canvas editing, preferences)
- All macro management features (creation, editing, deletion, icon management)
- All data persistence and caching mechanisms
- All existing callback functions and event handlers

### 3. **Configurable UI Components**

#### **Tab System**
- Configurable tab structure with custom labels
- Tab content callbacks for dynamic content generation
- Tab switching behavior and state management
- Customizable tab styling and layout

#### **Button System**
- Configurable button placement, text, and styling
- Button callback functions for custom actions
- Button groups and layouts
- Icon support for buttons

#### **Form Elements**
- Input fields with validation and callbacks
- Radio button groups with change handlers
- Checkboxes and other form controls
- File upload components

#### **Image/Media Components**
- Image display and editing interfaces
- Canvas-based editing tools
- File upload and preview functionality
- Custom image manipulation callbacks

#### **Grid/List Components**
- Configurable grid layouts for items
- List views with custom item rendering
- Sorting and filtering capabilities
- Item selection and management

### 4. **Unified Design System**

#### **Consistent Look and Feel**
- Unified styling across all menus
- Consistent spacing, colors, and typography
- Standardized component layouts
- Responsive design principles

#### **Themeable Interface**
- All visual aspects configurable
- Support for custom themes and skins
- Color schemes, fonts, and spacing customization
- Component-level styling overrides

### 5. **Console Testing Support**

#### **Dynamic Menu Creation**
- Create menus from console with full configuration
- Test different UI layouts and configurations
- Validate callback functions and business logic
- Iterate on menu designs without code changes

#### **Configuration Validation**
- Validate menu configurations at runtime
- Error handling for invalid configurations
- Debug information for configuration issues
- Console feedback for successful menu creation

## Technical Specifications

### **Menu Class Structure**

```javascript
class Menu {
  static DEFAULT_CONFIG = {
    // Visual styling
    styling: { /* colors, fonts, spacing, etc. */ },
    
    // Layout configuration
    layout: { /* size, position, padding, etc. */ },
    
    // Content structure
    content: {
      tabs: [ /* tab configurations */ ],
      sections: [ /* content sections */ ],
      buttons: [ /* button configurations */ ]
    },
    
    // Behavior configuration
    behavior: {
      modal: true,
      resizable: true,
      draggable: false,
      closeOnEscape: true
    },
    
    // Event handlers
    callbacks: {
      onOpen: null,
      onClose: null,
      onTabChange: null,
      onButtonClick: null
    }
  }
  
  constructor(config = {}) {
    // Merge with defaults and create menu
  }
}
```

### **Configuration Schema**

#### **Tab Configuration**
```javascript
{
  id: 'string',
  label: 'string',
  content: 'function|string|element',
  active: boolean,
  disabled: boolean
}
```

#### **Button Configuration**
```javascript
{
  id: 'string',
  text: 'string',
  icon: 'string|element',
  position: 'string|object',
  style: 'object',
  callback: 'function',
  disabled: boolean
}
```

#### **Form Element Configuration**
```javascript
{
  type: 'input|radio|checkbox|file|select',
  id: 'string',
  label: 'string',
  value: 'any',
  options: 'array', // for radio/select
  validation: 'function',
  onChange: 'function'
}
```

### **MenuManager Architecture**

#### **Core Responsibilities**
- **Menu Lifecycle Management**: Create, open, close, and destroy menus
- **Z-Index Management**: Handle layering of multiple open menus
- **Escape Key Handling**: Centralized escape key listener to close all menus
- **Menu State Tracking**: Track which menus are open and their states
- **Menu Registration**: Register menu types and their configurations

#### **Additional MenuManager Features**

##### **Menu Stack Management**
- **Menu History**: Track menu opening order for back/forward navigation
- **Menu Dependencies**: Handle parent-child menu relationships
- **Menu Groups**: Group related menus for batch operations
- **Menu Focus Management**: Track which menu has keyboard focus

##### **Performance & Memory Management**
- **Menu Pooling**: Reuse menu instances for better performance
- **Lazy Loading**: Load menu content only when needed
- **Memory Cleanup**: Properly dispose of closed menus
- **Resource Monitoring**: Track memory usage of open menus

##### **Advanced UI Features**
- **Menu Positioning**: Smart positioning to avoid overlapping
- **Menu Minimization**: Allow menus to be minimized to taskbar
- **Menu Snap**: Snap menus to screen edges or other menus
- **Menu Transitions**: Smooth animations for opening/closing

##### **Developer Tools**
- **Menu Inspector**: Console commands to inspect open menus
- **Menu Debugging**: Debug information for menu state
- **Menu Performance**: Metrics on menu creation/rendering time
- **Menu Hot Reload**: Reload menu configurations without restart

##### **Accessibility & UX**
- **Keyboard Navigation**: Tab order management across menus
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Menu Announcements**: Announce menu state changes
- **Focus Restoration**: Restore focus when menus close

#### **MenuManager API**

```javascript
window.UI.menuManager = {
  // Core methods
  createMenu(config) { /* Create new menu instance */ },
  openMenu(menuId) { /* Open menu and manage z-index */ },
  closeMenu(menuId) { /* Close specific menu */ },
  closeAllMenus() { /* Close all open menus */ },
  
  // Advanced features
  minimizeMenu(menuId) { /* Minimize menu to taskbar */ },
  restoreMenu(menuId) { /* Restore minimized menu */ },
  snapMenu(menuId, target) { /* Snap menu to target */ },
  
  // Developer tools
  getOpenMenus() { /* Return list of open menus */ },
  getMenuState(menuId) { /* Get current state of menu */ },
  reloadMenu(menuId) { /* Reload menu configuration */ },
  
  // Performance
  getMenuMetrics() { /* Get performance metrics */ },
  cleanupMenus() { /* Clean up unused menu resources */ }
}
```

### **Integration Points**

#### **Menu Bar Integration**
- Menu bar buttons call `menuManager.openMenu()` instead of direct menu creation
- Menu bar state tracking via `menuManager.getOpenMenus()`
- Z-index management handled by MenuManager
- Escape key handling centralized in MenuManager

#### **Business Logic Integration**
- Import existing manager classes (skinsManager, macroManager)
- Preserve all existing data structures
- Maintain localStorage persistence
- Keep all existing API methods

## Implementation Phases

### **Phase 1: MenuManager Core**
- Create `MenuManager` class with core functionality
- Implement z-index management and escape key handling
- Create basic `Menu` class with `DEFAULT_CONFIG`
- Console testing capabilities for MenuManager

### **Phase 2: Menu Class Implementation**
- Implement comprehensive `Menu` class with all configurable components
- Support for tabs, buttons, forms, and media components
- Unified styling system and theme support
- Integration with MenuManager for lifecycle management

### **Phase 3: Skins Menu Implementation**
- Create new skins menu using Menu class and MenuManager
- Copy all business logic from existing skins.js
- Implement all current features (image upload, canvas editing, etc.)
- Test against existing functionality

### **Phase 4: Macro Menu Implementation**
- Create new macro menu using Menu class and MenuManager
- Copy all business logic from existing macros.js
- Implement all current features (macro creation, editing, etc.)
- Test against existing functionality

### **Phase 5: Menu Bar Integration**
- Update menu bar to use MenuManager instead of direct menu creation
- Preserve existing menu bar functionality and state tracking
- Ensure seamless integration with new menu system
- Performance testing and optimization

### **Phase 6: Advanced Features & Polish**
- Implement advanced MenuManager features (minimization, snapping, etc.)
- Developer tools and debugging capabilities
- Accessibility improvements and keyboard navigation
- Documentation, examples, and final testing

## Success Criteria

### **Functional Requirements**
- [ ] All existing skins functionality preserved
- [ ] All existing macro functionality preserved
- [ ] New menus work with existing menu bar system
- [ ] Console testing allows dynamic menu creation
- [ ] All UI elements are configurable via constructor

### **Technical Requirements**
- [ ] No changes to existing ui/skins.js or ui/macros.js
- [ ] Menu class is fully configurable
- [ ] Unified design system across all menus
- [ ] Performance equivalent to existing menus
- [ ] Error handling for invalid configurations

### **User Experience Requirements**
- [ ] Consistent look and feel across all menus
- [ ] Intuitive navigation and interaction
- [ ] Responsive design for different screen sizes
- [ ] Accessibility considerations
- [ ] Smooth animations and transitions

## Future Considerations

### **Extensibility**
- Support for new menu types without code changes
- Plugin system for custom components
- Theme system for visual customization
- Internationalization support

### **Advanced Features**
- Drag and drop functionality
- Keyboard shortcuts and navigation
- Undo/redo capabilities
- Search and filtering across menus
- Menu state persistence

### **Developer Experience**
- Comprehensive documentation
- Example configurations
- Debugging tools
- Performance monitoring
- Testing utilities 