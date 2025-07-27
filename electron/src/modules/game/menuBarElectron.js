// electron/src/modules/game/menuBarElectron.js

import { SkinsMenu } from './menus/SkinsMenu.js';

// Menu bar config (viewport-relative, dark theme)
const MENU_BAR_CONFIG = {
  height: '36px',
  background: 'rgba(20,20,30,0.98)',
  zIndex: 2000,
  borderTop: '2px solid #444',
  boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
  gap: '12px',
  fontFamily: 'inherit',
  button: {
    height: '28px',
    minWidth: '28px',
    padding: '0 12px',
    margin: '0 4px',
    fontSize: '16px',
    background: '#222',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '5px',
    cursor: 'pointer',
    opacity: '1',
    activeBackground: '#4ECDC4',
    activeColor: '#222',
    disabledBackground: '#333',
    disabledColor: '#888',
    disabledCursor: 'default',
    disabledOpacity: '0.6',
  }
};

class MenuBarElectron {
  constructor(menuManager) {
    this.menuManager = menuManager;
    this.element = null;
    this.menuButtons = {};
    // Initialize dedicated menu classes
    this.skinsMenu = new SkinsMenu('skins', menuManager);
    this.menuIds = [this.skinsMenu.menuId, 'macro', 'character'];
    
    
    
    this.init();
  }

  init() {
    if (document.getElementById('electron-menu-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'electron-menu-bar';
    bar.style.position = 'fixed';
    bar.style.left = '0';
    bar.style.right = '0';
    bar.style.bottom = '0';
    bar.style.height = MENU_BAR_CONFIG.height;
    bar.style.background = MENU_BAR_CONFIG.background;
    bar.style.display = 'flex';
    bar.style.flexDirection = 'row';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'center';
    bar.style.zIndex = MENU_BAR_CONFIG.zIndex;
    bar.style.borderTop = MENU_BAR_CONFIG.borderTop;
    bar.style.boxShadow = MENU_BAR_CONFIG.boxShadow;
    bar.style.gap = MENU_BAR_CONFIG.gap;
    bar.style.fontFamily = MENU_BAR_CONFIG.fontFamily;

    // Create menu buttons
    this.menuIds.forEach(menuId => {
      const btn = document.createElement('button');
      btn.textContent = this.getMenuLabel(menuId);
      btn.title = `Toggle ${this.getMenuLabel(menuId)} Menu`;
      this.applyButtonStyle(btn, false);
      btn.onclick = () => this.toggleMenu(menuId);
      bar.appendChild(btn);
      this.menuButtons[menuId] = btn;
      if (menuId == 'skins') {
        this.menuManager.createMenu(this.skinsMenu.createMenuConfig(() => this.updateButtonStates()));
      } else if (menuId == 'macro') {
        this.menuManager.createMenu(this.menuManager.createMacroMenuConfig(menuId, () => this.updateButtonStates()));
      } else if (menuId == 'character') {
        this.menuManager.createMenu(this.menuManager.createCharacterMenuConfig(menuId, () => this.updateButtonStates()));
      }
      
    });

    document.body.appendChild(bar);
    this.element = bar;
  }

  getMenuLabel(menuId) {
    switch (menuId) {
      case 'skins': return '🎨 Skins';
      case 'macro': return '⚡ Macros';
      case 'character': return '🧑 Character';
      default: return menuId;
    }
  }



  applyButtonStyle(btn, active) {
    btn.style.height = MENU_BAR_CONFIG.button.height;
    btn.style.minWidth = MENU_BAR_CONFIG.button.minWidth;
    btn.style.padding = MENU_BAR_CONFIG.button.padding;
    btn.style.margin = MENU_BAR_CONFIG.button.margin;
    btn.style.fontSize = MENU_BAR_CONFIG.button.fontSize;
    btn.style.border = MENU_BAR_CONFIG.button.border;
    btn.style.borderRadius = MENU_BAR_CONFIG.button.borderRadius;
    btn.style.cursor = MENU_BAR_CONFIG.button.cursor;
    btn.style.opacity = MENU_BAR_CONFIG.button.opacity;
    if (active) {
      btn.style.background = MENU_BAR_CONFIG.button.activeBackground;
      btn.style.color = MENU_BAR_CONFIG.button.activeColor;
    } else {
      btn.style.background = MENU_BAR_CONFIG.button.background;
      btn.style.color = MENU_BAR_CONFIG.button.color;
    }
  }

  toggleMenu(menuId) {
    const menu = this.menuManager.getMenu(menuId);
    if (menu && menu.visible) {
      this.menuManager.hideMenu(menuId);
    } else {
      this.menuManager.showMenu(menuId);
    }
    this.updateButtonStates();
  }

  updateButtonStates() {
    this.menuIds.forEach(menuId => {
      const menu = this.menuManager.getMenu(menuId);
      const isOpen = menu && menu.visible;
      this.applyButtonStyle(this.menuButtons[menuId], isOpen);
    });
  }
}

// Export for use in main Electron game UI
export default MenuBarElectron; 