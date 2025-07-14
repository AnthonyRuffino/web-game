// core/entityRenderer.js
// Unified entity rendering system - orchestrator and cache controller

const EntityRenderer = {
  // Global image cache for all generated sprites
  imageCache: new Map(),
  
  // Global canvas cache for pre-rendered shapes
  canvasCache: new Map(),
  
  // Cache key for localStorage
  cacheStorageKey: 'entityRenderer_cache',
  canvasCacheStorageKey: 'entityRenderer_canvas_cache',
  preferencesStorageKey: 'entityRenderer_preferences',
  
  // Registry of entity modules
  entityModules: {},

  // Render mode preferences per entity type
  renderModePreferences: {
    // 'rock': 'sprite' | 'shape' | 'default'
    // 'tree': 'sprite' | 'shape' | 'default'
  },

  // Default render mode preference
  defaultRenderMode: 'default',

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
    
    // Force refresh of all entities of this type in the world
    this.refreshEntitiesOfType(entityType);
  },

  // Force refresh all entities of a specific type
  refreshEntitiesOfType(entityType) {
    // This will be called by the world system to refresh entities
    // For now, just log that entities should be refreshed
    console.log(`[EntityRenderer] Entities of type '${entityType}' should be refreshed for render mode change`);
    
    // In the future, this could trigger a world refresh or entity recreation
    // For now, the draw method will handle the switch automatically
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

  // Generic entity creation method that handles boilerplate
  createEntityWithBoilerplate(entityType, config, entityRenderer, entityModule) {
    const finalConfig = { ...entityModule.defaultConfig, ...config };
    const cacheKey = entityModule.getCacheKey(finalConfig);
    
    // Determine effective render type based on preferences
    const originalRenderType = finalConfig.isSprite ? 'sprite' : 'shape';
    const effectiveRenderType = this.getEffectiveRenderType(entityType, originalRenderType);
    
    // Lazy load: only cache what we need based on effective render type
    let sprite = null;
    let canvasImage = null;
    
    if (effectiveRenderType === 'sprite') {
      sprite = entityRenderer.getCachedImage(cacheKey);
      if (!sprite) {
        const svg = entityModule.generateSVG(finalConfig);
        sprite = entityRenderer.createAndCacheImage(cacheKey, svg);
      }
    } else if (effectiveRenderType === 'shape') {
      canvasImage = entityRenderer.getCachedCanvas(cacheKey);
      if (!canvasImage) {
        const drawFunction = entityModule.generateCanvasDraw(finalConfig);
        canvasImage = entityRenderer.createAndCacheCanvas(cacheKey, drawFunction, finalConfig.size);
      }
    }
    
    return {
      type: entityType,
      config: finalConfig,
      renderType: effectiveRenderType,
      originalRenderType: originalRenderType,
      sprite: sprite,
      canvasImage: canvasImage,
      drawShape: entityModule.generateCanvasDraw(finalConfig),
      cacheKey: cacheKey,
      entityRenderer: entityRenderer,
      entityModule: entityModule,
      
      // Generic draw method that handles dynamic render mode switching
      draw(ctx) {
        // Get current effective render type (may have changed since creation)
        const currentEffectiveType = EntityRenderer.getEffectiveRenderType(this.type, this.originalRenderType);
        
        if (currentEffectiveType === 'sprite') {
          // Check if we have a loaded sprite
          if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            // Draw cached sprite
            const spriteWidth = this.sprite.width || this.config.size;
            const spriteHeight = this.sprite.height || this.config.size;
            ctx.drawImage(
              this.sprite,
              this.x - spriteWidth / 2,
              this.y - spriteHeight / 2,
              spriteWidth,
              spriteHeight
            );
          } else {
            // Lazy load sprite if not available
            this.sprite = this.entityRenderer.getCachedImage(this.cacheKey);
            if (!this.sprite) {
              const svg = this.entityModule.generateSVG(this.config);
              this.sprite = this.entityRenderer.createAndCacheImage(this.cacheKey, svg);
            }
            
            // If sprite is now available, draw it immediately
            if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
              const spriteWidth = this.sprite.width || this.config.size;
              const spriteHeight = this.sprite.height || this.config.size;
              ctx.drawImage(
                this.sprite,
                this.x - spriteWidth / 2,
                this.y - spriteHeight / 2,
                spriteWidth,
                spriteHeight
              );
            } else {
              // Draw fallback until sprite loads
              this.drawShape(ctx, this.x, this.y);
            }
          }
        } else if (currentEffectiveType === 'shape') {
          // Check if we have a loaded canvas image
          if (this.canvasImage && this.canvasImage.complete && this.canvasImage.naturalWidth > 0) {
            // Draw cached canvas image
            const imageWidth = this.canvasImage.width || this.config.size;
            const imageHeight = this.canvasImage.height || this.config.size;
            ctx.drawImage(
              this.canvasImage,
              this.x - imageWidth / 2,
              this.y - imageHeight / 2,
              imageWidth,
              imageHeight
            );
          } else {
            // Lazy load canvas image if not available
            this.canvasImage = this.entityRenderer.getCachedCanvas(this.cacheKey);
            if (!this.canvasImage) {
              const drawFunction = this.entityModule.generateCanvasDraw(this.config);
              this.canvasImage = this.entityRenderer.createAndCacheCanvas(this.cacheKey, drawFunction, this.config.size);
            }
            
            // If canvas image is now available, draw it immediately
            if (this.canvasImage && this.canvasImage.complete && this.canvasImage.naturalWidth > 0) {
              const imageWidth = this.canvasImage.width || this.config.size;
              const imageHeight = this.canvasImage.height || this.config.size;
              ctx.drawImage(
                this.canvasImage,
                this.x - imageWidth / 2,
                this.y - imageHeight / 2,
                imageWidth,
                imageHeight
              );
            } else {
              // Draw fallback until canvas image loads
              this.drawShape(ctx, this.x, this.y);
            }
          }
        }
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
    
    // Future entity modules can be registered here
    // this.entityModules.grass = GrassEntity;
  },

  // Get cached image by key
  getCachedImage(cacheKey) {
    return this.imageCache.get(cacheKey);
  },

  // Get cached canvas by key
  getCachedCanvas(cacheKey) {
    return this.canvasCache.get(cacheKey);
  },

  // Create and cache image from SVG
  createAndCacheImage(cacheKey, svg) {
    const img = new Image();
    
    img.onload = () => {
      console.log(`[EntityRenderer] Generated image for cache key: ${cacheKey}`);
      this.imageCache.set(cacheKey, img);
      this.saveCacheToStorage();
    };
    
    img.onerror = () => {
      console.warn(`[EntityRenderer] Failed to generate image for cache key: ${cacheKey}`);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    
    // Return the image (will be updated when loaded)
    return img;
  },

  // Create and cache canvas from draw function
  createAndCacheCanvas(cacheKey, drawFunction, size) {
    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw the shape to the canvas
    drawFunction(ctx, size / 2, size / 2);
    
    // Convert to image for caching
    const img = new Image();
    img.onload = () => {
      console.log(`[EntityRenderer] Generated canvas image for cache key: ${cacheKey}`);
      this.canvasCache.set(cacheKey, img);
      this.saveCanvasCacheToStorage();
    };
    
    img.onerror = () => {
      console.warn(`[EntityRenderer] Failed to generate canvas image for cache key: ${cacheKey}`);
    };
    
    img.src = canvas.toDataURL();
    
    // Return the image (will be updated when loaded)
    return img;
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
      for (const [key, img] of this.imageCache) {
        if (img.complete && img.naturalWidth > 0) {
          // Convert image to data URL for storage
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          cacheData[key] = canvas.toDataURL();
        }
      }
      localStorage.setItem(this.cacheStorageKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('[EntityRenderer] Failed to save cache to storage:', e);
    }
  },

  // Save canvas cache to localStorage
  saveCanvasCacheToStorage() {
    try {
      const cacheData = {};
      for (const [key, img] of this.canvasCache) {
        if (img.complete && img.naturalWidth > 0) {
          // Convert image to data URL for storage
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          cacheData[key] = canvas.toDataURL();
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
        
        for (const [key, dataUrl] of Object.entries(parsed)) {
          const imagePromise = new Promise((imageResolve) => {
            const img = new Image();
            img.onload = () => {
              this.imageCache.set(key, img);
              imageResolve();
            };
            img.onerror = () => {
              console.warn(`[EntityRenderer] Failed to load cached image: ${key}`);
              imageResolve(); // Resolve even on error to not block other images
            };
            img.src = dataUrl;
          });
          imagePromises.push(imagePromise);
        }
        
        // Wait for all images to load (or fail)
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
        
        for (const [key, dataUrl] of Object.entries(parsed)) {
          const imagePromise = new Promise((imageResolve) => {
            const img = new Image();
            img.onload = () => {
              this.canvasCache.set(key, img);
              imageResolve();
            };
            img.onerror = () => {
              console.warn(`[EntityRenderer] Failed to load cached canvas image: ${key}`);
              imageResolve(); // Resolve even on error to not block other images
            };
            img.src = dataUrl;
          });
          imagePromises.push(imagePromise);
        }
        
        // Wait for all images to load (or fail)
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

// Make globally available
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