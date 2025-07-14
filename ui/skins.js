// ui/skins.js
// Skins management system for entity renderer cache

// Ensure UI object exists
if (!window.UI) window.UI = {};

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
      // Migrate old format if needed
      for (const k in this.imageCache) {
        const entry = this.imageCache[k];
        if (typeof entry === 'string') {
          this.imageCache[k] = { dataUrl: entry };
        } else if (entry && entry.image) {
          // Old wrapper format
          this.imageCache[k] = { dataUrl: entry.image, ...entry.meta };
        }
      }
      // Load canvas cache
      const canvasData = localStorage.getItem(this.canvasCacheKey);
      if (canvasData) {
        this.canvasCache = JSON.parse(canvasData);
      }
      for (const k in this.canvasCache) {
        const entry = this.canvasCache[k];
        if (typeof entry === 'string') {
          this.canvasCache[k] = { dataUrl: entry };
        } else if (entry && entry.image) {
          this.canvasCache[k] = { dataUrl: entry.image, ...entry.meta };
        }
      }
      // Load preferences
      const preferencesData = localStorage.getItem(this.preferencesKey);
      if (preferencesData) {
        this.preferences = JSON.parse(preferencesData);
      }
      // Ensure all entity types have default preferences
      this.ensureDefaultPreferences();
      // Save migrated caches if needed
      this.saveImageCache();
      this.saveCanvasCache();
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
      this.saveCanvasCache();
    } else {
      this.imageCache[cacheKey] = entry;
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
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '2000';
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
          return { width: def.size * 2, height: def.imageHeight * 2 };
        }
        return { width: 64, height: 64 };
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
      dialogOverlay.style.background = 'rgba(0,0,0,0.6)';
      dialogOverlay.style.zIndex = '2100';
      dialogOverlay.style.display = 'flex';
      dialogOverlay.style.alignItems = 'center';
      dialogOverlay.style.justifyContent = 'center';
      const dialog = document.createElement('div');
      dialog.style.background = '#23232b';
      dialog.style.borderRadius = '10px';
      dialog.style.boxShadow = '0 4px 32px rgba(0,0,0,0.8)';
      dialog.style.padding = '32px 32px 24px 32px';
      dialog.style.minWidth = '400px';
      dialog.style.maxWidth = '95vw';
      dialog.style.color = '#fff';
      dialog.style.position = 'relative';
      dialog.innerHTML = `<h3 style='margin-top:0'>Upload New Image</h3>
        <p style='color:#aaa;margin-bottom:20px'>Replace image for: ${cacheKey}</p>`;
      // Current image preview
      const currentPreview = document.createElement('img');
      currentPreview.style.width = '64px';
      currentPreview.style.height = '64px';
      currentPreview.style.borderRadius = '6px';
      currentPreview.style.background = '#444';
      currentPreview.style.display = 'block';
      currentPreview.style.margin = '8px auto 16px auto';
      currentPreview.style.objectFit = 'cover';
      currentPreview.alt = 'Current Image';
      const currentCache = isCanvas ? this.canvasCache : this.imageCache;
      if (currentCache[cacheKey] && currentCache[cacheKey].dataUrl) {
        currentPreview.src = currentCache[cacheKey].dataUrl;
      }
      dialog.appendChild(currentPreview);
      // New image preview
      const newPreview = document.createElement('img');
      newPreview.style.width = '64px';
      newPreview.style.height = '64px';
      newPreview.style.borderRadius = '6px';
      newPreview.style.background = '#444';
      newPreview.style.display = 'block';
      newPreview.style.margin = '8px auto 16px auto';
      newPreview.style.objectFit = 'cover';
      newPreview.alt = 'New Image';
      dialog.appendChild(newPreview);
      // File input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      dialog.appendChild(fileInput);
      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Choose Image File';
      uploadBtn.style.marginRight = '8px';
      uploadBtn.style.background = '#4ECDC4';
      uploadBtn.style.color = '#222';
      uploadBtn.style.border = 'none';
      uploadBtn.style.borderRadius = '5px';
      uploadBtn.style.padding = '7px 18px';
      uploadBtn.style.fontWeight = 'bold';
      uploadBtn.style.cursor = 'pointer';
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
              });
            };
            img.src = reader.result;
          } else {
            newPreview.src = reader.result;
            newPreview._pendingDataURL = reader.result;
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
      saveBtn.style.background = '#4ECDC4';
      saveBtn.style.color = '#222';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '5px';
      saveBtn.style.padding = '7px 18px';
      saveBtn.style.fontWeight = 'bold';
      saveBtn.style.cursor = 'pointer';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = '#444';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '5px';
      cancelBtn.style.padding = '7px 18px';
      cancelBtn.style.cursor = 'pointer';
      btnRow.appendChild(saveBtn);
      btnRow.appendChild(cancelBtn);
      dialog.appendChild(btnRow);
      saveBtn.onclick = () => {
        if (newPreview._pendingDataURL) {
          this.updateCacheEntry(cacheKey, newPreview._pendingDataURL, isCanvas);
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
      dialogOverlay.style.background = 'rgba(0,0,0,0.6)';
      dialogOverlay.style.zIndex = '2100';
      dialogOverlay.style.display = 'flex';
      dialogOverlay.style.alignItems = 'center';
      dialogOverlay.style.justifyContent = 'center';

      // Dialog
      const dialog = document.createElement('div');
      dialog.style.background = '#23232b';
      dialog.style.borderRadius = '10px';
      dialog.style.boxShadow = '0 4px 32px rgba(0,0,0,0.8)';
      dialog.style.padding = '32px 32px 24px 32px';
      dialog.style.minWidth = '400px';
      dialog.style.maxWidth = '95vw';
      dialog.style.color = '#fff';
      dialog.style.position = 'relative';

      dialog.innerHTML = `<h3 style='margin-top:0'>Delete Image</h3>
        <p style='color:#aaa;margin-bottom:20px'>Are you sure you want to delete the image for: ${cacheKey}?</p>
        <p style='color:#ff6b6b;font-size:14px'>This will force a reload of the original generated image next time it's needed.</p>`;

      // Buttons
      const btnRow = document.createElement('div');
      btnRow.style.marginTop = '18px';
      btnRow.style.textAlign = 'right';
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '12px';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.background = '#FF6B6B';
      deleteBtn.style.color = '#fff';
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '5px';
      deleteBtn.style.padding = '7px 18px';
      deleteBtn.style.cursor = 'pointer';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = '#444';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '5px';
      cancelBtn.style.padding = '7px 18px';
      cancelBtn.style.cursor = 'pointer';
      
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
    modal.style.background = '#222';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 32px rgba(0,0,0,0.7)';
    modal.style.padding = '24px 32px';
    modal.style.minWidth = '900px';
    modal.style.maxWidth = '95vw';
    modal.style.maxHeight = '85vh';
    modal.style.overflow = 'hidden';
    modal.style.color = '#fff';
    modal.style.position = 'relative';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.innerHTML = `<h2 style="margin-top:0;margin-bottom:20px;font-size:24px">Skins Management</h2>`;

    // Top buttons row
    const topButtons = document.createElement('div');
    topButtons.style.display = 'flex';
    topButtons.style.gap = '12px';
    topButtons.style.marginBottom = '20px';
    topButtons.style.flexWrap = 'wrap';

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export All Skins';
    exportBtn.style.background = '#45B7D1';
    exportBtn.style.color = '#fff';
    exportBtn.style.border = 'none';
    exportBtn.style.borderRadius = '5px';
    exportBtn.style.padding = '8px 16px';
    exportBtn.style.cursor = 'pointer';
    exportBtn.onclick = () => this.exportCacheData();
    topButtons.appendChild(exportBtn);

    // Import button
    const importBtn = document.createElement('button');
    importBtn.textContent = 'Import Skins';
    importBtn.style.background = '#96CEB4';
    importBtn.style.color = '#222';
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
    tabContainer.style.borderBottom = '2px solid #444';
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
      tabBtn.style.background = tab.active ? '#4ECDC4' : 'transparent';
      tabBtn.style.color = tab.active ? '#222' : '#fff';
      tabBtn.style.border = 'none';
      tabBtn.style.padding = '12px 20px';
      tabBtn.style.cursor = 'pointer';
      tabBtn.style.borderRadius = '6px 6px 0 0';
      tabBtn.style.fontWeight = tab.active ? 'bold' : 'normal';
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
        tabButtons[index].style.background = tab.active ? '#4ECDC4' : 'transparent';
        tabButtons[index].style.color = tab.active ? '#222' : '#fff';
        tabButtons[index].style.fontWeight = tab.active ? 'bold' : 'normal';
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
      
      preferencesSection.innerHTML = `<h3 style="margin-top:0;margin-bottom:12px;font-size:18px">Render Mode Preferences</h3>`;
      
      const entityTypes = Object.keys(this.preferences);
      if (entityTypes.length === 0) {
        preferencesSection.innerHTML += `<p style="color:#aaa;font-style:italic">No entity types found.</p>`;
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
          label.style.fontSize = '14px';
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
            radioLabel.style.fontSize = '13px';
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
        emptyMsg.style.color = '#aaa';
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.textContent = 'No sprite images found. Sprite images will appear here as they are generated by the game.';
        contentArea.appendChild(emptyMsg);
        return;
      }
      const gridCols = 6;
      const gridRows = Math.ceil(spriteEntries.length / gridCols);
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
      grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
      grid.style.gap = '12px';
      grid.style.margin = '16px 0';
      spriteEntries.forEach(([key, entry]) => {
        const cell = document.createElement('div');
        cell.style.background = '#333';
        cell.style.borderRadius = '6px';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.height = '90px';
        cell.style.cursor = 'pointer';
        cell.style.position = 'relative';
        cell.style.transition = 'background 0.2s';
        cell.style.padding = '8px';
        // Image preview
        const img = document.createElement('img');
        img.src = entry.dataUrl;
        img.alt = key;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.marginBottom = '6px';
        img.style.borderRadius = '4px';
        img.style.objectFit = 'cover';
        cell.appendChild(img);
        // Meta info
        if (entry.size || entry.fixedScreenAngle || entry.drawOffsetX || entry.drawOffsetY) {
          const metaDiv = document.createElement('div');
          metaDiv.style.fontSize = '10px';
          metaDiv.style.color = '#6ec6ff';
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
        keyLabel.style.fontSize = '10px';
        keyLabel.style.textAlign = 'center';
        keyLabel.style.wordBreak = 'break-all';
        keyLabel.style.color = '#aaa';
        cell.appendChild(keyLabel);
        // Delete button (small X)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '2px';
        deleteBtn.style.right = '2px';
        deleteBtn.style.background = '#FF6B6B';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.width = '16px';
        deleteBtn.style.height = '16px';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'none';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          openDeleteDialog(key, false);
        };
        cell.appendChild(deleteBtn);
        cell.onmouseenter = () => {
          cell.style.background = '#444';
          deleteBtn.style.display = 'block';
        };
        cell.onmouseleave = () => {
          cell.style.background = '#333';
          deleteBtn.style.display = 'none';
        };
        cell.onclick = () => openUploadDialog(key, false);
        grid.appendChild(cell);
      });
      contentArea.appendChild(grid);
    };
    // Load shapes content (EntityRenderer format)
    const loadShapesContent = () => {
      const shapeEntries = Object.entries(this.canvasCache);
      if (shapeEntries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '40px';
        emptyMsg.style.color = '#aaa';
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.textContent = 'No shape images found. Shape images will appear here as they are generated by the game.';
        contentArea.appendChild(emptyMsg);
        return;
      }
      const gridCols = 6;
      const gridRows = Math.ceil(shapeEntries.length / gridCols);
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
      grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
      grid.style.gap = '12px';
      grid.style.margin = '16px 0';
      shapeEntries.forEach(([key, entry]) => {
        const cell = document.createElement('div');
        cell.style.background = '#333';
        cell.style.borderRadius = '6px';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.height = '90px';
        cell.style.cursor = 'pointer';
        cell.style.position = 'relative';
        cell.style.transition = 'background 0.2s';
        cell.style.padding = '8px';
        // Image preview
        const img = document.createElement('img');
        img.src = entry.dataUrl;
        img.alt = key;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.marginBottom = '6px';
        img.style.borderRadius = '4px';
        img.style.objectFit = 'cover';
        cell.appendChild(img);
        // Meta info
        if (entry.size || entry.fixedScreenAngle || entry.drawOffsetX || entry.drawOffsetY) {
          const metaDiv = document.createElement('div');
          metaDiv.style.fontSize = '10px';
          metaDiv.style.color = '#6ec6ff';
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
        keyLabel.style.fontSize = '10px';
        keyLabel.style.textAlign = 'center';
        keyLabel.style.wordBreak = 'break-all';
        keyLabel.style.color = '#aaa';
        cell.appendChild(keyLabel);
        // Delete button (small X)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '2px';
        deleteBtn.style.right = '2px';
        deleteBtn.style.background = '#FF6B6B';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.width = '16px';
        deleteBtn.style.height = '16px';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'none';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          openDeleteDialog(key, true);
        };
        cell.appendChild(deleteBtn);
        cell.onmouseenter = () => {
          cell.style.background = '#444';
          deleteBtn.style.display = 'block';
        };
        cell.onmouseleave = () => {
          cell.style.background = '#333';
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
    closeBtn.style.background = '#444';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '6px 14px';
    closeBtn.style.cursor = 'pointer';
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