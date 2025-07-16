// ui/minimap.js
// Minimap system with draggable functionality and persistence

// --- Minimap Config ---
const MINIMAP_CONFIG = {
  defaultWidth: 200,
  defaultHeight: 150,
  defaultZIndex: 997,
  defaultOpacity: 0.9,
  defaultColors: {
    background: 'rgba(0,0,0,0.8)',
    border: '#666',
    world: '#000',
    player: '#ffff00',
    text: '#fff'
  },
  defaultPosition: { right: 20, top: 20 },
  defaultPadding: 8,
  defaultBorderRadius: 8,
  defaultBoxShadow: '0 4px 20px rgba(0,0,0,0.6)',
  defaultTextFont: '12px sans-serif',
  defaultTextColor: '#fff',
  defaultTextOutline: 'rgba(0,0,0,0.8)',
  defaultTextOutlineWidth: 2,
  defaultPlayerDotSize: 6,
  defaultWorldBorderWidth: 1,
  defaultWorldBorderColor: '#333',
  // Drag handle config
  handleSize: 7,
  handleLockedColor: '#e53935',
  handleEditableColor: '#43a047',
  handleLockedShadow: '#b71c1c',
  handleEditableShadow: '#1b5e20',
  handlePosition: { dx: 4, dy: 4 }, // bottom left corner
  borderThreshold: 8, // pixels from border to enable drag
};
// --- End Minimap Config ---

