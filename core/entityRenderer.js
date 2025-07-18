// core/entityRenderer.js
// Unified entity rendering system - orchestrator and cache controller

(() => {
  // --- Entity Renderer Config ---
  const ENTITY_RENDERER_CONFIG = {
    cacheStorageKey: 'entityRenderer_cache',
    canvasCacheStorageKey: 'entityRenderer_canvas_cache',
    preferencesStorageKey: 'entityRenderer_preferences',
    defaultRenderMode: 'default',
    defaultEntitySize: 32,
    svgBackground: {
      plains: {
        width: 640,
        height: 640,
        baseColor: '#3cb043',
        rects: [
          { x: 40, y: 80, w: 40, h: 40, color: '#4fdc5a' },
          { x: 120, y: 200, w: 40, h: 40, color: '#2e8b3d' },
          { x: 320, y: 320, w: 40, h: 40, color: '#4fdc5a' },
          { x: 480, y: 560, w: 40, h: 40, color: '#2e8b3d' },
          { x: 600, y: 40, w: 40, h: 40, color: '#4fdc5a' },
          { x: 200, y: 400, w: 40, h: 40, color: '#2e8b3d' },
          { x: 560, y: 320, w: 40, h: 40, color: '#4fdc5a' },
          { x: 80, y: 600, w: 40, h: 40, color: '#2e8b3d' }
        ]
      },
      desert: {
        width: 640,
        height: 640,
        baseColor: '#f7e9a0',
        rects: [
          { x: 40, y: 80, w: 40, h: 40, color: '#e6d17a' },
          { x: 120, y: 200, w: 40, h: 40, color: '#fff7c0' },
          { x: 320, y: 320, w: 40, h: 40, color: '#e6d17a' },
          { x: 480, y: 560, w: 40, h: 40, color: '#fff7c0' },
          { x: 600, y: 40, w: 40, h: 40, color: '#e6d17a' },
          { x: 200, y: 400, w: 40, h: 40, color: '#fff7c0' },
          { x: 560, y: 320, w: 40, h: 40, color: '#e6d17a' },
          { x: 80, y: 600, w: 40, h: 40, color: '#fff7c0' }
        ]
      }
    },
    // Add more config values as needed
  };
  // --- End Entity Renderer Config ---

  const EntityRenderer = {
    // Global image cache for all generated sprites
    imageCache: new Map(),
    
    // Global canvas cache for pre-rendered shapes
    canvasCache: new Map(),
    
    // Cache key for localStorage
    cacheStorageKey: ENTITY_RENDERER_CONFIG.cacheStorageKey,
    canvasCacheStorageKey: ENTITY_RENDERER_CONFIG.canvasCacheStorageKey,
    preferencesStorageKey: ENTITY_RENDERER_CONFIG.preferencesStorageKey,
    
    // Registry of entity modules
    entityModules: {},

    // Render mode preferences per entity type
    renderModePreferences: {},

    // Default render mode preference
    defaultRenderMode: ENTITY_RENDERER_CONFIG.defaultRenderMode,

    // Hash function for creating compact cache keys
    hashString(str) {
      let hash = 0;
      if (str.length === 0) return hash.toString();
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Add additional mixing for better distribution
      hash = hash ^ (hash >>> 16);
      hash = Math.imul(hash, 0x85ebca6b);
      hash = hash ^ (hash >>> 13);
      hash = Math.imul(hash, 0xc2b2ae35);
      hash = hash ^ (hash >>> 16);
      
      return Math.abs(hash).toString(36); // Convert to base36 for shorter strings
    },

    // Hash a JSON object to create a compact cache key
    hashConfig(config) {
      const jsonString = JSON.stringify(config);
      return this.hashString(jsonString);
    },

    // Set preferred render mode for an entity type
    setPreferredRenderMode(entityType, mode) {
      if (mode === 'default') {
        delete this.renderModePreferences[entityType];
      } else {
        this.renderModePreferences[entityType] = mode;
      }
      console.log(`[EntityRenderer] Set ${entityType} preferred render mode to: ${mode}`);
      
      // Save preferences to localStorage
      this.savePreferencesToStorage();
      
    },

    // Get preferred render mode for an entity type
    getPreferredRenderMode(entityType) {
      return this.renderModePreferences[entityType] || this.defaultRenderMode;
    },

    // Get effective render type for an entity (considers preferences)
    getEffectiveRenderType(entityType, originalRenderType) {
      const preference = this.getPreferredRenderMode(entityType);
      if (preference === 'default') {
        return originalRenderType;
      }
      return preference;
    },

    drawAndRotate(_ctx, _image, _x, _y, _playerAngle, _fixedScreenAngle, _w, _h, _offsetX, _offsetY) {
      
      let angle = 0;
      if (_fixedScreenAngle !== null && _fixedScreenAngle !== undefined) {
        if (PERSPECTIVE_MODE === "player-perspective") {
          // Undo world rotation, then apply fixed angle (in radians)
          angle = _playerAngle + (typeof _fixedScreenAngle === 'number' ? _fixedScreenAngle * Math.PI / 180 : 0);
        } else if (PERSPECTIVE_MODE === "fixed-north") {
          // In fixed-north mode, apply camera rotation to respect fixedScreenAngle
          // Get camera rotation from GameEngine (if available)
          const cameraRotation = typeof CAMERA_ROTATION !== 'undefined' ? CAMERA_ROTATION : 0;
          angle = cameraRotation + (typeof _fixedScreenAngle === 'number' ? _fixedScreenAngle * Math.PI / 180 : 0);
        }
      }
      
      _ctx.save();
      _ctx.translate(_x || 0, _y || 0);
      _ctx.rotate(angle);
      _ctx.translate(_offsetX || 0, _offsetY || 0);
      
      _ctx.drawImage(
        _image,
        -_w / 2,
        -_h / 2,
        _w,
        _h
      );
    },

    // Generic entity creation method that handles boilerplate
    createEntityWithBoilerplate(entityType, config, entityRenderer, entityModule) {
      const cacheKey = entityModule.getCacheKey(config);

      return {
        type: entityType,
        config: config,
        originalRenderType: config.isSprite ? 'sprite' : 'shape',
        // spriteAndMeta: spriteAndMeta,
        // canvasImageAndMeta: canvasImageAndMeta,
        drawShape: entityModule.generateCanvasDraw(config),
        cacheKey: cacheKey,
        entityRenderer: entityRenderer,
        entityModule: entityModule,
        fixedScreenAngle: config.fixedScreenAngle,
        
        // Generic draw method that handles dynamic render mode switching
        draw(ctx, playerAngle = 0) {
          // Get current effective render type (may have changed since creation)
          const currentEffectiveType = EntityRenderer.getEffectiveRenderType(this.type, this.originalRenderType);

          let sprite = null;
          let canvasImage = null;
          if (currentEffectiveType === 'sprite') {
            let spriteAndMeta = this.entityRenderer.getCachedImage(this.cacheKey);
            sprite = (spriteAndMeta || {}).image;
            if (!sprite) {
              const svg = this.entityModule.generateSVG(this.config);
              spriteAndMeta = this.entityRenderer.createAndCacheImage(this.cacheKey, svg, this.config);
              sprite = (spriteAndMeta || {}).image;
            }
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
              EntityRenderer.drawAndRotate(
                ctx, 
                sprite, 
                this.x,
                this.y,
                playerAngle,
                spriteAndMeta.fixedScreenAngle, 
                sprite.width || config.size, 
                sprite.height || config.size,
                spriteAndMeta.drawOffsetX, 
                spriteAndMeta.drawOffsetY
              );
            } else {
              this.drawShape(ctx, 0, 0);
            }
          } else if (currentEffectiveType === 'shape') {
            let canvasImageAndMeta = this.entityRenderer.getCachedCanvas(this.cacheKey);
            canvasImage = (canvasImageAndMeta || {}).image;
            if (!canvasImage) {
              const drawFunction = this.entityModule.generateCanvasDraw(this.config);
              canvasImageAndMeta = this.entityRenderer.createAndCacheCanvas(this.cacheKey, drawFunction, this.config.size, this.config);
              canvasImage = (canvasImageAndMeta || {}).image;
            }
            if (canvasImage && canvasImage.complete && canvasImage.naturalWidth > 0) {
              EntityRenderer.drawAndRotate(
                ctx, 
                canvasImage, 
                this.x,
                this.y, 
                playerAngle,
                canvasImageAndMeta.fixedScreenAngle, 
                canvasImage.width || config.size, 
                canvasImage.height || config.size,
                canvasImageAndMeta.offsetX, 
                canvasImageAndMeta.offsetY
              );
            } else {
              this.drawShape(ctx, 0, 0);
            }
          }
          ctx.restore();
        }
      };
    },

    // Initialize the renderer system
    async init() {
      console.log('[EntityRenderer] Initializing entity renderer system...');
      
      // Wait for all caches and preferences to load completely
      await Promise.all([
        this.loadCacheFromStorage(),
        this.loadCanvasCacheFromStorage(),
        this.loadPreferencesFromStorage()
      ]);
      
      this.registerEntityModules();
      
      // Ensure all entity types have default preferences
      this.ensureDefaultPreferences();

      // --- Add default biome backgrounds if not present ---
      const plainsKey = 'background-plains';
      const desertKey = 'background-desert';
      if (!this.imageCache.has(plainsKey)) {
        const plainsCfg = ENTITY_RENDERER_CONFIG.svgBackground.plains;
        let w = plainsCfg.width, h = plainsCfg.height, base = plainsCfg.baseColor, rects = plainsCfg.rects;
        const plainsSVG = `
          <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${w}" height="${h}" fill="${base}"/>
            ${rects.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>`).join('\n          ')}
          </svg>
        `;
        await this.createAndCacheImage(plainsKey, plainsSVG, {});
      }
      if (!this.imageCache.has(desertKey)) {
        const desertCfg = ENTITY_RENDERER_CONFIG.svgBackground.desert;
        let w = desertCfg.width, h = desertCfg.height, base = desertCfg.baseColor, rects = desertCfg.rects;
        const desertSVG = `
          <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${w}" height="${h}" fill="${base}"/>
            ${rects.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>`).join('\n          ')}
          </svg>
        `;
        await this.createAndCacheImage(desertKey, desertSVG, {});
      }
      // --- End biome backgrounds ---
      
      // Pre-generate all images for all entity types and render modes
      await this.preGenerateAllImages();
      
      console.log('[EntityRenderer] Initialization complete');
    },

    // Register available entity modules
    registerEntityModules() {
      // Rock entity module
      if (typeof RockEntity !== 'undefined') {
        this.entityModules.rock = RockEntity;
        console.log('[EntityRenderer] Registered RockEntity module');
      } else {
        console.warn('[EntityRenderer] RockEntity module not found');
      }
      
      // Tree entity module
      if (typeof TreeEntity !== 'undefined') {
        this.entityModules.tree = TreeEntity;
        console.log('[EntityRenderer] Registered TreeEntity module');
      } else {
        console.warn('[EntityRenderer] TreeEntity module not found');
      }
      
      // Grass entity module
      if (typeof GrassEntity !== 'undefined') {
        this.entityModules.grass = GrassEntity;
        console.log('[EntityRenderer] Registered GrassEntity module');
      } else {
        console.warn('[EntityRenderer] GrassEntity module not found');
      }
      
      // Future entity modules can be registered here
    },

    // Utility: Pre-generate all images for all entity types and render modes
    async preGenerateAllImages() {
      const entityTypes = Object.keys(this.entityModules);
      const renderModes = ['sprite', 'shape'];
      const promises = [];
      for (const entityType of entityTypes) {
        for (const mode of renderModes) {
          promises.push(this.preGenerateForEntityType(entityType, mode));
        }
      }
      await Promise.all(promises);
    },

    // Utility: Pre-generate image for a single entity type and render mode
    async preGenerateForEntityType(entityType, mode) {
      const entityModule = this.entityModules[entityType];
      if (!entityModule) return;
      const config = { ...entityModule.defaultConfig };
      // Force render mode
      config.isSprite = (mode === 'sprite');
      const cacheKey = entityModule.getCacheKey(config);
      if (mode === 'sprite') {
        if (!this.imageCache.has(cacheKey)) {
          const svg = entityModule.generateSVG(config);
          await new Promise((resolve, reject) => {
            this.createAndCacheImageAsync(cacheKey, svg, resolve, reject, config);
          });
        }
      } else if (mode === 'shape') {
        if (!this.canvasCache.has(cacheKey)) {
          const drawFunction = entityModule.generateCanvasDraw(config);
          await this.createAndCacheCanvas(cacheKey, drawFunction, config.size, config);

          await new Promise((resolve, reject) => {
            this.createAndCacheCanvasAsync(cacheKey, drawFunction, config.size, resolve, reject, config);
          });
        }
      }
    },

    // Get cached image by key
    getCachedImage(cacheKey) {
      return this.imageCache.get(cacheKey);
    },

    // Get cached canvas by key
    getCachedCanvas(cacheKey) {
      return this.canvasCache.get(cacheKey);
    },

    // Create and cache image from SVG, with metadata
    async createAndCacheImageAsync(cacheKey, svg, resolve, reject, meta = {}) {
        const img = new Image();
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
        img.src = dataUrl;
        img.onerror = (e) => {
          console.warn(`[EntityRenderer] Failed to generate image for cache key: ${cacheKey}`);
          if(reject) {
            reject(e);
          }
        };
        const cacheObj = {
          image: img,
          size: meta.size || ENTITY_RENDERER_CONFIG.defaultEntitySize,
          fixedScreenAngle: meta.fixedScreenAngle != undefined ? meta.fixedScreenAngle : null,
          drawOffsetX: meta.drawOffsetX || 0,
          drawOffsetY: meta.drawOffsetY || 0
        };

        img.onload = () => {
          this.imageCache.set(cacheKey, cacheObj);
          console.log(`[EntityRenderer] Cached image for key: ${cacheKey}`, meta);
          this.saveCacheToStorage();
          if(resolve) {
            resolve(cacheObj);
          }
        };
        return cacheObj;
    },
    async createAndCacheImage(cacheKey, svg, meta = {}) {
      return this.createAndCacheImageAsync(cacheKey, svg, null, null, meta);
    },

    // Create and cache canvas from draw function, with metadata
    createAndCacheCanvasAsync(cacheKey, drawFunction, size, resolve, reject, meta = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        drawFunction(ctx, size / 2, size / 2);
        const img = new Image();
        img.src = canvas.toDataURL();
        img.onerror = (e) => {
          console.warn(`[EntityRenderer] Failed to generate image for canvas cache key: ${cacheKey}`);
          if(reject) {
            reject(e);
          }
        };
        const cacheObj = {
          image: img,
          size: size,
          fixedScreenAngle: meta.fixedScreenAngle !== undefined ? meta.fixedScreenAngle : null,
          drawOffsetX: meta.drawOffsetX || 0,
          drawOffsetY: meta.drawOffsetY || 0
        }
        img.onload = () => {
          this.canvasCache.set(cacheKey, cacheObj);
          console.log(`[EntityRenderer] Cached canvas for key: ${cacheKey}`);
          this.saveCanvasCacheToStorage();
          if(resolve) {
            resolve(cacheObj);
          }
        };
        return cacheObj;
    }, 
    createAndCacheCanvas(cacheKey, drawFunction, size, meta = {}) {
      return this.createAndCacheCanvasAsync(cacheKey, drawFunction, size, null, null, meta)
    },
    // Create a rock entity (delegates to RockEntity module)
    createRock(config = {}) {
      if (!this.entityModules.rock) {
        console.error('[EntityRenderer] RockEntity module not available');
        return null;
      }
      return this.entityModules.rock.create(config, this);
    },

    // Create a tree entity (delegates to TreeEntity module)
    createTree(config = {}) {
      if (!this.entityModules.tree) {
        console.error('[EntityRenderer] TreeEntity module not available');
        return null;
      }
      return this.entityModules.tree.create(config, this);
    },

    // Create a grass entity (delegates to GrassEntity module)
    createGrass(config = {}) {
      if (!this.entityModules.grass) {
        console.error('[EntityRenderer] GrassEntity module not available');
        return null;
      }
      return this.entityModules.grass.create(config, this);
    },

    // Generic entity creation method
    createEntity(entityType, config = {}) {
      if (!this.entityModules[entityType]) {
        console.error(`[EntityRenderer] Entity module '${entityType}' not available`);
        return null;
      }
      return this.entityModules[entityType].create(config, this);
    },

    // Save cache to localStorage
    saveCacheToStorage() {
      try {
        const cacheData = {};
        for (const [key, entry] of this.imageCache) {
          const img = entry.image;
          if (img && img.complete && img.naturalWidth > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            cacheData[key] = {
              dataUrl: canvas.toDataURL(),
              size: entry.size,
              fixedScreenAngle: entry.fixedScreenAngle,
              drawOffsetX: entry.drawOffsetX,
              drawOffsetY: entry.drawOffsetY
            };
          }
        }
        localStorage.setItem(this.cacheStorageKey, JSON.stringify(cacheData));
        console.log(`[EntityRenderer] Wrote image cache to localStorage (${Object.keys(cacheData).length} entries)`);
      } catch (e) {
        console.warn('[EntityRenderer] Failed to save cache to storage:', e);
      }
    },

    // Save canvas cache to localStorage
    saveCanvasCacheToStorage() {
      try {
        const cacheData = {};
        for (const [key, entry] of this.canvasCache) {
          const img = entry.image;
          if (img && img.complete && img.naturalWidth > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            cacheData[key] = {
              dataUrl: canvas.toDataURL(),
              size: entry.size,
              fixedScreenAngle: entry.fixedScreenAngle,
              drawOffsetX: entry.drawOffsetX,
              drawOffsetY: entry.drawOffsetY
            };
          }
        }
        localStorage.setItem(this.canvasCacheStorageKey, JSON.stringify(cacheData));
      } catch (e) {
        console.warn('[EntityRenderer] Failed to save canvas cache to storage:', e);
      }
    },

    // Save preferences to localStorage
    savePreferencesToStorage() {
      try {
        localStorage.setItem(this.preferencesStorageKey, JSON.stringify(this.renderModePreferences));
        console.log('[EntityRenderer] Saved render mode preferences to storage');
      } catch (e) {
        console.warn('[EntityRenderer] Failed to save preferences to storage:', e);
      }
    },

    // Load preferences from localStorage
    loadPreferencesFromStorage() {
      return new Promise((resolve) => {
        try {
          const preferencesData = localStorage.getItem(this.preferencesStorageKey);
          if (!preferencesData) {
            resolve();
            return;
          }
          
          const parsed = JSON.parse(preferencesData);
          this.renderModePreferences = { ...parsed };
          console.log(`[EntityRenderer] Loaded render mode preferences:`, this.renderModePreferences);
          resolve();
        } catch (e) {
          console.warn('[EntityRenderer] Failed to load preferences from storage:', e);
          resolve();
        }
      });
    },

    // Ensure all entity types have default preferences
    ensureDefaultPreferences() {
      const entityTypes = Object.keys(this.entityModules);
      let updated = false;
      
      for (const entityType of entityTypes) {
        if (!(entityType in this.renderModePreferences)) {
          this.renderModePreferences[entityType] = 'default';
          updated = true;
          console.log(`[EntityRenderer] Added default preference for ${entityType}`);
        }
      }
      
      if (updated) {
        this.savePreferencesToStorage();
      }
    },

    // Load cache from localStorage
    loadCacheFromStorage() {
      return new Promise((resolve) => {
        try {
          const cacheData = localStorage.getItem(this.cacheStorageKey);
          if (!cacheData) {
            resolve();
            return;
          }
          const parsed = JSON.parse(cacheData);
          const imagePromises = [];
          for (const [key, value] of Object.entries(parsed)) {
            const imagePromise = new Promise((imageResolve) => {
              const img = new Image();
              img.onload = () => {
                this.imageCache.set(key, {
                  image: img,
                  size: value.size,
                  fixedScreenAngle: value.fixedScreenAngle,
                  drawOffsetX: value.drawOffsetX,
                  drawOffsetY: value.drawOffsetY
                });
                imageResolve();
              };
              img.onerror = () => {
                console.warn(`[EntityRenderer] Failed to load cached image: ${key}`);
                imageResolve();
              };
              img.src = value.dataUrl;
            });
            imagePromises.push(imagePromise);
          }
          Promise.all(imagePromises).then(() => {
            console.log(`[EntityRenderer] Loaded ${Object.keys(parsed).length} cached images`);
            resolve();
          });
        } catch (e) {
          console.warn('[EntityRenderer] Failed to load cache from storage:', e);
          resolve();
        }
      });
    },

    // Load canvas cache from localStorage
    loadCanvasCacheFromStorage() {
      return new Promise((resolve) => {
        try {
          const cacheData = localStorage.getItem(this.canvasCacheStorageKey);
          if (!cacheData) {
            resolve();
            return;
          }
          const parsed = JSON.parse(cacheData);
          const imagePromises = [];
          for (const [key, value] of Object.entries(parsed)) {
            const imagePromise = new Promise((imageResolve) => {
              const img = new Image();
              img.onload = () => {
                this.canvasCache.set(key, {
                  image: img,
                  size: value.size,
                  fixedScreenAngle: value.fixedScreenAngle,
                  drawOffsetX: value.drawOffsetX,
                  drawOffsetY: value.drawOffsetY
                });
                imageResolve();
              };
              img.onerror = () => {
                console.warn(`[EntityRenderer] Failed to load cached canvas image: ${key}`);
                imageResolve();
              };
              img.src = value.dataUrl;
            });
            imagePromises.push(imagePromise);
          }
          Promise.all(imagePromises).then(() => {
            console.log(`[EntityRenderer] Loaded ${Object.keys(parsed).length} cached canvas images`);
            resolve();
          });
        } catch (e) {
          console.warn('[EntityRenderer] Failed to load canvas cache from storage:', e);
          resolve();
        }
      });
    },

    // Clear cache
    clearCache() {
      this.imageCache.clear();
      this.canvasCache.clear();
      this.renderModePreferences = {};
      localStorage.removeItem(this.cacheStorageKey);
      localStorage.removeItem(this.canvasCacheStorageKey);
      localStorage.removeItem(this.preferencesStorageKey);
      console.log('[EntityRenderer] All caches and preferences cleared');
    },

    // Get cache info
    getCacheInfo() {
      return {
        imageCacheSize: this.imageCache.size,
        canvasCacheSize: this.canvasCache.size,
        totalCacheSize: this.imageCache.size + this.canvasCache.size,
        imageKeys: Array.from(this.imageCache.keys()),
        canvasKeys: Array.from(this.canvasCache.keys()),
        entityModules: Object.keys(this.entityModules),
        renderModePreferences: { ...this.renderModePreferences }
      };
    },

    // Get registered entity modules
    getEntityModules() {
      return Object.keys(this.entityModules);
    }
  };

  // Register with new system
  window.WebGame.EntityRenderer = EntityRenderer;

  // Keep old global registration for backward compatibility
  window.EntityRenderer = EntityRenderer;

  // Console commands for testing render mode preferences
  window.setRenderMode = function(entityType, mode) {
    EntityRenderer.setPreferredRenderMode(entityType, mode);
  };

  window.getRenderMode = function(entityType) {
    return EntityRenderer.getPreferredRenderMode(entityType);
  };

  window.clearRenderMode = function(entityType) {
    EntityRenderer.setPreferredRenderMode(entityType, 'default');
  };

  // Test render mode switching
  window.testRenderModeSwitching = function() {
    console.log('Testing render mode switching...');
    
    // Create a rock (should use sprite by default)
    const rock = EntityRenderer.createRock({
      size: 25,
      baseColor: '#FF0000',
      textureSpots: 4
    });
    
    console.log('Rock created with default render mode');
    console.log('Current render mode for rock:', EntityRenderer.getPreferredRenderMode('rock'));
    
    // Switch to shape mode
    EntityRenderer.setPreferredRenderMode('rock', 'shape');
    console.log('Switched rock to shape mode');
    
    // Switch to sprite mode
    EntityRenderer.setPreferredRenderMode('rock', 'sprite');
    console.log('Switched rock to sprite mode');
    
    // Clear preference (back to default)
    EntityRenderer.setPreferredRenderMode('rock', 'default');
    console.log('Cleared rock render mode preference');
    
    return rock;
  };

  // Simulate the "/render prefer-mode" command
  window.renderPreferMode = function(entityType, mode) {
    if (!entityType || !mode) {
      console.log('Usage: renderPreferMode(entityType, mode)');
      console.log('Examples:');
      console.log('  renderPreferMode("rock", "shape")');
      console.log('  renderPreferMode("rock", "sprite")');
      console.log('  renderPreferMode("rock", "default")');
      return;
    }
    
    EntityRenderer.setPreferredRenderMode(entityType, mode);
    console.log(`Set ${entityType} preferred render mode to: ${mode}`);
  };
  
})();