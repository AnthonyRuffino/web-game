export class HarvestingManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.inventoryManager = persistenceManager.getInventoryManager();
        this.world = null; // Will be set by game
    }

    setWorld(world) {
        this.world = world;
    }

    // Define harvesting rules
    getHarvestingRules() {
        return {
            tree: {
                tool: 'axe',
                yield: [
                    { type: 'wood_block', quantity: 2, chance: 1.0 },
                    { type: 'tree_sapling', quantity: 1, chance: 0.1 }
                ],
                harvestIntact: false,
                harvestTime: 2000 // milliseconds
            },
            rock: {
                tool: 'pickaxe',
                yield: [
                    { type: 'stone', quantity: 1, chance: 1.0 },
                    { type: 'rock', quantity: 1, chance: 0.3 } // Intact rock
                ],
                harvestIntact: true,
                harvestTime: 1500
            },
            grass: {
                tool: null,
                yield: [
                    { type: 'grass', quantity: 1, chance: 1.0 }
                ],
                harvestIntact: false,
                harvestTime: 500
            }
        };
    }

    async harvestEntity(entity, playerPosition, tool = null) {
        if (!this.world || !this.inventoryManager) {
            throw new Error('Harvesting system not properly initialized');
        }

        const rules = this.getHarvestingRules();
        const entityRules = rules[entity.type];

        if (!entityRules) {
            console.warn(`[HarvestingManager] No harvesting rules for entity type: ${entity.type}`);
            return false;
        }

        // Check if player is close enough
        const distance = Math.sqrt(
            Math.pow(entity.x - playerPosition.x, 2) + 
            Math.pow(entity.y - playerPosition.y, 2)
        );

        if (distance > 50) { // 50 pixel interaction range
            console.warn('[HarvestingManager] Entity too far away for harvesting');
            return false;
        }

        // Check tool requirements
        if (entityRules.tool && tool !== entityRules.tool) {
            console.warn(`[HarvestingManager] Need ${entityRules.tool} to harvest ${entity.type}`);
            return false;
        }

        // Calculate yields
        const yields = [];
        for (const yieldItem of entityRules.yield) {
            if (Math.random() < yieldItem.chance) {
                yields.push({
                    type: yieldItem.type,
                    quantity: yieldItem.quantity
                });
            }
        }

        if (yields.length === 0) {
            console.log(`[HarvestingManager] No yields from harvesting ${entity.type}`);
            return false;
        }

        // Add items to inventory
        for (const yieldItem of yields) {
            try {
                // Create harvest metadata
                const harvestMetadata = {
                    sourceEntity: entity.type,
                    sourcePosition: { x: entity.x, y: entity.y },
                    harvestTime: Date.now(),
                    tool: tool,
                    playerPosition: playerPosition
                };

                await this.inventoryManager.addItemToInventory(
                    yieldItem.type, 
                    yieldItem.quantity, 
                    harvestMetadata
                );
            } catch (error) {
                console.error(`[HarvestingManager] Failed to add ${yieldItem.type} to inventory:`, error);
                return false;
            }
        }

        // Remove entity from world
        const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
        
        await this.world.markEntityRemoved(entity, chunkX, chunkY);

        console.log(`[HarvestingManager] Successfully harvested ${entity.type}, got:`, yields);
        return true;
    }

    async placeEntityFromInventory(slotIndex, worldPosition) {
        if (!this.world || !this.inventoryManager) {
            throw new Error('Harvesting system not properly initialized');
        }

        const item = this.inventoryManager.getItemAtSlot(slotIndex);
        if (!item) {
            throw new Error(`No item in slot ${slotIndex}`);
        }

        if (!item.isPlaceable) {
            throw new Error(`${item.type} is not placeable`);
        }

        // Create entity at world position
        const entity = {
            x: worldPosition.x,
            y: worldPosition.y,
            type: item.type,
            metadata: item.metadata
        };

        // Add entity-specific properties
        switch (item.type) {
            case 'wood_block':
                entity.collision = true;
                entity.collisionRadius = 16;
                break;
            case 'rock':
                entity.collision = true;
                entity.collisionRadius = 12;
                break;
        }

        // Add entity to world
        const chunkX = Math.floor(worldPosition.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(worldPosition.y / (this.world.config.chunkSize * this.world.config.tileSize));
        
        await this.world.addEntityToWorld(entity, chunkX, chunkY);

        // Remove item from inventory
        await this.inventoryManager.removeItemFromInventory(slotIndex, 1);

        console.log(`[HarvestingManager] Placed ${item.type} at position:`, worldPosition);
        return true;
    }
} 