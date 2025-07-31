# Persistence System - Phase 3: Inventory System

## Overview
Phase 3 implements the inventory system and entity harvesting mechanics. This phase focuses on creating a persistent inventory system, implementing entity harvesting (tree chopping, rock mining), connecting the world changes to inventory updates, and implementing player position persistence.

## Prerequisites
- Phase 1 completed (database infrastructure)
- Phase 2 completed (world integration)
- Understanding of entity harvesting mechanics

## Phase 3 Goals
- [ ] Implement persistent inventory system
- [ ] Create entity harvesting mechanics
- [ ] Implement inventory UI integration
- [ ] Add entity placement from inventory
- [ ] Implement harvest metadata tracking
- [ ] Implement player position persistence

## Implementation Steps

### Step 3.1: Inventory Management System

#### 3.1.1 Create Inventory Manager
**File**: `electron/src/modules/game/persistence/InventoryManager.js`

```javascript
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

        const items = await this.database.db.all(`
            SELECT ie.*, et.type_name, et.is_placeable, et.can_harvest_intact
            FROM inventory_entities ie
            JOIN entity_types et ON ie.entity_type_id = et.id
            WHERE ie.character_id = ?
            ORDER BY ie.slot_index
        `, [this.currentCharacterId]);

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

        // Get entity type ID
        const entityTypeRecord = await this.database.db.get(`
            SELECT id FROM entity_types WHERE type_name = ?
        `, [entityType]);

        if (!entityTypeRecord) {
            throw new Error(`Unknown entity type: ${entityType}`);
        }

        // Add to pending changes
        this.persistenceManager.changeTracker.trackInventoryChange(
            this.currentCharacterId,
            emptySlot,
            entityTypeRecord.id,
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
            this.persistenceManager.changeTracker.trackInventoryChange(
                this.currentCharacterId,
                slotIndex,
                null,
                0,
                null
            );
            this.inventoryCache.delete(slotIndex);
        } else {
            // Update quantity
            this.persistenceManager.changeTracker.trackInventoryChange(
                this.currentCharacterId,
                slotIndex,
                item.entityTypeId || 0, // Will be resolved during persistence
                newQuantity,
                item.metadata ? JSON.stringify(item.metadata) : null
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
```

#### 3.1.2 Update Persistence Manager
**File**: `electron/src/modules/game/persistence/PersistenceManager.js` (add InventoryManager)

```javascript
import { InventoryManager } from './InventoryManager.js';

export class PersistenceManager {
    constructor() {
        // ... existing constructor code ...
        this.inventoryManager = new InventoryManager(this);
    }

    // Add getter for inventory manager
    getInventoryManager() {
        return this.inventoryManager;
    }
}
```

### Step 3.2: Entity Harvesting System

#### 3.2.1 Create Harvesting Manager
**File**: `electron/src/modules/game/persistence/HarvestingManager.js`

```javascript
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
```

#### 3.2.2 Update Persistence Manager
**File**: `electron/src/modules/game/persistence/PersistenceManager.js` (add HarvestingManager)

```javascript
import { HarvestingManager } from './HarvestingManager.js';

export class PersistenceManager {
    constructor() {
        // ... existing constructor code ...
        this.harvestingManager = new HarvestingManager(this);
    }

    // Add getter for harvesting manager
    getHarvestingManager() {
        return this.harvestingManager;
    }
}
```

### Step 3.3: Game Integration

#### 3.3.1 Update Game Class
**File**: `electron/src/modules/game/index.js` (add inventory and harvesting integration)

```javascript
export class Game {
    constructor() {
        // ... existing constructor code ...
        this.inventoryManager = null;
        this.harvestingManager = null;
    }

    async initializeGame() {
        // ... existing initialization code ...
        
        // Initialize persistence system
        this.persistenceManager = new PersistenceManager();
        await this.persistenceManager.initialize();
        
        // Create persistent world
        this.world = new PersistentWorld(this.persistenceManager);
        
        // Initialize managers
        this.inventoryManager = this.persistenceManager.getInventoryManager();
        this.harvestingManager = this.persistenceManager.getHarvestingManager();
        this.harvestingManager.setWorld(this.world);
        
        // Initialize world
        await this.initializeWorld();
        
        // Load inventory for current character
        await this.inventoryManager.loadInventory();
        
        // ... rest of initialization ...
    }

    async initializeWorld() {
        // ... existing world initialization code ...
        
        // Set current character in inventory manager
        this.inventoryManager.setCurrentCharacter(this.world.currentCharacterId);
    }

    // Add harvesting method
    async harvestEntity(entity, tool = null) {
        if (!this.player) {
            console.warn('[Game] No player found for harvesting');
            return false;
        }

        const playerPosition = { x: this.player.x, y: this.player.y };
        return await this.harvestingManager.harvestEntity(entity, playerPosition, tool);
    }

    // Add entity placement method
    async placeEntityFromInventory(slotIndex, worldPosition) {
        return await this.harvestingManager.placeEntityFromInventory(slotIndex, worldPosition);
    }

    // Add inventory access methods
    getInventory() {
        return this.inventoryManager.getInventoryArray();
    }

    async addItemToInventory(entityType, quantity = 1, metadata = null) {
        return await this.inventoryManager.addItemToInventory(entityType, quantity, metadata);
    }

    async removeItemFromInventory(slotIndex, quantity = 1) {
        return await this.inventoryManager.removeItemFromInventory(slotIndex, quantity);
    }
}
```

