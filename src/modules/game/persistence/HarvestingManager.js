export class HarvestingManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.inventoryManager = persistenceManager.getInventoryManager();
        this.world = null; // Will be set by game
        this.tools = new Map(); // Track player's tools
        this.skills = new Map(); // Track player's skills
    }

    setWorld(world) {
        this.world = world;
    }

    // Add tool to player's inventory
    addTool(toolType) {
        this.tools.set(toolType, true);
        console.log(`[HarvestingManager] Added tool: ${toolType}`);
    }

    // Remove tool from player's inventory
    removeTool(toolType) {
        this.tools.delete(toolType);
        console.log(`[HarvestingManager] Removed tool: ${toolType}`);
    }

    // Check if player has a specific tool
    hasTool(toolType) {
        return this.tools.has(toolType);
    }

    // Add skill level
    addSkill(skillType, level) {
        this.skills.set(skillType, level);
        console.log(`[HarvestingManager] Added skill: ${skillType} level ${level}`);
    }

    // Get skill level
    getSkillLevel(skillType) {
        return this.skills.get(skillType) || 0;
    }

    // Define harvesting rules
    getHarvestingRules() {
        return {
            tree: {
                tool: 'axe',
                skill: 'woodcutting',
                baseYield: [
                    { type: 'wood_block', quantity: 2, chance: 1.0 },
                    { type: 'tree_sapling', quantity: 1, chance: 0.1 }
                ],
                skillBonus: {
                    woodcutting: {
                        1: { quantity: 1, chance: 0.1 },
                        5: { quantity: 1, chance: 0.2 },
                        10: { quantity: 1, chance: 0.3 }
                    }
                },
                harvestIntact: false,
                harvestTime: 2000
            },
            rock: {
                tool: 'pickaxe',
                skill: 'mining',
                baseYield: [
                    { type: 'stone', quantity: 1, chance: 1.0 },
                    { type: 'rock', quantity: 1, chance: 0.3 }
                ],
                skillBonus: {
                    mining: {
                        1: { quantity: 1, chance: 0.1 },
                        5: { quantity: 1, chance: 0.2 },
                        10: { quantity: 1, chance: 0.3 }
                    }
                },
                harvestIntact: true,
                harvestTime: 1500
            },
            grass: {
                tool: null,
                skill: 'gathering',
                baseYield: [
                    { type: 'grass', quantity: 1, chance: 1.0 }
                ],
                skillBonus: {
                    gathering: {
                        1: { quantity: 1, chance: 0.2 },
                        5: { quantity: 1, chance: 0.4 },
                        10: { quantity: 1, chance: 0.6 }
                    }
                },
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
        if (entityRules.tool && !this.hasTool(entityRules.tool)) {
            console.warn(`[HarvestingManager] Need ${entityRules.tool} to harvest ${entity.type}`);
            return false;
        }

        // Get skill level
        const skillLevel = this.getSkillLevel(entityRules.skill);

        // Calculate yields with skill bonuses
        const yields = [];
        
        // Base yields
        for (const yieldItem of entityRules.baseYield) {
            if (Math.random() < yieldItem.chance) {
                yields.push({
                    type: yieldItem.type,
                    quantity: yieldItem.quantity
                });
            }
        }

        // Skill bonus yields
        if (entityRules.skillBonus && entityRules.skillBonus[entityRules.skill]) {
            const skillBonuses = entityRules.skillBonus[entityRules.skill];
            for (const [level, bonus] of Object.entries(skillBonuses)) {
                if (skillLevel >= parseInt(level)) {
                    if (Math.random() < bonus.chance) {
                        yields.push({
                            type: 'wood_block', // Could be configurable
                            quantity: bonus.quantity
                        });
                    }
                }
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
                    playerPosition: playerPosition,
                    skillLevel: skillLevel,
                    skillType: entityRules.skill
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
        
        // Calculate cell coordinates within the chunk
        const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        
        // Get the chunk and remove the entity from it
        try {
            const chunk = this.world.loadChunk(chunkX, chunkY);
            if (chunk && chunk.entities) {
                const entityIndex = chunk.entities.findIndex(e => 
                    e.x === entity.x && e.y === entity.y && e.type === entity.type
                );
                if (entityIndex !== -1) {
                    chunk.entities.splice(entityIndex, 1);
                    console.log(`[HarvestingManager] Removed ${entity.type} from chunk (${chunkX}, ${chunkY})`);
                    
                    // Persist the cell change to the database
                    if (this.persistenceManager && this.world.currentWorldId) {
                        await this.persistenceManager.markCellModified(
                            this.world.currentWorldId,
                            chunkX,
                            chunkY,
                            cellX,
                            cellY,
                            entity.x,
                            entity.y
                        );
                        console.log(`[HarvestingManager] Persisted cell change for ${entity.type} at (${cellX}, ${cellY})`);
                    }
                } else {
                    console.warn(`[HarvestingManager] Could not find ${entity.type} to remove from chunk`);
                }
            }
        } catch (error) {
            console.error(`[HarvestingManager] Failed to remove entity from world:`, error);
        }

        // Gain skill experience
        this.gainSkillExperience(entityRules.skill, 1);

        console.log(`[HarvestingManager] Successfully harvested ${entity.type} with skill level ${skillLevel}, got:`, yields);
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

    gainSkillExperience(skillType, amount) {
        const currentLevel = this.getSkillLevel(skillType);
        const newLevel = Math.min(10, currentLevel + amount); // Cap at level 10
        this.addSkill(skillType, newLevel);
        
        if (newLevel > currentLevel) {
            console.log(`[HarvestingManager] ${skillType} skill increased to level ${newLevel}!`);
        }
    }
} 