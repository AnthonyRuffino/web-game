// ui/skins.js
// Skins management system for entity renderer cache

// Ensure UI object exists
if (!window.UI) window.UI = {};

// --- Skins Config ---
const SKINS_CONFIG = {
  imagePreviewSize: 64,
  borderRadius: 6,
  background: '#444',
  objectFit: 'cover',
  font: {
    main: 'inherit',
    title: '24px',
    section: '18px',
    label: '14px',
    meta: '10px',
    empty: 'italic 14px',
    button: 'bold 14px',
    tab: 'bold 13px',
    slot: '12px',
    input: '1rem',
  },
  color: {
    text: '#fff',
    faded: '#aaa',
    highlight: '#4ECDC4',
    error: '#FF6B6B',
    warning: '#ffeaa7',
    meta: '#6ec6ff',
    background: '#222',
    overlay: 'rgba(0,0,0,0.5)',
    overlayStrong: 'rgba(0,0,0,0.6)',
    border: '#444',
    inputBg: '#23232b',
    inputBorder: '#444',
    inputFocus: '#4ECDC4',
    previewBg: '#444',
    previewBorder: '#444',
    plus: '#aaa',
    plusBg: '#333',
    plusHover: '#444',
    slotBg: '#333',
    slotHover: '#444',
    slotSelected: '#4ECDC4',
    slotSelectedText: '#222',
    slotEmpty: 'rgba(136,136,136,0.4)',
  },
  modal: {
    minWidth: '900px',
    maxWidth: '95vw',
    maxHeight: '85vh',
    padding: '24px 32px',
    color: '#fff',
    background: '#222',
    borderRadius: '12px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.7)'
  },
  tab: {
    padding: '12px 20px',
    borderRadius: '6px 6px 0 0',
    fontWeight: 'bold',
    marginRight: '4px',
    activeBg: '#4ECDC4',
    activeColor: '#222',
    inactiveBg: 'transparent',
    inactiveColor: '#fff',
  },
  grid: {
    cols: 6,
    cellHeight: 90,
    cellPadding: 8,
    cellRadius: 4,
    cellGap: 12,
    metaFont: '10px',
    metaColor: '#6ec6ff',
    keyFont: '10px',
    keyColor: '#aaa',
    editBtn: {
      background: '#4ECDC4',
      color: '#222',
      border: 'none',
      borderRadius: '4px',
      width: '36px',
      height: '20px',
      fontSize: '10px',
      cursor: 'pointer',
      position: 'absolute',
      bottom: '2px',
      right: '2px',
    },
    deleteBtn: {
      background: '#FF6B6B',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      fontSize: '12px',
      cursor: 'pointer',
      position: 'absolute',
      top: '2px',
      right: '2px',
      display: 'none',
    },
    cellBg: '#333',
    cellHoverBg: '#444',
    cellSelectedBg: '#4ECDC4',
    cellSelectedText: '#222',
    cellEmptyPlus: '+',
    cellEmptyPlusFont: '32px',
    cellEmptyPlusColor: '#aaa',
  },
  button: {
    background: '#4ECDC4',
    color: '#222',
    border: 'none',
    borderRadius: '5px',
    padding: '7px 18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginRight: '8px',
    fontSize: '14px',
  },
  deleteButton: {
    background: '#FF6B6B',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  closeButton: {
    background: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    position: 'absolute',
    top: '16px',
    right: '16px',
  },
  overlay: {
    zIndex: 2000,
    strongZIndex: 2100,
    background: 'rgba(0,0,0,0.5)',
    strongBackground: 'rgba(0,0,0,0.6)',
    align: 'center',
    justify: 'center',
  },
  dialog: {
    minWidth: '400px',
    maxWidth: '95vw',
    padding: '32px 32px 24px 32px',
    borderRadius: '10px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.8)',
    color: '#fff',
    background: '#23232b',
    margin: '8px auto 16px auto',
  },
  input: {
    width: '100%',
    margin: '4px 0 12px 0',
    fontSize: '1rem',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #444',
  },
  preview: {
    width: '64px',
    height: '64px',
    borderRadius: '6px',
    background: '#444',
    display: 'block',
    margin: '8px auto 16px auto',
    objectFit: 'cover',
  },
  plus: {
    fontSize: '32px',
    color: '#aaa',
    userSelect: 'none',
  },
  transition: {
    short: 0.2,
    long: 0.4,
  },
  misc: {
    minGridWidth: '480px',
    maxGridWidth: '80vw',
    minModalWidth: '340px',
    maxModalWidth: '95vw',
    minDialogWidth: '340px',
    maxDialogWidth: '95vw',
    minDialogHeight: '400px',
    maxDialogHeight: '95vh',
  },
  durations: {
    slotActive: 150,
    fade: 200,
  },
};
// --- End Skins Config ---

// Skins Management System
window.UI.skinsManager = {
  // Storage keys (matching EntityRenderer)
  imageCacheKey: 'entityRenderer_cache',
  canvasCacheKey: 'entityRenderer_canvas_cache',
  preferencesKey: 'entityRenderer_preferences',
  
  // Cache data
  imageCache: {}, // { cacheKey: { dataUrl: dataURL, size: number, fixedScreenAngle: number, drawOffsetX: number, drawOffsetY: number } }
  canvasCache: {}, // { cacheKey: { dataUrl: dataURL, size: number, fixedScreenAngle: number, drawOffsetX: number, drawOffsetY: number } }
  preferences: {}, // { entityType: renderMode }
  
  // Initialize skins system
  init() {
    this.loadCaches();
    console.log('[UI] Skins system initialized');
  },

  // Load all caches from localStorage
  loadCaches() {
    try {
      // Load image cache
      const imageData = localStorage.getItem(this.imageCacheKey);
      if (imageData) {
        this.imageCache = JSON.parse(imageData);
      }

      // Load canvas cache
      const canvasData = localStorage.getItem(this.canvasCacheKey);
      if (canvasData) {
        this.canvasCache = JSON.parse(canvasData);
      }

      // Load preferences
      const preferencesData = localStorage.getItem(this.preferencesKey);
      if (preferencesData) {
        this.preferences = JSON.parse(preferencesData);
      }
      // Ensure all entity types have default preferences
      this.ensureDefaultPreferences();
      // Save migrated caches if needed
      console.log(`[UI] Loaded ${Object.keys(this.imageCache).length} image cache entries`);
      console.log(`[UI] Loaded ${Object.keys(this.canvasCache).length} canvas cache entries`);
      console.log(`[UI] Loaded ${Object.keys(this.preferences).length} preference entries`);
    } catch (e) {
      console.warn('[UI] Failed to load caches:', e);
    }
  },

  // Ensure all entity types have default preferences
  ensureDefaultPreferences() {
    if (window.EntityRenderer && window.EntityRenderer.entityModules) {
      const entityTypes = Object.keys(window.EntityRenderer.entityModules);
      let updated = false;
      
      for (const entityType of entityTypes) {
        if (!(entityType in this.preferences)) {
          this.preferences[entityType] = 'default';
          updated = true;
        }
      }
      
      if (updated) {
        this.savePreferences();
      }
    }
  },

  // Save image cache to localStorage
  saveImageCache() {
    try {
      localStorage.setItem(this.imageCacheKey, JSON.stringify(this.imageCache));
      console.log('[UI] Saved image cache to storage');
    } catch (e) {
      console.warn('[UI] Failed to save image cache:', e);
    }
  },

  // Save canvas cache to localStorage
  saveCanvasCache() {
    try {
      localStorage.setItem(this.canvasCacheKey, JSON.stringify(this.canvasCache));
      console.log('[UI] Saved canvas cache to storage');
      EntityRenderer.canvasCache.delete(this.canvasCacheKey);
    } catch (e) {
      console.warn('[UI] Failed to save canvas cache:', e);
    }
  },

  // Save preferences to localStorage
  savePreferences() {
    try {
      localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
      console.log('[UI] Saved preferences to storage');
    } catch (e) {
      console.warn('[UI] Failed to save preferences:', e);
    }
  },

  // Update a cache entry (EntityRenderer format)
  updateCacheEntry(cacheKey, newDataURL, isCanvas = false, meta = {}) {
    const entry = {
      dataUrl: newDataURL,
      size: meta.size,
      fixedScreenAngle: meta.fixedScreenAngle,
      drawOffsetX: meta.drawOffsetX,
      drawOffsetY: meta.drawOffsetY
    };
    if (isCanvas) {
      this.canvasCache[cacheKey] = entry;
      EntityRenderer.canvasCache[cacheKey] = entry;;
      this.saveCanvasCache();
    } else {
      this.imageCache[cacheKey] = entry;
      EntityRenderer.imageCache[cacheKey] = entry;
      this.saveImageCache();
    }
    // Update EntityRenderer cache if available
    if (window.EntityRenderer) {
      const img = new Image();
      img.onload = () => {
        if (isCanvas) {
          window.EntityRenderer.canvasCache.set(cacheKey, {
            image: img,
            size: entry.size,
            fixedScreenAngle: entry.fixedScreenAngle,
            drawOffsetX: entry.drawOffsetX,
            drawOffsetY: entry.drawOffsetY
          });
        } else {
          window.EntityRenderer.imageCache.set(cacheKey, {
            image: img,
            size: entry.size,
            fixedScreenAngle: entry.fixedScreenAngle,
            drawOffsetX: entry.drawOffsetX,
            drawOffsetY: entry.drawOffsetY
          });
        }
      };
      img.src = newDataURL;
    }
  },

  // Delete a cache entry
  deleteCacheEntry(cacheKey, isCanvas = false) {
    if (isCanvas) {
      delete this.canvasCache[cacheKey];
      this.saveCanvasCache();
      if (window.EntityRenderer) {
        window.EntityRenderer.canvasCache.delete(cacheKey);
      }
    } else {
      delete this.imageCache[cacheKey];
      this.saveImageCache();
      if (window.EntityRenderer) {
        window.EntityRenderer.imageCache.delete(cacheKey);
      }
    }
  },

  // Update render mode preference
  updateRenderModePreference(entityType, mode) {
    if (mode === 'default') {
      delete this.preferences[entityType];
    } else {
      this.preferences[entityType] = mode;
    }
    this.savePreferences();
    
    // Update EntityRenderer preferences if available
    if (window.EntityRenderer) {
      window.EntityRenderer.renderModePreferences = { ...this.preferences };
      window.EntityRenderer.savePreferencesToStorage();
    }
  },

  // Export all cache data to JSON (wrapper objects)
  exportCacheData() {
    const exportData = {
      imageCache: this.imageCache,
      canvasCache: this.canvasCache,
      preferences: this.preferences,
      exportDate: new Date().toISOString(),
      version: '2.0-wrapper'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-skins-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import cache data from JSON file (wrapper objects)
  importCacheData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          // Validate import data
          if (!importData.imageCache || !importData.canvasCache || !importData.preferences) {
            reject(new Error('Invalid skin file format'));
            return;
          }
          
          // Update caches
          this.imageCache = { ...importData.imageCache };
          this.canvasCache = { ...importData.canvasCache };
          this.preferences = { ...importData.preferences };
          
          // Save to localStorage
          this.saveImageCache();
          this.saveCanvasCache();
          this.savePreferences();
          
          // Update EntityRenderer if available
          if (window.EntityRenderer) {
            window.EntityRenderer.renderModePreferences = { ...this.preferences };
            window.EntityRenderer.savePreferencesToStorage();
            
            // Reload caches in EntityRenderer
            window.EntityRenderer.loadCacheFromStorage();
            window.EntityRenderer.loadCanvasCacheFromStorage();
          }
          
          console.log('[UI] Successfully imported skin data');
          resolve();
        } catch (e) {
          reject(new Error('Failed to parse skin file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Get all cache entries for display (EntityRenderer format)
  getAllCacheEntries() {
    const entries = [];
    for (const [key, entry] of Object.entries(this.imageCache)) {
      entries.push({
        key: key,
        dataURL: entry.dataUrl,
        meta: {
          size: entry.size,
          fixedScreenAngle: entry.fixedScreenAngle,
          drawOffsetX: entry.drawOffsetX,
          drawOffsetY: entry.drawOffsetY
        },
        type: 'image',
        size: this.estimateImageSize(entry.dataUrl)
      });
    }
    for (const [key, entry] of Object.entries(this.canvasCache)) {
      entries.push({
        key: key,
        dataURL: entry.dataUrl,
        meta: {
          size: entry.size,
          fixedScreenAngle: entry.fixedScreenAngle,
          drawOffsetX: entry.drawOffsetX,
          drawOffsetY: entry.drawOffsetY
        },
        type: 'canvas',
        size: this.estimateImageSize(entry.dataUrl)
      });
    }
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  },

  // Estimate image size from data URL
  estimateImageSize(dataURL) {
    const base64 = dataURL.split(',')[1];
    if (!base64) return 'Unknown';
    const sizeInBytes = Math.ceil((base64.length * 3) / 4);
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  },

  // --- Skins Management UI ---
  openSkinsUI() {
    // Prevent multiple modals
    if (document.getElementById('skins-ui-modal')) return;

    // Reload caches to get latest data
    this.loadCaches();

    // Create overlay for the modal
    const overlay = document.createElement('div');
    overlay.id = 'skins-ui-modal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = SKINS_CONFIG.overlay.background;
    overlay.style.zIndex = SKINS_CONFIG.overlay.zIndex;
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // Handle escape key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Helper to refresh the UI
    const refreshUI = () => {
      const old = document.getElementById('skins-ui-modal');
      if (old) old.remove();
      this.openSkinsUI();
    };

    // --- Image Upload Dialog ---
    const openUploadDialog = (cacheKey, isCanvas = false) => {
      if (document.getElementById('skins-upload-dialog')) return;
      function getTreeTargetSize() {
        if (window.TreeEntity) {
          const def = window.TreeEntity.defaultConfig;
          return { width: def.size, height: def.imageHeight };
        }
        return { width: SKINS_CONFIG.imagePreviewSize, height: SKINS_CONFIG.imagePreviewSize };
      }
      function getGrassTargetSize() {
        if (window.TreeEntity) {
          const def = window.GrassEntity.defaultConfig;
          return { width: def.size, height: def.size };
        }
        return { width: SKINS_CONFIG.imagePreviewSize, height: SKINS_CONFIG.imagePreviewSize };
      }
      function resizeImageToTarget(img, width, height, callback) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          const resizedImg = new window.Image();
          resizedImg.onload = () => callback(resizedImg, canvas.toDataURL('image/png'));
          resizedImg.src = URL.createObjectURL(blob);
        }, 'image/png');
      }
      const dialogOverlay = document.createElement('div');
      dialogOverlay.id = 'skins-upload-dialog';
      dialogOverlay.style.position = 'fixed';
      dialogOverlay.style.top = '0';
      dialogOverlay.style.left = '0';
      dialogOverlay.style.width = '100vw';
      dialogOverlay.style.height = '100vh';
      dialogOverlay.style.background = SKINS_CONFIG.overlay.strongBackground;
      dialogOverlay.style.zIndex = SKINS_CONFIG.overlay.strongZIndex;
      dialogOverlay.style.display = 'flex';
      dialogOverlay.style.alignItems = 'center';
      dialogOverlay.style.justifyContent = 'center';
      const dialog = document.createElement('div');
      dialog.style.background = SKINS_CONFIG.dialog.background;
      dialog.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
      dialog.style.boxShadow = SKINS_CONFIG.dialog.boxShadow;
      dialog.style.padding = SKINS_CONFIG.dialog.padding;
      dialog.style.minWidth = SKINS_CONFIG.misc.minDialogWidth;
      dialog.style.maxWidth = SKINS_CONFIG.misc.maxDialogWidth;
      dialog.style.color = SKINS_CONFIG.dialog.color;
      dialog.style.position = 'relative';
      dialog.innerHTML = `<h3 style='margin-top:0'>Edit Skin: ${cacheKey}</h3>
        <p style='color:${SKINS_CONFIG.color.faded};margin-bottom:20px'>Replace image for: ${cacheKey}</p>`;
      // Current image preview
      const currentPreview = document.createElement('img');
      currentPreview.style.width = SKINS_CONFIG.preview.width;
      currentPreview.style.height = SKINS_CONFIG.preview.height;
      currentPreview.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
      currentPreview.style.background = SKINS_CONFIG.preview.background;
      currentPreview.style.display = 'block';
      currentPreview.style.margin = '8px auto 16px auto';
      currentPreview.style.objectFit = SKINS_CONFIG.preview.objectFit;
      currentPreview.alt = 'Current Image';
      const currentCache = isCanvas ? this.canvasCache : this.imageCache;
      if (currentCache[cacheKey] && currentCache[cacheKey].dataUrl) {
        currentPreview.src = currentCache[cacheKey].dataUrl;
      } else {
        currentPreview.style.display = 'none';
      }
      dialog.appendChild(currentPreview);
      // New image preview (hidden until file is uploaded)
      const newPreview = document.createElement('img');
      newPreview.style.width = SKINS_CONFIG.preview.width;
      newPreview.style.height = SKINS_CONFIG.preview.height;
      newPreview.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
      newPreview.style.background = SKINS_CONFIG.preview.background;
      newPreview.style.display = 'none';
      newPreview.style.margin = '8px auto 16px auto';
      newPreview.style.objectFit = SKINS_CONFIG.preview.objectFit;
      newPreview.alt = 'New Image';
      dialog.appendChild(newPreview);
      // Offset and angle controls
      const metaControls = document.createElement('div');
      metaControls.style.display = 'flex';
      metaControls.style.justifyContent = 'center';
      metaControls.style.gap = '10px';
      metaControls.style.margin = '8px 0 12px 0';
      // Offset X
      const offsetXInput = document.createElement('input');
      offsetXInput.type = 'number';
      offsetXInput.placeholder = 'Offset X';
      offsetXInput.style.width = '60px';
      offsetXInput.title = 'drawOffsetX';
      offsetXInput.style.fontSize = SKINS_CONFIG.font.input;
      offsetXInput.style.padding = '6px';
      offsetXInput.style.borderRadius = '4px';
      offsetXInput.style.border = '1px solid ' + SKINS_CONFIG.color.inputBorder;
      offsetXInput.style.background = SKINS_CONFIG.color.inputBg;
      offsetXInput.style.color = SKINS_CONFIG.color.text;
      offsetXInput.style.textAlign = 'center';
      // Offset Y
      const offsetYInput = document.createElement('input');
      offsetYInput.type = 'number';
      offsetYInput.placeholder = 'Offset Y';
      offsetYInput.style.width = '60px';
      offsetYInput.title = 'drawOffsetY';
      offsetYInput.style.fontSize = SKINS_CONFIG.font.input;
      offsetYInput.style.padding = '6px';
      offsetYInput.style.borderRadius = '4px';
      offsetYInput.style.border = '1px solid ' + SKINS_CONFIG.color.inputBorder;
      offsetYInput.style.background = SKINS_CONFIG.color.inputBg;
      offsetYInput.style.color = SKINS_CONFIG.color.text;
      offsetYInput.style.textAlign = 'center';
      // Fixed Angle
      const angleInput = document.createElement('input');
      angleInput.type = 'number';
      angleInput.placeholder = 'Angle (deg)';
      angleInput.style.width = '80px';
      angleInput.title = 'fixedScreenAngle';
      angleInput.style.fontSize = SKINS_CONFIG.font.input;
      angleInput.style.padding = '6px';
      angleInput.style.borderRadius = '4px';
      angleInput.style.border = '1px solid ' + SKINS_CONFIG.color.inputBorder;
      angleInput.style.background = SKINS_CONFIG.color.inputBg;
      angleInput.style.color = SKINS_CONFIG.color.text;
      angleInput.style.textAlign = 'center';
      // Pre-fill with current values if present
      if (currentCache[cacheKey]) {
        if (typeof currentCache[cacheKey].drawOffsetX === 'number') offsetXInput.value = currentCache[cacheKey].drawOffsetX;
        if (typeof currentCache[cacheKey].drawOffsetY === 'number') offsetYInput.value = currentCache[cacheKey].drawOffsetY;
        if (typeof currentCache[cacheKey].fixedScreenAngle === 'number') angleInput.value = currentCache[cacheKey].fixedScreenAngle;
      }
      metaControls.appendChild(offsetXInput);
      metaControls.appendChild(offsetYInput);
      metaControls.appendChild(angleInput);
      dialog.appendChild(metaControls);
      // File input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      dialog.appendChild(fileInput);
      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Choose Image File';
      uploadBtn.style.marginRight = '8px';
      uploadBtn.style.background = SKINS_CONFIG.button.background;
      uploadBtn.style.color = SKINS_CONFIG.button.color;
      uploadBtn.style.border = 'none';
      uploadBtn.style.borderRadius = '5px';
      uploadBtn.style.padding = '7px 18px';
      uploadBtn.style.fontWeight = 'bold';
      uploadBtn.style.cursor = 'pointer';
      uploadBtn.style.fontSize = SKINS_CONFIG.font.button;
      uploadBtn.onclick = () => fileInput.click();
      dialog.appendChild(uploadBtn);
      fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          if (cacheKey.startsWith('tree-')) {
            const img = new window.Image();
            img.onload = function () {
              const { width, height } = getTreeTargetSize();
              resizeImageToTarget(img, width, height, (resizedImg, dataUrl) => {
                newPreview.src = dataUrl;
                newPreview._pendingDataURL = dataUrl;
                newPreview.style.display = 'block';
              });
            };
            img.src = reader.result;
          } else if(cacheKey.startsWith('grass-')) {
            const img = new window.Image();
            img.onload = function () {
              const { width, height } = getGrassTargetSize();
              resizeImageToTarget(img, SKINS_CONFIG.imagePreviewSize, SKINS_CONFIG.imagePreviewSize, (resizedImg, dataUrl) => {
                newPreview.src = dataUrl;
                newPreview._pendingDataURL = dataUrl;
                newPreview.style.display = 'block';
              });
            };
            img.src = reader.result;
          }
          else {
            newPreview.src = reader.result;
            newPreview._pendingDataURL = reader.result;
            newPreview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      });
      // Save/Cancel buttons
      const btnRow = document.createElement('div');
      btnRow.style.marginTop = '18px';
      btnRow.style.textAlign = 'right';
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '12px';
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.style.background = SKINS_CONFIG.button.background;
      saveBtn.style.color = SKINS_CONFIG.button.color;
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '5px';
      saveBtn.style.padding = '7px 18px';
      saveBtn.style.fontWeight = 'bold';
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.fontSize = SKINS_CONFIG.font.button;
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = SKINS_CONFIG.button.background;
      cancelBtn.style.color = SKINS_CONFIG.button.color;
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '5px';
      cancelBtn.style.padding = '7px 18px';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.fontSize = SKINS_CONFIG.font.button;
      btnRow.appendChild(saveBtn);
      btnRow.appendChild(cancelBtn);
      dialog.appendChild(btnRow);
      saveBtn.onclick = () => {
        // Allow saving metadata even if no new image is uploaded
        if (newPreview._pendingDataURL || currentCache[cacheKey]) {
          this.updateCacheEntry(
            cacheKey,
            newPreview._pendingDataURL || (currentCache[cacheKey] && currentCache[cacheKey].dataUrl),
            isCanvas,
            {
              drawOffsetX: parseFloat(offsetXInput.value) || 0,
              drawOffsetY: parseFloat(offsetYInput.value) || 0,
              fixedScreenAngle: angleInput.value !== '' ? parseFloat(angleInput.value) : 0
            }
          );
          document.body.removeChild(dialogOverlay);
          refreshUI();
        } else {
          alert('Please select an image file first.');
        }
      };
      cancelBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
      };
      dialogOverlay.appendChild(dialog);
      document.body.appendChild(dialogOverlay);
    };

    // --- Delete Confirmation Dialog ---
    const openDeleteDialog = (cacheKey, isCanvas = false) => {
      if (document.getElementById('skins-delete-dialog')) return;

      // Overlay
      const dialogOverlay = document.createElement('div');
      dialogOverlay.id = 'skins-delete-dialog';
      dialogOverlay.style.position = 'fixed';
      dialogOverlay.style.top = '0';
      dialogOverlay.style.left = '0';
      dialogOverlay.style.width = '100vw';
      dialogOverlay.style.height = '100vh';
      dialogOverlay.style.background = SKINS_CONFIG.overlay.strongBackground;
      dialogOverlay.style.zIndex = SKINS_CONFIG.overlay.strongZIndex;
      dialogOverlay.style.display = 'flex';
      dialogOverlay.style.alignItems = 'center';
      dialogOverlay.style.justifyContent = 'center';

      // Dialog
      const dialog = document.createElement('div');
      dialog.style.background = SKINS_CONFIG.dialog.background;
      dialog.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
      dialog.style.boxShadow = SKINS_CONFIG.dialog.boxShadow;
      dialog.style.padding = SKINS_CONFIG.dialog.padding;
      dialog.style.minWidth = SKINS_CONFIG.misc.minDialogWidth;
      dialog.style.maxWidth = SKINS_CONFIG.misc.maxDialogWidth;
      dialog.style.color = SKINS_CONFIG.dialog.color;
      dialog.style.position = 'relative';

      dialog.innerHTML = `<h3 style='margin-top:0'>Delete Image</h3>
        <p style='color:${SKINS_CONFIG.color.faded};margin-bottom:20px'>Are you sure you want to delete the image for: ${cacheKey}?</p>
        <p style='color:${SKINS_CONFIG.color.error};font-size:14px'>This will force a reload of the original generated image next time it's needed.</p>`;

      // Buttons
      const btnRow = document.createElement('div');
      btnRow.style.marginTop = '18px';
      btnRow.style.textAlign = 'right';
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '12px';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.background = SKINS_CONFIG.deleteButton.background;
      deleteBtn.style.color = SKINS_CONFIG.deleteButton.color;
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '5px';
      deleteBtn.style.padding = '7px 18px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.fontSize = SKINS_CONFIG.font.button;
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = SKINS_CONFIG.button.background;
      cancelBtn.style.color = SKINS_CONFIG.button.color;
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '5px';
      cancelBtn.style.padding = '7px 18px';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.fontSize = SKINS_CONFIG.font.button;
      
      btnRow.appendChild(deleteBtn);
      btnRow.appendChild(cancelBtn);
      dialog.appendChild(btnRow);

      // Delete handler
      deleteBtn.onclick = () => {
        this.deleteCacheEntry(cacheKey, isCanvas);
        document.body.removeChild(dialogOverlay);
        refreshUI();
      };
      
      // Cancel handler
      cancelBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
      };

      dialogOverlay.appendChild(dialog);
      document.body.appendChild(dialogOverlay);
    };

    // Create modal content
    const modal = document.createElement('div');
    modal.style.background = SKINS_CONFIG.modal.background;
    modal.style.borderRadius = SKINS_CONFIG.modal.borderRadius + 'px';
    modal.style.boxShadow = SKINS_CONFIG.modal.boxShadow;
    modal.style.padding = SKINS_CONFIG.modal.padding;
    modal.style.minWidth = SKINS_CONFIG.modal.minWidth;
    modal.style.maxWidth = SKINS_CONFIG.modal.maxWidth;
    modal.style.maxHeight = SKINS_CONFIG.modal.maxHeight;
    modal.style.overflow = 'hidden';
    modal.style.color = SKINS_CONFIG.modal.color;
    modal.style.position = 'relative';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.innerHTML = `<h2 style="margin-top:0;margin-bottom:20px;font-size:${SKINS_CONFIG.font.title}">Skins Management</h2>`;

    // Top buttons row
    const topButtons = document.createElement('div');
    topButtons.style.display = 'flex';
    topButtons.style.gap = '12px';
    topButtons.style.marginBottom = '20px';
    topButtons.style.flexWrap = 'wrap';

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export All Skins';
    exportBtn.style.background = SKINS_CONFIG.button.background;
    exportBtn.style.color = SKINS_CONFIG.button.color;
    exportBtn.style.border = 'none';
    exportBtn.style.borderRadius = '5px';
    exportBtn.style.padding = '8px 16px';
    exportBtn.style.cursor = 'pointer';
    exportBtn.style.fontSize = SKINS_CONFIG.font.button;
    exportBtn.onclick = () => this.exportCacheData();
    topButtons.appendChild(exportBtn);

    // Import button
    const importBtn = document.createElement('button');
    importBtn.textContent = 'Import Skins';
    importBtn.style.background = SKINS_CONFIG.button.background;
    importBtn.style.color = SKINS_CONFIG.button.color;
    importBtn.style.border = 'none';
    importBtn.style.borderRadius = '5px';
    importBtn.style.padding = '8px 16px';
    importBtn.style.cursor = 'pointer';
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.importCacheData(file).then(() => {
          alert('Skins imported successfully!');
          refreshUI();
        }).catch((error) => {
          alert(`Import failed: ${error.message}`);
        });
      }
    };
    
    importBtn.onclick = () => importInput.click();
    topButtons.appendChild(importBtn);
    topButtons.appendChild(importInput);

    modal.appendChild(topButtons);

    // Tab system
    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.borderBottom = '2px solid ' + SKINS_CONFIG.color.border;
    tabContainer.style.marginBottom = '20px';

    // Tab buttons
    const tabs = [
      { id: 'preferences', label: 'Preferences', active: true },
      { id: 'sprites', label: 'Sprite Skins', active: false },
      { id: 'shapes', label: 'Shape Skins', active: false }
    ];

    tabs.forEach(tab => {
      const tabBtn = document.createElement('button');
      tabBtn.textContent = tab.label;
      tabBtn.style.background = tab.active ? SKINS_CONFIG.tab.activeBg : 'transparent';
      tabBtn.style.color = tab.active ? SKINS_CONFIG.tab.activeColor : SKINS_CONFIG.tab.inactiveColor;
      tabBtn.style.border = 'none';
      tabBtn.style.padding = SKINS_CONFIG.tab.padding;
      tabBtn.style.cursor = 'pointer';
      tabBtn.style.borderRadius = '6px 6px 0 0';
      tabBtn.style.fontWeight = tab.active ? SKINS_CONFIG.font.tab : 'normal';
      tabBtn.style.marginRight = '4px';
      tabBtn.onclick = () => switchTab(tab.id);
      tabContainer.appendChild(tabBtn);
    });

    modal.appendChild(tabContainer);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.overflow = 'auto';
    contentArea.style.paddingRight = '8px';

    // Tab content functions
    const switchTab = (tabId) => {
      // Update tab buttons
      const tabButtons = tabContainer.querySelectorAll('button');
      tabs.forEach((tab, index) => {
        tab.active = tab.id === tabId;
        tabButtons[index].style.background = tab.active ? SKINS_CONFIG.tab.activeBg : 'transparent';
        tabButtons[index].style.color = tab.active ? SKINS_CONFIG.tab.activeColor : SKINS_CONFIG.tab.inactiveColor;
        tabButtons[index].style.fontWeight = tab.active ? SKINS_CONFIG.font.tab : 'normal';
      });

      // Clear content area
      contentArea.innerHTML = '';

      // Load appropriate content
      if (tabId === 'preferences') {
        loadPreferencesContent();
      } else if (tabId === 'sprites') {
        loadSpritesContent();
      } else if (tabId === 'shapes') {
        loadShapesContent();
      }
    };

    // Load preferences content
    const loadPreferencesContent = () => {
      const preferencesSection = document.createElement('div');
      preferencesSection.style.padding = '16px';
      preferencesSection.style.background = '#2a2a2a';
      preferencesSection.style.borderRadius = '8px';
      
      preferencesSection.innerHTML = `<h3 style="margin-top:0;margin-bottom:12px;font-size:${SKINS_CONFIG.font.section}">Render Mode Preferences</h3>`;
      
      const entityTypes = Object.keys(this.preferences);
      if (entityTypes.length === 0) {
        preferencesSection.innerHTML += `<p style="color:${SKINS_CONFIG.color.faded};font-style:italic">No entity types found.</p>`;
      } else {
        entityTypes.forEach(entityType => {
          const entityDiv = document.createElement('div');
          entityDiv.style.marginBottom = '8px';
          entityDiv.style.display = 'flex';
          entityDiv.style.alignItems = 'center';
          entityDiv.style.gap = '12px';
          
          const label = document.createElement('label');
          label.textContent = `${entityType}:`;
          label.style.minWidth = '80px';
          label.style.fontSize = SKINS_CONFIG.font.label;
          entityDiv.appendChild(label);
          
          const modes = ['default', 'sprite', 'shape'];
          modes.forEach(mode => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `pref_${entityType}`;
            radio.value = mode;
            radio.checked = this.preferences[entityType] === mode;
            radio.onchange = () => this.updateRenderModePreference(entityType, mode);
            
            const radioLabel = document.createElement('label');
            radioLabel.textContent = mode;
            radioLabel.style.marginRight = '12px';
            radioLabel.style.cursor = 'pointer';
            radioLabel.style.fontSize = SKINS_CONFIG.font.label;
            radioLabel.onclick = () => radio.click();
            
            entityDiv.appendChild(radio);
            entityDiv.appendChild(radioLabel);
          });
          
          preferencesSection.appendChild(entityDiv);
        });
      }
      
      contentArea.appendChild(preferencesSection);
    };

    // Load sprites content (EntityRenderer format)
    const loadSpritesContent = () => {
      const spriteEntries = Object.entries(this.imageCache);
      if (spriteEntries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '40px';
        emptyMsg.style.color = SKINS_CONFIG.color.faded;
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.textContent = 'No sprite images found. Sprite images will appear here as they are generated by the game.';
        contentArea.appendChild(emptyMsg);
        return;
      }
      const gridCols = SKINS_CONFIG.grid.cols;
      const gridRows = Math.ceil(spriteEntries.length / gridCols);
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
      grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
      grid.style.gap = SKINS_CONFIG.grid.cellGap + 'px';
      grid.style.margin = '16px 0';
      // Render sprite entries
      spriteEntries.forEach(([key, entry]) => {
        const cell = document.createElement('div');
        cell.style.background = SKINS_CONFIG.grid.cellBg;
        cell.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.height = SKINS_CONFIG.grid.cellHeight + 'px';
        cell.style.cursor = 'pointer';
        cell.style.position = 'relative';
        cell.style.transition = 'background ' + SKINS_CONFIG.transition.short + 's';
        cell.style.padding = SKINS_CONFIG.grid.cellPadding + 'px';
        // Image preview
        const img = document.createElement('img');
        img.src = entry.dataUrl;
        img.alt = key;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.marginBottom = '6px';
        img.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
        img.style.objectFit = SKINS_CONFIG.preview.objectFit;
        cell.appendChild(img);
        // Meta info
        if (entry.size || entry.fixedScreenAngle || entry.drawOffsetX || entry.drawOffsetY) {
          const metaDiv = document.createElement('div');
          metaDiv.style.fontSize = SKINS_CONFIG.grid.metaFont;
          metaDiv.style.color = SKINS_CONFIG.color.meta;
          metaDiv.style.marginBottom = '2px';
          metaDiv.textContent = [
            entry.size ? `size: ${entry.size}` : '',
            entry.fixedScreenAngle ? `angle: ${entry.fixedScreenAngle}` : '',
            entry.drawOffsetX ? `dx: ${entry.drawOffsetX}` : '',
            entry.drawOffsetY ? `dy: ${entry.drawOffsetY}` : ''
          ].filter(Boolean).join(', ');
          cell.appendChild(metaDiv);
        }
        // Cache key (truncated)
        const keyLabel = document.createElement('div');
        keyLabel.textContent = key.length > 10 ? key.substring(0, 10) + '...' : key;
        keyLabel.style.fontSize = SKINS_CONFIG.grid.keyFont;
        keyLabel.style.textAlign = 'center';
        keyLabel.style.wordBreak = 'break-all';
        keyLabel.style.color = SKINS_CONFIG.color.key;
        cell.appendChild(keyLabel);
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.position = 'absolute';
        editBtn.style.bottom = '2px';
        editBtn.style.right = '2px';
        editBtn.style.background = SKINS_CONFIG.grid.editBtn.background;
        editBtn.style.color = SKINS_CONFIG.grid.editBtn.color;
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = SKINS_CONFIG.grid.editBtn.borderRadius;
        editBtn.style.width = SKINS_CONFIG.grid.editBtn.width;
        editBtn.style.height = SKINS_CONFIG.grid.editBtn.height;
        editBtn.style.fontSize = SKINS_CONFIG.grid.editBtn.fontSize;
        editBtn.style.cursor = 'pointer';
        editBtn.onclick = (e) => {
          e.stopPropagation();
          openEditMetaDialog(key, false);
        };
        cell.appendChild(editBtn);
        // Delete button (small X)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '2px';
        deleteBtn.style.right = '2px';
        deleteBtn.style.background = SKINS_CONFIG.deleteButton.background;
        deleteBtn.style.color = SKINS_CONFIG.deleteButton.color;
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = SKINS_CONFIG.deleteButton.borderRadius;
        deleteBtn.style.width = SKINS_CONFIG.deleteButton.width;
        deleteBtn.style.height = SKINS_CONFIG.deleteButton.height;
        deleteBtn.style.fontSize = SKINS_CONFIG.deleteButton.fontSize;
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'none';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          openDeleteDialog(key, false);
        };
        cell.appendChild(deleteBtn);
        cell.onmouseenter = () => {
          cell.style.background = SKINS_CONFIG.grid.cellHoverBg;
          deleteBtn.style.display = 'block';
        };
        cell.onmouseleave = () => {
          cell.style.background = SKINS_CONFIG.grid.cellBg;
          deleteBtn.style.display = 'none';
        };
        cell.onclick = () => openUploadDialog(key, false);
        grid.appendChild(cell);
      });
      contentArea.appendChild(grid);

      // --- Edit Metadata Dialog ---
      function openEditMetaDialog(cacheKey, isCanvas = false) {
        if (document.getElementById('skins-meta-dialog')) return;
        const dialogOverlay = document.createElement('div');
        dialogOverlay.id = 'skins-meta-dialog';
        dialogOverlay.style.position = 'fixed';
        dialogOverlay.style.top = '0';
        dialogOverlay.style.left = '0';
        dialogOverlay.style.width = '100vw';
        dialogOverlay.style.height = '100vh';
        dialogOverlay.style.background = SKINS_CONFIG.overlay.strongBackground;
        dialogOverlay.style.zIndex = SKINS_CONFIG.overlay.strongZIndex;
        dialogOverlay.style.display = 'flex';
        dialogOverlay.style.alignItems = 'center';
        dialogOverlay.style.justifyContent = 'center';
        // Dialog
        const dialog = document.createElement('div');
        dialog.style.background = SKINS_CONFIG.dialog.background;
        dialog.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
        dialog.style.boxShadow = SKINS_CONFIG.dialog.boxShadow;
        dialog.style.padding = SKINS_CONFIG.dialog.padding;
        dialog.style.minWidth = SKINS_CONFIG.misc.minDialogWidth;
        dialog.style.maxWidth = SKINS_CONFIG.misc.maxDialogWidth;
        dialog.style.color = SKINS_CONFIG.dialog.color;
        dialog.style.position = 'relative';
        dialog.innerHTML = `<h3 style='margin-top:0'>Edit Skin Metadata</h3>
          <p style='color:${SKINS_CONFIG.color.faded};margin-bottom:20px'>Edit offset and angle for: ${cacheKey}</p>`;
        // Current image preview
        const currentCache = isCanvas ? this.canvasCache : this.imageCache;
        const entry = currentCache[cacheKey] || {};
        const img = document.createElement('img');
        img.style.width = SKINS_CONFIG.preview.width;
        img.style.height = SKINS_CONFIG.preview.height;
        img.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
        img.style.background = SKINS_CONFIG.preview.background;
        img.style.display = entry.dataUrl ? 'block' : 'none';
        img.style.margin = '8px auto 16px auto';
        img.style.objectFit = SKINS_CONFIG.preview.objectFit;
        img.alt = 'Current Image';
        if (entry.dataUrl) img.src = entry.dataUrl;
        dialog.appendChild(img);
        // Offset and angle controls
        const metaControls = document.createElement('div');
        metaControls.style.display = 'flex';
        metaControls.style.justifyContent = 'center';
        metaControls.style.gap = '10px';
        metaControls.style.margin = '8px 0 12px 0';
        // Offset X
        const offsetXInput = document.createElement('input');
        offsetXInput.type = 'number';
        offsetXInput.placeholder = 'Offset X';
        offsetXInput.style.width = '60px';
        offsetXInput.title = 'drawOffsetX';
        offsetXInput.style.fontSize = SKINS_CONFIG.font.input;
        offsetXInput.style.padding = '6px';
        offsetXInput.style.borderRadius = '4px';
        offsetXInput.style.border = '1px solid ' + SKINS_CONFIG.color.inputBorder;
        offsetXInput.style.background = SKINS_CONFIG.color.inputBg;
        offsetXInput.style.color = SKINS_CONFIG.color.text;
        offsetXInput.style.textAlign = 'center';
        // Offset Y
        const offsetYInput = document.createElement('input');
        offsetYInput.type = 'number';
        offsetYInput.placeholder = 'Offset Y';
        offsetYInput.style.width = '60px';
        offsetYInput.title = 'drawOffsetY';
        offsetYInput.style.fontSize = SKINS_CONFIG.font.input;
        offsetYInput.style.padding = '6px';
        offsetYInput.style.borderRadius = '4px';
        offsetYInput.style.border = '1px solid ' + SKINS_CONFIG.color.inputBorder;
        offsetYInput.style.background = SKINS_CONFIG.color.inputBg;
        offsetYInput.style.color = SKINS_CONFIG.color.text;
        offsetYInput.style.textAlign = 'center';
        // Fixed Angle
        const angleInput = document.createElement('input');
        angleInput.type = 'number';
        angleInput.placeholder = 'Angle (deg)';
        angleInput.style.width = '80px';
        angleInput.title = 'fixedScreenAngle';
        angleInput.style.fontSize = SKINS_CONFIG.font.input;
        angleInput.style.padding = '6px';
        angleInput.style.borderRadius = '4px';
        angleInput.style.border = '1px solid ' + SKINS_CONFIG.color.inputBorder;
        angleInput.style.background = SKINS_CONFIG.color.inputBg;
        angleInput.style.color = SKINS_CONFIG.color.text;
        angleInput.style.textAlign = 'center';
        angleInput.value = typeof entry.fixedScreenAngle === 'number' ? entry.fixedScreenAngle : 0;
        metaControls.appendChild(offsetXInput);
        metaControls.appendChild(offsetYInput);
        metaControls.appendChild(angleInput);
        dialog.appendChild(metaControls);
        // Save/Cancel buttons
        const btnRow = document.createElement('div');
        btnRow.style.marginTop = '18px';
        btnRow.style.textAlign = 'right';
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'flex-end';
        btnRow.style.gap = '12px';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.style.background = SKINS_CONFIG.button.background;
        saveBtn.style.color = SKINS_CONFIG.button.color;
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '5px';
        saveBtn.style.padding = '7px 18px';
        saveBtn.style.fontWeight = 'bold';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = SKINS_CONFIG.font.button;
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.background = SKINS_CONFIG.button.background;
        cancelBtn.style.color = SKINS_CONFIG.button.color;
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '5px';
        cancelBtn.style.padding = '7px 18px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.fontSize = SKINS_CONFIG.font.button;
        btnRow.appendChild(saveBtn);
        btnRow.appendChild(cancelBtn);
        dialog.appendChild(btnRow);
        // Save handler
        saveBtn.onclick = () => {
          // Update metadata only, keep existing image
          const updated = {
            ...entry,
            drawOffsetX: parseFloat(offsetXInput.value) || 0,
            drawOffsetY: parseFloat(offsetYInput.value) || 0,
            fixedScreenAngle: angleInput.value !== '' ? parseFloat(angleInput.value) : 0
          };
          if (isCanvas) {
            this.canvasCache[cacheKey] = updated;
            this.saveCanvasCache();
            if (window.EntityRenderer) {
              const img = new Image();
              img.onload = () => {
                window.EntityRenderer.canvasCache.set(cacheKey, {
                  image: img,
                  size: updated.size,
                  fixedScreenAngle: updated.fixedScreenAngle,
                  drawOffsetX: updated.drawOffsetX,
                  drawOffsetY: updated.drawOffsetY
                });
              };
              img.src = updated.dataUrl;
            }
          } else {
            this.imageCache[cacheKey] = updated;
            this.saveImageCache();
            if (window.EntityRenderer) {
              const img = new Image();
              img.onload = () => {
                window.EntityRenderer.imageCache.set(cacheKey, {
                  image: img,
                  size: updated.size,
                  fixedScreenAngle: updated.fixedScreenAngle,
                  drawOffsetX: updated.drawOffsetX,
                  drawOffsetY: updated.drawOffsetY
                });
              };
              img.src = updated.dataUrl;
            }
          }
          document.body.removeChild(dialogOverlay);
          refreshUI();
        };
        // Cancel handler
        cancelBtn.onclick = () => {
          document.body.removeChild(dialogOverlay);
        };
        // Escape key closes dialog
        const handleEscape = (e) => {
          if (e.key === 'Escape') {
            dialogOverlay.remove();
            document.removeEventListener('keydown', handleEscape);
          }
        };
        document.addEventListener('keydown', handleEscape);
        dialogOverlay.appendChild(dialog);
        document.body.appendChild(dialogOverlay);
      }
    };
    // Load shapes content (EntityRenderer format)
    const loadShapesContent = () => {
      const shapeEntries = Object.entries(this.canvasCache);
      if (shapeEntries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '40px';
        emptyMsg.style.color = SKINS_CONFIG.color.faded;
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.textContent = 'No shape images found. Shape images will appear here as they are generated by the game.';
        contentArea.appendChild(emptyMsg);
        return;
      }
      const gridCols = SKINS_CONFIG.grid.cols;
      const gridRows = Math.ceil(shapeEntries.length / gridCols);
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
      grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
      grid.style.gap = SKINS_CONFIG.grid.cellGap + 'px';
      grid.style.margin = '16px 0';
      shapeEntries.forEach(([key, entry]) => {
        const cell = document.createElement('div');
        cell.style.background = SKINS_CONFIG.grid.cellBg;
        cell.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.height = SKINS_CONFIG.grid.cellHeight + 'px';
        cell.style.cursor = 'pointer';
        cell.style.position = 'relative';
        cell.style.transition = 'background ' + SKINS_CONFIG.transition.short + 's';
        cell.style.padding = SKINS_CONFIG.grid.cellPadding + 'px';
        // Image preview
        const img = document.createElement('img');
        img.src = entry.dataUrl;
        img.alt = key;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.marginBottom = '6px';
        img.style.borderRadius = SKINS_CONFIG.borderRadius + 'px';
        img.style.objectFit = SKINS_CONFIG.preview.objectFit;
        cell.appendChild(img);
        // Meta info
        if (entry.size || entry.fixedScreenAngle || entry.drawOffsetX || entry.drawOffsetY) {
          const metaDiv = document.createElement('div');
          metaDiv.style.fontSize = SKINS_CONFIG.grid.metaFont;
          metaDiv.style.color = SKINS_CONFIG.color.meta;
          metaDiv.style.marginBottom = '2px';
          metaDiv.textContent = [
            entry.size ? `size: ${entry.size}` : '',
            entry.fixedScreenAngle ? `angle: ${entry.fixedScreenAngle}` : '',
            entry.drawOffsetX ? `dx: ${entry.drawOffsetX}` : '',
            entry.drawOffsetY ? `dy: ${entry.drawOffsetY}` : ''
          ].filter(Boolean).join(', ');
          cell.appendChild(metaDiv);
        }
        // Cache key (truncated)
        const keyLabel = document.createElement('div');
        keyLabel.textContent = key.length > 10 ? key.substring(0, 10) + '...' : key;
        keyLabel.style.fontSize = SKINS_CONFIG.grid.keyFont;
        keyLabel.style.textAlign = 'center';
        keyLabel.style.wordBreak = 'break-all';
        keyLabel.style.color = SKINS_CONFIG.color.key;
        cell.appendChild(keyLabel);
        // Delete button (small X)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '2px';
        deleteBtn.style.right = '2px';
        deleteBtn.style.background = SKINS_CONFIG.deleteButton.background;
        deleteBtn.style.color = SKINS_CONFIG.deleteButton.color;
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = SKINS_CONFIG.deleteButton.borderRadius;
        deleteBtn.style.width = SKINS_CONFIG.deleteButton.width;
        deleteBtn.style.height = SKINS_CONFIG.deleteButton.height;
        deleteBtn.style.fontSize = SKINS_CONFIG.deleteButton.fontSize;
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'none';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          openDeleteDialog(key, true);
        };
        cell.appendChild(deleteBtn);
        cell.onmouseenter = () => {
          cell.style.background = SKINS_CONFIG.grid.cellHoverBg;
          deleteBtn.style.display = 'block';
        };
        cell.onmouseleave = () => {
          cell.style.background = SKINS_CONFIG.grid.cellBg;
          deleteBtn.style.display = 'none';
        };
        cell.onclick = () => openUploadDialog(key, true);
        grid.appendChild(cell);
      });
      contentArea.appendChild(grid);
    };

    // Add content area to modal
    modal.appendChild(contentArea);

    // Initialize with preferences tab
    loadPreferencesContent();

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '16px';
    closeBtn.style.right = '16px';
    closeBtn.style.background = SKINS_CONFIG.closeButton.background;
    closeBtn.style.color = SKINS_CONFIG.closeButton.color;
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = SKINS_CONFIG.closeButton.borderRadius;
    closeBtn.style.padding = SKINS_CONFIG.closeButton.padding;
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = SKINS_CONFIG.font.button;
    closeBtn.onclick = () => {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    };
    modal.appendChild(closeBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
};

// Console command to open skins UI
window.openSkinsUI = function() {
  if (window.UI.skinsManager) {
    window.UI.skinsManager.openSkinsUI();
  } else {
    console.error('[Console] Skins manager not available');
  }
}; 