### Step 3.4: Input Integration

#### 3.4.1 Add Harvesting Input
**File**: `electron/src/modules/game/input.js` (add harvesting input handling)

```javascript
export class InputManager {
    constructor() {
        // ... existing constructor code ...
        this.harvestingEnabled = true;
    }

    // Add to existing input handling
    handleKeyDown(event) {
        // ... existing key handling ...

        // Add harvesting key (H key)
        if (event.key === 'h' || event.key === 'H') {
            this.triggerHarvesting();
        }
    }

    triggerHarvesting() {
        if (!this.harvestingEnabled || !window.game) {
            return;
        }

        // Get player position
        const player = window.game.player;
        if (!player) {
            return;
        }

        // Find nearby entities
        const nearbyEntities = this.findNearbyEntities(player.x, player.y, 50);
        
        if (nearbyEntities.length > 0) {
            // Harvest the closest entity
            const closestEntity = nearbyEntities[0];
            window.game.harvestEntity(closestEntity);
        } else {
            console.log('[InputManager] No entities nearby to harvest');
        }
    }

    findNearbyEntities(playerX, playerY, radius) {
        if (!window.game || !window.game.world) {
            return [];
        }

        const nearbyEntities = [];
        const playerChunk = window.game.world.worldToChunk(playerX, playerY);
        
        // Check entities in current chunk and adjacent chunks
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const chunkX = playerChunk.x + dx;
                const chunkY = playerChunk.y + dy;
                
                try {
                    const chunk = window.game.world.loadChunk(chunkX, chunkY);
                    if (chunk && chunk.entities) {
                        chunk.entities.forEach(entity => {
                            const distance = Math.sqrt(
                                Math.pow(entity.x - playerX, 2) + 
                                Math.pow(entity.y - playerY, 2)
                            );
                            
                            if (distance <= radius) {
                                nearbyEntities.push({
                                    entity: entity,
                                    distance: distance
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.warn('[InputManager] Error loading chunk for harvesting:', error);
                }
            }
        }

        // Sort by distance
        nearbyEntities.sort((a, b) => a.distance - b.distance);
        
        return nearbyEntities.map(item => item.entity);
    }
}
```

### Step 3.5: Player Position Persistence

#### 3.5.1 Implement Player Position Saving
**File**: `electron/src/modules/game/index.js` (add position saving)

```javascript
export class Game {
    constructor() {
        // ... existing constructor code ...
        this.lastPositionSave = 0;
        this.positionSaveInterval = 5000; // Save position every 5 seconds
    }

    async initializeGame() {
        // ... existing initialization code ...
        
        // Load player position from database
        await this.loadPlayerPosition();
        
        // ... rest of initialization ...
    }

    async loadPlayerPosition() {
        if (!this.world || !this.world.currentCharacterId) {
            return;
        }

        try {
            const character = await this.persistenceManager.getWorldManager().loadCharacter(this.world.currentCharacterId);
            if (character && character.position_x !== null && character.position_y !== null) {
                this.player.x = character.position_x;
                this.player.y = character.position_y;
                console.log('[Game] Loaded player position:', this.player.x, this.player.y);
            }
        } catch (error) {
            console.warn('[Game] Failed to load player position:', error);
        }
    }

    async savePlayerPosition() {
        if (!this.world || !this.world.currentCharacterId || !this.player) {
            return;
        }

        const now = Date.now();
        if (now - this.lastPositionSave < this.positionSaveInterval) {
            return; // Don't save too frequently
        }

        try {
            await this.persistenceManager.getWorldManager().saveCharacterPosition(
                this.world.currentCharacterId,
                this.player.x,
                this.player.y
            );
            this.lastPositionSave = now;
        } catch (error) {
            console.error('[Game] Failed to save player position:', error);
        }
    }

    // Add to game loop
    update() {
        // ... existing update code ...
        
        // Save player position periodically
        this.savePlayerPosition();
        
        // ... rest of update code ...
    }
}
```

### Step 3.6: UI Integration

#### 3.5.1 Create Inventory UI Component
**File**: `electron/src/modules/game/ui/InventoryUI.js`

