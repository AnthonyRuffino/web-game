// ui/menuBar.js
// Compact menu bar below the action bars

window.UI = window.UI || {};

// --- Menu Bar Config ---
const MENU_BAR_CONFIG = {
  height: '32px',
  background: 'rgba(30,30,40,0.96)',
  zIndex: 1100,
  borderTop: '2px solid #444',
  boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
  gap: '8px',
  fontFamily: 'inherit',
  button: {
    height: '24px',
    minWidth: '24px',
    padding: '0 8px',
    margin: '0 2px',
    fontSize: '14px',
    background: '#222',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: '1',
    disabledBackground: '#333',
    disabledColor: '#888',
    disabledCursor: 'default',
    disabledOpacity: '0.6',
    activeBackground: '#4ECDC4',
    activeColor: '#222'
  },
  pollInterval: 500
};
// --- End Menu Bar Config ---

window.UI.menuBar = {
  // Track which menus are currently open
  openMenus: new Set(),
  
  init() {
    if (document.getElementById('ui-menu-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'ui-menu-bar';
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

    function makeButton(label, title, onClick, enabled = true) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.title = title;
      btn.style.height = MENU_BAR_CONFIG.button.height;
      btn.style.minWidth = MENU_BAR_CONFIG.button.minWidth;
      btn.style.padding = MENU_BAR_CONFIG.button.padding;
      btn.style.margin = MENU_BAR_CONFIG.button.margin;
      btn.style.fontSize = MENU_BAR_CONFIG.button.fontSize;
      btn.style.background = enabled ? MENU_BAR_CONFIG.button.background : MENU_BAR_CONFIG.button.disabledBackground;
      btn.style.color = enabled ? MENU_BAR_CONFIG.button.color : MENU_BAR_CONFIG.button.disabledColor;
      btn.style.border = MENU_BAR_CONFIG.button.border;
      btn.style.borderRadius = MENU_BAR_CONFIG.button.borderRadius;
      btn.style.cursor = enabled ? MENU_BAR_CONFIG.button.cursor : MENU_BAR_CONFIG.button.disabledCursor;
      btn.style.opacity = enabled ? MENU_BAR_CONFIG.button.opacity : MENU_BAR_CONFIG.button.disabledOpacity;
      if (enabled && onClick) btn.onclick = onClick;
      return btn;
    }

    // Perspective toggle
    bar.appendChild(makeButton(
      '⟳',
      'Toggle Perspective (player-perspective/fixed-north)',
      () => {
        window.cmd && window.cmd('perspective');
        if (window.GameEngine && window.GameEngine.render) window.GameEngine.render(window.UI.responsiveCanvas.ctx);
      }
    ));

    // Skins menu with toggle functionality
    const skinsBtn = makeButton(
      '🎨',
      'Toggle Skins Menu',
      () => {
        if (window.UI.menuBar.openMenus.has('skins')) {
          // Close skins menu
          window.UI.menuBar.closeMenu('skins');
        } else {
          // Open skins menu
          if (window.UI.skinsManager && window.UI.skinsManager.openSkinsUI) {
            window.UI.skinsManager.openSkinsUI();
            window.UI.menuBar.openMenus.add('skins');
            window.UI.menuBar.updateButtonStates();
          }
        }
      }
    );
    bar.appendChild(skinsBtn);

    // Macro menu with toggle functionality
    const macroBtn = makeButton(
      '\u26a1',
      'Toggle Macro Menu',
      () => {
        if (window.UI.menuBar.openMenus.has('macro')) {
          // Close macro menu
          window.UI.menuBar.closeMenu('macro');
        } else {
          // Open macro menu
          if (window.UI.macroManager && window.UI.macroManager.openMacroUI) {
            window.UI.macroManager.openMacroUI();
            window.UI.menuBar.openMenus.add('macro');
            window.UI.menuBar.updateButtonStates();
          }
        }
      }
    );
    bar.appendChild(macroBtn);

    // --- Grid toggle button ---
    const gridBtn = makeButton(
      '\u25A9',
      'Toggle World Grid Overlay',
      () => {
        if (window.cmd) window.cmd('grid');
        // Update button style immediately for feedback
        updateGridButton();
      }
    );
    bar.appendChild(gridBtn);
    function updateGridButton() {
      if (window.RENDER_GRID) {
        gridBtn.style.background = '#4ECDC4';
        gridBtn.style.color = '#222';
        gridBtn.textContent = '\u25A9'; // Could use a different icon if desired
        gridBtn.title = 'Grid ON (click to turn off)';
      } else {
        gridBtn.style.background = '#222';
        gridBtn.style.color = '#fff';
        gridBtn.textContent = '\u25A9';
        gridBtn.title = 'Grid OFF (click to turn on)';
      }
    }
    // Keep button in sync with grid state
    updateGridButton();
    setInterval(updateGridButton, 500); // Poll for state changes (or use an event system if available)
    // --- END Grid toggle button ---

    // Placeholders for future menus
    bar.appendChild(makeButton('📜', 'Quests (coming soon)', null, false));
    bar.appendChild(makeButton('✨', 'Spells (coming soon)', null, false));
    bar.appendChild(makeButton('🌲', 'Talents (coming soon)', null, false));
    bar.appendChild(makeButton('🧑', 'Character (coming soon)', null, false));

    document.body.appendChild(bar);
  },

  // Close a specific menu
  closeMenu(menuName) {
    this.openMenus.delete(menuName);
    this.updateButtonStates();
    
    // Close the actual menu UI
    if (menuName === 'skins') {
      const skinsModal = document.getElementById('skins-ui-modal');
      if (skinsModal) {
        skinsModal.remove();
      }
    } else if (menuName === 'macro') {
      const macroModal = document.getElementById('macro-ui-modal');
      if (macroModal) {
        macroModal.remove();
      }
    }
  },

  // Update button visual states based on open menus
  updateButtonStates() {
    const bar = document.getElementById('ui-menu-bar');
    if (!bar) return;

    // Update skins button
    const skinsBtn = bar.querySelector('button[title*="Skins"]');
    if (skinsBtn) {
      if (this.openMenus.has('skins')) {
        skinsBtn.style.background = MENU_BAR_CONFIG.button.activeBackground;
        skinsBtn.style.color = MENU_BAR_CONFIG.button.activeColor;
        skinsBtn.title = 'Skins Menu Open (click to close)';
      } else {
        skinsBtn.style.background = MENU_BAR_CONFIG.button.background;
        skinsBtn.style.color = MENU_BAR_CONFIG.button.color;
        skinsBtn.title = 'Toggle Skins Menu';
      }
    }

    // Update macro button
    const macroBtn = bar.querySelector('button[title*="Macro"]');
    if (macroBtn) {
      if (this.openMenus.has('macro')) {
        macroBtn.style.background = MENU_BAR_CONFIG.button.activeBackground;
        macroBtn.style.color = MENU_BAR_CONFIG.button.activeColor;
        macroBtn.title = 'Macro Menu Open (click to close)';
      } else {
        macroBtn.style.background = MENU_BAR_CONFIG.button.background;
        macroBtn.style.color = MENU_BAR_CONFIG.button.color;
        macroBtn.title = 'Toggle Macro Menu';
      }
    }
  }
}; 