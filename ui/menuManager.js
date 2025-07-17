// ui/menuManager.js
// Unified Menu System - MenuManager and Menu classes

class Menu {
  constructor(config) {
    if (!config.id) {
      throw new Error('Menu config must include an id property');
    }
    this.id = config.id;
    this.title = config.title || 'Menu';
    this.visible = false;
    this.zIndex = 1000;
    this.element = null;
    this.config = config;
    this.destroyOnClose = config.destroyOnClose || false;
    
    this.createMenuElement();
  }
  
  createMenuElement() {
    // Create the menu container
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.className = 'menu-container';
    this.element.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50px;
      min-width: 300px;
      min-height: 200px;
      background: #2a2a2a;
      border: 2px solid #444;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      z-index: ${this.zIndex};
      display: none;
      font-family: 'Courier New', monospace;
      color: #fff;
      resize: both;
      overflow: hidden;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.className = 'menu-header';
    header.style.cssText = `
      background: #333;
      padding: 8px 12px;
      border-bottom: 1px solid #555;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    `;
    
    const title = document.createElement('span');
    title.textContent = this.title;
    title.style.cssText = `
      font-weight: bold;
      font-size: 14px;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#555';
    closeBtn.onmouseout = () => closeBtn.style.background = 'none';
    closeBtn.onclick = () => this.hide();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create main content container
    const mainContent = document.createElement('div');
    mainContent.style.cssText = `
      display: flex;
      flex-direction: column;
      height: calc(100% - 50px);
    `;
    
    // Always create a tab system - single tab if no tabs configured
    this.createTabSystem(mainContent);
    
    // Assemble the menu
    this.element.appendChild(header);
    this.element.appendChild(mainContent);
    
    // Add to document
    document.body.appendChild(this.element);
    
    // Make draggable
    this.makeDraggable();
  }
  
  createTabSystem(mainContent) {
    // Determine if we have explicit tabs or need to create a single tab
    const hasExplicitTabs = this.config.tabs && Array.isArray(this.config.tabs) && this.config.tabs.length > 0;
    
    // Create tab container (hidden if single tab)
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: ${hasExplicitTabs ? 'flex' : 'none'};
      border-bottom: 2px solid #444;
      background: #333;
    `;
    
    // Create content area
    const contentArea = document.createElement('div');
    contentArea.style.cssText = `
      flex: 1;
      overflow: auto;
      padding: 12px;
    `;
    
    // Create tabs array - either from config or single default tab
    this.tabs = hasExplicitTabs ? this.config.tabs : [{
      name: 'Content',
      content: this.config.content,
      buttons: this.config.buttons,
      radioGroups: this.config.radioGroups
    }];
    
    // Create tab buttons (only if multiple tabs)
    if (hasExplicitTabs) {
      this.tabs.forEach((tab, index) => {
        const tabBtn = document.createElement('button');
        tabBtn.textContent = tab.name;
        tabBtn.style.cssText = `
          background: ${index === 0 ? '#4ECDC4' : 'transparent'};
          color: ${index === 0 ? '#222' : '#fff'};
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          border-radius: 6px 6px 0 0;
          font-weight: ${index === 0 ? 'bold' : 'normal'};
          margin-right: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        `;
        
        tabBtn.onclick = () => this.switchTab(index, tabContainer, contentArea);
        tabContainer.appendChild(tabBtn);
      });
    }
    
    // Add tab container and content area to main content
    mainContent.appendChild(tabContainer);
    mainContent.appendChild(contentArea);
    
    // Load initial tab content
    this.loadTabContent(0, contentArea);
  }
  

  
  switchTab(tabIndex, tabContainer, contentArea) {
    // Update tab button styles
    const tabButtons = tabContainer.querySelectorAll('button');
    tabButtons.forEach((btn, index) => {
      btn.style.background = index === tabIndex ? '#4ECDC4' : 'transparent';
      btn.style.color = index === tabIndex ? '#222' : '#fff';
      btn.style.fontWeight = index === tabIndex ? 'bold' : 'normal';
    });
    
    // Load tab content
    this.loadTabContent(tabIndex, contentArea);
  }
  
