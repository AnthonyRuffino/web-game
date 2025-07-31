export class HarvestingManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.inventoryManager = persistenceManager.getInventoryManager();
    }

    async harvestEntity(entity, worldX, worldY) {
        if (!entity) {
            throw new Error('No entity provided for harvesting');
        }

        console.log(`[HarvestingManager] Harvesting ${entity.type} at (${worldX}, ${worldY})`);

        // Determine what the entity yields when harvested
        const yieldItems = this.getHarvestYield(entity);
        
        // Add items to inventory
        for (const yieldItem of yieldItems) {
            try {
                await this.inventoryManager.addItemToInventory(
                    yieldItem.type,
                    yieldItem.quantity,
                    yieldItem.metadata
                );
            } catch (error) {
                console.error(`[HarvestingManager] Failed to add ${yieldItem.type} to inventory:`, error);
                throw error;
            }
        }

        // Mark entity as removed from world
        const chunkX = Math.floor(worldX / (64 * 32)); // Assuming 64x64 chunks with 32px tiles
        const chunkY = Math.floor(worldY / (64 * 32));
        
        await this.persistenceManager.getCellStateManager().removeEntityFromCell(
            chunkX, chunkY, 
            Math.floor((worldX % (64 * 32)) / 32), 
            Math.floor((worldY % (64 * 32)) / 32), 
            entity.type
        );

        console.log(`[HarvestingManager] Successfully harvested ${entity.type}, yielded:`, yieldItems);
        return yieldItems;
    }

    getHarvestYield(entity) {
        // Define what each entity type yields when harvested
        const harvestRules = {
            'tree': [
                { type: 'wood_block', quantity: 2, metadata: { source: 'tree' } }
            ],
            'rock': [
                { type: 'stone', quantity: 1, metadata: { source: 'rock' } }
            ],
            'grass': [
                { type: 'grass', quantity: 1, metadata: { source: 'grass' } }
            ],
            'wood_block': [
                { type: 'wood_block', quantity: 1, metadata: { source: 'wood_block' } }
            ],
            'stone': [
                { type: 'stone', quantity: 1, metadata: { source: 'stone' } }
            ]
        };

        return harvestRules[entity.type] || [];
    }

    canHarvest(entity) {
        // Check if entity can be harvested
        const harvestableTypes = ['tree', 'rock', 'grass', 'wood_block', 'stone'];
        return harvestableTypes.includes(entity.type);
    }

    async placeEntityFromInventory(slotIndex, worldX, worldY) {
        const item = await this.inventoryManager.getItemInSlot(slotIndex);
        if (!item) {
            throw new Error(`No item in slot ${slotIndex}`);
        }

        // Check if the item is placeable
        const entityTypeInfo = await this.persistenceManager.getWorldManager().getEntityTypeInfo(item.entityType);
        if (!entityTypeInfo || !entityTypeInfo.is_placeable) {
            throw new Error(`${item.entityType} is not placeable`);
        }

        // Create entity for placement
        const entity = {
            type: item.entityType,
            x: worldX,
            y: worldY,
            metadata: item.metadata
        };

        // Add entity to world
        const chunkX = Math.floor(worldX / (64 * 32));
        const chunkY = Math.floor(worldY / (64 * 32));
        
        await this.persistenceManager.getCellStateManager().addEntityToCell(
            chunkX, chunkY,
            Math.floor((worldX % (64 * 32)) / 32),
            Math.floor((worldY % (64 * 32)) / 32),
            entity.type,
            entity.metadata
        );

        // Remove item from inventory
        await this.inventoryManager.removeItemFromInventory(slotIndex, 1);

        console.log(`[HarvestingManager] Placed ${item.entityType} at (${worldX}, ${worldY})`);
        return entity;
    }

    async findNearbyHarvestableEntities(playerX, playerY, radius = 50) {
        // This would typically query the world for entities within radius
        // For now, we'll return an empty array - this will be implemented
        // when we integrate with the actual world rendering system
        return [];
    }

    async getHarvestingStats() {
        // Return statistics about harvesting
        const inventory = await this.inventoryManager.getInventoryContents();
        
        const stats = {
            totalItems: 0,
            itemTypes: {},
            harvestableItems: 0
        };

        for (const item of inventory) {
            stats.totalItems += item.quantity;
            stats.itemTypes[item.entityType] = (stats.itemTypes[item.entityType] || 0) + item.quantity;
            
            if (this.canHarvest({ type: item.entityType })) {
                stats.harvestableItems += item.quantity;
            }
        }

        return stats;
    }
} 