// Local EntityRenderer for the electron game
// Only uses cached images - no dynamic creation

export class EntityRenderer {
    // Get cached image from asset manager
    static getCachedImage(cacheKey) {
        if (window.game && window.game.assetManager) {
            return window.game.assetManager.imageCache.get(cacheKey);
        }
        return null;
    }

    // Create entity with proper boilerplate (matching core system)
    static createEntityWithBoilerplate(type, config, entityRenderer, entityModule) {
        const entity = {
            type: type,
            size: config.size || 32,
            render: function(ctx) {
                // Use cached image if available
                const cacheKey = entityModule.getCacheKey(config);
                const cachedImage = EntityRenderer.getCachedImage(cacheKey);
                
                if (cachedImage && cachedImage.image && cachedImage.image.complete) {
                    // Draw cached image
                    const img = cachedImage.image;
                    const width = img.width || this.size;
                    const height = img.height || this.size;
                    
                    // Apply draw offset if specified
                    const offsetX = config.drawOffsetX || 0;
                    const offsetY = config.drawOffsetY || 0;
                    
                    ctx.drawImage(
                        img,
                        -width / 2 + offsetX,
                        -height / 2 + offsetY,
                        width,
                        height
                    );
                } else {
                    // No cached image available - this should not happen with proper caching
                    console.error(`[EntityRenderer] No cached image for ${type} with key: ${cacheKey}`);
                    
                    // Draw error placeholder
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('NO IMG', 0, 0);
                }
            }
        };
        
        return entity;
    }

    // Hash configuration for cache keys (matching core system)
    static hashConfig(config) {
        const str = JSON.stringify(config);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
} 