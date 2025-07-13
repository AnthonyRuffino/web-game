// ui/actionBars.js
// Action bar system with multiple configurable bars

// Only declare ActionBar if it doesn't already exist
if (!window.ActionBar) {
  class ActionBar {
    constructor(config) {
      this.name = config.name;
      this.orientation = config.orientation || 'horizontal';
      this.position = config.position || { left: 0, bottom: 0 };
      this.slots = config.slots || 10;
      this.slotSize = config.slotSize || 60;
      this.spacing = config.spacing || 4;
      this.zIndex = config.zIndex || 998;
      this.opacity = config.opacity || 0.95;
      this.colors = Object.assign({
        background: 'rgba(20,20,20,0.95)',
        border: '#666',
        slot: 'rgba(40,40,40,0.6)',
        slotHover: 'rgba(60,60,60,0.9)',
        slotActive: 'rgba(80,80,80,0.9)',
        label: '#fff'
      }, config.colors || {});
      this.keyBindings = config.keyBindings || [];
      this.macroBindings = config.macroBindings || {}; // { slotIndex: macroName }
      this.visible = true;
      // State
      this.canvas = null;
      this.ctx = null;
      this.hoveredSlot = null;
      this.activeSlot = null;
      this.scale = 1.0;
      this._createCanvas();
      this._setupListeners();
      this.render();
    }
    _createCanvas() {
      const canvas = document.createElement('canvas');
      canvas.id = `ui-action-bar-${this.name}`;
      canvas.style.position = 'fixed';
      for (const [k, v] of Object.entries(this.position)) {
        canvas.style[k] = typeof v === 'number' ? `${v}px` : v;
      }
      canvas.style.zIndex = this.zIndex;
      canvas.style.border = `2px solid ${this.colors.border}`;
      canvas.style.borderRadius = '8px';
      canvas.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
      document.body.appendChild(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this._updateSize();
    }
    _updateSize() {
      const count = this.slots;
      const slot = this.slotSize;
      const spacing = this.spacing;
      const padding = 40;
      if (this.orientation === 'horizontal') {
        this.canvas.width = count * slot + (count - 1) * spacing + padding;
        this.canvas.height = slot + 20;
      } else {
        this.canvas.width = slot + 20;
        this.canvas.height = count * slot + (count - 1) * spacing + padding;
      }
      this.scale = 1.0;
    }
    _setupListeners() {
      this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
      this.canvas.addEventListener('click', (e) => this._handleClick(e));
      this.canvas.addEventListener('mouseleave', () => this._handleMouseLeave());
      window.addEventListener('resize', () => {
        this._updateSize();
        this.render();
      });
    }
    _handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.scale;
      const y = (e.clientY - rect.top) / this.scale;
      let found = false;
      for (let i = 0; i < this.slots; i++) {
        const { slotX, slotY } = this._slotPosition(i);
        if (
          x >= slotX && x < slotX + this.slotSize &&
          y >= slotY && y < slotY + this.slotSize
        ) {
          this.hoveredSlot = i;
          found = true;
          break;
        }
      }
      if (!found) this.hoveredSlot = null;
      this.render();
    }
    _handleClick(e) {
      if (this.hoveredSlot === null) return;
      this.activeSlot = this.hoveredSlot;
      this.render();
      e.preventDefault();
      e.stopPropagation();
      const macroName = this.macroBindings[this.activeSlot];
      if (macroName && window.UI.macroManager && window.UI.macroManager.macros[macroName]) {
        if (window.UI.macroManager.macros[macroName].command && window.cmd) {
          window.cmd(window.UI.macroManager.macros[macroName].command);
        }
      }
      setTimeout(() => {
        this.activeSlot = null;
        this.render();
      }, 150);
    }
    _handleMouseLeave() {
      this.hoveredSlot = null;
      this.render();
    }
    _slotPosition(i) {
      const start = 20;
      if (this.orientation === 'horizontal') {
        return {
          slotX: start + i * (this.slotSize + this.spacing),
          slotY: 10
        };
      } else {
        return {
          slotX: 10,
          slotY: start + i * (this.slotSize + this.spacing)
        };
      }
    }
    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const canvas = this.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      for (let i = 0; i < this.slots; i++) {
        const { slotX, slotY } = this._slotPosition(i);
        let bgColor = this.colors.slot;
        if (this.hoveredSlot === i) bgColor = this.colors.slotHover;
        if (this.activeSlot === i) bgColor = this.colors.slotActive;
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = bgColor;
        ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
        const macroName = this.macroBindings[i];
        if (macroName && UI.macroManager && UI.macroManager.ensureMacroManager() && UI.macroManager.macroIcons[macroName]) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(
              img,
              slotX + (this.slotSize - 40) / 2,
              slotY + (this.slotSize - 40) / 2,
              40, 40
            );
          };
          img.src = UI.macroManager.macroIcons[macroName];
        }
        ctx.fillStyle = this.colors.label;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          this._slotLabel(i),
          slotX + this.slotSize / 2,
          slotY + this.slotSize / 2 + 5
        );
        if (!macroName) {
          ctx.fillStyle = 'rgba(136,136,136,0.4)';
          ctx.font = '10px sans-serif';
          ctx.fillText('Empty', slotX + this.slotSize / 2, slotY + this.slotSize / 2 + 20);
        }
      }
    }
    _slotLabel(i) {
      if (this.keyBindings && this.keyBindings[i]) {
        return this._keyLabel(this.keyBindings[i]);
      }
      return (i === 9 ? '0' : (i + 1).toString());
    }
    _keyLabel(binding) {
      if (binding.startsWith('Shift+')) {
        return 'S+' + binding.replace('Shift+Digit', '');
      }
      if (binding.startsWith('Digit')) {
        return binding.replace('Digit', '');
      }
      if (binding.startsWith('F')) {
        return binding;
      }
      return binding;
    }
    assignMacro(slotIndex, macroName) {
      this.macroBindings[slotIndex] = macroName;
      this.render();
    }
    removeMacro(slotIndex) {
      delete this.macroBindings[slotIndex];
      this.render();
    }
    updateConfig(newConfig) {
      Object.assign(this, newConfig);
      this._updateSize();
      this.render();
    }
    triggerSlot(slotIndex) {
      this.activeSlot = slotIndex;
      this.render();
      const macroName = this.macroBindings[slotIndex];
      if (macroName && UI.macroManager && UI.macroManager.ensureMacroManager() && UI.macroManager.macros[macroName]) {
        if (UI.macroManager.macros[macroName].command && window.cmd) {
          window.cmd(UI.macroManager.macros[macroName].command);
        }
      }
      setTimeout(() => {
        this.activeSlot = null;
        this.render();
      }, 150);
    }
    show() {
      this.visible = true;
      this.canvas.style.display = 'block';
    }
    hide() {
      this.visible = false;
      this.canvas.style.display = 'none';
    }
  }
  window.ActionBar = ActionBar;
} else {
  var ActionBar = window.ActionBar;
}

