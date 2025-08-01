import { DatabaseManager } from './database.js';
import { ChangeTracker } from './ChangeTracker.js';
import { WorldManager } from './WorldManager.js';
import { CellStateManager } from './CellStateManager.js';
import { InventoryManager } from './InventoryManager.js';
import { HarvestingManager } from './HarvestingManager.js';

class PersistenceManager {
    constructor() {
        this.database = null;
        this.changeTracker = null;
        this.worldManager = null;
        this.cellStateManager = null;
        this.inventoryManager = null;
        this.harvestingManager = null;
        
        // Configuration
        this.batchSize = 100; // Number of changes to batch before saving
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        
        // State
        this.isInitialized = false;
        this.currentWorldId = null;
        this.currentCharacterId = null;
    }

    async initialize(userDataPath = null) {
        try {
            console.log('[PersistenceManager] Initializing persistence system...');
            
            // Initialize database
            this.database = new DatabaseManager();
            await this.database.initialize(userDataPath);
            
            // Initialize change tracker
            this.changeTracker = new ChangeTracker();
            
            // Initialize managers
            this.worldManager = new WorldManager(this.database);
            await this.worldManager.initialize();
            
            this.cellStateManager = new CellStateManager(this.database, this.changeTracker);
            await this.cellStateManager.initialize();
            
            this.inventoryManager = new InventoryManager(this);
            this.harvestingManager = new HarvestingManager(this);
            
            this.isInitialized = true;
            console.log('[PersistenceManager] Persistence system initialized successfully');
            
            return true;
        } catch (error) {
            console.error('[PersistenceManager] Failed to initialize persistence system:', error);
            throw error;
        }
    }

