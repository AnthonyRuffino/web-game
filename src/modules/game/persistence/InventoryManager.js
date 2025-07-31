export class InventoryManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.database = persistenceManager.database;
        this.currentCharacterId = null;
        this.inventorySlots = 20; // Default inventory size
        this.inventoryCache = new Map(); // Cache for inventory items
    }

    setCurrentCharacter(characterId) {
        this.currentCharacterId = characterId;
        this.inventoryCache.clear();
    }

    async loadInventory() {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        // Use IPC call instead of direct database access
        const items = await window.electronAPI.dbGetInventoryContents(this.currentCharacterId);

        // Clear cache and populate with loaded items
        this.inventoryCache.clear();
        items.forEach(item => {
            this.inventoryCache.set(item.slot_index, {
                id: item.id,
                slotIndex: item.slot_index,
                type: item.type_name,
                quantity: item.quantity,
                metadata: item.metadata ? JSON.parse(item.metadata) : null,
                isPlaceable: item.is_placeable,
                canHarvestIntact: item.can_harvest_intact
            });
        });

        console.log('[InventoryManager] Loaded inventory with', items.length, 'items');
        return this.getInventoryArray();
    }

    getInventoryArray() {
        const inventory = new Array(this.inventorySlots).fill(null);
        for (const [slotIndex, item] of this.inventoryCache) {
            inventory[slotIndex] = item;
        }
        return inventory;
    }

    async addItemToInventory(entityType, quantity = 1, metadata = null) {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        // Find first empty slot
        const emptySlot = this.findEmptySlot();
        if (emptySlot === -1) {
            throw new Error('Inventory is full');
        }

        // Get entity type ID - for now, we'll use a simple mapping
        // TODO: Add proper entity type ID lookup via IPC
        const entityTypeIds = {
            'grass': 1,
            'tree': 2,
            'rock': 3,
            'wood_block': 4,
            'stone': 5,
            'tree_sapling': 6
        };

        const entityTypeId = entityTypeIds[entityType];
        if (!entityTypeId) {
            throw new Error(`Unknown entity type: ${entityType}`);
        }

        // Add item directly via IPC
        await window.electronAPI.dbAddItemToInventory(
            this.currentCharacterId,
            emptySlot,
            entityTypeId,
            quantity,
            metadata ? JSON.stringify(metadata) : null
        );

        // Update cache immediately
        this.inventoryCache.set(emptySlot, {
            id: null, // Will be set when persisted
            slotIndex: emptySlot,
            type: entityType,
            quantity: quantity,
            metadata: metadata,
            isPlaceable: false, // Will be updated from database
            canHarvestIntact: false // Will be updated from database
        });

        console.log(`[InventoryManager] Added ${quantity}x ${entityType} to slot ${emptySlot}`);
        return emptySlot;
    }

    async removeItemFromInventory(slotIndex, quantity = 1) {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        const item = this.inventoryCache.get(slotIndex);
        if (!item) {
            throw new Error(`No item in slot ${slotIndex}`);
        }

        if (quantity > item.quantity) {
            throw new Error(`Not enough items in slot ${slotIndex}`);
        }

        const newQuantity = item.quantity - quantity;
        
        if (newQuantity <= 0) {
            // Remove item completely
            await window.electronAPI.dbRemoveItemFromInventory(
                this.currentCharacterId,
                slotIndex,
                item.quantity
            );
            this.inventoryCache.delete(slotIndex);
        } else {
            // Update quantity
            await window.electronAPI.dbRemoveItemFromInventory(
                this.currentCharacterId,
                slotIndex,
                quantity
            );
            item.quantity = newQuantity;
        }

        console.log(`[InventoryManager] Removed ${quantity}x ${item.type} from slot ${slotIndex}`);
    }

    async moveItemInInventory(fromSlot, toSlot) {
        if (!this.currentCharacterId) {
            throw new Error('No current character set');
        }

        const fromItem = this.inventoryCache.get(fromSlot);
        const toItem = this.inventoryCache.get(toSlot);

        if (!fromItem) {
            throw new Error(`No item in slot ${fromSlot}`);
        }

        if (toItem && toItem.type !== fromItem.type) {
            throw new Error(`Cannot stack different item types`);
        }

        // Remove from source slot
        await this.removeItemFromInventory(fromSlot, fromItem.quantity);

        // Add to destination slot
        if (toItem) {
            // Stack with existing item
            await this.addItemToInventory(fromItem.type, fromItem.quantity, fromItem.metadata);
        } else {
            // Move to empty slot
            this.inventoryCache.set(toSlot, {
                ...fromItem,
                slotIndex: toSlot
            });
            
            // Update pending changes
            this.persistenceManager.changeTracker.trackInventoryChange(
                this.currentCharacterId,
                toSlot,
                fromItem.entityTypeId || 0,
                fromItem.quantity,
                fromItem.metadata ? JSON.stringify(fromItem.metadata) : null
            );
        }
    }

    findEmptySlot() {
        for (let i = 0; i < this.inventorySlots; i++) {
            if (!this.inventoryCache.has(i)) {
                return i;
            }
        }
        return -1; // No empty slots
    }

    getItemAtSlot(slotIndex) {
        return this.inventoryCache.get(slotIndex) || null;
    }

    async saveInventory() {
        // This will be called by the persistence manager during batch saves
        // The actual saving is handled by the change tracker
    }
} 