// Only declare Minimap if it doesn't already exist
if (!window.Minimap) {
  class Minimap {
    constructor(config) {
      this.name = config.name || 'minimap';
      this.width = config.width || MINIMAP_CONFIG.defaultWidth;
      this.height = config.height || MINIMAP_CONFIG.defaultHeight;
      this.zIndex = config.zIndex || MINIMAP_CONFIG.defaultZIndex;
      this.opacity = config.opacity || MINIMAP_CONFIG.defaultOpacity;
      this.colors = Object.assign({}, MINIMAP_CONFIG.defaultColors, config.colors || {});
      this.position = config.position || MINIMAP_CONFIG.defaultPosition;
      this.padding = config.padding || MINIMAP_CONFIG.defaultPadding;
      this.borderRadius = config.borderRadius || MINIMAP_CONFIG.defaultBorderRadius;
      this.boxShadow = config.boxShadow || MINIMAP_CONFIG.defaultBoxShadow;
      this.textFont = config.textFont || MINIMAP_CONFIG.defaultTextFont;
      this.textColor = config.textColor || MINIMAP_CONFIG.defaultTextColor;
      this.textOutline = config.textOutline || MINIMAP_CONFIG.defaultTextOutline;
      this.textOutlineWidth = config.textOutlineWidth || MINIMAP_CONFIG.defaultTextOutlineWidth;
      this.playerDotSize = config.playerDotSize || MINIMAP_CONFIG.defaultPlayerDotSize;
      this.worldBorderWidth = config.worldBorderWidth || MINIMAP_CONFIG.defaultWorldBorderWidth;
      this.worldBorderColor = config.worldBorderColor || MINIMAP_CONFIG.defaultWorldBorderColor;
      this.visible = config.visible !== undefined ? config.visible : true;
      
      // State
      this.canvas = null;
      this.ctx = null;
      this._dragging = false;
      this._dragOffset = { x: 0, y: 0 };
      this._handleSize = config.handleSize || MINIMAP_CONFIG.handleSize;
      this._handleLockedColor = config.handleLockedColor || MINIMAP_CONFIG.handleLockedColor;
      this._handleEditableColor = config.handleEditableColor || MINIMAP_CONFIG.handleEditableColor;
      this._handleLockedShadow = config.handleLockedShadow || MINIMAP_CONFIG.handleLockedShadow;
      this._handleEditableShadow = config.handleEditableShadow || MINIMAP_CONFIG.handleEditableShadow;
      this._handlePosition = config.handlePosition || MINIMAP_CONFIG.handlePosition;
      this._handleCorner = config.handleCorner || 'bottomLeft'; // 'bottomLeft', 'topRight', etc.
      this._borderThreshold = config.borderThreshold || MINIMAP_CONFIG.borderThreshold;
      this._handleActive = config.handleActive !== undefined ? config.handleActive : false; // true if dot is green (unlocked)
      this._jsonPopup = null; // reference to popup DOM
      
      this._createCanvas();
      this._setupListeners();
      this.render();
    }
    
    _createCanvas() {
      const canvas = document.createElement('canvas');
      canvas.id = `ui-minimap-${this.name}`;
      canvas.style.position = 'fixed';
      canvas.style.zIndex = this.zIndex;
      canvas.style.border = `2px solid ${this.colors.border}`;
      canvas.style.borderRadius = `${this.borderRadius}px`;
      canvas.style.boxShadow = this.boxShadow;
      
      // Add canvas to DOM first
      document.body.appendChild(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      // Set canvas size
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      
      // Handle positioning
      for (const [k, v] of Object.entries(this.position)) {
        if (k === 'right') {
          // Handle right positioning by calculating left position
          const rightPos = typeof v === 'number' ? v : parseInt(v);
          canvas.style.left = `calc(100vw - ${rightPos + this.canvas.width}px)`;
        } else {
          canvas.style[k] = typeof v === 'number' ? `${v}px` : v;
        }
      }
    }
    
    _setupListeners() {
      this.canvas.addEventListener('mousedown', (e) => this._handleDragStart(e));
      window.addEventListener('mousemove', (e) => this._handleDragMove(e));
      window.addEventListener('mouseup', (e) => this._handleDragEnd(e));
      this.canvas.addEventListener('click', (e) => this._handleClick(e));
      window.addEventListener('resize', () => {
        this.render();
      });
    }
    
    _handleDragStart(e) {
      // Allow drag from any border if handleActive is true
      if (!this._handleActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Check if near any border (within borderThreshold)
      if (
        x <= this._borderThreshold ||
        x >= this.canvas.width - this._borderThreshold ||
        y <= this._borderThreshold ||
        y >= this.canvas.height - this._borderThreshold
      ) {
        this._dragging = true;
        // Calculate offset from mouse to top-left of minimap
        const minimapRect = this.canvas.getBoundingClientRect();
        this._dragOffset = {
          x: e.clientX - minimapRect.left,
          y: e.clientY - minimapRect.top
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
      // Update position config (prefer left/top)
      this.position.left = newLeft;
      this.position.top = newTop;
      delete this.position.right;
      delete this.position.bottom;
      // Update style
      this.canvas.style.left = `${this.position.left}px`;
      this.canvas.style.top = `${this.position.top}px`;
      this.canvas.style.right = '';
      this.canvas.style.bottom = '';
      this.render();
    }
    
    _handleDragEnd(e) {
      if (this._dragging) {
        this._dragging = false;
        if (window.UI && window.UI.minimapManager) window.UI.minimapManager.saveAllMinimaps();
      }
    }
    
    _handleClick(e) {
      // Check if click is on the handle dot
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate handle position based on corner
      let handleX, handleY;
      switch (this._handleCorner) {
        case 'topRight':
          handleX = this.canvas.width - this._handlePosition.dx - this._handleSize / 2;
          handleY = this._handlePosition.dy + this._handleSize / 2;
          break;
        case 'topLeft':
          handleX = this._handlePosition.dx + this._handleSize / 2;
          handleY = this._handlePosition.dy + this._handleSize / 2;
          break;
        case 'bottomRight':
          handleX = this.canvas.width - this._handlePosition.dx - this._handleSize / 2;
          handleY = this.canvas.height - this._handlePosition.dy - this._handleSize / 2;
          break;
        case 'bottomLeft':
        default:
          handleX = this._handlePosition.dx + this._handleSize / 2;
          handleY = this.canvas.height - this._handlePosition.dy - this._handleSize / 2;
          break;
      }
      
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
        if (window.UI && window.UI.minimapManager) window.UI.minimapManager.saveAllMinimaps();
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    
    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const canvas = this.canvas;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      
      // Draw world bounds (black rectangle)
      const worldMargin = this.padding;
      const worldWidth = canvas.width - worldMargin * 2;
      const worldHeight = canvas.height - worldMargin * 2;
      
      ctx.fillStyle = this.colors.world;
      ctx.fillRect(worldMargin, worldMargin, worldWidth, worldHeight);
      
      // Draw world border
      ctx.strokeStyle = this.worldBorderColor;
      ctx.lineWidth = this.worldBorderWidth;
      ctx.strokeRect(worldMargin, worldMargin, worldWidth, worldHeight);
      
      // Draw player position (triangle showing direction)
      if (typeof Player !== 'undefined' && typeof World !== 'undefined') {
        const worldBounds = {
          minX: 0,
          minY: 0,
          maxX: World.width,
          maxY: World.height
        };
        
        // Calculate player position relative to world bounds
        const playerX = worldMargin + (Player.x - worldBounds.minX) / (worldBounds.maxX - worldBounds.minX) * worldWidth;
        const playerY = worldMargin + (Player.y - worldBounds.minY) / (worldBounds.maxY - worldBounds.minY) * worldHeight;
        
        // Draw player as triangle showing direction
        ctx.save();
        ctx.translate(playerX, playerY);
        ctx.rotate(Player.angle);
        
        // Draw triangle pointing up (north)
        ctx.beginPath();
        ctx.moveTo(0, -this.playerDotSize * 2); // tip
        ctx.lineTo(this.playerDotSize, this.playerDotSize); // right base
        ctx.lineTo(-this.playerDotSize, this.playerDotSize); // left base
        ctx.closePath();
        
        ctx.fillStyle = this.colors.player;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      }
      
      // Draw coordinates text
      if (typeof Player !== 'undefined') {
        const text = `${Math.floor(Player.x)}, ${Math.floor(Player.y)}`;
        
        ctx.font = this.textFont;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Draw text outline
        ctx.strokeStyle = this.textOutline;
        ctx.lineWidth = this.textOutlineWidth;
        ctx.strokeText(text, canvas.width - this.padding, canvas.height - this.padding);
        
        // Draw text
        ctx.fillStyle = this.textColor;
        ctx.fillText(text, canvas.width - this.padding, canvas.height - this.padding);
      }
      
      // Draw draggable handle (dot) - always on top
      ctx.save();
      let handleDotX, handleDotY;
      switch (this._handleCorner) {
        case 'topRight':
          handleDotX = canvas.width - this._handlePosition.dx - this._handleSize / 2;
          handleDotY = this._handlePosition.dy + this._handleSize / 2;
          break;
        case 'topLeft':
          handleDotX = this._handlePosition.dx + this._handleSize / 2;
          handleDotY = this._handlePosition.dy + this._handleSize / 2;
          break;
        case 'bottomRight':
          handleDotX = canvas.width - this._handlePosition.dx - this._handleSize / 2;
          handleDotY = canvas.height - this._handlePosition.dy - this._handleSize / 2;
          break;
        case 'bottomLeft':
        default:
          handleDotX = this._handlePosition.dx + this._handleSize / 2;
          handleDotY = canvas.height - this._handlePosition.dy - this._handleSize / 2;
          break;
      }
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
    
    updateConfig(newConfig) {
      Object.assign(this, newConfig);
      this.render();
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
      // Create popup elements
      const popup = document.createElement('div');
      popup.style.position = 'fixed';
      popup.style.left = '50%';
      popup.style.top = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
      popup.style.background = '#222';
      popup.style.color = '#fff';
      popup.style.padding = '20px';
      popup.style.borderRadius = '8px';
      popup.style.zIndex = 9999;
      popup.style.boxShadow = '0 4px 32px #000a';
      popup.style.minWidth = '400px';
      popup.style.maxWidth = '90vw';
      popup.style.maxHeight = '80vh';
      popup.style.overflow = 'auto';

      const label = document.createElement('div');
      label.textContent = 'Edit Minimap JSON:';
      label.style.marginBottom = '8px';
      popup.appendChild(label);

      const textarea = document.createElement('textarea');
      textarea.style.width = '100%';
      textarea.style.height = '200px';
      textarea.style.background = '#111';
      textarea.style.color = '#fff';
      textarea.style.fontFamily = 'monospace';
      textarea.style.fontSize = '14px';
      textarea.value = JSON.stringify(this._getSerializableConfig(), null, 2);
      popup.appendChild(textarea);

      const errorDiv = document.createElement('div');
      errorDiv.style.color = '#ff5252';
      errorDiv.style.margin = '8px 0';
      popup.appendChild(errorDiv);

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '8px';

      const submitBtn = document.createElement('button');
      submitBtn.textContent = 'Save';
      submitBtn.style.background = '#43a047';
      submitBtn.style.color = '#fff';
      submitBtn.style.border = 'none';
      submitBtn.style.padding = '6px 16px';
      submitBtn.style.borderRadius = '4px';
      submitBtn.style.cursor = 'pointer';
      btnRow.appendChild(submitBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = '#e53935';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.padding = '6px 16px';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.style.cursor = 'pointer';
      btnRow.appendChild(cancelBtn);

      popup.appendChild(btnRow);

      document.body.appendChild(popup);
      this._jsonPopup = popup;

      cancelBtn.onclick = () => {
        document.body.removeChild(popup);
        this._jsonPopup = null;
      };

      submitBtn.onclick = () => {
        try {
          const newConfig = JSON.parse(textarea.value);
          // Update this minimap with new config
          this._applyConfig(newConfig);
          if (window.UI && window.UI.minimapManager) window.UI.minimapManager.saveAllMinimaps();
          document.body.removeChild(popup);
          this._jsonPopup = null;
          this.render();
        } catch (err) {
          errorDiv.textContent = 'Invalid JSON: ' + err.message;
        }
      };
    }
    
    _getSerializableConfig() {
      return {
        name: this.name,
        width: this.width,
        height: this.height,
        position: this.position,
        zIndex: this.zIndex,
        opacity: this.opacity,
        colors: this.colors,
        padding: this.padding,
        borderRadius: this.borderRadius,
        boxShadow: this.boxShadow,
        textFont: this.textFont,
        textColor: this.textColor,
        textOutline: this.textOutline,
        textOutlineWidth: this.textOutlineWidth,
        playerDotSize: this.playerDotSize,
        worldBorderWidth: this.worldBorderWidth,
        worldBorderColor: this.worldBorderColor,
        visible: this.visible,
        handleSize: this._handleSize,
        handleLockedColor: this._handleLockedColor,
        handleEditableColor: this._handleEditableColor,
        handleLockedShadow: this._handleLockedShadow,
        handleEditableShadow: this._handleEditableShadow,
        handlePosition: this._handlePosition,
        handleCorner: this._handleCorner,
        borderThreshold: this._borderThreshold,
        handleActive: this._handleActive
      };
    }
    
    _applyConfig(newConfig) {
      // Apply config fields to this minimap
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
      // Update canvas size if needed
      if (newConfig.width || newConfig.height) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }
      // Update positioning
      if (newConfig.position) {
        for (const [k, v] of Object.entries(this.position)) {
          if (k === 'right') {
            const rightPos = typeof v === 'number' ? v : parseInt(v);
            this.canvas.style.left = `calc(100vw - ${rightPos + this.canvas.width}px)`;
          } else {
            this.canvas.style[k] = typeof v === 'number' ? `${v}px` : v;
          }
        }
      }
    }
  }
  window.Minimap = Minimap;
} else {
  var Minimap = window.Minimap;
}

// MinimapManager
window.UI.minimapManager = {
  minimaps: {},
  minimapsStorageKey: 'ui_minimaps',

  saveAllMinimaps() {
    const minimapsData = {};
    for (const minimapName in this.minimaps) {
      const minimap = this.minimaps[minimapName];
      minimapsData[minimapName] = minimap._getSerializableConfig();
    }
    try {
      localStorage.setItem(this.minimapsStorageKey, JSON.stringify(minimapsData));
    } catch (e) {
      console.warn('[UI] Failed to save minimaps:', e);
    }
  },

  loadAllMinimaps() {
    try {
      const raw = localStorage.getItem(this.minimapsStorageKey);
      if (!raw) return;
      const minimapsData = JSON.parse(raw);
      for (const minimapName in minimapsData) {
        const config = minimapsData[minimapName];
        // Avoid duplicate creation
        if (!this.minimaps[minimapName]) {
          this.createMinimap(config);
        } else {
          // Restore handleActive state from config
          this.minimaps[minimapName]._handleActive = config.handleActive;
        }
      }
    } catch (e) {
      console.warn('[UI] Failed to load minimaps:', e);
    }
  },

  createMinimap(config) {
    if (!config.name) throw new Error('Minimap must have a unique name');
    if (this.minimaps[config.name]) throw new Error('Minimap name already exists');
    const minimap = new Minimap(config);
    this.minimaps[config.name] = minimap;
    this.saveAllMinimaps(); // Save all minimaps after creation
    return minimap;
  },

  removeMinimap(name) {
    const minimap = this.minimaps[name];
    if (minimap) {
      minimap.canvas.remove();
      delete this.minimaps[name];
      this.saveAllMinimaps(); // Save all minimaps after removal
    }
  },

  getMinimap(name) {
    return this.minimaps[name];
  },

  listMinimaps() {
    return Object.keys(this.minimaps);
  }
};

// --- Create default minimap for compatibility ---
function createDefaultMinimap() {
  if (!window.UI.minimapManager.getMinimap('mainMinimap')) {
    window.UI.minimapManager.createMinimap({
      name: 'mainMinimap',
      width: 200,
      height: 150,
      position: { right: 20, top: 20 },
      zIndex: 997,
      opacity: 0.9,
      colors: {
        background: 'rgba(0,0,0,0.8)',
        border: '#666',
        world: '#000',
        player: '#ffff00',
        text: '#fff'
      }
    });
  }
}

// On UI startup, load all minimaps from storage and render them
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.UI.minimapManager.loadAllMinimaps();
    if (!localStorage.getItem('ui_minimaps')) {
      createDefaultMinimap();
    }
  });
} else {
  window.UI.minimapManager.loadAllMinimaps();
  if (!localStorage.getItem('ui_minimaps')) {
    createDefaultMinimap();
  }
} 