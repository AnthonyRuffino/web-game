// ui/actionBars.js
// Action bar system with multiple configurable bars

// --- JSON Popup Classes ---
class JsonPopupButton {
  constructor(config) {
    this.text = config.text || 'Button';
    this.style = config.style || {
      background: '#666',
      color: '#fff',
      border: 'none',
      padding: '6px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginLeft: '8px'
    };
    this.onClick = config.onClick || (() => {});
    this.enabled = config.enabled !== false;
  }

  createElement() {
    const button = document.createElement('button');
    button.textContent = this.text;
    
    // Apply styles
    Object.assign(button.style, this.style);
    
    // Add click handler
    button.onclick = () => {
      if (this.enabled) {
        this.onClick();
      }
    };
    
    return button;
  }
}

class JsonPopup {
  constructor(config) {
    this.title = config.title || 'Edit JSON';
    this.jsonData = config.jsonData || {};
    this.onSave = config.onSave || (() => {});
    this.onCancel = config.onCancel || (() => {});
    this.onClose = config.onClose || (() => {});
    this.buttons = config.buttons || [];
    this.popup = null;
    this.textarea = null;
    this.errorDiv = null;
  }

  show() {
    if (this.popup) return; // already open

    // Create popup elements
    this.popup = document.createElement('div');
    this.popup.style.position = 'fixed';
    this.popup.style.left = '50%';
    this.popup.style.top = '50%';
    this.popup.style.transform = 'translate(-50%, -50%)';
    this.popup.style.background = '#222';
    this.popup.style.color = '#fff';
    this.popup.style.padding = '20px';
    this.popup.style.borderRadius = '8px';
    this.popup.style.zIndex = 9999;
    this.popup.style.boxShadow = '0 4px 32px #000a';
    this.popup.style.minWidth = '400px';
    this.popup.style.maxWidth = '90vw';
    this.popup.style.maxHeight = '80vh';
    this.popup.style.overflow = 'auto';

    const label = document.createElement('div');
    label.textContent = this.title + ':';
    label.style.marginBottom = '8px';
    this.popup.appendChild(label);

    this.textarea = document.createElement('textarea');
    this.textarea.style.width = '100%';
    this.textarea.style.height = '200px';
    this.textarea.style.background = '#111';
    this.textarea.style.color = '#fff';
    this.textarea.style.fontFamily = 'monospace';
    this.textarea.style.fontSize = '14px';
    this.textarea.value = JSON.stringify(this.jsonData, null, 2);
    this.popup.appendChild(this.textarea);

    this.errorDiv = document.createElement('div');
    this.errorDiv.style.color = '#ff5252';
    this.errorDiv.style.margin = '8px 0';
    this.popup.appendChild(this.errorDiv);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'flex-end';
    btnRow.style.gap = '8px';

    // Add custom buttons first
    this.buttons.forEach(buttonConfig => {
      const button = new JsonPopupButton(buttonConfig);
      btnRow.appendChild(button.createElement());
    });

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Save';
    submitBtn.style.background = '#43a047';
    submitBtn.style.color = '#fff';
    submitBtn.style.border = 'none';
    submitBtn.style.padding = '6px 16px';
    submitBtn.style.borderRadius = '4px';
    submitBtn.style.cursor = 'pointer';
    submitBtn.onclick = () => this.handleSave();
    btnRow.appendChild(submitBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.background = '#e53935';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => this.handleCancel();
    btnRow.appendChild(cancelBtn);

    this.popup.appendChild(btnRow);
    document.body.appendChild(this.popup);
  }

  handleSave() {
    try {
      const newConfig = JSON.parse(this.textarea.value);
      this.onSave(newConfig);
      this.close();
    } catch (err) {
      this.errorDiv.textContent = 'Invalid JSON: ' + err.message;
    }
  }

  handleCancel() {
    this.onCancel();
    this.close();
  }

  close() {
    if (this.popup) {
      document.body.removeChild(this.popup);
      this.popup = null;
      this.textarea = null;
      this.errorDiv = null;
      this.onClose();
    }
  }

  updateJsonData(newData) {
    this.jsonData = newData;
    if (this.textarea) {
      this.textarea.value = JSON.stringify(this.jsonData, null, 2);
    }
  }
}

// --- Action Bar Config ---
const ACTION_BAR_CONFIG = {
  defaultSlots: 10,
  defaultSlotSize: 60,
  defaultSpacing: 4,
  defaultZIndex: 998,
  defaultOpacity: 0.95,
  defaultColors: {
    background: 'rgba(20,20,20,0.95)',
    border: '#666',
    slot: 'rgba(40,40,40,0.6)',
    slotHover: 'rgba(60,60,60,0.9)',
    slotActive: 'rgba(80,80,80,0.9)',
    label: '#fff'
  },
  defaultPadding: 0,
  defaultBorderRadius: 8,
  defaultBoxShadow: '0 4px 20px rgba(0,0,0,0.6)',
  defaultSlotIconSize: 40,
  defaultSlotLabelFont: 'bold 16px sans-serif',
  defaultSlotLabelOutline: 'rgba(0,0,0,0.7)',
  defaultSlotLabelOutlineWidth: 3,
  defaultEmptyLabel: 'Empty',
  defaultEmptyLabelColor: 'rgba(136,136,136,0.4)',
  defaultEmptyLabelFont: '10px sans-serif',
  defaultSlotNumberFont: '12px sans-serif',
  defaultSlotNumberColor: '#aaa',
  defaultSlotNumberYOffset: 20,
  defaultSlotBorderWidth: 1,
  defaultSlotBorderRadius: 8,
  defaultSlotBoxShadow: '0 4px 20px rgba(0,0,0,0.6)',
  defaultSlotPadding: 20,
  defaultSlotStart: 20,
  defaultSlotY: 10,
  defaultSlotX: 10,
  defaultSlotHeight: 20,
  defaultSlotWidth: 20,
  defaultSlotLabelYOffset: 20,
  defaultSlotLabelFontSize: 10,
  defaultSlotLabelTextAlign: 'center',
  defaultSlotLabelTextBaseline: 'middle',
  defaultSlotLabelColor: '#fff',
  defaultSlotLabelOutlineColor: 'rgba(0,0,0,0.7)',
  defaultSlotLabelOutlineWidth: 3,
  menuBarOffset: 32,
  handleSize: 7,
  toggleSize: 10,
  handleLockedColor: '#e53935',
  handleEditableColor: '#43a047',
  handleLockedShadow: '#b71c1c',
  handleEditableShadow: '#1b5e20',
  toggleDotColor: 'rgba(20,20,20,0.95)', // default to bar background
  toggleDotShadow: 'rgba(0,0,0,0.2)',
  toggleIconColor: '#444',
  dotGap: 4,
  // Dot positions (relative offsets)
  dotPositions: {
    horizontal: {
      // dx, dy are offsets from bottom left
      handle: { dx: 4, dy: 4 }, // bottom left, small padding
      toggle: { dx: 4, dy: 4 } // will be adjusted in code
    },
    vertical: {
      handle: { dx: 4, dy: 4 }, // bottom left
      toggle: { dx: 4, dy: 4 } // will be adjusted in code
    },
    grid: {
      handle: { dx: 4, dy: 4 }, // bottom left
      toggle: { dx: 4, dy: 4 } // will be adjusted in code
    }
  },
  // Corner placement support
  defaultHandleCorner: 'bottomLeft', // 'bottomLeft', 'bottomRight', 'topLeft', 'topRight'
  defaultLayout: 'horizontal',
  defaultRows: 1,
  defaultColumns: 10,
};
// --- End Action Bar Config ---

// Only declare ActionBar if it doesn't already exist
if (!window.ActionBar) {
  class ActionBar {
    constructor(config) {
      this.name = config.name;
      this.layout = config.layout || config.orientation || ACTION_BAR_CONFIG.defaultLayout;
      this.orientation = (this.layout === 'horizontal' || this.layout === 'vertical') ? this.layout : undefined;
      this.rows = config.rows || (this.layout === 'grid' ? (config.rows || ACTION_BAR_CONFIG.defaultRows) : (this.layout === 'vertical' ? (config.slots || ACTION_BAR_CONFIG.defaultSlots) : 1));
      this.columns = config.columns || (this.layout === 'grid' ? (config.columns || ACTION_BAR_CONFIG.defaultColumns) : (this.layout === 'vertical' ? 1 : (config.slots || ACTION_BAR_CONFIG.defaultSlots)));
      this.slots = this.rows * this.columns;
              this.slotSize = config.slotSize || ACTION_BAR_CONFIG.defaultSlotSize;
        this.spacing = config.spacing || ACTION_BAR_CONFIG.defaultSpacing;
        this.padding = config.padding || ACTION_BAR_CONFIG.defaultPadding;
        this.zIndex = config.zIndex || ACTION_BAR_CONFIG.defaultZIndex;
      this.opacity = config.opacity || ACTION_BAR_CONFIG.defaultOpacity;
      this.colors = Object.assign({}, ACTION_BAR_CONFIG.defaultColors, config.colors || {});
      this.position = config.position || { left: 0, bottom: 0 };
      // Always use 2D arrays for keyBindings and macroBindings
      this.keyBindings = config.keyBindings || Array.from({ length: this.rows }, () => Array(this.columns).fill(undefined));
      this.macroBindings = config.macroBindings || Array.from({ length: this.rows }, () => Array(this.columns).fill(undefined));
      this.visible = true;
      // State
      this.canvas = null;
      this.ctx = null;
      this.hoveredSlot = null;
      this.activeSlot = null;
      this.scale = 1.0;
      this._iconCache = {}; // Cache for loaded macro icons
      this._dragging = false;
      this._dragOffset = { x: 0, y: 0 };
      this._handleSize = config.handleSize || ACTION_BAR_CONFIG.handleSize;
      this._toggleSize = config.toggleSize || ACTION_BAR_CONFIG.toggleSize;
      this._handleLockedColor = config.handleLockedColor || ACTION_BAR_CONFIG.handleLockedColor;
      this._handleEditableColor = config.handleEditableColor || ACTION_BAR_CONFIG.handleEditableColor;
      this._handleLockedShadow = config.handleLockedShadow || ACTION_BAR_CONFIG.handleLockedShadow;
      this._handleEditableShadow = config.handleEditableShadow || ACTION_BAR_CONFIG.handleEditableShadow;
      this._toggleDotColor = config.toggleDotColor || ACTION_BAR_CONFIG.toggleDotColor;
      this._toggleDotShadow = config.toggleDotShadow || ACTION_BAR_CONFIG.toggleDotShadow;
      this._toggleIconColor = config.toggleIconColor || ACTION_BAR_CONFIG.toggleIconColor;
      this._dotPositions = config.dotPositions || ACTION_BAR_CONFIG.dotPositions;
      this._handleActive = config.handleActive || false; // true if dot is green (unlocked)
      this._dotGap = config.dotGap || ACTION_BAR_CONFIG.dotGap;
      this._handleCorner = config.handleCorner || ACTION_BAR_CONFIG.defaultHandleCorner;
      this._jsonPopup = null; // reference to popup DOM
      this._JsonPopupClass = config.JsonPopupClass || JsonPopup;
      this._createCanvas();
      this._setupListeners();
      this.render();
    }
    // Helpers for slot access
    getSlot(row, col) {
      return { key: (this.keyBindings[row] || [])[col], macro: (this.macroBindings[row] || [])[col] };
    }
    setSlot(row, col, key, macro) {
      if(this.keyBindings[row] === undefined) this.keyBindings[row] = [];
      if(this.macroBindings[row] === undefined) this.macroBindings[row] = [];
      this.keyBindings[row][col] = key;
      this.macroBindings[row][col] = macro;
    }
    getSlotByIndex(i) {
      const row = Math.floor(i / this.columns);
      const col = i % this.columns;
      return this.getSlot(row, col);
    }
    preloadIcons() {
      // Preload all macro icons for current bindings
      if (!window.UI || !window.UI.macroManager) return;
      for (let i = 0; i < this.slots; i++) {
        const { row, col } = this._slotPosition(i);
        const macroName = (this.macroBindings[row] || [])[col];
        if (macroName && window.UI.macroManager.macroIcons[macroName]) {
          const iconUrl = window.UI.macroManager.macroIcons[macroName];
          let img = this._iconCache[macroName];
          if (!img) {
            img = new window.Image();
            img.src = iconUrl;
            this._iconCache[macroName] = img;
            img.onload = () => this.render();
          }
        }
      }
    }
    _createCanvas() {
      const canvas = document.createElement('canvas');
      canvas.id = `ui-action-bar-${this.name}`;
      canvas.style.position = 'fixed';
      canvas.style.zIndex = this.zIndex;
      canvas.style.border = `2px solid ${this.colors.border}`;
      canvas.style.borderRadius = '8px';
      canvas.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
      
      // Add canvas to DOM first
      document.body.appendChild(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      // Now calculate size
      this._updateSize();
      
      // Then handle positioning
      for (const [k, v] of Object.entries(this.position)) {
        // If this is a horizontal bar and positioned at the bottom, shift up by menuBarOffset for the menu bar
        if (k === 'bottom' && this.orientation === 'horizontal') {
          canvas.style[k] = typeof v === 'number' ? `${v + ACTION_BAR_CONFIG.menuBarOffset}px` : `calc(${v} + ${ACTION_BAR_CONFIG.menuBarOffset}px)`;
        } else if (k === 'right') {
          // Handle right positioning by calculating left position
          const rightPos = typeof v === 'number' ? v : parseInt(v);
          canvas.style.left = `calc(100vw - ${rightPos + this.canvas.width}px)`;
        } else {
          canvas.style[k] = typeof v === 'number' ? `${v}px` : v;
        }
      }
    }
    _updateSize() {
              const slot = this.slotSize;
        const spacing = this.spacing;
        const padding = this.padding;
      if (this.layout === 'grid') {
        this.canvas.width = this.columns * slot + (this.columns - 1) * spacing + padding * 2;
        this.canvas.height = this.rows * slot + (this.rows - 1) * spacing + padding * 2;
      } else if (this.layout === 'horizontal') {
        this.canvas.width = this.columns * slot + (this.columns - 1) * spacing + padding * 2;
        this.canvas.height = slot + padding * 2;
      } else {
        // vertical
        this.canvas.width = slot + padding * 2;
        this.canvas.height = this.rows * slot + (this.rows - 1) * spacing + padding * 2;
      }
      this.scale = 1.0;
    }
    
    _syncPositionWithCanvas() {
      // Get the actual current position of the canvas on screen
      const rect = this.canvas.getBoundingClientRect();
      const winH = window.innerHeight;
      const winW = window.innerWidth;
      
      // The handle is in the bottom-left corner, so we want to keep that point stationary
      // Calculate the bottom-left corner position (handle position)
      const handleX = rect.left;
      const handleY = rect.bottom;
      
      // Update the position object to match the actual canvas position
      this.position.left = handleX;
      
      // Determine if we should use top or bottom positioning
      if (this.orientation === 'horizontal' && handleY > winH / 2) {
        // Horizontal bar in bottom half - use bottom positioning with menuBarOffset
        delete this.position.top;
        this.position.bottom = winH - handleY - ACTION_BAR_CONFIG.menuBarOffset;
      } else {
        // Use top positioning
        this.position.top = handleY - this.canvas.height;
        delete this.position.bottom;
      }
    }
    
    _applyPositionFromBottomLeft(bottomLeftX, bottomLeftY) {
      const winH = window.innerHeight;
      
      // Calculate the new top-left position based on the bottom-left corner
      const newLeft = bottomLeftX;
      const newTop = bottomLeftY - this.canvas.height;
      
      // Update the position object
      this.position.left = newLeft;
      
      // Determine if we should use top or bottom positioning
      if (this.orientation === 'horizontal' && newTop > winH / 2) {
        // Horizontal bar in bottom half - use bottom positioning with menuBarOffset
        delete this.position.top;
        this.position.bottom = winH - bottomLeftY - ACTION_BAR_CONFIG.menuBarOffset;
      } else {
        // Use top positioning
        this.position.top = newTop;
        delete this.position.bottom;
      }
      
      // Update canvas style
      this.canvas.style.left = `${this.position.left}px`;
      if ('top' in this.position) {
        this.canvas.style.top = `${this.position.top}px`;
        this.canvas.style.bottom = '';
      } else {
        if (this.orientation === 'horizontal') {
          this.canvas.style.bottom = `${this.position.bottom + ACTION_BAR_CONFIG.menuBarOffset}px`;
        } else {
          this.canvas.style.bottom = `${this.position.bottom}px`;
        }
        this.canvas.style.top = '';
      }
    }
    
    _setupListeners() {
      this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
      this.canvas.addEventListener('click', (e) => this._handleClick(e));
      this.canvas.addEventListener('mouseleave', () => this._handleMouseLeave());
      // Drag handle events
      this.canvas.addEventListener('mousedown', (e) => this._handleDragStart(e));
      window.addEventListener('mousemove', (e) => this._handleDragMove(e));
      window.addEventListener('mouseup', (e) => this._handleDragEnd(e));
      window.addEventListener('resize', () => {
        this._updateSize();
        this.render();
      });
    }
    _handleDragStart(e) {
      // Allow drag from any border if handleActive is true
      if (!this._handleActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Check if near any border (within 8px)
      const borderThreshold = 8;
      if (
        x <= borderThreshold ||
        x >= this.canvas.width - borderThreshold ||
        y <= borderThreshold ||
        y >= this.canvas.height - borderThreshold
      ) {
        this._dragging = true;
        // Calculate offset from mouse to top-left of bar
        const barRect = this.canvas.getBoundingClientRect();
        this._dragOffset = {
          x: e.clientX - barRect.left,
          y: e.clientY - barRect.top
        };
        e.preventDefault();
        e.stopPropagation();
      }
    }
    _handleDragMove(e) {
      if (!this._dragging) return;
      // Restrict to window bounds
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      let newLeft = e.clientX - this._dragOffset.x;
      let newTop = e.clientY - this._dragOffset.y;
      // Clamp
      newLeft = Math.max(0, Math.min(winW - this.canvas.width, newLeft));
      newTop = Math.max(0, Math.min(winH - this.canvas.height, newTop));
      // Update position config (prefer left/top, fallback to left/bottom if originally bottom)
      if ('top' in this.position || !('bottom' in this.position)) {
        this.position.left = newLeft;
        this.position.top = newTop;
        delete this.position.bottom;
      } else {
        this.position.left = newLeft;
        // Subtract menuBarOffset for horizontal bars at bottom
        if (this.orientation === 'horizontal') {
          this.position.bottom = winH - (newTop + this.canvas.height) - ACTION_BAR_CONFIG.menuBarOffset;
        } else {
          this.position.bottom = winH - (newTop + this.canvas.height);
        }
        delete this.position.top;
      }
      // Update style
      this.canvas.style.left = `${this.position.left}px`;
      if ('top' in this.position) {
        this.canvas.style.top = `${this.position.top}px`;
        this.canvas.style.bottom = '';
      } else {
        if (this.orientation === 'horizontal') {
          this.canvas.style.bottom = `${this.position.bottom + ACTION_BAR_CONFIG.menuBarOffset}px`;
        } else {
          this.canvas.style.bottom = `${this.position.bottom}px`;
        }
        this.canvas.style.top = '';
      }
      this.render();
    }
    _handleDragEnd(e) {
      if (this._dragging) {
        this._dragging = false;
        if (window.UI && window.UI.actionBarManager) window.UI.actionBarManager.saveAllBars();
      }
    }
    _handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.scale;
      const y = (e.clientY - rect.top) / this.scale;
      let found = false;
      for (let i = 0; i < this.slots; i++) {
        const { slotX, slotY, row, col } = this._slotPosition(i);
        if (
          x >= slotX && x < slotX + this.slotSize &&
          y >= slotY && y < slotY + this.slotSize
        ) {
          this.hoveredSlot = { row, col };
          found = true;
          break;
        }
      }
      if (!found) this.hoveredSlot = null;
      this.render();
    }
    
    _calculateDotPositions() {
      const pos = this._dotPositions[this.orientation || this.layout];
      let handleX, handleY;
      
      // Calculate handle position based on corner
      switch (this._handleCorner) {
        case 'topRight':
          handleX = this.canvas.width - pos.handle.dx - this._handleSize / 2;
          handleY = pos.handle.dy + this._handleSize / 2;
          break;
        case 'topLeft':
          handleX = pos.handle.dx + this._handleSize / 2;
          handleY = pos.handle.dy + this._handleSize / 2;
          break;
        case 'bottomRight':
          handleX = this.canvas.width - pos.handle.dx - this._handleSize / 2;
          handleY = this.canvas.height - pos.handle.dy - this._handleSize / 2;
          break;
        case 'bottomLeft':
        default:
          handleX = pos.handle.dx + this._handleSize / 2;
          handleY = this.canvas.height - pos.handle.dy - this._handleSize / 2;
          break;
      }
      
      // Calculate toggle position relative to handle
      let toggleX, toggleY;
      if ((this.orientation || this.layout) === 'horizontal') {
        // For horizontal bars, toggle is above the handle
        toggleX = handleX;
        toggleY = handleY - this._handleSize / 2 - this._toggleSize / 2 - this._dotGap;
      } else {
        // For vertical bars, toggle is to the right of the handle
        toggleX = handleX + this._handleSize / 2 + this._toggleSize / 2 + this._dotGap;
        toggleY = handleY;
      }
      
      return { handleX, handleY, toggleX, toggleY };
    }
    
    _handleClick(e) {
      // Check if click is on the handle dot
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate handle and toggle positions based on corner
      const { handleX, handleY, toggleX, toggleY } = this._calculateDotPositions();
      if (
        x >= handleX - this._handleSize / 2 && x <= handleX + this._handleSize / 2 &&
        y >= handleY - this._handleSize / 2 && y <= handleY + this._handleSize / 2
      ) {
        // Ctrl+Click on green dot: show JSON popup
        if (this._handleActive && e.ctrlKey) {
          this._showJsonPopup();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        // Toggle handle active state (red <-> green)
        this._handleActive = !this._handleActive;
        this.render();
        if (window.UI && window.UI.actionBarManager) window.UI.actionBarManager.saveAllBars();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Otherwise, normal slot click
      if (this.hoveredSlot === null) return;
      this.activeSlot = this.hoveredSlot;
      this.render();
      e.preventDefault();
      e.stopPropagation();
      const macroName = (this.macroBindings[this.activeSlot.row] || [])[this.activeSlot.col];
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
      const start = this.padding;
      if (this.layout === 'grid') {
        const row = Math.floor(i / this.columns);
        const col = i % this.columns;
        return {
          slotX: start + col * (this.slotSize + this.spacing),
          slotY: start + row * (this.slotSize + this.spacing),
          row, col
        };
      } else if (this.layout === 'horizontal') {
        return {
          slotX: start + i * (this.slotSize + this.spacing),
          slotY: start,
          row: 0, col: i
        };
      } else {
        // vertical
        return {
          slotX: start,
          slotY: start + i * (this.slotSize + this.spacing),
          row: i, col: 0
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
        const { slotX, slotY, row, col } = this._slotPosition(i);
        let bgColor = this.colors.slot;
        if (this.hoveredSlot && this.hoveredSlot.row === row && this.hoveredSlot.col === col) bgColor = this.colors.slotHover;
        if (this.activeSlot && this.activeSlot.row === row && this.activeSlot.col === col) bgColor = this.colors.slotActive;
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = bgColor;
        ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = ACTION_BAR_CONFIG.defaultSlotBorderWidth;
        ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
        const macroName = (this.macroBindings[row] || [])[col];
        // --- Macro Icon Drawing ---
        if (macroName && UI.macroManager && UI.macroManager.ensureMacroManager() && UI.macroManager.macroIcons[macroName]) {
          const iconUrl = UI.macroManager.macroIcons[macroName];
          let img = this._iconCache[macroName];
          if (!img) {
            img = new window.Image();
            img.src = iconUrl;
            this._iconCache[macroName] = img;
            // Redraw when loaded
            img.onload = () => this.render();
          }
          // If loaded, draw immediately
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
              img,
              slotX + (this.slotSize - ACTION_BAR_CONFIG.defaultSlotIconSize) / 2,
              slotY + (this.slotSize - ACTION_BAR_CONFIG.defaultSlotIconSize) / 2,
              ACTION_BAR_CONFIG.defaultSlotIconSize, ACTION_BAR_CONFIG.defaultSlotIconSize
            );
          }
        }
        // --- Key Label Drawing (always on top) ---
        const keyLabel = (this.keyBindings[row] || [])[col];
        ctx.fillStyle = this.colors.label;
        ctx.font = ACTION_BAR_CONFIG.defaultSlotLabelFont;
        ctx.textAlign = ACTION_BAR_CONFIG.defaultSlotLabelTextAlign;
        ctx.textBaseline = ACTION_BAR_CONFIG.defaultSlotLabelTextBaseline;
        ctx.strokeStyle = ACTION_BAR_CONFIG.defaultSlotLabelOutlineColor;
        ctx.lineWidth = ACTION_BAR_CONFIG.defaultSlotLabelOutlineWidth;
        // Draw outline for better contrast
        ctx.strokeText(
          this._keyLabel(keyLabel, row, col),
          slotX + this.slotSize / 2,
          slotY + this.slotSize / 2
        );
        ctx.fillText(
          this._keyLabel(keyLabel, row, col),
          slotX + this.slotSize / 2,
          slotY + this.slotSize / 2
        );
        if (!macroName) {
          ctx.fillStyle = ACTION_BAR_CONFIG.defaultEmptyLabelColor;
          ctx.font = ACTION_BAR_CONFIG.defaultEmptyLabelFont;
          ctx.fillText(ACTION_BAR_CONFIG.defaultEmptyLabel, slotX + this.slotSize / 2, slotY + this.slotSize / 2 + ACTION_BAR_CONFIG.defaultSlotLabelYOffset);
        }
      }
      
      // Draw draggable handle (dot) - always on top
      ctx.save();
      const { handleX: handleDotX, handleY: handleDotY } = this._calculateDotPositions();
      ctx.beginPath();
      ctx.arc(
        handleDotX,
        handleDotY,
        this._handleSize / 2,
        0, 2 * Math.PI
      );
      if (this._handleActive) {
        ctx.fillStyle = this._handleEditableColor;
        ctx.shadowColor = this._handleEditableShadow;
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = this._handleLockedColor;
        ctx.shadowColor = this._handleLockedShadow;
        ctx.shadowBlur = 2;
      }
      ctx.fill();
      ctx.restore();
      

    }
    _keyLabel(binding, row, col) {
      if (!binding) return '';
      if (typeof binding === 'string' && binding.startsWith('Shift+')) {
        return 'S+' + binding.replace('Shift+Digit', '');
      }
      if (typeof binding === 'string' && binding.startsWith('Digit')) {
        return binding.replace('Digit', '');
      }
      if (typeof binding === 'string' && binding.startsWith('F')) {
        return binding;
      }
      return binding || '';
    }
    assignMacro(row, col, macroName) {
      if(this.macroBindings[row] === undefined) this.macroBindings[row] = [];
      this.macroBindings[row][col] = macroName;
      this.render();
      if (window.UI && window.UI.actionBarManager) window.UI.actionBarManager.saveAllBars();
    }
    removeMacro(row, col) {
      if(thins.macroBindings[row] === undefined) this.macroBindings[row] = [];
      this.macroBindings[row][col] = undefined;
      this.render();
      if (window.UI && window.UI.actionBarManager) window.UI.actionBarManager.saveAllBars();
    }
    updateConfig(newConfig) {
      Object.assign(this, newConfig);
      this._updateSize();
      this.render();
    }
    triggerSlot(row, col) {
      this.activeSlot = { row, col };
      this.render();
      const macroName = (this.macroBindings[row] || [])[col];
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
    _showJsonPopup() {
      if (this._jsonPopup) return; // already open
      
      // Create rotate button configuration (only for non-grid layouts)
      const buttons = [];
      if (this.layout !== 'grid') {
        buttons.push({
          text: 'Rotate',
          style: {
            background: '#2196F3',
            color: '#fff',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '8px'
          },
          onClick: () => this._rotateActionBar()
        });
      }
      
      // Create and show the JSON popup
      this._jsonPopup = new this._JsonPopupClass({
        title: `Edit Action Bar: ${this.name}`,
        jsonData: this._getSerializableConfig(),
        onSave: (newConfig) => {
          this._applyConfig(newConfig);
          if (window.UI && window.UI.actionBarManager) window.UI.actionBarManager.saveAllBars();
          this.render();
        },
        onCancel: () => {
          // onCancel is called by the popup's handleCancel method, which already calls close()
        },
        onClose: () => {
          this._jsonPopup = null;
        },
        buttons: buttons
      });
      
      this._jsonPopup.show();
    }
    
    _rotateActionBar() {
      // Capture the current bottom-left corner position before any changes
      const rect = this.canvas.getBoundingClientRect();
      let bottomLeftX = rect.left;
      let bottomLeftY = rect.bottom;
      
      // If this is a horizontal bar positioned at bottom, we need to account for menuBarOffset
      if (this.orientation === 'horizontal' && 'bottom' in this.position) {
        bottomLeftY = rect.bottom - (ACTION_BAR_CONFIG.menuBarOffset / 4);
      }
      
      // Toggle orientation and layout
      const newOrientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      this.orientation = newOrientation;
      this.layout = newOrientation;
      
      // Transform keyBindings to match the new orientation
      if (newOrientation === 'vertical') {
        // Convert from horizontal (1 row, N columns) to vertical (N rows, 1 column)
        const oldKeyBindings = this.keyBindings[0] || [];
        this.keyBindings = oldKeyBindings.map(key => [key]);
        this.rows = this.slots; // All slots in one column
        this.columns = 1;
      } else {
        // Convert from vertical (N rows, 1 column) to horizontal (1 row, N columns)
        const oldKeyBindings = this.keyBindings.map(row => row[0]);
        this.keyBindings = [oldKeyBindings];
        this.rows = 1; // All slots in one row
        this.columns = this.slots;
      }
      
      this._updateSize();
      
      // Apply the captured position to maintain the bottom-left corner location
      this._applyPositionFromBottomLeft(bottomLeftX, bottomLeftY);
      
      // Update the JSON popup with new data
      if (this._jsonPopup) {
        this._jsonPopup.updateJsonData(this._getSerializableConfig());
      }
      
      this.render();
      if (window.UI && window.UI.actionBarManager) {
        window.UI.actionBarManager._rebuildKeyBindingMap();
        window.UI.actionBarManager.saveAllBars();
      }
    }
    _getSerializableConfig() {
      // Return the config as saved in saveAllBars
      return {
        name: this.name,
        layout: this.layout,
        orientation: this.orientation,
        position: this.position,
        slots: this.slots,
        rows: this.rows,
        columns: this.columns,
        slotSize: this.slotSize,
        spacing: this.spacing,
        padding: this.padding,
        zIndex: this.zIndex,
        opacity: this.opacity,
        colors: this.colors,
        keyBindings: this.keyBindings,
        macroBindings: this.macroBindings,
        handleSize: this._handleSize,
        toggleSize: this._toggleSize,
        handleLockedColor: this._handleLockedColor,
        handleEditableColor: this._handleEditableColor,
        handleLockedShadow: this._handleLockedShadow,
        handleEditableShadow: this._handleEditableShadow,
        toggleDotColor: this._toggleDotColor,
        toggleDotShadow: this._toggleDotShadow,
        toggleIconColor: this._toggleIconColor,
        dotPositions: this._dotPositions,
        dotGap: this._dotGap,
        handleCorner: this._handleCorner,
        handleActive: this._handleActive
      };
    }
    _applyConfig(newConfig) {
      // Apply config fields to this bar
      for (const k in newConfig) {
        if (k in this) {
          this[k] = newConfig[k];
        } else if (k.startsWith('_') && (k.slice(1) in this)) {
          this[k] = newConfig[k];
        } else {
          // For private fields
          this['_' + k] = newConfig[k];
        }
      }
      // Special: update dot positions and sizes
      this._handleSize = newConfig.handleSize || this._handleSize;
      this._toggleSize = newConfig.toggleSize || this._toggleSize;
      this._dotGap = newConfig.dotGap || this._dotGap;
      this._dotPositions = newConfig.dotPositions || this._dotPositions;
      this._updateSize();
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

  barsStorageKey: 'ui_actionBars',

  saveAllBars() {
    // Serialize all action bars (full config, not just macroBindings)
    const barsData = {};
    for (const barName in this.bars) {
      const bar = this.bars[barName];
      barsData[barName] = bar._getSerializableConfig();
    }
    try {
      localStorage.setItem(this.barsStorageKey, JSON.stringify(barsData));
    } catch (e) {
      console.warn('[UI] Failed to save action bars:', e);
    }
  },

  loadAllBars() {
    try {
      const raw = localStorage.getItem(this.barsStorageKey);
      if (!raw) return;
      const barsData = JSON.parse(raw);
      for (const barName in barsData) {
        const config = barsData[barName];
        // Avoid duplicate creation
        if (!this.bars[barName]) {
          this.createActionBar(config);
        } else {
          // Restore handleActive state and handleCorner from config
          this.bars[barName]._handleActive = config.handleActive;
          if (config.handleCorner) {
            this.bars[barName]._handleCorner = config.handleCorner;
          }
        }
      }
    } catch (e) {
      console.warn('[UI] Failed to load action bars:', e);
    }
  },

  preloadAllIcons() {
    for (const barName in this.bars) {
      this.bars[barName].preloadIcons();
    }
  },

  createActionBar(config) {
    if (!config.name) throw new Error('Action bar must have a unique name');
    if (this.bars[config.name]) throw new Error('Action bar name already exists');
    const bar = new ActionBar(config);
    this.bars[config.name] = bar;
    this._rebuildKeyBindingMap();
    this.saveAllBars(); // Save all bars after creation
    return bar;
  },

  removeActionBar(name) {
    const bar = this.bars[name];
    if (bar) {
      bar.canvas.remove();
      delete this.bars[name];
      this._rebuildKeyBindingMap();
      this.saveAllBars(); // Save all bars after removal
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
      for (let r = 0; r < bar.rows; r++) {
        for (let c = 0; c < bar.columns; c++) {
          const binding = (bar.keyBindings[r] || [])[c];
          if (binding) {
            this.keyBindingMap[binding] = { barName, row: r, col: c };
          }
        }
      }
    }
    console.log('[UI] Key binding map rebuilt:', this.keyBindingMap);
  },

  // Global event handling for key bindings
  handleGlobalKey(e) {
    // Explicitly block all action bar processing if the input bar is open
    if (typeof window !== 'undefined' && window.UI && typeof window.UI.isInputBlocked === 'function' && window.UI.isInputBlocked()) {
      return;
    }
    
    // Create the key lookup string
    const keyLookup = e.shiftKey ? `Shift+${e.code}` : e.code;
    
    // Look up the binding in the map
    const binding = this.keyBindingMap[keyLookup];
    if (binding) {
      const bar = this.bars[binding.barName];
      if (bar) {
        bar.triggerSlot(binding.row, binding.col);
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
      layout: 'horizontal',
      position: { left: 20, bottom: 20 },
      slots: 10,
      slotSize: 60,
      spacing: 4,
      zIndex: 998,
      opacity: 0.95,
      handleCorner: 'bottomLeft',
      keyBindings: [
        ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0']
      ]
    });
  }
  if (!window.UI.actionBarManager.getActionBar('secondaryBar')) {
    window.UI.actionBarManager.createActionBar({
      name: 'secondaryBar',
      layout: 'horizontal',
      position: { left: 700, bottom: 20 },
      slots: 10,
      slotSize: 60,
      spacing: 4,
      zIndex: 998,
      opacity: 0.95,
      handleCorner: 'bottomRight',
      keyBindings: [
        ['Shift+Digit2','Shift+Digit2','Shift+Digit3','Shift+Digit4','Shift+Digit5','Shift+Digit6','Shift+Digit7','Shift+Digit8','Shift+Digit9','Shift+Digit0']
      ]
    });
  }
  if (!window.UI.actionBarManager.getActionBar('gridBar')) {
    window.UI.actionBarManager.createActionBar({
      name: 'gridBar',
      layout: 'grid',
      position: { right: 20, top: 20 },
      rows: 2,
      columns: 2,
      slotSize: 60,
      spacing: 4,
      zIndex: 998,
      opacity: 0.95,
      handleCorner: 'bottomRight',
      keyBindings: [
        ['KeyF', "KeyG"],
        ["KeyH", "KeyI"]
      ]
    });
  }
}

// On UI startup, load all bars from storage and render them
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.UI.actionBarManager.loadAllBars();
    if (!localStorage.getItem('ui_actionBars')) {
      createDefaultActionBars();
    }
  });
} else {
  window.UI.actionBarManager.loadAllBars();
  if (!localStorage.getItem('ui_actionBars')) {
    createDefaultActionBars();
  }
}
