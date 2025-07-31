import { World } from '../core/world.js';

export class RendererPersistentWorld extends World {
    constructor(persistenceManager) {
        super();
        this.persistenceManager = persistenceManager;
        this.currentWorldId = null;
        this.currentCharacterId = null;
    }

    async initializeWithPersistence(worldId, characterId) {
        // Load world configuration from database
        if (!this.persistenceManager) {
            console.error('[RendererPersistentWorld] Persistence manager is null');
            throw new Error('Persistence manager is not initialized');
        }
        
        const worldData = await this.persistenceManager.getWorld(worldId);
        
        // Convert database format to WORLD_CONFIG format
        const worldConfig = {
            name: worldData.name,
            seed: worldData.seed,
            chunkCount: worldData.chunk_count,
            chunkSize: worldData.chunk_size,
            tileSize: worldData.tile_size,
            biomePlainsFraction: worldData.biome_plains_fraction
        };
        
        // Set world configuration
        this.setConfig(worldConfig);
        
        this.currentWorldId = worldId;
        this.currentCharacterId = characterId;
        
        console.log('[RendererPersistentWorld] Initialized with world ID:', worldId, 'character ID:', characterId);
    }

    // Override loadChunk to integrate with persistence
    async loadChunk(chunkX, chunkY) {
        const chunk = await super.loadChunk(chunkX, chunkY);
        
        // Load persisted changes for this chunk
        if (!this.persistenceManager || !this.currentWorldId) {
            console.warn('[RendererPersistentWorld] Skipping persistence - manager or world not initialized');
            return chunk;
        }
        
        const persistedStates = await this.persistenceManager.getChunkCellStates(this.currentWorldId, chunkX, chunkY);
        
        // Apply persisted changes to chunk
        this.applyPersistedChangesToChunk(chunk, persistedStates);
        
        return chunk;
    }

    applyPersistedChangesToChunk(chunk, persistedStates) {
        if (!persistedStates || persistedStates.size === 0) {
            return; // No changes to apply
        }

        // Create a map of entities by cell position
        const entitiesByCell = new Map();
        chunk.entities.forEach(entity => {
            const cellX = Math.floor((entity.x - chunk.worldX) / this.config.tileSize) % this.config.chunkSize;
            const cellY = Math.floor((entity.y - chunk.worldY) / this.config.tileSize) % this.config.chunkSize;
            const cellKey = `${cellX},${cellY}`;
            
            if (!entitiesByCell.has(cellKey)) {
                entitiesByCell.set(cellKey, []);
            }
            entitiesByCell.get(cellKey).push(entity);
        });

        // Apply persisted changes
        for (const [cellKey, cellState] of persistedStates) {
            const [cellX, cellY] = cellKey.split(',').map(Number);
            
            if (cellState.entities.length === 0) {
                // Cell should be empty - remove all entities from this cell
                const entitiesToRemove = entitiesByCell.get(cellKey) || [];
                entitiesToRemove.forEach(entity => {
                    const index = chunk.entities.indexOf(entity);
                    if (index > -1) {
                        chunk.entities.splice(index, 1);
                    }
                });
            } else {
                // Replace entities in this cell with persisted entities
                const entitiesToRemove = entitiesByCell.get(cellKey) || [];
                entitiesToRemove.forEach(entity => {
                    const index = chunk.entities.indexOf(entity);
                    if (index > -1) {
                        chunk.entities.splice(index, 1);
                    }
                });

                // Add persisted entities
                cellState.entities.forEach(persistedEntity => {
                    const worldX = chunk.worldX + cellX * this.config.tileSize + this.config.tileSize / 2;
                    const worldY = chunk.worldY + cellY * this.config.tileSize + this.config.tileSize / 2;
                    
                    const entity = this.createEntityFromPersistedData(persistedEntity, worldX, worldY);
                    if (entity) {
                        chunk.entities.push(entity);
                    }
                });
            }
        }
    }

    createEntityFromPersistedData(persistedEntity, worldX, worldY) {
        // Create entity based on type and metadata
        const entity = {
            x: worldX,
            y: worldY,
            type: persistedEntity.type,
            metadata: persistedEntity.metadata
        };

        // Apply metadata if present
        if (persistedEntity.metadata) {
            if (persistedEntity.metadata.image_config) {
                // Apply custom image configuration
                Object.assign(entity, persistedEntity.metadata.image_config);
            }
        }

        // Add entity-specific properties
        switch (persistedEntity.type) {
            case 'tree':
                entity.collision = true;
                entity.collisionRadius = 18;
                break;
            case 'rock':
                entity.collision = true;
                entity.collisionRadius = 12;
                break;
            case 'wood_block':
                entity.collision = true;
                entity.collisionRadius = 16;
                break;
        }

        return entity;
    }
} 