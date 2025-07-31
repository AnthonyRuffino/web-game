class ChangeTracker {
    constructor() {
        this.pendingChanges = new Map();
        this.pendingCellChanges = new Map();
        this.pendingCellEntities = new Map();
        this.pendingInventoryChanges = new Map();
    }

    // Track a cell change (marking a cell as modified)
    trackCellChange(worldId, chunkX, chunkY, cellX, cellY, worldX, worldY) {
        const key = `${worldId}-${chunkX}-${chunkY}-${cellX}-${cellY}`;
        this.pendingCellChanges.set(key, {
            worldId,
            chunkX,
            chunkY,
            cellX,
            cellY,
            worldX,
            worldY,
            timestamp: Date.now()
        });
        
        console.log(`[ChangeTracker] Tracked cell change: ${key}`);
    }

    // Track an entity being added to a cell
    trackCellEntity(cellChangeKey, entityTypeId, metadata = null) {
        if (!this.pendingCellEntities.has(cellChangeKey)) {
            this.pendingCellEntities.set(cellChangeKey, []);
        }
        
        this.pendingCellEntities.get(cellChangeKey).push({
            entityTypeId,
            metadata: metadata ? JSON.stringify(metadata) : null,
            timestamp: Date.now()
        });
        
        console.log(`[ChangeTracker] Tracked cell entity: ${cellChangeKey} -> ${entityTypeId}`);
    }

    // Track inventory changes
    trackInventoryChange(characterId, slotIndex, entityTypeId, quantity, metadata = null) {
        const key = `${characterId}-${slotIndex}`;
        this.pendingInventoryChanges.set(key, {
            characterId,
            slotIndex,
            entityTypeId,
            quantity,
            metadata: metadata ? JSON.stringify(metadata) : null,
            timestamp: Date.now()
        });
        
        console.log(`[ChangeTracker] Tracked inventory change: ${key} -> ${entityTypeId} x${quantity}`);
    }

    // Get all pending cell changes
    getPendingCellChanges() {
        return Array.from(this.pendingCellChanges.values());
    }

    // Get all pending cell entities for a specific cell change
    getPendingCellEntities(cellChangeKey) {
        return this.pendingCellEntities.get(cellChangeKey) || [];
    }

    // Get all pending inventory changes
    getPendingInventoryChanges() {
        return Array.from(this.pendingInventoryChanges.values());
    }

    // Get all pending changes as a batch
    getPendingChangesBatch() {
        return {
            cellChanges: this.getPendingCellChanges(),
            cellEntities: Array.from(this.pendingCellEntities.entries()).map(([key, entities]) => ({
                cellChangeKey: key,
                entities: entities
            })),
            inventoryChanges: this.getPendingInventoryChanges()
        };
    }

    // Clear all pending changes
    clearPendingChanges() {
        this.pendingCellChanges.clear();
        this.pendingCellEntities.clear();
        this.pendingInventoryChanges.clear();
        console.log('[ChangeTracker] Cleared all pending changes');
    }

    // Clear specific types of pending changes
    clearCellChanges() {
        this.pendingCellChanges.clear();
        this.pendingCellEntities.clear();
        console.log('[ChangeTracker] Cleared pending cell changes');
    }

    clearInventoryChanges() {
        this.pendingInventoryChanges.clear();
        console.log('[ChangeTracker] Cleared pending inventory changes');
    }

    // Get statistics about pending changes
    getPendingChangesStats() {
        return {
            cellChanges: this.pendingCellChanges.size,
            cellEntities: Array.from(this.pendingCellEntities.values()).reduce((sum, entities) => sum + entities.length, 0),
            inventoryChanges: this.pendingInventoryChanges.size,
            totalChanges: this.pendingCellChanges.size + this.pendingInventoryChanges.size
        };
    }

    // Check if there are any pending changes
    hasPendingChanges() {
        return this.pendingCellChanges.size > 0 || this.pendingInventoryChanges.size > 0;
    }

    // Remove a specific cell change from tracking
    removeCellChange(worldId, chunkX, chunkY, cellX, cellY) {
        const key = `${worldId}-${chunkX}-${chunkY}-${cellX}-${cellY}`;
        this.pendingCellChanges.delete(key);
        this.pendingCellEntities.delete(key);
        console.log(`[ChangeTracker] Removed cell change: ${key}`);
    }

    // Remove a specific inventory change from tracking
    removeInventoryChange(characterId, slotIndex) {
        const key = `${characterId}-${slotIndex}`;
        this.pendingInventoryChanges.delete(key);
        console.log(`[ChangeTracker] Removed inventory change: ${key}`);
    }
}

export { ChangeTracker }; 