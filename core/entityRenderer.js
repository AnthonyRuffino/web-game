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
  
  // Registry of entity modules
  entityModules: {},

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

  // Initialize the renderer system
  async init() {
    console.log('[EntityRenderer] Initializing entity renderer system...');
    
    // Wait for both caches to load completely
    await Promise.all([
      this.loadCacheFromStorage(),
      this.loadCanvasCacheFromStorage()
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
    localStorage.removeItem(this.cacheStorageKey);
    localStorage.removeItem(this.canvasCacheStorageKey);
    console.log('[EntityRenderer] All caches cleared');
  },

  // Get cache info
  getCacheInfo() {
    return {
      imageCacheSize: this.imageCache.size,
      canvasCacheSize: this.canvasCache.size,
      totalCacheSize: this.imageCache.size + this.canvasCache.size,
      imageKeys: Array.from(this.imageCache.keys()),
      canvasKeys: Array.from(this.canvasCache.keys()),
      entityModules: Object.keys(this.entityModules)
    };
  },

  // Get registered entity modules
  getEntityModules() {
    return Object.keys(this.entityModules);
  }
};

// Make globally available
window.EntityRenderer = EntityRenderer;