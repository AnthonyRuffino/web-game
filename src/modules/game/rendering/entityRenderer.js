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

    // Get entity type config from asset manager
    static getEntityTypeConfig(entityType) {
        if (window.game && window.game.assetManager) {
            return window.game.assetManager.getEntityTypeConfig(entityType);
        }
        return null;
    }

    // Generate default cache key for entity type
    static generateEntityCacheKey(entityType) {
        return `image:entity:${entityType}`;
    }

    // Render entity with dynamic config
    static renderEntity(ctx, entity) {
        if (!entity || !entity.type) {
            console.warn('[EntityRenderer] Entity missing or no type:', entity);
            return;
        }
        
        console.log('[EntityRenderer] Rendering entity:', entity.type, 'at', entity.x, entity.y);

        // Get config: entity-specific config OR entity type config OR fallback
        let config = entity.imageConfig; // Optional entity-specific config
        if (!config) {
            config = EntityRenderer.getEntityTypeConfig(entity.type); // Entity type config
        }
        if (!config) {
            // Hardcoded fallback config
            config = { size: 32, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 };
        }

        // Get cache key: entity-specific key OR use default from entity type
        let cacheKey = entity.imageCacheKey;
        if (!cacheKey) {
            if (entity.entityModule && entity.entityModule.getImageCacheKey) {
                cacheKey = entity.entityModule.getImageCacheKey();
            } else {
                // Fallback for entities without entityModule (like world-generated entities)
                cacheKey = EntityRenderer.generateEntityCacheKey(entity.type);
            }
        }
        
        console.log('[EntityRenderer] Using cache key:', cacheKey);
        
        const cachedImage = EntityRenderer.getCachedImage(cacheKey);
        
        if (cachedImage && cachedImage.image && cachedImage.image.complete) {
            // Draw cached image
            const img = cachedImage.image;
            const width = img.width;
            const height = img.height;
            
            // Apply draw offset if specified
            const offsetX = config.drawOffsetX || 0;
            const offsetY = config.drawOffsetY || 0;
            
            // Handle fixed screen angle if specified
            if (config.fixedScreenAngle !== null && config.fixedScreenAngle !== undefined) {
                // Get current camera mode and rotation
                const cameraMode = window.game?.inputManager?.cameraMode || 'fixed-angle';
                const cameraRotation = window.game?.camera?.rotation || 0;
                const playerAngle = window.game?.player?.angle || 0;
                
                let angle = 0;
                if (cameraMode === 'player-perspective') {
                    // In player-perspective mode, undo world rotation and apply fixed angle
                    angle = playerAngle + (config.fixedScreenAngle * Math.PI / 180);
                } else {
                    // In fixed-angle mode, apply camera rotation and fixed angle
                    angle = cameraRotation + (config.fixedScreenAngle * Math.PI / 180);
                }
                
                // Apply rotation
                ctx.save();
                ctx.translate(entity.x, entity.y);
                ctx.rotate(angle);
                ctx.drawImage(
                    img,
                    -width / 2 + offsetX,
                    -height / 2 + offsetY,
                    width,
                    height
                );
                ctx.restore();
            } else {
                // No rotation - draw normally
                ctx.drawImage(
                    img,
                    entity.x - width / 2 + offsetX,
                    entity.y - height / 2 + offsetY,
                    width,
                    height
                );
            }
        } else {
            // No cached image available - emit missing image event for lazy loading
            const missingImageEvent = new CustomEvent('imageMissing', {
                detail: {
                    type: 'entity',
                    imageName: entity.type,
                    entityClass: entity.entityModule,
                    config: config,
                    cacheKey: cacheKey,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(missingImageEvent);
            
            // Draw error placeholder while loading
            const size = config.size || 32;
            ctx.save();
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(entity.x - size / 2, entity.y - size / 2, size, size);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(entity.x - size / 2, entity.y - size / 2, size, size);
            ctx.fillStyle = '#ffffff';
            ctx.font = `${Math.max(8, size/4)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('?', entity.x, entity.y + size/8);
            ctx.restore();
        }
    }

    // Create entity with proper boilerplate (matching core system)
    static createEntityWithBoilerplate(type, config, entityModule) {
        const entity = {
            type: type,
            size: config.size || 32,
            config: config, // Store config for new render method
            entityModule: entityModule, // Store entityModule for new render method
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