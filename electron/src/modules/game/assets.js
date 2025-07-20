// Asset management system with 3-tier fallback
// Filesystem → localStorage → procedural generation

export class AssetManager {
    constructor() {
        // Asset directory in user's home folder
        this.assetDir = null;
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

    // Main image loading function with 3-tier fallback
    async loadGameImage(type, imageName) {
        const cacheKey = `image:${type}-${imageName}`;
        
        try {
            // Tier 1: Check filesystem
            const fsImage = await this.loadFromFilesystem(imageName);
            if (fsImage) {
                console.log(`[AssetManager] Loaded from filesystem: ${imageName}`);
                return fsImage;
            }

            // Tier 2: Check localStorage
            const cachedImage = localStorage.getItem(cacheKey);
            if (cachedImage) {
                console.log(`[AssetManager] Loaded from cache: ${cacheKey}`);
                return cachedImage;
            }

            // Tier 3: Procedural generation
            console.log(`[AssetManager] Generating image: ${cacheKey}`);
            const generatedImage = await this.generateImage(type, imageName);
            if (generatedImage) {
                // Cache the generated image
                localStorage.setItem(cacheKey, generatedImage);
                console.log(`[AssetManager] Cached generated image: ${cacheKey}`);
                return generatedImage;
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
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(this.assetDir, `${imageName}.png`);
            
            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                const base64 = imageBuffer.toString('base64');
                return `data:image/png;base64,${base64}`;
            }
        } catch (error) {
            console.warn(`[AssetManager] Filesystem read error for ${imageName}:`, error);
        }
        
        return null;
    }

    // Generate image based on type and name
    async generateImage(type, imageName) {
        try {
            let svgData = null;

            // Generate SVG based on type and name
            switch (type) {
                case 'biome':
                    svgData = this.generateBiomeSVG(imageName);
                    break;
                case 'entity':
                    svgData = this.generateEntitySVG(imageName);
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

    // Generate biome SVG
    generateBiomeSVG(biomeName) {
        switch (biomeName) {
            case 'plains':
                return this.generatePlainsSVG();
            case 'desert':
                return this.generateDesertSVG();
            default:
                console.warn(`[AssetManager] Unknown biome: ${biomeName}`);
                return null;
        }
    }

    // Generate entity SVG
    generateEntitySVG(entityName) {
        // This will be implemented when we create the entity modules
        // For now, return a placeholder
        console.warn(`[AssetManager] Entity generation not yet implemented: ${entityName}`);
        return null;
    }

    // Generate plains biome SVG
    generatePlainsSVG() {
        const size = 2048; // Chunk size in pixels
        const tileSize = 32;
        const tilesPerChunk = size / tileSize;

        let svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Generate grass pattern for plains
        for (let tileY = 0; tileY < tilesPerChunk; tileY++) {
            for (let tileX = 0; tileX < tilesPerChunk; tileX++) {
                const x = tileX * tileSize;
                const y = tileY * tileSize;
                
                // Base grass color
                svgContent += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="#8FBC8F" opacity="0.8"/>`;
                
                // Add some grass detail
                if ((tileX + tileY) % 3 === 0) {
                    svgContent += `<rect x="${x + 4}" y="${y + 4}" width="${tileSize - 8}" height="${tileSize - 8}" fill="#9ACD32" opacity="0.3"/>`;
                }
            }
        }
        
        svgContent += '</svg>';
        return svgContent;
    }

    // Generate desert biome SVG
    generateDesertSVG() {
        const size = 2048; // Chunk size in pixels
        const tileSize = 32;
        const tilesPerChunk = size / tileSize;

        let svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Generate sand pattern for desert
        for (let tileY = 0; tileY < tilesPerChunk; tileY++) {
            for (let tileX = 0; tileX < tilesPerChunk; tileX++) {
                const x = tileX * tileSize;
                const y = tileY * tileSize;
                
                // Base sand color
                svgContent += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="#F4A460" opacity="0.9"/>`;
                
                // Add some sand variation
                if ((tileX + tileY) % 4 === 0) {
                    svgContent += `<rect x="${x + 2}" y="${y + 2}" width="${tileSize - 4}" height="${tileSize - 4}" fill="#DEB887" opacity="0.4"/>`;
                }
            }
        }
        
        svgContent += '</svg>';
        return svgContent;
    }

    // Convert SVG to data URL
    async svgToDataURL(svgData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
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
        console.log(`[AssetManager] Cleared ${keysToRemove.length} cached images`);
    }

    // Get list of available images
    getAvailableImages() {
        const images = {
            filesystem: [],
            localStorage: []
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