  loadTabContent(tabIndex, contentArea) {
    const tab = this.tabs[tabIndex];
    if (!tab) return;
    
    // Clear content area
    contentArea.innerHTML = '';
    
    // Add tab content
    if (tab.content) {
      if (typeof tab.content === 'string') {
        contentArea.innerHTML = tab.content;
      } else if (tab.content instanceof HTMLElement) {
        contentArea.appendChild(tab.content);
      }
    }
    
    // Add radio groups
    if (tab.radioGroups && Array.isArray(tab.radioGroups)) {
      tab.radioGroups.forEach(radioGroup => {
        const radioContainer = this.createRadioGroup(radioGroup);
        contentArea.appendChild(radioContainer);
      });
    }
    
    // Add grid buttons
    if (tab.gridButtons && Array.isArray(tab.gridButtons)) {
      tab.gridButtons.forEach(gridConfig => {
        const gridContainer = this.createGridButtons(gridConfig);
        contentArea.appendChild(gridContainer);
      });
    }
    
    // Add tab buttons
    if (tab.buttons && Array.isArray(tab.buttons)) {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      `;
      
      tab.buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.textContent = buttonConfig.text || 'Button';
        button.style.cssText = `
          background: #444;
          border: 1px solid #666;
          color: #fff;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        `;
        button.onmouseover = () => button.style.background = '#555';
        button.onmouseout = () => button.style.background = '#444';
        button.onclick = buttonConfig.onClick || (() => console.log('Tab button clicked'));
        
        buttonContainer.appendChild(button);
      });
      