    // Start automatic saving
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.savePendingChanges();
        }, this.autoSaveInterval);
        
        console.log(`[PersistenceManager] Auto-save started (${this.autoSaveInterval}ms interval)`);
    }

    // Stop automatic saving
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('[PersistenceManager] Auto-save stopped');
        }
    }

    // Save pending changes to database
    async savePendingChanges() {
        if (!this.isInitialized) {
            console.warn('[PersistenceManager] Cannot save changes - system not initialized');
            return false;
        }

        if (!this.changeTracker.hasPendingChanges()) {
            console.log('[PersistenceManager] No pending changes to save');
            return true;
        }

        try {
            console.log('[PersistenceManager] Saving pending changes...');
            
            const db = this.database.getDatabase();
            
            // Start transaction
            await db.run('BEGIN TRANSACTION');
            
            try {
                const pendingChanges = this.changeTracker.getPendingChangesBatch();
                
                // Process cell changes
                for (const cellChange of pendingChanges.cellChanges) {
                    await db.run(`
                        INSERT OR REPLACE INTO cell_changes 
                        (world_id, chunk_x, chunk_y, cell_x, cell_y, world_x, world_y)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        cellChange.worldId,
                        cellChange.chunkX,
                        cellChange.chunkY,
                        cellChange.cellX,
                        cellChange.cellY,
                        cellChange.worldX,
                        cellChange.worldY
                    ]);
                }
                
                // Process cell entities
                for (const cellEntityBatch of pendingChanges.cellEntities) {
                    const cellChangeKey = cellEntityBatch.cellChangeKey;
                    const [worldId, chunkX, chunkY, cellX, cellY] = cellEntityBatch.cellChangeKey.split('-');
                    
                    // Get the cell change ID
                    const cellChange = await db.get(`
                        SELECT id FROM cell_changes 
                        WHERE world_id = ? AND chunk_x = ? AND chunk_y = ? AND cell_x = ? AND cell_y = ?
                    `, [worldId, chunkX, chunkY, cellX, cellY]);
                    
                    if (cellChange) {
                        for (const entity of cellEntityBatch.entities) {
                            await db.run(`
                                INSERT INTO cell_entities (cell_changes_id, entity_type_id, metadata)
                                VALUES (?, ?, ?)
                            `, [cellChange.id, entity.entityTypeId, entity.metadata]);
                        }
                    }
                }
                
                // Process inventory changes
                for (const inventoryChange of pendingChanges.inventoryChanges) {
                    await db.run(`
                        INSERT OR REPLACE INTO inventory_entities 
                        (character_id, slot_index, entity_type_id, quantity, metadata)
                        VALUES (?, ?, ?, ?, ?)
                    `, [
                        inventoryChange.characterId,
                        inventoryChange.slotIndex,
                        inventoryChange.entityTypeId,
                        inventoryChange.quantity,
                        inventoryChange.metadata
                    ]);
                }
                
                // Commit transaction
                await db.run('COMMIT');
                
                // Clear pending changes
                this.changeTracker.clearPendingChanges();
                
                console.log('[PersistenceManager] Successfully saved pending changes');
                return true;
                
            } catch (error) {
                // Rollback transaction on error
                await db.run('ROLLBACK');
                throw error;
            }
            
        } catch (error) {
            console.error('[PersistenceManager] Failed to save pending changes:', error);
            return false;
        }
    }

    // Set current world
    setCurrentWorld(worldId) {
        this.currentWorldId = worldId;
        this.cellStateManager.setCurrentWorld(worldId);
        console.log(`[PersistenceManager] Set current world: ${worldId}`);
    }

    // Set current character
    setCurrentCharacter(characterId) {
        this.currentCharacterId = characterId;
        console.log(`[PersistenceManager] Set current character: ${characterId}`);
    }

    // World management methods
    async createWorld(worldConfig) {
        return await this.worldManager.createWorld(worldConfig);
    }

    async loadWorld(worldId) {
        return await this.worldManager.loadWorld(worldId);
    }

    async getWorlds() {
        return await this.worldManager.getWorlds();
    }

    // Character management methods
    async createCharacter(worldId, characterName, startingPosition) {
        return await this.worldManager.createCharacter(worldId, characterName, startingPosition);
    }

    async loadCharacter(characterId) {
        return await this.worldManager.loadCharacter(characterId);
    }

    async getCharacters(worldId) {
        return await this.worldManager.getCharacters(worldId);
    }

    async saveCharacterPosition(characterId, position) {
        return await this.worldManager.saveCharacterPosition(characterId, position);
    }

    // Cell state management methods
    async loadCellState(chunkX, chunkY, cellX, cellY) {
        return await this.cellStateManager.loadCellState(chunkX, chunkY, cellX, cellY);
    }

    async loadChunkCellStates(chunkX, chunkY) {
        return await this.cellStateManager.loadChunkCellStates(chunkX, chunkY);
    }

    async markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY) {
        return await this.cellStateManager.markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY);
    }

    async addEntityToCell(chunkX, chunkY, cellX, cellY, entityTypeName, metadata) {
        return await this.cellStateManager.addEntityToCell(chunkX, chunkY, cellX, cellY, entityTypeName, metadata);
    }

    async removeEntityFromCell(chunkX, chunkY, cellX, cellY, entityTypeName) {
        return await this.cellStateManager.removeEntityFromCell(chunkX, chunkY, cellX, cellY, entityTypeName);
    }

    // Entity type management
    async getEntityTypeId(typeName) {
        return await this.worldManager.getEntityTypeId(typeName);
    }

    async getEntityTypeName(entityTypeId) {
        return await this.worldManager.getEntityTypeName(entityTypeId);
    }

    async getAllEntityTypes() {
        return await this.worldManager.getAllEntityTypes();
    }

    // Statistics and monitoring
    getPendingChangesStats() {
        return this.changeTracker.getPendingChangesStats();
    }

    async getCellStateStats() {
        return await this.cellStateManager.getCellStateStats();
    }

    // Manual save trigger
    async manualSave() {
        console.log('[PersistenceManager] Manual save triggered');
        return await this.savePendingChanges();
    }

    // Shutdown and cleanup
    async shutdown() {
        try {
            console.log('[PersistenceManager] Shutting down persistence system...');
            
            // Stop auto-save
            this.stopAutoSave();
            
            // Save any remaining pending changes
            if (this.changeTracker.hasPendingChanges()) {
                console.log('[PersistenceManager] Saving final pending changes...');
                await this.savePendingChanges();
            }
            
            // Close database connection
            if (this.database) {
                await this.database.close();
            }
            
            console.log('[PersistenceManager] Persistence system shut down successfully');
        } catch (error) {
            console.error('[PersistenceManager] Error during shutdown:', error);
        }
    }

    // Configuration methods
    setBatchSize(size) {
        this.batchSize = size;
        console.log(`[PersistenceManager] Batch size set to: ${size}`);
    }

    setAutoSaveInterval(interval) {
        this.autoSaveInterval = interval;
        if (this.autoSaveTimer) {
            this.stopAutoSave();
            this.startAutoSave();
        }
        console.log(`[PersistenceManager] Auto-save interval set to: ${interval}ms`);
    }

    // Get current configuration
    getConfig() {
        return {
            batchSize: this.batchSize,
            autoSaveInterval: this.autoSaveInterval,
            isInitialized: this.isInitialized,
            currentWorldId: this.currentWorldId,
            currentCharacterId: this.currentCharacterId
        };
    }

    // Getter methods for managers
    getWorldManager() {
        return this.worldManager;
    }

    getCellStateManager() {
        return this.cellStateManager;
    }

    getInventoryManager() {
        return this.inventoryManager;
    }

    getHarvestingManager() {
        return this.harvestingManager;
    }
}

export { PersistenceManager }; 