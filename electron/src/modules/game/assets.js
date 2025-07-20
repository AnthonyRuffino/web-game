// Asset management system with 3-tier fallback
// Filesystem → localStorage → procedural generation

export class AssetManager {
    constructor() {
        // Asset directory in user's home folder
        this.assetDir = null;
        this.imageCache = new Map(); // In-memory cache for loaded images
        this.initAssetDir();
    }

    async initAssetDir() {
        try {
            // Get asset directory path
            const { app } = require('electron').remote || require('@electron/remote');
            const path = require('path');
            const os = require('os');
            
            // Use app.getPath('userData') for proper Electron user data directory
            this.assetDir = path.join(app.getPath('userData'), 'assets');
            
            // Ensure directory exists
            const fs = require('fs');
            if (!fs.existsSync(this.assetDir)) {
                fs.mkdirSync(this.assetDir, { recursive: true });
                console.log('[AssetManager] Created asset directory:', this.assetDir);
            }
        } catch (error) {
            console.warn('[AssetManager] Could not initialize filesystem access:', error);
            // Fallback to localStorage only
            this.assetDir = null;
        }
    }

    // Initialize all required images on startup
    async initializeImages() {
        console.log('[AssetManager] Initializing all required images...');
        
        // Also clear any localStorage entries
        localStorage.removeItem('image:background-plains');
        localStorage.removeItem('image:background-desert');
        
        const requiredImages = [
            // Entity images
            { type: 'entity', name: 'grass', config: { size: 32, bladeColor: '#81C784', bladeWidth: 1.5, clusterCount: 3, bladeCount: 5, bladeLength: 10, bladeAngleVariation: 30, opacity: 1.0 } },
            { type: 'entity', name: 'tree', config: { size: 32, imageHeight: 96, trunkWidth: 12, trunkHeight: 60, trunkColor: '#5C4033', foliageColor: '#1B5E20', foliageRadius: 24, opacity: 1.0 } },
            { type: 'entity', name: 'rock', config: { size: 20, baseColor: '#757575', strokeColor: '#424242', textureColor: '#424242', opacity: 1.0, textureSpots: 3, strokeWidth: 2 } },
            
            // Biome images - using the same cache keys as entityRenderer
            { type: 'background', name: 'plains', config: { size: 640, tileSize: 32, chunkSize: 64, seed: 12345 } },
            { type: 'background', name: 'desert', config: { size: 640, tileSize: 32, chunkSize: 64, seed: 12345 } }
        ];

        console.log('[AssetManager] Required images:', requiredImages.map(img => `${img.type}-${img.name}`));

        const promises = requiredImages.map(image => this.ensureImageLoaded(image.type, image.name, image.config));
        
        try {
            await Promise.all(promises);
            console.log('[AssetManager] All required images initialized successfully');
            console.log('[AssetManager] Current image cache keys:', Array.from(this.imageCache.keys()));
        } catch (error) {
            console.error('[AssetManager] Error initializing images:', error);
        }
    }