// ActionBarManager
window.UI.actionBarManager = {
  bars: {},
  keyBindingMap: {}, // Maps key codes to { barName, slotIndex }

  createActionBar(config) {
    if (!config.name) throw new Error('Action bar must have a unique name');
    if (this.bars[config.name]) throw new Error('Action bar name already exists');
    const bar = new ActionBar(config);
    this.bars[config.name] = bar;
    this._rebuildKeyBindingMap();
    return bar;
  },

  removeActionBar(name) {
    const bar = this.bars[name];
    if (bar) {
      bar.canvas.remove();
      delete this.bars[name];
      this._rebuildKeyBindingMap();
    }
  },

  getActionBar(name) {
    return this.bars[name];
  },

  listActionBars() {
    return Object.keys(this.bars);
  },

  // Update key bindings for a specific bar
  updateKeyBindings(barName, newKeyBindings) {
    const bar = this.bars[barName];
    if (bar) {
      bar.keyBindings = newKeyBindings;
      this._rebuildKeyBindingMap();
    }
  },

  // Rebuild the key binding map from all bars
  _rebuildKeyBindingMap() {
    this.keyBindingMap = {};
    
    for (const barName in this.bars) {
      const bar = this.bars[barName];
      if (!bar.keyBindings) continue;
      
      for (let i = 0; i < bar.keyBindings.length; i++) {
        const binding = bar.keyBindings[i];
        this.keyBindingMap[binding] = { barName, slotIndex: i };
      }
    }
    
    console.log('[UI] Key binding map rebuilt:', this.keyBindingMap);
  },

  // Global event handling for key bindings
  handleGlobalKey(e) {
    // Explicitly block all action bar processing if the input bar is open
    if (typeof UI !== 'undefined' && UI.inputBar && UI.inputBar.inputBarOpen) {
      return;
    }
    
    // Create the key lookup string
    const keyLookup = e.shiftKey ? `Shift+${e.code}` : e.code;
    
    // Look up the binding in the map
    const binding = this.keyBindingMap[keyLookup];
    if (binding) {
      const bar = this.bars[binding.barName];
      if (bar) {
        bar.triggerSlot(binding.slotIndex);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    
    // If no action bar binding found, let other handlers process the key
    // (like movement, input bar, etc.)
  }
};

// Attach global keydown listener (normal priority)
window.addEventListener('keydown', (e) => window.UI.actionBarManager.handleGlobalKey(e));



// --- Example: create two default bars for compatibility ---
function createDefaultActionBars() {
  if (!window.UI.actionBarManager.getActionBar('mainBar')) {
    window.UI.actionBarManager.createActionBar({
      name: 'mainBar',
      orientation: 'horizontal',
      position: { left: 20, bottom: 20 },
      slots: 10,
      slotSize: 60,
      spacing: 4,
      zIndex: 998,
      opacity: 0.95,
      keyBindings: [
        'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0'
      ]
    });
  }
  if (!window.UI.actionBarManager.getActionBar('secondaryBar')) {
    window.UI.actionBarManager.createActionBar({
      name: 'secondaryBar',
      orientation: 'horizontal',
      position: { left: 700, bottom: 20 },
      slots: 10,
      slotSize: 60,
      spacing: 4,
      zIndex: 998,
      opacity: 0.95,
      keyBindings: [
        'Shift+Digit1','Shift+Digit2','Shift+Digit3','Shift+Digit4','Shift+Digit5','Shift+Digit6','Shift+Digit7','Shift+Digit8','Shift+Digit9','Shift+Digit0'
      ]
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', createDefaultActionBars);
} else {
  createDefaultActionBars();
}
