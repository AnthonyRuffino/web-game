// ui/menuBar.js
// Compact menu bar below the action bars

window.UI = window.UI || {};

window.UI.menuBar = {
  init() {
    if (document.getElementById('ui-menu-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'ui-menu-bar';
    bar.style.position = 'fixed';
    bar.style.left = '0';
    bar.style.right = '0';
    bar.style.bottom = '0';
    bar.style.height = '32px';
    bar.style.background = 'rgba(30,30,40,0.96)';
    bar.style.display = 'flex';
    bar.style.flexDirection = 'row';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'center';
    bar.style.zIndex = 1100;
    bar.style.borderTop = '2px solid #444';
    bar.style.boxShadow = '0 -2px 8px rgba(0,0,0,0.3)';
    bar.style.gap = '8px';
    bar.style.fontFamily = 'inherit';

    function makeButton(label, title, onClick, enabled = true) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.title = title;
      btn.style.height = '24px';
      btn.style.minWidth = '24px';
      btn.style.padding = '0 8px';
      btn.style.margin = '0 2px';
      btn.style.fontSize = '14px';
      btn.style.background = enabled ? '#222' : '#333';
      btn.style.color = enabled ? '#fff' : '#888';
      btn.style.border = '1px solid #555';
      btn.style.borderRadius = '4px';
      btn.style.cursor = enabled ? 'pointer' : 'default';
      btn.style.opacity = enabled ? '1' : '0.6';
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

    // Skins menu
    bar.appendChild(makeButton(
      '🎨',
      'Open Skins Menu',
      () => {
        if (window.UI.skinsManager && window.UI.skinsManager.openSkinsUI) {
          window.UI.skinsManager.openSkinsUI();
        }
      }
    ));

    // Macro menu
    bar.appendChild(makeButton(
      '⚡',
      'Open Macro Menu',
      () => {
        if (window.UI.macroManager && window.UI.macroManager.openMacroUI) {
          window.UI.macroManager.openMacroUI();
        }
      }
    ));

    // Placeholders for future menus
    bar.appendChild(makeButton('📜', 'Quests (coming soon)', null, false));
    bar.appendChild(makeButton('✨', 'Spells (coming soon)', null, false));
    bar.appendChild(makeButton('🌲', 'Talents (coming soon)', null, false));
    bar.appendChild(makeButton('🧑', 'Character (coming soon)', null, false));

    document.body.appendChild(bar);
  }
}; 