    // Ensure an image is loaded (filesystem → localStorage → generation)
    async ensureImageLoaded(type, imageName, config = {}) {
        // Use the same cache key pattern as entityRenderer for backgrounds
        const cacheKey = type === 'background' ? `image:background-${imageName}` : `image:${type}-${imageName}`;
        
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
                            size: img.width || 640,
                            fixedScreenAngle: null,
                            drawOffsetX: 0,
                            drawOffsetY: 0
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
                localStorage.setItem(cacheKey, generatedImage);
                console.log(`[AssetManager] Saved to localStorage: ${cacheKey}`);
                
                // Convert data URL to image object and cache it
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        const cacheObj = {
                            image: img,
                            size: img.width || 640,
                            fixedScreenAngle: null,
                            drawOffsetX: 0,
                            drawOffsetY: 0
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

    // Main image loading function with 3-tier fallback
    async loadGameImage(type, imageName, config = {}) {
        return this.ensureImageLoaded(type, imageName, config);
    }

    // Load image from filesystem
    async loadFromFilesystem(imageName) {
        if (!this.assetDir) return null;

        try {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(this.assetDir, `${imageName}.png`);
            
            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                const base64 = imageBuffer.toString('base64');
                const dataURL = `data:image/png;base64,${base64}`;
                
                // Update in-memory cache
                const cacheKey = `image:${imageName}`;
                this.imageCache.set(cacheKey, dataURL);
                
                return dataURL;
            }
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
                return this.generateGrassSVG(config);
            case 'tree':
                return this.generateTreeSVG(config);
            case 'rock':
                return this.generateRockSVG(config);
            default:
                console.warn(`[AssetManager] Unknown entity: ${entityName}`);
                return null;
        }
    }

    // Generate grass SVG
    generateGrassSVG(config) {
        const size = config.size || 32;
        const bladeColor = config.bladeColor || '#81C784';
        const bladeWidth = config.bladeWidth || 1.5;
        const clusterCount = config.clusterCount || 3;
        const bladeCount = config.bladeCount || 5;
        const bladeLength = config.bladeLength || 10;
        const bladeAngleVariation = config.bladeAngleVariation || 30;
        const opacity = config.opacity || 1.0;

        const center = size / 2;
        const clusterRadius = size * 0.3;

        // Generate grass clusters with deterministic positions
        let grassElements = '';
        
        for (let cluster = 0; cluster < clusterCount; cluster++) {
            // Calculate cluster center using deterministic positioning
            const angle = (cluster * 120) * (Math.PI / 180);
            const distance = clusterRadius * (0.3 + (cluster * 0.2) % 0.4);
            const clusterX = center + Math.cos(angle) * distance;
            const clusterY = center + Math.sin(angle) * distance;
            
            // Generate blades for this cluster
            const clusterBladeCount = bladeCount + (cluster % 2);
            const baseAngle = (cluster * 137.5) * (Math.PI / 180);
            
            for (let blade = 0; blade < clusterBladeCount; blade++) {
                // Vary the angle slightly for each blade
                const angleVariation = ((cluster * 100 + blade * 50) % (bladeAngleVariation * 2) - bladeAngleVariation) * (Math.PI / 180);
                const bladeAngle = baseAngle + angleVariation;
                
                // Vary the length slightly
                const length = bladeLength + (cluster * 200 + blade * 30) % 6;
                
                // Calculate blade end point
                const endX = clusterX + Math.cos(bladeAngle) * length;
                const endY = clusterY + Math.sin(bladeAngle) * length;
                
                // Create grass blade as a line
                grassElements += `<line x1="${clusterX.toFixed(1)}" y1="${clusterY.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}" stroke="${bladeColor}" stroke-width="${bladeWidth}" opacity="${opacity}"/>`;
            }
        }

        const svg = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                ${grassElements}
            </svg>
        `;

        return svg;
    }

    // Generate tree SVG
    generateTreeSVG(config) {
        const size = config.size || 32;
        const width = size;
        const height = config.imageHeight || 96;
        const trunkWidth = config.trunkWidth || 12;
        const trunkHeight = config.trunkHeight || 60;
        const trunkColor = config.trunkColor || '#5C4033';
        const foliageColor = config.foliageColor || '#1B5E20';
        const foliageRadius = config.foliageRadius || 24;
        const opacity = config.opacity || 1.0;

        // Trunk: from bottom center up
        const trunkX = width / 2 - trunkWidth / 2;
        const trunkY = height - size * 0.1;

        // Foliage: centered near the top
        const foliageCenterX = width / 2;
        const foliageCenterY = height * 0.18;

        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect x="${trunkX}" y="${trunkY - trunkHeight}" width="${trunkWidth}" height="${trunkHeight}" fill="${trunkColor}" opacity="${opacity}"/>
                <ellipse cx="${foliageCenterX}" cy="${foliageCenterY}" rx="${foliageRadius}" ry="${foliageRadius * 1.2}" fill="${foliageColor}" opacity="${opacity}"/>
            </svg>
        `;
        
        return svg;
    }

    // Generate rock SVG
    generateRockSVG(config) {
        const size = config.size || 20;
        const baseColor = config.baseColor || '#757575';
        const strokeColor = config.strokeColor || '#424242';
        const textureColor = config.textureColor || '#424242';
        const opacity = config.opacity || 1.0;
        const textureSpots = config.textureSpots || 3;
        const strokeWidth = config.strokeWidth || 2;

        const center = size / 2;
        const radius = (size / 2) - strokeWidth;

        // Generate texture spots with deterministic positions
        let textureElements = '';
        for (let i = 0; i < textureSpots; i++) {
            const angle = (i * 137.5) * (Math.PI / 180);
            const distance = radius * (0.3 + (i * 0.2) % 0.4);
            const spotX = center + Math.cos(angle) * distance;
            const spotY = center + Math.sin(angle) * distance;
            const spotSize = radius * (0.1 + (i * 0.05) % 0.1);
            
            textureElements += `<circle cx="${spotX.toFixed(1)}" cy="${spotY.toFixed(1)}" r="${spotSize.toFixed(1)}" fill="${textureColor}"/>`;
        }

        const svg = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${center}" cy="${center}" r="${radius}" fill="${baseColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"/>
                ${textureElements}
            </svg>
        `;

        return svg;
    }

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
            
            img.onload = () => {
                // Create a cache object with metadata like entityRenderer
                const cacheObj = {
                    image: img,
                    size: img.width || 640,
                    fixedScreenAngle: null,
                    drawOffsetX: 0,
                    drawOffsetY: 0
                };
                
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
            
            img.onerror = () => {
                console.error('[AssetManager] Error loading SVG image');
                resolve(null);
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('image:')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        this.imageCache.clear();
        console.log(`[AssetManager] Cleared ${keysToRemove.length} cached images`);
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