```javascript
export class InventoryUI {
    constructor(game) {
        this.game = game;
        this.element = null;
        this.isVisible = false;
        this.createUI();
    }

    createUI() {
        this.element = document.createElement('div');
        this.element.id = 'inventory-ui';
        this.element.className = 'inventory-panel';
        this.element.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #666;
            border-radius: 8px;
            padding: 20px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 1000;
            display: none;
        `;

        this.element.innerHTML = `
            <h3>Inventory</h3>
            <div id="inventory-slots" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top: 10px;"></div>
            <button id="close-inventory" style="margin-top: 10px; padding: 5px 10px;">Close</button>
        `;

        document.body.appendChild(this.element);

        // Add event listeners
        document.getElementById('close-inventory').addEventListener('click', () => {
            this.hide();
        });

        // Add keyboard shortcut (I key)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'i' || event.key === 'I') {
                this.toggle();
            }
        });
    }

    show() {
        this.updateInventory();
        this.element.style.display = 'block';
        this.isVisible = true;
    }

    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateInventory() {
        const inventory = this.game.getInventory();
        const slotsContainer = document.getElementById('inventory-slots');
        
        slotsContainer.innerHTML = '';
        
        for (let i = 0; i < inventory.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.style.cssText = `
                width: 50px;
                height: 50px;
                border: 1px solid #666;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            `;

            const item = inventory[i];
            if (item) {
                slot.innerHTML = `
                    <div style="font-size: 12px;">${item.type}</div>
                    <div style="font-size: 10px; color: #ccc;">${item.quantity}</div>
                `;
                
                if (item.isPlaceable) {
                    slot.style.borderColor = '#4CAF50';
                }
                
                // Add click handler for placement
                slot.addEventListener('click', () => {
                    this.handleSlotClick(i, item);
                });
            } else {
                slot.innerHTML = `<div style="font-size: 10px; color: #666;">${i}</div>`;
            }
            
            slotsContainer.appendChild(slot);
        }
    }

    handleSlotClick(slotIndex, item) {
        if (!item) {
            return;
        }

        if (item.isPlaceable) {
            // Enable placement mode
            this.enablePlacementMode(slotIndex, item);
        } else {
            console.log(`[InventoryUI] ${item.type} is not placeable`);
        }
    }

    enablePlacementMode(slotIndex, item) {
        console.log(`[InventoryUI] Placement mode enabled for ${item.type} in slot ${slotIndex}`);
        
        // Add visual indicator
        document.body.style.cursor = 'crosshair';
        
        // Add click handler for world placement
        const placementHandler = async (event) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Convert screen coordinates to world coordinates
            const worldPos = window.game.camera.screenToWorld(x, y);
            
            try {
                await window.game.placeEntityFromInventory(slotIndex, worldPos);
                this.updateInventory();
                console.log(`[InventoryUI] Placed ${item.type} at world position:`, worldPos);
            } catch (error) {
                console.error('[InventoryUI] Failed to place entity:', error);
            }
            
            // Disable placement mode
            this.disablePlacementMode();
        };
        
        document.addEventListener('click', placementHandler, { once: true });
        
        // Store handler for cleanup
        this.currentPlacementHandler = placementHandler;
    }

    disablePlacementMode() {
        document.body.style.cursor = 'default';
        if (this.currentPlacementHandler) {
            document.removeEventListener('click', this.currentPlacementHandler);
            this.currentPlacementHandler = null;
        }
    }
}
```

#### 3.5.2 Integrate Inventory UI
**File**: `electron/src/modules/game/index.js` (add inventory UI)

```javascript
import { InventoryUI } from './ui/InventoryUI.js';

export class Game {
    constructor() {
        // ... existing constructor code ...
        this.inventoryUI = null;
    }

    async initializeGame() {
        // ... existing initialization code ...
        
        // Initialize inventory UI
        this.inventoryUI = new InventoryUI(this);
        
        // ... rest of initialization ...
    }
}
```

## Testing Phase 3

### Test Cases
1. **Inventory Loading**: Verify inventory loads correctly for character
2. **Item Addition**: Verify items can be added to inventory
3. **Item Removal**: Verify items can be removed from inventory
4. **Entity Harvesting**: Verify entities can be harvested and yield items
5. **Entity Placement**: Verify items can be placed from inventory
6. **Harvest Metadata**: Verify harvest metadata is preserved
7. **Inventory UI**: Verify inventory UI displays correctly

### Manual Testing Steps
1. Start game and open inventory (I key)
2. Harvest entities (H key near trees/rocks)
3. Check inventory for harvested items
4. Place items from inventory (click on placeable items)
5. Verify items persist after game restart

## Success Criteria
- [ ] Inventory system works correctly with persistence
- [ ] Entity harvesting yields appropriate items
- [ ] Items can be placed from inventory
- [ ] Harvest metadata is preserved
- [ ] Inventory UI is functional and responsive
- [ ] All changes persist across game sessions
- [ ] No performance issues during harvesting/placement
- [ ] Player position is saved and loaded correctly

## Next Phase
Phase 4 will focus on advanced features like entity modification, image config persistence, and performance optimizations. 