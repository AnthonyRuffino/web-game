export class EntityModificationManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.world = null;
    }

    setWorld(world) {
        this.world = world;
    }

    // Modify entity's image configuration
    async modifyEntityImageConfig(entity, newImageConfig) {
        if (!this.world) {
            throw new Error('World not set in EntityModificationManager');
        }

        // Validate image config
        const validatedConfig = this.validateImageConfig(newImageConfig);
        if (!validatedConfig) {
            throw new Error('Invalid image configuration');
        }

        // Get entity's cell coordinates
        const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
        const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);

        // Mark cell as modified
        const worldX = chunkX * this.world.config.chunkSize * this.world.config.tileSize + cellX * this.world.config.tileSize;
        const worldY = chunkY * this.world.config.chunkSize * this.world.config.tileSize + cellY * this.world.config.tileSize;
        
        // Use renderer process persistence methods
        await this.persistenceManager.markCellModified(
            this.world.currentWorldId,
            chunkX, chunkY, cellX, cellY, worldX, worldY
        );

        // Create metadata with image config
        const metadata = {
            image_config: validatedConfig,
            modification_time: Date.now(),
            modifier: 'player' // Could be 'wizard', 'system', etc.
        };

        // Add entity with modified config
        await this.persistenceManager.addEntityToCell(
            this.world.currentWorldId,
            chunkX, chunkY, cellX, cellY, entity.type, metadata
        );

        console.log(`[EntityModificationManager] Modified image config for ${entity.type} at cell (${cellX}, ${cellY})`);
        return true;
    }

    validateImageConfig(imageConfig) {
        const requiredFields = ['size', 'fixedScreenAngle', 'drawOffsetX', 'drawOffsetY'];
        const optionalFields = ['customImageData'];

        // Check required fields
        for (const field of requiredFields) {
            if (imageConfig[field] === undefined || imageConfig[field] === null) {
                console.error(`[EntityModificationManager] Missing required field: ${field}`);
                return null;
            }
        }

        // Validate data types and ranges
        if (typeof imageConfig.size !== 'number' || imageConfig.size <= 0) {
            console.error('[EntityModificationManager] Invalid size value');
            return null;
        }

        if (typeof imageConfig.fixedScreenAngle !== 'number') {
            console.error('[EntityModificationManager] Invalid fixedScreenAngle value');
            return null;
        }

        if (typeof imageConfig.drawOffsetX !== 'number' || typeof imageConfig.drawOffsetY !== 'number') {
            console.error('[EntityModificationManager] Invalid draw offset values');
            return null;
        }

        // Validate custom image data if present
        if (imageConfig.customImageData && typeof imageConfig.customImageData !== 'string') {
            console.error('[EntityModificationManager] Invalid custom image data');
            return null;
        }

        return imageConfig;
    }

    // Reset entity to default configuration
    async resetEntityToDefault(entity) {
        if (!this.world) {
            throw new Error('World not set in EntityModificationManager');
        }

        // Get entity's cell coordinates
        const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
        const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);

        // Mark cell as modified (this will remove custom modifications)
        const worldX = chunkX * this.world.config.chunkSize * this.world.config.tileSize + cellX * this.world.config.tileSize;
        const worldY = chunkY * this.world.config.chunkSize * this.world.config.tileSize + cellY * this.world.config.tileSize;
        
        // Use renderer process persistence methods
        await this.persistenceManager.markCellModified(
            this.world.currentWorldId,
            chunkX, chunkY, cellX, cellY, worldX, worldY
        );

        // Add entity without custom metadata (will use default config)
        await this.persistenceManager.addEntityToCell(
            this.world.currentWorldId,
            chunkX, chunkY, cellX, cellY, entity.type, null
        );

        console.log(`[EntityModificationManager] Reset ${entity.type} to default config at cell (${cellX}, ${cellY})`);
        return true;
    }

    // Get entity's current configuration
    async getEntityConfiguration(entity) {
        if (!this.world) {
            throw new Error('World not set in EntityModificationManager');
        }

        try {
            const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
            const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
            const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
            const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);

            // Use renderer process persistence methods
            const cellState = await this.persistenceManager.getCellState(
                this.world.currentWorldId, 
                chunkX, 
                chunkY, 
                cellX, 
                cellY
            );
            
            if (!cellState || cellState.entities.length === 0) {
                // Entity uses default configuration
                return this.getDefaultConfiguration(entity.type);
            }

            // Find the specific entity
            const entityData = cellState.entities.find(e => e.type === entity.type);
            if (!entityData || !entityData.metadata) {
                return this.getDefaultConfiguration(entity.type);
            }

            return entityData.metadata.image_config || this.getDefaultConfiguration(entity.type);
        } catch (error) {
            console.warn('[EntityModificationManager] Failed to get entity configuration, using default:', error);
            return this.getDefaultConfiguration(entity.type);
        }
    }

    getDefaultConfiguration(entityType) {
        // Return default configurations for each entity type
        const defaults = {
            tree: {
                size: 48,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            },
            rock: {
                size: 20,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            },
            grass: {
                size: 32,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            },
            wood_block: {
                size: 32,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            }
        };

        return defaults[entityType] || {
            size: 32,
            fixedScreenAngle: 0,
            drawOffsetX: 0,
            drawOffsetY: 0
        };
    }
} 