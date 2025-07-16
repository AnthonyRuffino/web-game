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
  defaultPlayerDotSize: 3,
  defaultWorldBorderWidth: 1,
  defaultWorldBorderColor: '#333',
  // Biome tile display config
  defaultShowBiomeTiles: true,
  defaultBiomeTileOpacity: 0.6,
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
      this.showBiomeTiles = config.showBiomeTiles !== undefined ? config.showBiomeTiles : MINIMAP_CONFIG.defaultShowBiomeTiles;
      this.biomeTileOpacity = config.biomeTileOpacity || MINIMAP_CONFIG.defaultBiomeTileOpacity;
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
      this._JsonPopupClass = config.JsonPopupClass || window.JsonPopup;
      
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
      
      // Draw cached world map
      const worldMap = window.UI.minimapManager.getWorldMap();
      if (worldMap && worldMap.complete) {
        // Draw the cached world map directly (it's already the right size)
        ctx.drawImage(worldMap, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback: draw black background if world map not ready
        ctx.fillStyle = this.colors.world;
        ctx.fillRect(worldMargin, worldMargin, worldWidth, worldHeight);
      }
      
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
      
      // Create toggle buttons configuration
      const buttons = [
        {
          text: this.showBiomeTiles ? 'Hide Biomes' : 'Show Biomes',
          style: {
            background: this.showBiomeTiles ? '#ff9800' : '#4caf50',
            color: '#fff',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '8px'
          },
          onClick: () => this._toggleBiomeTiles()
        }
      ];
      
      // Create and show the JSON popup
      this._jsonPopup = new this._JsonPopupClass({
        title: `Edit Minimap: ${this.name}`,
        jsonData: this._getSerializableConfig(),
        onSave: (newConfig) => {
          this._applyConfig(newConfig);
          if (window.UI && window.UI.minimapManager) window.UI.minimapManager.saveAllMinimaps();
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
    
    _toggleBiomeTiles() {
      this.showBiomeTiles = !this.showBiomeTiles;
      
      // Mark world map as dirty so it regenerates with new biome settings
      if (window.UI && window.UI.minimapManager) {
        window.UI.minimapManager.markWorldMapDirty();
      }
      
      this.render();
      if (window.UI && window.UI.minimapManager) window.UI.minimapManager.saveAllMinimaps();
      
      // Update the button text in the popup
      if (this._jsonPopup && this._jsonPopup.popup) {
        const buttons = this._jsonPopup.popup.querySelectorAll('button');
        if (buttons[0]) {
          buttons[0].textContent = this.showBiomeTiles ? 'Hide Biomes' : 'Show Biomes';
          buttons[0].style.background = this.showBiomeTiles ? '#ff9800' : '#4caf50';
        }
      }
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
        showBiomeTiles: this.showBiomeTiles,
        biomeTileOpacity: this.biomeTileOpacity,
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
        
        // Regenerate world map with new dimensions
        if (window.UI && window.UI.minimapManager) {
          window.UI.minimapManager.regenerateWorldMapForMinimap(this);
        }
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
  cachedWorldMap: null, // Cached PNG image of the entire world
  worldMapCanvas: null, // Canvas used to generate the world map
  worldMapDirty: true, // Flag to indicate if world map needs regeneration

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
  },

  // Generate the cached world map
  generateWorldMap() {
    if (typeof World === 'undefined') return;
    
    console.log('[MinimapManager] Generating cached world map...');
    
    // Create a canvas for generating the world map
    if (!this.worldMapCanvas) {
      this.worldMapCanvas = document.createElement('canvas');
    }
    
    const canvas = this.worldMapCanvas;
    const ctx = canvas.getContext('2d');
    
    // Get minimap dimensions from the first minimap (or use defaults)
    let minimapWidth = 200;
    let minimapHeight = 150;
    const minimapNames = Object.keys(this.minimaps);
    if (minimapNames.length > 0) {
      const firstMinimap = this.minimaps[minimapNames[0]];
      minimapWidth = firstMinimap.width || 200;
      minimapHeight = firstMinimap.height || 150;
    }
    
    // Set canvas size to match minimap dimensions (not world dimensions)
    const worldMargin = 10; // padding
    const worldWidth = minimapWidth - worldMargin * 2;
    const worldHeight = minimapHeight - worldMargin * 2;
    canvas.width = minimapWidth;
    canvas.height = minimapHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw world background
    ctx.fillStyle = '#000';
    ctx.fillRect(worldMargin, worldMargin, worldWidth, worldHeight);
    
    // Get chunk information
    const chunkCount = World.getChunkCount();
    const chunkSize = World.config.chunkSize * World.config.tileSize; // Full world chunk size
    
    // Calculate scaled chunk dimensions for minimap
    const scaledChunkWidth = worldWidth / chunkCount.x;
    const scaledChunkHeight = worldHeight / chunkCount.y;
    
    // Get biome tile opacity from first minimap (or use default)
    let biomeOpacity = 0.6; // default
    if (minimapNames.length > 0) {
      const firstMinimap = this.minimaps[minimapNames[0]];
      biomeOpacity = firstMinimap.biomeTileOpacity || 0.6;
    }
    
    // Draw all chunks with their biome tiles (scaled down)
    for (let chunkY = 0; chunkY < chunkCount.y; chunkY++) {
      for (let chunkX = 0; chunkX < chunkCount.x; chunkX++) {
        const chunkMinimapX = worldMargin + chunkX * scaledChunkWidth;
        const chunkMinimapY = worldMargin + chunkY * scaledChunkHeight;
        
        // Get biome for this chunk
        const chunkKey = World.getChunkKey(chunkX, chunkY);
        const biome = World.chunkBiomeMap.get(chunkKey) || 'plains';
        
        // Draw biome tile (scaled down to minimap size)
        this._drawBiomeTileOnWorldMap(ctx, chunkMinimapX, chunkMinimapY, scaledChunkWidth, scaledChunkHeight, biome, biomeOpacity);
      }
    }
    
    // Draw chunk grid lines (scaled down)
    this._drawChunkGridOnWorldMap(ctx, chunkCount, scaledChunkWidth, scaledChunkHeight, worldMargin);
    
    // Convert canvas to image
    this.cachedWorldMap = new Image();
    this.cachedWorldMap.src = canvas.toDataURL();
    
    this.worldMapDirty = false;
    console.log('[MinimapManager] World map generated and cached');
  },

  // Draw biome tile on world map (scaled down)
  _drawBiomeTileOnWorldMap(ctx, x, y, width, height, biome, opacity = 0.6) {
    if (typeof EntityRenderer === 'undefined') return;
    
    // Get biome background image from cache
    const bgKey = `background-${biome}`;
    const bgEntry = EntityRenderer.getCachedImage(bgKey);
    
    if (bgEntry && bgEntry.image && bgEntry.image.complete) {
      ctx.globalAlpha = opacity;
      ctx.drawImage(bgEntry.image, x, y, width, height);
      ctx.globalAlpha = 1.0;
    } else {
      // Fallback: draw biome color if image not available
      ctx.globalAlpha = opacity;
      let biomeColor;
      switch (biome) {
        case 'plains':
          biomeColor = '#3cb043';
          break;
        case 'desert':
          biomeColor = '#f7e9a0';
          break;
        default:
          biomeColor = '#666666';
      }
      
      ctx.fillStyle = biomeColor;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1.0;
    }
  },

  // Draw chunk grid on world map (scaled down)
  _drawChunkGridOnWorldMap(ctx, chunkCount, scaledChunkWidth, scaledChunkHeight, worldMargin) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let x = 1; x < chunkCount.x; x++) {
      const gridX = worldMargin + x * scaledChunkWidth;
      ctx.beginPath();
      ctx.moveTo(gridX, worldMargin);
      ctx.lineTo(gridX, worldMargin + chunkCount.y * scaledChunkHeight);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 1; y < chunkCount.y; y++) {
      const gridY = worldMargin + y * scaledChunkHeight;
      ctx.beginPath();
      ctx.moveTo(worldMargin, gridY);
      ctx.lineTo(worldMargin + chunkCount.x * scaledChunkWidth, gridY);
      ctx.stroke();
    }
  },

  // Mark world map as dirty (needs regeneration)
  markWorldMapDirty() {
    this.worldMapDirty = true;
  },

  // Regenerate world map when minimap dimensions change
  regenerateWorldMapForMinimap(minimap) {
    // Store the minimap dimensions temporarily
    const originalMinimaps = this.minimaps;
    this.minimaps = { temp: minimap };
    
    // Generate the world map with the new dimensions
    this.generateWorldMap();
    
    // Restore the original minimaps
    this.minimaps = originalMinimaps;
  },

  // Get the cached world map, generating it if needed
  getWorldMap() {
    if (this.worldMapDirty || !this.cachedWorldMap) {
      this.generateWorldMap();
    }
    return this.cachedWorldMap;
  }
};

// --- Create default minimap for compatibility ---
function createDefaultMinimap() {
  if (!window.UI.minimapManager.getMinimap('mainMinimap')) {
    window.UI.minimapManager.createMinimap({
      name: 'mainMinimap',
      handleCorner: 'topRight',
      handlePosition: { dx: 4, dy: 4 },
      width: 200,
      height: 150,
      position: { right: 20, top: 20 },
      zIndex: 997,
      opacity: 0.9,
      showBiomeTiles: true,
      biomeTileOpacity: 0.6,
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