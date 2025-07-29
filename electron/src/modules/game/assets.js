// Asset management system with 3-tier fallback
// Filesystem → localStorage → procedural generation

import { GrassEntity } from './entities/grass.js';
import { TreeEntity } from './entities/tree.js';
import { RockEntity } from './entities/rock.js';

export class AssetManager {
    constructor() {
        // Asset directory in user's home folder
        this.assetDir = null;
        this.imageCache = new Map(); // In-memory cache for loaded images
        this.entityTypeConfigs = new Map(); // In-memory cache for entity type configs
        this.loadingImages = new Set(); // Track images currently being loaded
        this.initAssetDir();
        this.initImageConfigs(); // Initialize entity type configs at startup
        
        // Setup lazy loading for missing images
        this.setupMissingImageListener();
    }

    // Setup listener for missing image events
    setupMissingImageListener() {
        document.addEventListener('imageMissing', (event) => {
            this.handleMissingImageEvent(event.detail);
        });
        console.log('[AssetManager] Missing image event listener setup complete');
    }

    // Handle missing image events for lazy loading
    async handleMissingImageEvent(detail) {
        
        
        const { type, imageName, entityClass, config, cacheKey } = detail;
        
        // Check if we're already loading this image
        if (this.loadingImages.has(cacheKey)) {
            return;
        }
        console.log('[AssetManager] Handling missing image event:', detail);
        // Mark as loading
        this.loadingImages.add(cacheKey);
        
        try {
            // Load the missing image
            const imageData = await this.ensureImageLoaded({
                type: type,
                imageName: imageName,
                entityClass: entityClass,
                config: config
            });
            
            if (imageData) {
                console.log(`[AssetManager] Successfully loaded missing image: ${cacheKey}`);
            } else {
                console.error(`[AssetManager] Failed to load missing image: ${cacheKey}`);
            }
        } catch (error) {
            console.error(`[AssetManager] Error loading missing image ${cacheKey}:`, error);
        } finally {
            // Remove from loading set
            this.loadingImages.delete(cacheKey);
        }
    }

    async initAssetDir() {
        try {
            // Check if we're in an Electron environment
            if (typeof window !== 'undefined' && window.electronAPI) {
                // We're in Electron renderer process
                console.log('[AssetManager] Running in Electron environment');
                this.assetDir = null; // For now, just use localStorage
            } else {
                // We're in a browser environment
                console.log('[AssetManager] Running in browser environment');
                this.assetDir = null;
            }
        } catch (error) {
            console.warn('[AssetManager] Could not initialize filesystem access:', error);
            // Fallback to localStorage only
            this.assetDir = null;
        }
    }

    // Initialize centralized entity type configurations
    initImageConfigs() {
        console.log('[AssetManager] Initializing entity type configurations...');
        
        // Load existing configs from localStorage
        const savedConfigs = localStorage.getItem('entityTypeConfigs');
        if (savedConfigs) {
            try {
                const configs = JSON.parse(savedConfigs);
                console.log('[AssetManager] Loaded entity type configs from localStorage:', configs);
                
                // Store in memory cache
                Object.entries(configs).forEach(([key, config]) => {
                    this.entityTypeConfigs.set(key, config);
                });
            } catch (error) {
                console.error('[AssetManager] Error parsing saved entity type configs:', error);
            }
        }

        // Ensure all required entity type configs exist
        this.ensureAllEntityTypeConfigs();
    }

    // Ensure all required entity type configs exist in memory and localStorage
    ensureAllEntityTypeConfigs() {
        const requiredEntityTypes = [
            GrassEntity,
            TreeEntity,
            RockEntity
        ];

        const requiredBackgroundTypes = [
            { name: 'plains', defaultConfig: { size: 640, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 } },
            { name: 'desert', defaultConfig: { size: 640, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 } }
        ];

        let configsChanged = false;

        // Ensure entity type configs
        requiredEntityTypes.forEach(entityType => {
            const configKey = `entity:${entityType.type}`;
            if (!this.entityTypeConfigs.has(configKey)) {
                this.entityTypeConfigs.set(configKey, entityType.defaultConfig);
                configsChanged = true;
                console.log(`[AssetManager] Created default config for ${configKey}:`, entityType.defaultConfig);
            }
        });

        // Ensure background type configs
        requiredBackgroundTypes.forEach(backgroundType => {
            const configKey = `background:${backgroundType.name}`;
            if (!this.entityTypeConfigs.has(configKey)) {
                this.entityTypeConfigs.set(configKey, backgroundType.defaultConfig);
                configsChanged = true;
                console.log(`[AssetManager] Created default config for ${configKey}:`, backgroundType.defaultConfig);
            }
        });

        // Save to localStorage if any configs were added
        if (configsChanged) {
            this.saveAllEntityTypeConfigs();
        }

        console.log('[AssetManager] All entity type configs ensured:', Object.fromEntries(this.entityTypeConfigs));
    }

