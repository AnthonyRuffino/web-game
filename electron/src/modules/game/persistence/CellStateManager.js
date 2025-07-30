class CellStateManager {
    constructor(databaseManager, changeTracker) {
        this.database = databaseManager;
        this.changeTracker = changeTracker;
        this.db = null;
        this.currentWorldId = null;
        this.chunkCache = new Map(); // Cache for loaded chunk cell states
    }

    async initialize() {
        this.db = this.database.getDatabase();
    }

    // Set the current world for cell state operations
    setCurrentWorld(worldId) {
        this.currentWorldId = worldId;
        this.clearChunkCache(); // Clear cache when world changes
        console.log(`[CellStateManager] Set current world: ${worldId}`);
    }

    // Convert world coordinates to chunk and cell coordinates
    worldToChunkAndCell(worldX, worldY, chunkSize = 64, tileSize = 32) {
        const chunkX = Math.floor(worldX / (chunkSize * tileSize));
        const chunkY = Math.floor(worldY / (chunkSize * tileSize));
        
        const localWorldX = worldX - (chunkX * chunkSize * tileSize);
        const localWorldY = worldY - (chunkY * chunkSize * tileSize);
        
        const cellX = Math.floor(localWorldX / tileSize);
        const cellY = Math.floor(localWorldY / tileSize);
        
        return { chunkX, chunkY, cellX, cellY };
    }

    // Load the state of a specific cell
    async loadCellState(chunkX, chunkY, cellX, cellY) {
        if (!this.currentWorldId) {
            throw new Error('No current world set in CellStateManager');
        }

        try {
            // Check if we have a cell change record
            const cellChange = await this.db.get(`
                SELECT * FROM cell_changes 
                WHERE world_id = ? AND chunk_x = ? AND chunk_y = ? AND cell_x = ? AND cell_y = ?
            `, [this.currentWorldId, chunkX, chunkY, cellX, cellY]);

            if (!cellChange) {
                // No changes recorded for this cell - it uses procedural generation
                return null;
            }

            // Get all entities in this modified cell
            const entities = await this.db.all(`
                SELECT ce.*, et.type_name 
                FROM cell_entities ce
                JOIN entity_types et ON ce.entity_type_id = et.id
                WHERE ce.cell_changes_id = ?
            `, [cellChange.id]);

            // Convert to game entity format
            const cellEntities = entities.map(entity => ({
                id: entity.id,
                type: entity.type_name,
                metadata: entity.metadata ? JSON.parse(entity.metadata) : null,
                created_at: entity.created_at
            }));

            const cellState = {
                cellChangeId: cellChange.id,
                worldId: cellChange.world_id,
                chunkX: cellChange.chunk_x,
                chunkY: cellChange.chunk_y,
                cellX: cellChange.cell_x,
                cellY: cellChange.cell_y,
                worldX: cellChange.world_x,
                worldY: cellChange.world_y,
                entities: cellEntities,
                modified_at: cellChange.created_at
            };

            console.log(`[CellStateManager] Loaded cell state: (${chunkX},${chunkY}) (${cellX},${cellY}) with ${cellEntities.length} entities`);
            return cellState;
        } catch (error) {
            console.error('[CellStateManager] Failed to load cell state:', error);
            throw error;
        }
    }

    // Load all cell states for a chunk
    async loadChunkCellStates(chunkX, chunkY) {
        if (!this.currentWorldId) {
            throw new Error('No current world set in CellStateManager');
        }

        try {
            const cacheKey = `${this.currentWorldId}-${chunkX}-${chunkY}`;
            
            // Check cache first
            if (this.chunkCache.has(cacheKey)) {
                return this.chunkCache.get(cacheKey);
            }

            // Get all cell changes for this chunk
            const cellChanges = await this.db.all(`
                SELECT * FROM cell_changes 
                WHERE world_id = ? AND chunk_x = ? AND chunk_y = ?
            `, [this.currentWorldId, chunkX, chunkY]);

            const chunkCellStates = {};

            for (const cellChange of cellChanges) {
                // Get entities for this cell
                const entities = await this.db.all(`
                    SELECT ce.*, et.type_name 
                    FROM cell_entities ce
                    JOIN entity_types et ON ce.entity_type_id = et.id
                    WHERE ce.cell_changes_id = ?
                `, [cellChange.id]);

                const cellEntities = entities.map(entity => ({
                    id: entity.id,
                    type: entity.type_name,
                    metadata: entity.metadata ? JSON.parse(entity.metadata) : null,
                    created_at: entity.created_at
                }));

                const cellKey = `${cellChange.cell_x},${cellChange.cell_y}`;
                chunkCellStates[cellKey] = {
                    cellChangeId: cellChange.id,
                    worldId: cellChange.world_id,
                    chunkX: cellChange.chunk_x,
                    chunkY: cellChange.chunk_y,
                    cellX: cellChange.cell_x,
                    cellY: cellChange.cell_y,
                    worldX: cellChange.world_x,
                    worldY: cellChange.world_y,
                    entities: cellEntities,
                    modified_at: cellChange.created_at
                };
            }

            // Cache the result
            this.chunkCache.set(cacheKey, chunkCellStates);

            console.log(`[CellStateManager] Loaded chunk cell states: (${chunkX},${chunkY}) with ${Object.keys(chunkCellStates).length} modified cells`);
            return chunkCellStates;
        } catch (error) {
            console.error('[CellStateManager] Failed to load chunk cell states:', error);
            throw error;
        }
    }

    // Mark a cell as modified
    async markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY) {
        if (!this.currentWorldId) {
            throw new Error('No current world set in CellStateManager');
        }

        try {
            // Insert or replace cell change record
            const result = await this.db.run(`
                INSERT OR REPLACE INTO cell_changes 
                (world_id, chunk_x, chunk_y, cell_x, cell_y, world_x, world_y)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [this.currentWorldId, chunkX, chunkY, cellX, cellY, worldX, worldY]);

            const cellChangeId = result.lastID;

            // Track the change
            this.changeTracker.trackCellChange(this.currentWorldId, chunkX, chunkY, cellX, cellY, worldX, worldY);

            // Clear chunk cache for this chunk
            const cacheKey = `${this.currentWorldId}-${chunkX}-${chunkY}`;
            this.chunkCache.delete(cacheKey);

            console.log(`[CellStateManager] Marked cell as modified: (${chunkX},${chunkY}) (${cellX},${cellY})`);
            return cellChangeId;
        } catch (error) {
            console.error('[CellStateManager] Failed to mark cell as modified:', error);
            throw error;
        }
    }

    // Add an entity to a cell
    async addEntityToCell(chunkX, chunkY, cellX, cellY, entityTypeName, metadata = null) {
        if (!this.currentWorldId) {
            throw new Error('No current world set in CellStateManager');
        }

        try {
            // Get entity type ID
            const entityTypeId = await this.getEntityTypeId(entityTypeName);

            // Ensure cell is marked as modified
            const worldX = chunkX * 64 * 32 + cellX * 32;
            const worldY = chunkY * 64 * 32 + cellY * 32;
            const cellChangeId = await this.markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY);

            // Add entity to cell
            const result = await this.db.run(`
                INSERT INTO cell_entities (cell_changes_id, entity_type_id, metadata)
                VALUES (?, ?, ?)
            `, [cellChangeId, entityTypeId, metadata ? JSON.stringify(metadata) : null]);

            const entityId = result.lastID;

            // Track the entity addition
            const cellChangeKey = `${this.currentWorldId}-${chunkX}-${chunkY}-${cellX}-${cellY}`;
            this.changeTracker.trackCellEntity(cellChangeKey, entityTypeId, metadata);

            console.log(`[CellStateManager] Added entity to cell: ${entityTypeName} at (${chunkX},${chunkY}) (${cellX},${cellY})`);
            return entityId;
        } catch (error) {
            console.error('[CellStateManager] Failed to add entity to cell:', error);
            throw error;
        }
    }

    // Remove an entity from a cell
    async removeEntityFromCell(chunkX, chunkY, cellX, cellY, entityTypeName) {
        if (!this.currentWorldId) {
            throw new Error('No current world set in CellStateManager');
        }

        try {
            // Get entity type ID
            const entityTypeId = await this.getEntityTypeId(entityTypeName);

            // Get cell change record
            const cellChange = await this.db.get(`
                SELECT id FROM cell_changes 
                WHERE world_id = ? AND chunk_x = ? AND chunk_y = ? AND cell_x = ? AND cell_y = ?
            `, [this.currentWorldId, chunkX, chunkY, cellX, cellY]);

            if (!cellChange) {
                console.warn(`[CellStateManager] No cell change record found for cell (${chunkX},${chunkY}) (${cellX},${cellY})`);
                return false;
            }

            // Remove the entity
            const result = await this.db.run(`
                DELETE FROM cell_entities 
                WHERE cell_changes_id = ? AND entity_type_id = ?
            `, [cellChange.id, entityTypeId]);

            // Check if this was the last entity in the cell
            const remainingEntities = await this.db.get(`
                SELECT COUNT(*) as count FROM cell_entities WHERE cell_changes_id = ?
            `, [cellChange.id]);

            // If no entities remain, remove the cell change record
            if (remainingEntities.count === 0) {
                await this.db.run(`
                    DELETE FROM cell_changes WHERE id = ?
                `, [cellChange.id]);
                console.log(`[CellStateManager] Removed empty cell change record: (${chunkX},${chunkY}) (${cellX},${cellY})`);
            }

            // Clear chunk cache
            const cacheKey = `${this.currentWorldId}-${chunkX}-${chunkY}`;
            this.chunkCache.delete(cacheKey);

            console.log(`[CellStateManager] Removed entity from cell: ${entityTypeName} at (${chunkX},${chunkY}) (${cellX},${cellY})`);
            return result.changes > 0;
        } catch (error) {
            console.error('[CellStateManager] Failed to remove entity from cell:', error);
            throw error;
        }
    }

    // Clear the chunk cache
    clearChunkCache() {
        this.chunkCache.clear();
        console.log('[CellStateManager] Cleared chunk cache');
    }

    // Get entity type ID by name
    async getEntityTypeId(typeName) {
        try {
            const result = await this.db.get(`
                SELECT id FROM entity_types WHERE type_name = ?
            `, [typeName]);

            if (!result) {
                throw new Error(`Entity type '${typeName}' not found`);
            }

            return result.id;
        } catch (error) {
            console.error(`[CellStateManager] Failed to get entity type ID for '${typeName}':`, error);
            throw error;
        }
    }

    // Get statistics about cell states
    async getCellStateStats() {
        if (!this.currentWorldId) {
            throw new Error('No current world set in CellStateManager');
        }

        try {
            const stats = await this.db.get(`
                SELECT 
                    COUNT(*) as total_modified_cells,
                    COUNT(DISTINCT chunk_x || ',' || chunk_y) as chunks_with_modifications
                FROM cell_changes 
                WHERE world_id = ?
            `, [this.currentWorldId]);

            const entityStats = await this.db.get(`
                SELECT COUNT(*) as total_entities
                FROM cell_entities ce
                JOIN cell_changes cc ON ce.cell_changes_id = cc.id
                WHERE cc.world_id = ?
            `, [this.currentWorldId]);

            return {
                modifiedCells: stats.total_modified_cells,
                chunksWithModifications: stats.chunks_with_modifications,
                totalEntities: entityStats.total_entities,
                cachedChunks: this.chunkCache.size
            };
        } catch (error) {
            console.error('[CellStateManager] Failed to get cell state stats:', error);
            throw error;
        }
    }
}

module.exports = { CellStateManager }; 