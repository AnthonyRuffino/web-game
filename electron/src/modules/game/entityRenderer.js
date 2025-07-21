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

    // Render entity with dynamic config (extracted from createEntityWithBoilerplate)
    static renderEntity(ctx, entity) {
        if (!entity || !entity.type) {
            console.warn('[EntityRenderer] Entity missing or no type:', entity);
            return;
        }

        // Get config: entity-specific config OR entity type config OR fallback
        let config = entity.imageConfig; // Optional entity-specific config
        if (!config) {
            config = EntityRenderer.getEntityTypeConfig(`entity:${entity.type}`); // Entity type config
        }
        if (!config) {
            // Hardcoded fallback config
            config = { size: 32, fixedScreenAngle: null, drawOffsetX: 0, drawOffsetY: 0 };
        }

        // Get cache key: entity-specific key OR use the same logic as createEntityWithBoilerplate
        let cacheKey = entity.imageCacheKey;
        if (!cacheKey) {
            // Use the same cache key generation as the old system
            // This requires the entity to have been created with the proper entityModule
            if (entity.entityModule && entity.entityModule.getCacheKey) {
                cacheKey = entity.entityModule.getCacheKey(entity.config || {});
            } else {
                // Fallback: try to find a cached image with the entity type pattern
                const assetManager = window.game?.assetManager;
                if (assetManager) {
                    // Look for any cache key that starts with the entity type
                    for (const key of assetManager.imageCache.keys()) {
                        if (key.startsWith(entity.type + '-')) {
                            cacheKey = key;
                            break;
                        }
                    }
                }
            }
        }
        
        const cachedImage = EntityRenderer.getCachedImage(cacheKey);
        
        if (cachedImage && cachedImage.image && cachedImage.image.complete) {
            // Draw cached image
            const img = cachedImage.image;
            const width = config.size || img.width || 32;
            const height = config.size || img.height || 32;
            
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
            // No cached image available - draw error placeholder
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
    static createEntityWithBoilerplate(type, config, entityRenderer, entityModule) {
        const entity = {
            type: type,
            size: config.size || 32,
            config: config, // Store config for new render method
            entityModule: entityModule, // Store entityModule for new render method
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
                        ctx.rotate(angle);
                    }
                    
                    ctx.drawImage(
                        img,
                        -width / 2 + offsetX,
                        -height / 2 + offsetY,
                        width,
                        height
                    );
                    
                    // Restore rotation if applied
                    if (config.fixedScreenAngle !== null && config.fixedScreenAngle !== undefined) {
                        ctx.restore();
                    }
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