      contentArea.appendChild(buttonContainer);
    }
  }
  
  createRadioGroup(radioGroup) {
    const container = document.createElement('div');
    container.style.cssText = `
      margin: 12px 0;
      padding: 12px;
      background: #333;
      border-radius: 6px;
      border: 1px solid #555;
    `;
    
    // Group label
    if (radioGroup.label) {
      const label = document.createElement('div');
      label.textContent = radioGroup.label;
      label.style.cssText = `
        font-weight: bold;
        margin-bottom: 8px;
        color: #fff;
        font-size: 14px;
      `;
      container.appendChild(label);
    }
    
    // Radio options
    if (radioGroup.options && Array.isArray(radioGroup.options)) {
      radioGroup.options.forEach((option, index) => {
        const optionContainer = document.createElement('div');
        optionContainer.style.cssText = `
          display: flex;
          align-items: center;
          margin: 6px 0;
          cursor: pointer;
        `;
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = radioGroup.name || 'radio-group';
        radio.value = option.value || option.text || index.toString();
        radio.checked = option.checked || (index === 0 && !radioGroup.options.some(opt => opt.checked));
        radio.style.cssText = `
          margin-right: 8px;
          cursor: pointer;
        `;
        
        const optionLabel = document.createElement('label');
        optionLabel.textContent = option.text || option.value || `Option ${index + 1}`;
        optionLabel.style.cssText = `
          cursor: pointer;
          color: #fff;
          font-size: 13px;
        `;
        
        // Handle radio change
        radio.onchange = () => {
          if (radio.checked && radioGroup.onChange) {
            radioGroup.onChange(option.value || option.text || index.toString(), option);
          }
        };
        
        // Make label clickable
        optionLabel.onclick = () => radio.click();
        
        optionContainer.appendChild(radio);
        optionContainer.appendChild(optionLabel);
        container.appendChild(optionContainer);
      });
    }
    
    return container;
  }
  
  createGridButtons(gridConfig) {
    const container = document.createElement('div');
    container.style.cssText = `
      margin: 12px 0;
    `;
    
    // Grid label
    if (gridConfig.label) {
      const label = document.createElement('div');
      label.textContent = gridConfig.label;
      label.style.cssText = `
        font-weight: bold;
        margin-bottom: 12px;
        color: #fff;
        font-size: 14px;
      `;
      container.appendChild(label);
    }
    
    // Create grid
    const grid = document.createElement('div');
    const rows = gridConfig.rows || 4;
    const cols = gridConfig.cols || 4;
    const cellSize = gridConfig.cellSize || 80;
    const gap = gridConfig.gap || 16;
    
    grid.style.cssText = `
      display: grid;
      grid-template-rows: repeat(${rows}, ${cellSize}px);
      grid-template-columns: repeat(${cols}, ${cellSize}px);
      gap: ${gap}px;
      justify-content: start;
    `;
    
    // Create grid cells
    const buttons = gridConfig.buttons || [];
    const totalCells = rows * cols;
    
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = `
        background: #333;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        transition: background 0.2s;
        padding: 8px;
        box-sizing: border-box;
        border: 1px solid #555;
      `;
      
      const button = buttons[i];
      
      if (button) {
        // Filled cell with button data
        if (button.imageDataUrl) {
          const img = document.createElement('img');
          img.src = button.imageDataUrl;
          img.alt = button.name || 'Button';
          img.style.cssText = `
            width: ${cellSize * 0.5}px;
            height: ${cellSize * 0.5}px;
            margin-bottom: 6px;
            border-radius: 6px;
            object-fit: cover;
          `;
          cell.appendChild(img);
        }
        
        const name = document.createElement('div');
        name.textContent = button.name || `Button ${i + 1}`;
        name.style.cssText = `
          font-size: 12px;
          text-align: center;
          word-break: break-all;
          color: #fff;
          font-family: 'Courier New', monospace;
        `;
        cell.appendChild(name);
        
        // Hover effects
        cell.onmouseenter = () => {
          cell.style.background = '#444';
          if (button.tooltip) {
            cell.title = button.tooltip;
          }
        };
        cell.onmouseleave = () => {
          cell.style.background = '#333';
        };
        
        // Click handler
        cell.onclick = button.onClick || (() => console.log(`Grid button ${i} clicked`));
        
      } else {
        // Empty cell with plus sign
        const plus = document.createElement('div');
        plus.textContent = '+';
        plus.style.cssText = `
          font-size: 32px;
          color: #aaa;
          user-select: none;
        `;
        cell.appendChild(plus);
        
        // Hover effects for empty cell
        cell.onmouseenter = () => {
          cell.style.background = '#444';
          if (gridConfig.emptyTooltip) {
            cell.title = gridConfig.emptyTooltip;
          }
        };
        cell.onmouseleave = () => {
          cell.style.background = '#333';
        };
        
        // Click handler for empty cell
        cell.onclick = gridConfig.onEmptyClick || (() => console.log(`Empty grid cell ${i} clicked`));
      }
      
      grid.appendChild(cell);
    }
    
    container.appendChild(grid);
    return container;
  }
  
  makeDraggable() {
    const header = this.element.querySelector('.menu-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    header.onmousedown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(this.element.style.left) || 50;
      startTop = parseInt(this.element.style.top) || 50;
      
      // Bring menu to front when starting to drag
      this.bringToFront();
      
      document.onmousemove = (e) => {
        if (!isDragging) return;
        
        const newLeft = startLeft + (e.clientX - startX);
        const newTop = startTop + (e.clientY - startY);
        
        this.element.style.left = `${newLeft}px`;
        this.element.style.top = `${newTop}px`;
      };
      
      document.onmouseup = () => {
        isDragging = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
    
    // Add click-to-front functionality for the entire menu
    this.element.onmousedown = (e) => {
      // Don't interfere with dragging
      if (e.target.closest('.menu-header')) return;
      
      // Bring menu to front when clicked
      this.bringToFront();
    };
  }
  
  show() {
    this.visible = true;
    this.element.style.display = 'block';
    this.bringToFront();
  }
  
  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    
    if (this.destroyOnClose) {
      this.destroy();
      if (window.UI.menuManager) {
        window.UI.menuManager.removeMenu(this.id);
        console.log(`[MenuManager] Auto-destroyed menu: ${this.id}`);
      }
    }
  }
  
  bringToFront() {
    // This will be managed by MenuManager
    if (window.UI.menuManager) {
      window.UI.menuManager.bringMenuToFront(this);
    }
  }
  
  // Method to check if menu is currently on top
  isOnTop() {
    if (!window.UI.menuManager) return false;
    const topMenu = window.UI.menuManager.getTopMenu();
    return topMenu && topMenu.id === this.id;
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

class MenuManager {
  constructor() {
    this.menus = new Map();
    this.nextZIndex = 1000;
    this.setupEscapeKeyHandler();
  }
  
  createMenu(config) {
    if (!config.id) {
      throw new Error('Menu config must include an id property');
    }
    
    if (this.menus.has(config.id)) {
      throw new Error(`Menu with id '${config.id}' already exists`);
    }
    
    const menu = new Menu(config);
    this.menus.set(menu.id, menu);
    console.log(`[MenuManager] Created menu: ${menu.id}`);
    return menu.id;
  }
  
  showMenu(menuId) {
    const menu = this.menus.get(menuId);
    if (menu) {
      menu.show();
      console.log(`[MenuManager] Showed menu: ${menuId}`);
    } else {
      console.warn(`[MenuManager] Menu not found: ${menuId}`);
    }
  }
  
  hideMenu(menuId) {
    const menu = this.menus.get(menuId);
    if (menu) {
      menu.hide();
      console.log(`[MenuManager] Hid menu: ${menuId}`);
    } else {
      console.warn(`[MenuManager] Menu not found: ${menuId}`);
    }
  }
  
  removeMenu(menuId) {
    const menu = this.menus.get(menuId);
    if (menu) {
      menu.destroy();
      this.menus.delete(menuId);
      console.log(`[MenuManager] Removed menu: ${menuId}`);
    } else {
      console.warn(`[MenuManager] Menu not found: ${menuId}`);
    }
  }
  
  bringMenuToFront(menu) {
    // Find the highest z-index currently in use
    let maxZIndex = 1000;
    this.menus.forEach(m => {
      if (m.visible && m.zIndex > maxZIndex) {
        maxZIndex = m.zIndex;
      }
    });
    
    // Set this menu's z-index higher than the current maximum
    menu.zIndex = maxZIndex + 1;
    menu.element.style.zIndex = menu.zIndex;
    
    console.log(`[MenuManager] Brought menu ${menu.id} to front with z-index: ${menu.zIndex}`);
  }
  
  getTopMenu() {
    let topMenu = null;
    let highestZIndex = 0;
    
    this.menus.forEach(menu => {
      if (menu.visible && menu.zIndex > highestZIndex) {
        highestZIndex = menu.zIndex;
        topMenu = menu;
      }
    });
    
    return topMenu;
  }
  
  setupEscapeKeyHandler() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const topMenu = this.getTopMenu();
        if (topMenu) {
          topMenu.hide();
          console.log(`[MenuManager] Closed top menu: ${topMenu.id}`);
        }
      }
    });
  }
  
  // Debug methods
  listMenus() {
    console.log('[MenuManager] Current menus:');
    this.menus.forEach((menu, id) => {
      console.log(`  ${id}: ${menu.title} (visible: ${menu.visible}, z-index: ${menu.zIndex})`);
    });
  }
  
  getMenu(menuId) {
    return this.menus.get(menuId);
  }
}

// Create and export the MenuManager
const menuManager = new MenuManager();

// Add to global UI object
if (!window.UI) {
  window.UI = {};
}
window.UI.menuManager = menuManager;

console.log('[MenuManager] MenuManager initialized and available at window.UI.menuManager'); 