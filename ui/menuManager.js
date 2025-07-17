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
    
    // Create tab system if tabs are configured
    if (this.config.tabs && Array.isArray(this.config.tabs) && this.config.tabs.length > 0) {
      this.createTabSystem(mainContent);
    } else {
      // Create simple content area
      this.createSimpleContent(mainContent);
    }
    
    // Assemble the menu
    this.element.appendChild(header);
    this.element.appendChild(mainContent);
    
    // Add to document
    document.body.appendChild(this.element);
    
    // Make draggable
    this.makeDraggable();
  }
  
  createTabSystem(mainContent) {
    // Create tab container
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
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
    
    // Create tab buttons
    this.config.tabs.forEach((tab, index) => {
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
    
    // Add tab container and content area to main content
    mainContent.appendChild(tabContainer);
    mainContent.appendChild(contentArea);
    
    // Load initial tab content
    this.loadTabContent(0, contentArea);
  }
  
  createSimpleContent(mainContent) {
    const content = document.createElement('div');
    content.className = 'menu-content';
    content.style.cssText = `
      padding: 12px;
      flex: 1;
      overflow: auto;
    `;
    
    // Add configured content
    if (this.config.content) {
      if (typeof this.config.content === 'string') {
        content.innerHTML = this.config.content;
      } else if (this.config.content instanceof HTMLElement) {
        content.appendChild(this.config.content);
      }
    }
    
    // Add configured buttons
    if (this.config.buttons && Array.isArray(this.config.buttons)) {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      `;
      
      this.config.buttons.forEach(buttonConfig => {
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
        button.onclick = buttonConfig.onClick || (() => console.log('Button clicked'));
        
        buttonContainer.appendChild(button);
      });
      
      content.appendChild(buttonContainer);
    }
    
    mainContent.appendChild(content);
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
    const tab = this.config.tabs[tabIndex];
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