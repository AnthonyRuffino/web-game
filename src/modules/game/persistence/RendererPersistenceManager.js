import { InventoryManager } from './InventoryManager.js';
import { HarvestingManager } from './HarvestingManager.js';
import { EntityModificationManager } from './EntityModificationManager.js';

export class RendererPersistenceManager {
    constructor() {
        this.isInitialized = false;
        this.currentWorldId = null;
        this.currentCharacterId = null;
        
        // Initialize managers
        this.inventoryManager = new InventoryManager(this);
        this.harvestingManager = new HarvestingManager(this);
        this.entityModificationManager = new EntityModificationManager(this);
    }

    async initialize() {
        try {
            console.log('[RendererPersistenceManager] Initializing...');
            this.isInitialized = true;
            console.log('[RendererPersistenceManager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to initialize:', error);
            throw error;
        }
    }

    // World management
    async createWorld(worldConfig) {
        try {
            const result = await window.electronAPI.dbCreateWorld(worldConfig);
            console.log('[RendererPersistenceManager] Created world:', result);
            return result;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to create world:', error);
            throw error;
        }
    }

    async getWorlds() {
        try {
            const worlds = await window.electronAPI.dbGetWorlds();
            console.log('[RendererPersistenceManager] Got worlds:', worlds.length);
            return worlds;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get worlds:', error);
            throw error;
        }
    }

    async getWorld(worldId) {
        try {
            const world = await window.electronAPI.dbGetWorld(worldId);
            console.log('[RendererPersistenceManager] Got world:', world);
            return world;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get world:', error);
            throw error;
        }
    }

    async getCharacters(worldId) {
        try {
            const characters = await window.electronAPI.dbGetCharacters(worldId);
            console.log('[RendererPersistenceManager] Got characters:', characters.length);
            return characters;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get characters:', error);
            throw error;
        }
    }

    async getCharacter(characterId) {
        try {
            const character = await window.electronAPI.dbGetCharacter(characterId);
            console.log('[RendererPersistenceManager] Got character:', character);
            return character;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get character:', error);
            throw error;
        }
    }

    // Cell state management
    async getCellState(worldId, chunkX, chunkY, cellX, cellY) {
        try {
            const cellState = await window.electronAPI.dbGetCellState(worldId, chunkX, chunkY, cellX, cellY);
            return cellState;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get cell state:', error);
            throw error;
        }
    }

    async getChunkCellStates(worldId, chunkX, chunkY) {
        try {
            const chunkStates = await window.electronAPI.dbGetChunkCellStates(worldId, chunkX, chunkY);
            return chunkStates;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get chunk cell states:', error);
            throw error;
        }
    }

    async markCellModified(worldId, chunkX, chunkY, cellX, cellY, worldX, worldY) {
        try {
            // For now, we'll use a placeholder since we don't have this IPC method yet
            console.log(`[RendererPersistenceManager] Marking cell modified: (${chunkX},${chunkY}) cell (${cellX},${cellY})`);
            return true;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to mark cell modified:', error);
            throw error;
        }
    }

    async addEntityToCell(worldId, chunkX, chunkY, cellX, cellY, entityType, metadata) {
        try {
            // For now, we'll use a placeholder since we don't have this IPC method yet
            console.log(`[RendererPersistenceManager] Adding entity ${entityType} to cell (${chunkX},${chunkY}) cell (${cellX},${cellY})`);
            return true;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to add entity to cell:', error);
            throw error;
        }
    }

    // Inventory management
    async getInventoryContents(characterId) {
        try {
            const contents = await window.electronAPI.dbGetInventoryContents(characterId);
            console.log('[RendererPersistenceManager] Got inventory contents:', contents.length);
            return contents;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get inventory contents:', error);
            throw error;
        }
    }

    async getItemInSlot(characterId, slotIndex) {
        try {
            const item = await window.electronAPI.dbGetItemInSlot(characterId, slotIndex);
            return item;
        } catch (error) {
            console.error('[RendererPersistenceManager] Failed to get item in slot:', error);
            throw error;
        }
    }

    // State management
    setCurrentWorld(worldId) {
        this.currentWorldId = worldId;
        console.log('[RendererPersistenceManager] Set current world:', worldId);
    }

    setCurrentCharacter(characterId) {
        this.currentCharacterId = characterId;
        console.log('[RendererPersistenceManager] Set current character:', characterId);
        
        // Also set the character ID in the inventory manager
        if (this.inventoryManager) {
            this.inventoryManager.setCurrentCharacter(characterId);
        }
    }

    getCurrentWorld() {
        return this.currentWorldId;
    }

    getCurrentCharacter() {
        return this.currentCharacterId;
    }

    // Utility methods
    async savePendingChanges() {
        console.log('[RendererPersistenceManager] Manual save triggered (placeholder)');
        return true;
    }

    async shutdown() {
        console.log('[RendererPersistenceManager] Shutting down...');
        this.isInitialized = false;
    }

    getConfig() {
        return {
            isInitialized: this.isInitialized,
            currentWorldId: this.currentWorldId,
            currentCharacterId: this.currentCharacterId
        };
    }

    // Add getters for the new managers
    getInventoryManager() {
        return this.inventoryManager;
    }

    getHarvestingManager() {
        return this.harvestingManager;
    }

    getEntityModificationManager() {
        return this.entityModificationManager;
    }
} 