    // Save all entity type configs to localStorage
    saveAllEntityTypeConfigs() {
        try {
            const configs = Object.fromEntries(this.entityTypeConfigs);
            localStorage.setItem('entityTypeConfigs', JSON.stringify(configs));
            console.log('[AssetManager] Entity type configs saved to localStorage');
        } catch (error) {
            console.error('[AssetManager] Error saving entity type configs:', error);
        }
    }

    // Get entity type config from memory cache
    getEntityTypeConfig(entityType) {
        return this.entityTypeConfigs.get(`entity:${entityType}`);
    }

    // Save specific entity type config to localStorage
    saveEntityTypeConfig(entityType, config) {
        this.entityTypeConfigs.set(`entity:${entityType}`, config);
        this.saveAllEntityTypeConfigs();
        console.log(`[AssetManager] Saved config for ${entityType}:`, config);
    }

    // Utility method to update an image with new data
    async updateImage(type, entityType, imageDataURL, config = null) {
        console.log(`[AssetManager] Updating image: ${type}-${entityType.type}`);
        
        try {
            // Create cache key based on type and name
            let cacheKey;
            if (type === 'entity') {
                cacheKey = entityType.getImageCacheKey();
            } else if (type === 'background' || type === 'biome') {
                cacheKey = `image:background:${entityType.type}`;
            }
            
            // Convert data URL to image object
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // Get config for this image type
                    let imageConfig = config;
                    if (!imageConfig) {
                        if (type === 'entity') {
                            imageConfig = this.getEntityTypeConfig(entityType.type);
                        } else {
                            imageConfig = { size: 640, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 };
                        }
                    }
                    
                    // Create cache object with proper metadata
                    const cacheObj = {
                        image: img,
                        size: imageConfig ? (imageConfig.size || img.width) : img.width,
                        fixedScreenAngle: imageConfig ? (imageConfig.fixedScreenAngle || null) : null,
                        drawOffsetX: imageConfig ? (imageConfig.drawOffsetX || 0) : 0,
                        drawOffsetY: imageConfig ? (imageConfig.drawOffsetY || 0) : 0
                    };
                    
                    // Update in-memory cache
                    this.imageCache.set(cacheKey, cacheObj);
                    
                    // Save to localStorage
                    localStorage.setItem(cacheKey, imageDataURL);
                    
                    console.log(`[AssetManager] Successfully updated image: ${cacheKey}, size: ${img.width}x${img.height}`);
                    resolve(cacheObj);
                };
                img.onerror = reject;
                img.src = imageDataURL;
            });
            
            return true;
        } catch (error) {
            console.error(`[AssetManager] Error updating image ${type}-${entityType.type}:`, error);
            return false;
        }
    }

    // Initialize all required images on startup
    async initializeImages() {
        console.log('[AssetManager] Initializing all required images...');
        
        const requiredImages = [
            // Entity images - use entity class cache keys
            { 
                type: 'entity', 
                imageName: GrassEntity.type, 
                entityClass: GrassEntity,
                config: GrassEntity.defaultConfig
            },
            { 
                type: 'entity', 
                imageName: TreeEntity.type, 
                entityClass: TreeEntity,
                config: TreeEntity.defaultConfig
            },
            { 
                type: 'entity', 
                imageName: RockEntity.type, 
                entityClass: RockEntity,
                config: RockEntity.defaultConfig
            },
            
            // Biome images - using the same cache keys as entityRenderer
            { type: 'background', imageName: 'plains', config: { size: 640, tileSize: 32, chunkSize: 64, seed: 12345 } },
            { type: 'background', imageName: 'desert', config: { size: 640, tileSize: 32, chunkSize: 64, seed: 12345 } }
        ];

        console.log('[AssetManager] Required images:', requiredImages.map(img => `${img.type}-${img.name}`));

        const promises = requiredImages.map(image => this.ensureImageLoaded(image));
        
        try {
            await Promise.all(promises);
            console.log('[AssetManager] All required images initialized successfully');
            console.log('[AssetManager] Current image cache keys:', Array.from(this.imageCache.keys()));
        } catch (error) {
            console.error('[AssetManager] Error initializing images:', error);
        }
    }

    // Ensure an image is loaded (filesystem → localStorage → generation)
    async ensureImageLoaded({type, imageName, entityClass = null, config = null}) {
        // Use entity class cache key for entities, otherwise use background pattern
        let cacheKey;
        if (type === 'entity' && entityClass) {
            cacheKey = entityClass.getImageCacheKey(config);
        } else if (type === 'background') {
            cacheKey = `image:background:${imageName}`;
        } else {
            cacheKey = `image:${type}:${imageName}`;
        }
        
        console.log(`[AssetManager] ensureImageLoaded called for: ${cacheKey}`);
        
        // Check if already in memory cache
        if (this.imageCache.has(cacheKey)) {
            console.log(`[AssetManager] Found in memory cache: ${cacheKey}`);
            return this.imageCache.get(cacheKey);
        }

        try {
            // Tier 1: Check filesystem
            console.log(`[AssetManager] Checking filesystem for: ${imageName}`);
            const fsImage = await this.loadFromFilesystem(imageName);
            if (fsImage) {
                console.log(`[AssetManager] Loaded from filesystem: ${imageName}`);
                this.imageCache.set(cacheKey, fsImage);
                return fsImage;
            }

            // Tier 2: Check localStorage
            console.log(`[AssetManager] Checking localStorage for: ${cacheKey}`);
            const cachedImage = localStorage.getItem(cacheKey);
            if (cachedImage) {
                console.log(`[AssetManager] Found in localStorage: ${cacheKey}`);
                // Convert data URL back to image object
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        const cacheObj = {
                            image: img,
                            size: img.width || config.size || 640,
                            fixedScreenAngle: config.fixedScreenAngle || null,
                            drawOffsetX: config.drawOffsetX || 0,
                            drawOffsetY: config.drawOffsetY || 0
                        };
                        this.imageCache.set(cacheKey, cacheObj);
                        console.log(`[AssetManager] Cached image object from localStorage: ${cacheKey}, size: ${img.width}x${img.height}`);
                        resolve(cacheObj);
                    };
                    img.onerror = reject;
                    img.src = cachedImage;
                });
                return this.imageCache.get(cacheKey);
            }

            // Tier 3: Procedural generation
            console.log(`[AssetManager] Generating image: ${cacheKey}`);
            const generatedImage = await this.generateImage(type, imageName, config);
            if (generatedImage) {
                console.log(`[AssetManager] Generated image data URL for: ${cacheKey}`);
                // Cache the generated image
                console.log(`[AssetManager] Saved to localStorage: ${cacheKey}`);
                
                // Convert data URL to image object and cache it
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        const cacheObj = {
                            image: img,
                            size: img.width || config.size || 640,
                            fixedScreenAngle: config.fixedScreenAngle || null,
                            drawOffsetX: config.drawOffsetX || 0,
                            drawOffsetY: config.drawOffsetY || 0
                        };
                        this.imageCache.set(cacheKey, cacheObj);
                        console.log(`[AssetManager] Cached generated image object: ${cacheKey}, size: ${img.width}x${img.height}`);
                        resolve(cacheObj);
                    };
                    img.onerror = reject;
                    img.src = generatedImage;
                });
                
                return this.imageCache.get(cacheKey);
            }

            console.error(`[AssetManager] Failed to load or generate image: ${cacheKey}`);
            return null;

        } catch (error) {
            console.error(`[AssetManager] Error loading image ${cacheKey}:`, error);
            return null;
        }
    }

    // Load image from filesystem
    async loadFromFilesystem(imageName) {
        if (!this.assetDir) return null;

        try {
            // For now, skip filesystem loading in browser context
            // This can be enhanced later for Electron filesystem access
            console.log(`[AssetManager] Filesystem access not available for ${imageName}`);
            return null;
        } catch (error) {
            console.warn(`[AssetManager] Filesystem read error for ${imageName}:`, error);
        }
        
        return null;
    }

    // Generate image based on type and name
    async generateImage(type, imageName, config = {}) {
        try {
            let svgData = null;

            // Generate SVG based on type and name
            switch (type) {
                case 'background':
                    svgData = this.generateBackgroundSVG(imageName, config);
                    break;
                case 'entity':
                    svgData = this.generateEntitySVG(imageName, config);
                    break;
                default:
                    console.warn(`[AssetManager] Unknown image type: ${type}`);
                    return null;
            }

            if (svgData) {
                return await this.svgToDataURL(svgData);
            }

        } catch (error) {
            console.error(`[AssetManager] Error generating image ${type}-${imageName}:`, error);
        }

        return null;
    }

    // Generate background SVG (biome backgrounds)
    generateBackgroundSVG(backgroundName, config) {
        switch (backgroundName) {
            case 'plains':
                return this.generatePlainsSVG(config);
            case 'desert':
                return this.generateDesertSVG(config);
            default:
                console.warn(`[AssetManager] Unknown background: ${backgroundName}`);
                return null;
        }
    }

    // Generate entity SVG
    generateEntitySVG(entityName, config) {
        switch (entityName) {
            case 'grass':
                return GrassEntity.generateGrassSVG(config);
            case 'tree':
                return TreeEntity.generateTreeSVG(config);
            case 'rock':
                return RockEntity.generateRockSVG(config);
            default:
                console.warn(`[AssetManager] Unknown entity: ${entityName}`);
                return null;
        }
    }

    // Generate grass SVG


    // Generate plains biome SVG
    generatePlainsSVG(config) {
        const size = config.size || 640; // Use 640x640 like entityRenderer
        
        // Use the exact entityRenderer plains configuration
        const plainsConfig = {
            width: size,
            height: size,
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
        };

        // Use the exact same SVG generation as entityRenderer
        const w = plainsConfig.width, h = plainsConfig.height, base = plainsConfig.baseColor, rects = plainsConfig.rects;
        const svg = `
          <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${w}" height="${h}" fill="${base}"/>
            ${rects.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>`).join('\n          ')}
          </svg>
        `;
        
        return svg;
    }

    // Generate desert biome SVG
    generateDesertSVG(config) {
        const size = config.size || 640; // Use 640x640 like entityRenderer
        
        // Use the exact entityRenderer desert configuration
        const desertConfig = {
            width: size,
            height: size,
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
        };

        // Use the exact same SVG generation as entityRenderer
        const w = desertConfig.width, h = desertConfig.height, base = desertConfig.baseColor, rects = desertConfig.rects;
        const svg = `
          <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${w}" height="${h}" fill="${base}"/>
            ${rects.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>`).join('\n          ')}
          </svg>
        `;
        
        return svg;
    }

    // Simple hash function for deterministic generation
    simpleHash(str) {
        let hash = 0;
        const seedStr = str.toString();
        for (let i = 0; i < seedStr.length; i++) {
            const char = seedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Convert SVG to data URL with proper image object
    async svgToDataURL(svgData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            img.onerror = () => {
                console.error('[AssetManager] Error loading SVG image');
                resolve(null);
            };
            img.onload = () => {
                // Convert to data URL for localStorage
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (error) {
                    console.error('[AssetManager] Error converting SVG to data URL:', error);
                    resolve(null);
                }
            };
            
            
            
            
        });
    }

    // Save image to filesystem (for user-edited assets)
    async saveToFilesystem(imageName, dataURL) {
        if (!this.assetDir) {
            console.warn('[AssetManager] Filesystem not available');
            return false;
        }

        try {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(this.assetDir, `${imageName}.png`);
            
            // Convert data URL to buffer
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            fs.writeFileSync(imagePath, buffer);
            console.log(`[AssetManager] Saved to filesystem: ${imagePath}`);
            
            // Update in-memory cache
            const cacheKey = `image:${imageName}`;
            this.imageCache.set(cacheKey, dataURL);
            
            return true;
        } catch (error) {
            console.error(`[AssetManager] Error saving to filesystem:`, error);
            return false;
        }
    }

    // Clear localStorage cache
    clearCache() {
        const keysToRemove = this.imageCache.keys().length;
        this.imageCache.clear();
        console.log(`[AssetManager] Cleared ${keysToRemove} cached images`);
    }

    // Clear specific cached images
    clearCachedImages(imageKeys) {
        imageKeys.forEach(key => {
            const cacheKey = `image:${key}`;
            this.imageCache.delete(cacheKey);
            localStorage.removeItem(cacheKey);
            console.log(`[AssetManager] Cleared cached image: ${cacheKey}`);
        });
    }

    // Get list of available images
    getAvailableImages() {
        const images = {
            filesystem: [],
            localStorage: [],
            memory: Array.from(this.imageCache.keys())
        };

        // Check filesystem
        if (this.assetDir) {
            try {
                const fs = require('fs');
                const files = fs.readdirSync(this.assetDir);
                images.filesystem = files.filter(file => file.endsWith('.png'))
                    .map(file => file.replace('.png', ''));
            } catch (error) {
                console.warn('[AssetManager] Error reading filesystem:', error);
            }
        }

        // Check localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('image:')) {
                const imageName = key.replace('image:', '');
                images.localStorage.push(imageName);
            }
        }

        return images;
    }
} 