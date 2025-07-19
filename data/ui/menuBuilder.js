// Menu Builder System
// Main integration file for the menu creation system

const MenuBuilder = {
  // System state
  state: {
    currentMenu: null,
    selectedComponent: null,
    dragState: null,
    zoom: 1.0,
    gridSize: 10,
    snapToGrid: true,
    showGrid: true
  },

  // Initialize the menu builder
  init: function() {
    console.log("🎨 Menu Builder initialized");
    this.loadComponents();
    this.setupEventListeners();
    this.createMenuBarEntry();
  },

  // Load all available components
  loadComponents: function() {
    this.components = {
      button: ButtonComponent,
      tab: TabComponent,
      grid: GridComponent,
      form: FormComponent
    };
  },

  // Setup global event listeners
  setupEventListeners: function() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.saveCurrentMenu();
            break;
          case 'z':
            e.preventDefault();
            this.undo();
            break;
          case 'y':
            e.preventDefault();
            this.redo();
            break;
          case 'd':
            e.preventDefault();
            this.duplicateSelected();
            break;
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            this.deleteSelected();
            break;
        }
      }
    });

    // Global mouse events for drag and drop
    document.addEventListener('mousemove', (e) => {
      this.handleGlobalMouseMove(e);
    });

    document.addEventListener('mouseup', (e) => {
      this.handleGlobalMouseUp(e);
    });
  },

  // Create menu bar entry
  createMenuBarEntry: function() {
    // Add to existing menu bar
    if (window.UI && window.UI.menuBar) {
      window.UI.menuBar.addMenuItem({
        id: "menu-builder",
        label: "🎨 Menu Builder",
        icon: "🎨",
        action: () => this.openMenuBuilder()
      });
    }
  },

  // Open the main menu builder
  openMenuBuilder: function() {
    console.log("Opening Menu Builder...");
    
    // Create and show the main menu builder interface
    const mainMenu = MenuBuilderMenus.mainMenuBuilder;
    this.currentMenu = this.createMenu(mainMenu);
    
    // Load the default tab (Menus)
    this.loadTab('menus-tab');
  },

  // Create a menu from configuration
  createMenu: function(config) {
    const menu = {
      id: config.id,
      element: null,
      config: config,
      components: new Map(),
      eventListeners: new Map()
    };

    // Create the menu DOM element
    menu.element = this.createMenuElement(config);
    
    // Add to document
    document.body.appendChild(menu.element);
    
    // Setup event listeners
    this.setupMenuEventListeners(menu);
    
    return menu;
  },

  // Create menu DOM element
  createMenuElement: function(config) {
    const element = document.createElement('div');
    element.id = config.id;
    element.className = 'menu-builder-menu';
    
    // Apply styles
    Object.assign(element.style, {
      position: 'absolute',
      left: this.parsePosition(config.position.x),
      top: this.parsePosition(config.position.y),
      width: this.parseSize(config.size.width),
      height: this.parseSize(config.size.height),
      minWidth: config.size.minWidth || 'auto',
      minHeight: config.size.minHeight || 'auto',
      zIndex: config.style.zIndex || 1000,
      ...config.style
    });

    // Create components recursively
    this.createComponents(element, config.components || []);

    return element;
  },

  // Create components recursively
  createComponents: function(parentElement, components) {
    components.forEach(componentConfig => {
      const component = this.createComponent(componentConfig);
      if (component) {
        parentElement.appendChild(component);
      }
    });
  },

  // Create a single component
  createComponent: function(config) {
    const componentType = this.components[config.type];
    if (!componentType) {
      console.warn(`Component type '${config.type}' not found`);
      return null;
    }

    const element = document.createElement('div');
    element.id = config.id;
    element.className = `menu-builder-component ${config.type}`;
    
    // Apply styles
    Object.assign(element.style, {
      position: 'absolute',
      left: this.parsePosition(config.position?.x || '0%'),
      top: this.parsePosition(config.position?.y || '0%'),
      width: this.parseSize(config.size?.width || 'auto'),
      height: this.parseSize(config.size?.height || 'auto'),
      ...config.style
    });

    // Handle different component types
    switch (config.type) {
      case 'button':
        this.createButtonComponent(element, config);
        break;
      case 'label':
        this.createLabelComponent(element, config);
        break;
      case 'input':
        this.createInputComponent(element, config);
        break;
      case 'container':
        this.createContainerComponent(element, config);
        break;
      case 'tabNavigation':
        this.createTabNavigationComponent(element, config);
        break;
      case 'tabContent':
        this.createTabContentComponent(element, config);
        break;
      case 'collapsibleSection':
        this.createCollapsibleSectionComponent(element, config);
        break;
      case 'draggableComponent':
        this.createDraggableComponent(element, config);
        break;
      case 'designerCanvas':
        this.createDesignerCanvas(element, config);
        break;
      case 'propertySection':
        this.createPropertySection(element, config);
        break;
      default:
        console.warn(`Unknown component type: ${config.type}`);
    }

    // Setup component events
    this.setupComponentEvents(element, config);

    return element;
  },

  // Create button component
  createButtonComponent: function(element, config) {
    element.innerHTML = config.text || '';
    element.style.cursor = 'pointer';
    
    // Add icon if present
    if (config.icon) {
      element.innerHTML = `${config.icon} ${element.innerHTML}`;
    }
  },

  // Create label component
  createLabelComponent: function(element, config) {
    element.innerHTML = config.text || '';
    element.style.userSelect = 'none';
  },

  // Create input component
  createInputComponent: function(element, config) {
    const input = document.createElement('input');
    input.type = config.inputType || 'text';
    input.placeholder = config.placeholder || '';
    input.value = config.value || '';
    input.required = config.required || false;
    input.disabled = config.disabled || false;
    
    Object.assign(input.style, {
      width: '100%',
      height: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'inherit',
      fontSize: 'inherit'
    });
    
    element.appendChild(input);
  },

  // Create container component
  createContainerComponent: function(element, config) {
    if (config.components) {
      this.createComponents(element, config.components);
    }
  },

  // Create tab navigation component
  createTabNavigationComponent: function(element, config) {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'tab-navigation';
    
    config.tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.className = `tab ${tab.active ? 'active' : ''}`;
      tabElement.innerHTML = `${tab.icon || ''} ${tab.label}`;
      tabElement.dataset.tabId = tab.id;
      
      tabElement.addEventListener('click', () => {
        this.switchTab(tab.id);
      });
      
      tabContainer.appendChild(tabElement);
    });
    
    element.appendChild(tabContainer);
  },

  // Create tab content component
  createTabContentComponent: function(element, config) {
    element.className = 'tab-content';
    element.dataset.activeTab = config.activeTab || 0;
  },

  // Create collapsible section component
  createCollapsibleSectionComponent: function(element, config) {
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <span class="section-title">${config.title}</span>
      <span class="section-toggle">${config.expanded ? '▼' : '▶'}</span>
    `;
    
    const content = document.createElement('div');
    content.className = 'section-content';
    content.style.display = config.expanded ? 'block' : 'none';
    
    if (config.components) {
      this.createComponents(content, config.components);
    }
    
    header.addEventListener('click', () => {
      const isExpanded = content.style.display !== 'none';
      content.style.display = isExpanded ? 'none' : 'block';
      header.querySelector('.section-toggle').textContent = isExpanded ? '▶' : '▼';
    });
    
    element.appendChild(header);
    element.appendChild(content);
  },

  // Create draggable component
  createDraggableComponent: function(element, config) {
    element.className = 'draggable-component';
    element.draggable = true;
    element.dataset.componentType = config.componentType;
    
    // Create preview
    const preview = document.createElement('div');
    preview.className = 'component-preview';
    preview.innerHTML = config.icon || config.label;
    
    if (config.preview) {
      Object.assign(preview.style, config.preview.style);
      preview.innerHTML = config.preview.text || preview.innerHTML;
    }
    
    element.appendChild(preview);
    
    // Setup drag events
    element.addEventListener('dragstart', (e) => {
      this.handleDragStart(e, config);
    });
  },

  // Create designer canvas
  createDesignerCanvas: function(element, config) {
    element.className = 'designer-canvas';
    element.dataset.gridSize = config.properties?.gridSize || 10;
    element.dataset.snapToGrid = config.properties?.snapToGrid || true;
    element.dataset.showGrid = config.properties?.showGrid || true;
    
    // Add grid overlay
    if (config.properties?.showGrid) {
      this.addGridOverlay(element);
    }
    
    // Setup canvas events
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.handleCanvasDragOver(e);
    });
    
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      this.handleCanvasDrop(e);
    });
    
    element.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });
  },

  // Create property section
  createPropertySection: function(element, config) {
    const header = document.createElement('div');
    header.className = 'property-section-header';
    header.innerHTML = `
      <span class="property-title">${config.title}</span>
      <span class="property-toggle">${config.expanded ? '▼' : '▶'}</span>
    `;
    
    const content = document.createElement('div');
    content.className = 'property-section-content';
    content.style.display = config.expanded ? 'block' : 'none';
    
    if (config.components) {
      this.createComponents(content, config.components);
    }
    
    header.addEventListener('click', () => {
      const isExpanded = content.style.display !== 'none';
      content.style.display = isExpanded ? 'none' : 'block';
      header.querySelector('.property-toggle').textContent = isExpanded ? '▶' : '▼';
    });
    
    element.appendChild(header);
    element.appendChild(content);
  },

  // Setup component events
  setupComponentEvents: function(element, config) {
    if (config.events) {
      Object.keys(config.events).forEach(eventName => {
        const handler = config.events[eventName];
        if (typeof handler === 'function') {
          element.addEventListener(eventName, handler);
        } else if (typeof handler === 'string') {
          // Handle string-based event handlers (e.g., "MenuBuilder.close()")
          element.addEventListener(eventName, (e) => {
            this.executeStringHandler(handler, e);
          });
        }
      });
    }
  },

  // Execute string-based event handlers
  executeStringHandler: function(handler, event) {
    try {
      // Simple evaluation for method calls
      if (handler.includes('MenuBuilder.')) {
        const methodName = handler.split('MenuBuilder.')[1].replace('()', '');
        if (this[methodName]) {
          this[methodName](event);
        }
      }
    } catch (error) {
      console.error('Error executing event handler:', error);
    }
  },

  // Setup menu event listeners
  setupMenuEventListeners: function(menu) {
    // Close button
    const closeBtn = menu.element.querySelector('#close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // Tab navigation
    const tabNav = menu.element.querySelector('.tab-navigation');
    if (tabNav) {
      tabNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
          const tabId = e.target.dataset.tabId;
          this.switchTab(tabId);
        }
      });
    }
  },

  // Switch tabs
  switchTab: function(tabId) {
    console.log(`Switching to tab: ${tabId}`);
    
    // Update tab navigation
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tabId === tabId) {
        tab.classList.add('active');
      }
    });
    
    // Load tab content
    this.loadTab(tabId);
  },

  // Load tab content
  loadTab: function(tabId) {
    const tabContent = document.querySelector('.tab-content');
    if (!tabContent) return;
    
    // Clear existing content
    tabContent.innerHTML = '';
    
    // Load appropriate content based on tab
    switch (tabId) {
      case 'menus-tab':
        this.loadMenusTab(tabContent);
        break;
      case 'actionbars-tab':
        this.loadActionBarsTab(tabContent);
        break;
      case 'examples-tab':
        this.loadExamplesTab(tabContent);
        break;
      case 'export-tab':
        this.loadExportTab(tabContent);
        break;
    }
  },

  // Load menus tab content
  loadMenusTab: function(container) {
    const menusTab = MenuBuilderMenus.menusTab;
    this.createComponents(container, menusTab.components);
  },

  // Load action bars tab content
  loadActionBarsTab: function(container) {
    const actionBarBuilder = ActionBarBuilderMenus.actionBarBuilder;
    this.createComponents(container, actionBarBuilder.components);
  },

  // Load examples tab content
  loadExamplesTab: function(container) {
    const examplesTab = ExamplesMenus.examplesTab;
    this.createComponents(container, examplesTab.components);
  },

  // Load export tab content
  loadExportTab: function(container) {
    const exportTab = ExportMenus.exportTab;
    this.createComponents(container, exportTab.components);
  },

  // Drag and drop handlers
  handleDragStart: function(event, config) {
    event.dataTransfer.setData('application/json', JSON.stringify(config));
    event.dataTransfer.effectAllowed = 'copy';
  },

  handleCanvasDragOver: function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  },

  handleCanvasDrop: function(event) {
    event.preventDefault();
    
    try {
      const config = JSON.parse(event.dataTransfer.getData('application/json'));
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      
      // Calculate position relative to canvas
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Snap to grid if enabled
      const gridSize = parseInt(canvas.dataset.gridSize) || 10;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
      
      // Create component at drop position
      this.createComponentAtPosition(config, snappedX, snappedY, canvas);
      
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  },

  // Create component at specific position
  createComponentAtPosition: function(config, x, y, parent) {
    const componentConfig = {
      ...config,
      id: `${config.componentType}-${Date.now()}`,
      position: { x: `${x}px`, y: `${y}px` },
      size: { width: '100px', height: '30px' }
    };
    
    const component = this.createComponent(componentConfig);
    if (component) {
      parent.appendChild(component);
      this.selectComponent(component);
    }
  },

  // Select component
  selectComponent: function(component) {
    // Remove previous selection
    document.querySelectorAll('.component-selected').forEach(el => {
      el.classList.remove('component-selected');
    });
    
    // Add selection to current component
    component.classList.add('component-selected');
    this.state.selectedComponent = component;
    
    // Update property inspector
    this.updatePropertyInspector(component);
  },

  // Update property inspector
  updatePropertyInspector: function(component) {
    const inspector = document.querySelector('#property-inspector');
    if (!inspector) return;
    
    // Clear existing content
    inspector.innerHTML = '';
    
    // Create property inspector content
    const inspectorContent = this.createPropertyInspectorContent(component);
    inspector.appendChild(inspectorContent);
  },

  // Create property inspector content
  createPropertyInspectorContent: function(component) {
    const container = document.createElement('div');
    container.className = 'property-inspector-content';
    
    // Basic properties
    const basicProps = this.createPropertySection('Basic Properties', [
      { label: 'ID', type: 'input', value: component.id },
      { label: 'Type', type: 'input', value: component.className.split(' ')[1], disabled: true },
      { label: 'X', type: 'number', value: parseInt(component.style.left) || 0 },
      { label: 'Y', type: 'number', value: parseInt(component.style.top) || 0 },
      { label: 'Width', type: 'number', value: parseInt(component.style.width) || 100 },
      { label: 'Height', type: 'number', value: parseInt(component.style.height) || 30 }
    ]);
    
    container.appendChild(basicProps);
    
    return container;
  },

  // Create property section
  createPropertySection: function(title, fields) {
    const section = document.createElement('div');
    section.className = 'property-section';
    
    const header = document.createElement('div');
    header.className = 'property-section-header';
    header.textContent = title;
    
    const content = document.createElement('div');
    content.className = 'property-section-content';
    
    fields.forEach(field => {
      const fieldElement = this.createPropertyField(field);
      content.appendChild(fieldElement);
    });
    
    section.appendChild(header);
    section.appendChild(content);
    
    return section;
  },

  // Create property field
  createPropertyField: function(field) {
    const container = document.createElement('div');
    container.className = 'property-field';
    
    const label = document.createElement('label');
    label.textContent = field.label;
    
    const input = document.createElement('input');
    input.type = field.type || 'text';
    input.value = field.value || '';
    input.disabled = field.disabled || false;
    
    container.appendChild(label);
    container.appendChild(input);
    
    return container;
  },

  // Add grid overlay to canvas
  addGridOverlay: function(canvas) {
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'grid-overlay';
    gridOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 10px 10px;
    `;
    
    canvas.appendChild(gridOverlay);
  },

  // Utility functions
  parsePosition: function(value) {
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    return `${value}px`;
  },

  parseSize: function(value) {
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    return `${value}px`;
  },

  // Menu builder actions
  close: function() {
    if (this.currentMenu && this.currentMenu.element) {
      document.body.removeChild(this.currentMenu.element);
      this.currentMenu = null;
    }
  },

  saveCurrentMenu: function() {
    console.log('Saving current menu...');
    // Implementation for saving menu configuration
  },

  undo: function() {
    console.log('Undo action...');
    // Implementation for undo functionality
  },

  redo: function() {
    console.log('Redo action...');
    // Implementation for redo functionality
  },

  duplicateSelected: function() {
    console.log('Duplicating selected component...');
    // Implementation for duplicating components
  },

  deleteSelected: function() {
    if (this.state.selectedComponent) {
      this.state.selectedComponent.remove();
      this.state.selectedComponent = null;
    }
  },

  // Global mouse handlers
  handleGlobalMouseMove: function(event) {
    if (this.state.dragState) {
      // Handle global drag operations
    }
  },

  handleGlobalMouseUp: function(event) {
    this.state.dragState = null;
  },

  handleCanvasClick: function(event) {
    // Handle canvas clicks for component selection
    if (event.target.classList.contains('designer-canvas')) {
      this.selectComponent(null);
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MenuBuilder.init();
  });
} else {
  MenuBuilder.init();
}

// Export the menu builder
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuBuilder;
} else if (typeof window !== 'undefined') {
  window.MenuBuilder = MenuBuilder;
} 