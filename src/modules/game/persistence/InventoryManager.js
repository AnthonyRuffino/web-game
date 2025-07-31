export class InventoryManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.database = persistenceManager.database;
        this.currentCharacterId = null;
        this.inventorySlots = 20; // Default inventory size
    }

    setCurrentCharacter(characterId) {
        this.currentCharacterId = characterId;
    }

    async addItemToInventory(entityType, quantity = 1, metadata = null) {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        // Find an empty slot
        const emptySlot = await this.findEmptySlot();
        if (emptySlot === -1) {
            throw new Error('Inventory is full');
        }

        // Get entity type ID
        const entityTypeId = await this.persistenceManager.getWorldManager().getEntityTypeId(entityType);
        if (!entityTypeId) {
            throw new Error(`Unknown entity type: ${entityType}`);
        }

        // Add to pending changes
        this.persistenceManager.changeTracker.trackInventoryChange(
            this.currentCharacterId,
            emptySlot,
            entityTypeId,
            quantity,
            metadata ? JSON.stringify(metadata) : null
        );

        console.log(`[InventoryManager] Added ${quantity}x ${entityType} to slot ${emptySlot}`);
        return emptySlot;
    }

    async removeItemFromInventory(slotIndex, quantity = 1) {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        // Get current item in slot
        const currentItem = await this.getItemInSlot(slotIndex);
        if (!currentItem) {
            throw new Error(`No item in slot ${slotIndex}`);
        }

        if (currentItem.quantity < quantity) {
            throw new Error(`Not enough items in slot ${slotIndex}`);
        }

        // Add to pending changes (will be processed during save)
        // For now, we'll just mark the slot as modified
        this.persistenceManager.changeTracker.trackInventoryChange(
            this.currentCharacterId,
            slotIndex,
            currentItem.entityTypeId,
            currentItem.quantity - quantity,
            currentItem.metadata
        );

        console.log(`[InventoryManager] Removed ${quantity}x from slot ${slotIndex}`);
        return true;
    }

    async getItemInSlot(slotIndex) {
        if (!this.currentCharacterId) {
            return null;
        }

        const item = await this.database.db.get(`
            SELECT ie.*, et.type_name 
            FROM inventory_entities ie
            JOIN entity_types et ON ie.entity_type_id = et.id
            WHERE ie.character_id = ? AND ie.slot_index = ?
        `, [this.currentCharacterId, slotIndex]);

        if (!item) {
            return null;
        }

        return {
            slotIndex: item.slot_index,
            entityType: item.type_name,
            entityTypeId: item.entity_type_id,
            quantity: item.quantity,
            metadata: item.metadata ? JSON.parse(item.metadata) : null
        };
    }

    async getInventoryContents() {
        if (!this.currentCharacterId) {
            return [];
        }

        const items = await this.database.db.all(`
            SELECT ie.*, et.type_name 
            FROM inventory_entities ie
            JOIN entity_types et ON ie.entity_type_id = et.id
            WHERE ie.character_id = ?
            ORDER BY ie.slot_index
        `, [this.currentCharacterId]);

        return items.map(item => ({
            slotIndex: item.slot_index,
            entityType: item.type_name,
            entityTypeId: item.entity_type_id,
            quantity: item.quantity,
            metadata: item.metadata ? JSON.parse(item.metadata) : null
        }));
    }

    async findEmptySlot() {
        if (!this.currentCharacterId) {
            return -1;
        }

        // Find the first empty slot
        for (let i = 0; i < this.inventorySlots; i++) {
            const item = await this.getItemInSlot(i);
            if (!item) {
                return i;
            }
        }

        return -1; // No empty slots
    }

    async moveItem(fromSlot, toSlot) {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        const fromItem = await this.getItemInSlot(fromSlot);
        const toItem = await this.getItemInSlot(toSlot);

        if (!fromItem) {
            throw new Error(`No item in source slot ${fromSlot}`);
        }

        // If destination slot is empty, just move the item
        if (!toItem) {
            // Remove from source slot
            await this.removeItemFromInventory(fromSlot, fromItem.quantity);
            // Add to destination slot
            await this.addItemToInventory(fromItem.entityType, fromItem.quantity, fromItem.metadata);
            return true;
        }

        // If destination slot has the same item type, try to stack
        if (fromItem.entityType === toItem.entityType) {
            const totalQuantity = fromItem.quantity + toItem.quantity;
            // For now, assume no stacking limits
            await this.removeItemFromInventory(fromSlot, fromItem.quantity);
            await this.removeItemFromInventory(toSlot, toItem.quantity);
            await this.addItemToInventory(toItem.entityType, totalQuantity, toItem.metadata);
            return true;
        }

        // Different item types, swap them
        const fromQuantity = fromItem.quantity;
        const fromMetadata = fromItem.metadata;
        
        await this.removeItemFromInventory(fromSlot, fromQuantity);
        await this.removeItemFromInventory(toSlot, toItem.quantity);
        
        await this.addItemToInventory(toItem.entityType, toItem.quantity, toItem.metadata);
        await this.addItemToInventory(fromItem.entityType, fromQuantity, fromMetadata);

        return true;
    }

    async getInventorySize() {
        return this.inventorySlots;
    }

    async setInventorySize(size) {
        this.inventorySlots = size;
    }
} 