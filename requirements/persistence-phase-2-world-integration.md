# Persistence System - Phase 2: World Integration

## Overview
Phase 2 integrates the persistence system with the existing World system to track world state changes. This phase focuses on connecting the procedural world generation with the database persistence, implementing world creation/loading, and tracking cell modifications.

## Prerequisites
- Phase 1 completed (database infrastructure)
- Existing World system (see `ui/legacy/core/world.js`)
- Understanding of procedural generation vs. persistence

## Phase 2 Goals
- [ ] Implement world creation and loading
- [ ] Integrate with existing World system
- [ ] Implement cell modification tracking
- [ ] Add world state querying capabilities
- [ ] Implement lazy chunk loading with persistence

## Implementation Steps

### Step 2.1: World Management System

#### 2.1.1 Create World Manager
**File**: `electron/src/modules/game/persistence/WorldManager.js`

```javascript
import { DatabaseManager } from './database.js';

export class WorldManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.database = persistenceManager.database;
        this.currentWorld = null;
        this.currentCharacter = null;
    }

    async createWorld(worldConfig) {
        // Create world record in database
        const result = await this.database.db.run(`
            INSERT INTO worlds (
                name, seed, world_width_in_chunks, world_height_in_chunks,
                chunk_edge_length_in_cells, cell_edge_length_in_pixels
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            worldConfig.name,
            worldConfig.seed,
            worldConfig.chunkCount,
            worldConfig.chunkCount,
            worldConfig.chunkSize,
            worldConfig.tileSize
        ]);

        const worldId = result.lastID;
        console.log('[WorldManager] Created world with ID:', worldId);

        // Create default character for this world
        const characterId = await this.createCharacter(worldId, 'Player');

        return {
            worldId,
            characterId,
            config: worldConfig
        };
    }

    async loadWorld(worldId) {
        // Load world configuration from database
        const world = await this.database.db.get(`
            SELECT * FROM worlds WHERE id = ?
        `, [worldId]);

        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        // Convert database format to WORLD_CONFIG format
        const worldConfig = {
            name: world.name,
            seed: world.seed,
            chunkCount: world.world_width_in_chunks,
            chunkSize: world.chunk_edge_length_in_cells,
            tileSize: world.cell_edge_length_in_pixels,
            // Add other WORLD_CONFIG properties with defaults
            biomePlainsFraction: 0.5,
            grass: {
                baseChance: 0.01,
                hashSalt: 0,
                variationMod: 200,
                variationDiv: 1000,
                minChance: 0.01,
                maxChance: 1,
                hashLabel: 'grass'
            },
            tree: {
                baseChance: 0.025,
                hashSalt: 10000,
                variationMod: 150,
                variationDiv: 1000,
                minChance: 0.01,
                maxChance: 0.04,
                hashLabel: 'tree'
            },
            rock: {
                baseChance: 0.015,
                hashSalt: 20000,
                variationMod: 100,
                variationDiv: 1000,
                minChance: 0.005,
                maxChance: 0.025,
                hashLabel: 'rock'
            },
            keepDistance: 1
        };

        this.currentWorld = { id: worldId, config: worldConfig };
        console.log('[WorldManager] Loaded world:', worldConfig.name);

        return worldConfig;
    }

    async createCharacter(worldId, name) {
        const result = await this.database.db.run(`
            INSERT INTO characters (world_id, name, position_x, position_y)
            VALUES (?, ?, ?, ?)
        `, [worldId, name, 0, 0]); // Default position

        const characterId = result.lastID;
        console.log('[WorldManager] Created character with ID:', characterId);
        return characterId;
    }

    async loadCharacter(characterId) {
        const character = await this.database.db.get(`
            SELECT * FROM characters WHERE id = ?
        `, [characterId]);

        if (!character) {
            throw new Error(`Character with ID ${characterId} not found`);
        }

        this.currentCharacter = character;
        console.log('[WorldManager] Loaded character:', character.name);
        return character;
    }

    async saveCharacterPosition(characterId, x, y) {
        await this.database.db.run(`
            UPDATE characters 
            SET position_x = ?, position_y = ?, last_saved = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [x, y, characterId]);
    }

    async getWorlds() {
        return await this.database.db.all(`
            SELECT id, name, seed, created_at FROM worlds
            ORDER BY created_at DESC
        `);
    }

    async getCharacters(worldId) {
        return await this.database.db.all(`
            SELECT id, name, level, experience, last_saved FROM characters
            WHERE world_id = ?
            ORDER BY created_at DESC
        `, [worldId]);
    }
}
```

#### 2.1.2 Update Persistence Manager
**File**: `electron/src/modules/game/persistence/PersistenceManager.js` (add WorldManager)

```javascript
import { WorldManager } from './WorldManager.js';

export class PersistenceManager {
    constructor() {
        // ... existing constructor code ...
        this.worldManager = new WorldManager(this);
    }

    async initialize() {
        await this.database.initialize();
        await this.initializeEntityTypes();
        this.startAutoSave();
        this.isInitialized = true;
        console.log('[PersistenceManager] Initialized');
    }

    // Add getter for world manager
    getWorldManager() {
        return this.worldManager;
    }
}
```

### Step 2.2: Cell State Tracking

#### 2.2.1 Create Cell State Manager
**File**: `electron/src/modules/game/persistence/CellStateManager.js`

```javascript
export class CellStateManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.database = persistenceManager.database;
        this.currentWorldId = null;
        this.loadedCellStates = new Map(); // Cache for loaded cell states
    }

    setCurrentWorld(worldId) {
        this.currentWorldId = worldId;
        this.loadedCellStates.clear();
    }

    // Convert world coordinates to chunk and cell coordinates
    worldToChunkAndCell(worldX, worldY, chunkSize, tileSize) {
        const tileX = Math.floor(worldX / tileSize);
        const tileY = Math.floor(worldY / tileSize);
        const chunkX = Math.floor(tileX / chunkSize);
        const chunkY = Math.floor(tileY / chunkSize);
        const cellX = tileX % chunkSize;
        const cellY = tileY % chunkSize;
        
        return { chunkX, chunkY, cellX, cellY };
    }

    // Load cell state for a specific cell
    async loadCellState(chunkX, chunkY, cellX, cellY) {
        if (!this.currentWorldId) {
            throw new Error('No current world set');
        }

        const cacheKey = `${chunkX},${chunkY},${cellX},${cellY}`;
        
        // Check cache first
        if (this.loadedCellStates.has(cacheKey)) {
            return this.loadedCellStates.get(cacheKey);
        }

        // Load from database
        const cellChange = await this.database.db.get(`
            SELECT * FROM cell_changes 
            WHERE world_id = ? AND chunk_x = ? AND chunk_y = ? AND cell_x = ? AND cell_y = ?
        `, [this.currentWorldId, chunkX, chunkY, cellX, cellY]);

        if (!cellChange) {
            // No changes recorded for this cell
            this.loadedCellStates.set(cacheKey, null);
            return null;
        }

        // Load entities for this cell
        const entities = await this.database.db.all(`
            SELECT ce.*, et.type_name 
            FROM cell_entities ce
            JOIN entity_types et ON ce.entity_type_id = et.id
            WHERE ce.cell_changes_id = ?
        `, [cellChange.id]);

        const cellState = {
            cellChange,
            entities: entities.map(e => ({
                id: e.id,
                type: e.type_name,
                metadata: e.metadata ? JSON.parse(e.metadata) : null
            }))
        };

        this.loadedCellStates.set(cacheKey, cellState);
        return cellState;
    }

    // Load all cell states for a chunk
    async loadChunkCellStates(chunkX, chunkY) {
        if (!this.currentWorldId) {
            throw new Error('No current world set');
        }

        const cellChanges = await this.database.db.all(`
            SELECT * FROM cell_changes 
            WHERE world_id = ? AND chunk_x = ? AND chunk_y = ?
        `, [this.currentWorldId, chunkX, chunkY]);

        const chunkStates = new Map();

        for (const cellChange of cellChanges) {
            const entities = await this.database.db.all(`
                SELECT ce.*, et.type_name 
                FROM cell_entities ce
                JOIN entity_types et ON ce.entity_type_id = et.id
                WHERE ce.cell_changes_id = ?
            `, [cellChange.id]);

            const cellKey = `${cellChange.cell_x},${cellChange.cell_y}`;
            chunkStates.set(cellKey, {
                cellChange,
                entities: entities.map(e => ({
                    id: e.id,
                    type: e.type_name,
                    metadata: e.metadata ? JSON.parse(e.metadata) : null
                }))
            });
        }

        return chunkStates;
    }

    // Mark cell as modified (called when cell state changes)
    async markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY) {
        if (!this.currentWorldId) {
            throw new Error('No current world set');
        }

        // Add to pending changes
        this.persistenceManager.changeTracker.trackCellChange(
            this.currentWorldId, chunkX, chunkY, cellX, cellY, worldX, worldY
        );

        // Update cache
        const cacheKey = `${chunkX},${chunkY},${cellX},${cellY}`;
        this.loadedCellStates.delete(cacheKey);
    }

    // Add entity to cell
    async addEntityToCell(chunkX, chunkY, cellX, cellY, entityType, metadata = null) {
        if (!this.currentWorldId) {
            throw new Error('No current world set');
        }

        // Get entity type ID
        const entityTypeRecord = await this.database.db.get(`
            SELECT id FROM entity_types WHERE type_name = ?
        `, [entityType]);

        if (!entityTypeRecord) {
            throw new Error(`Unknown entity type: ${entityType}`);
        }

        // Mark cell as modified first
        const worldX = chunkX * 64 * 32 + cellX * 32; // Calculate world coordinates
        const worldY = chunkY * 64 * 32 + cellY * 32;
        await this.markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY);

        // Add entity change to pending changes
        // Note: We'll need to get the cell_change_id after the cell change is persisted
        // For now, we'll use a placeholder and update it during batch processing
        this.persistenceManager.changeTracker.trackCellEntity(
            'pending', // Will be updated during batch processing
            entityTypeRecord.id,
            metadata ? JSON.stringify(metadata) : null
        );
    }

    // Remove entity from cell
    async removeEntityFromCell(chunkX, chunkY, cellX, cellY, entityType) {
        if (!this.currentWorldId) {
            throw new Error('No current world set');
        }

        // Mark cell as modified
        const worldX = chunkX * 64 * 32 + cellX * 32;
        const worldY = chunkY * 64 * 32 + cellY * 32;
        await this.markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY);

        // For removal, we don't add a cell_entity record
        // The cell will be marked as modified but empty
    }

    // Clear cache for a specific chunk
    clearChunkCache(chunkX, chunkY) {
        const keysToDelete = [];
        for (const key of this.loadedCellStates.keys()) {
            if (key.startsWith(`${chunkX},${chunkY}`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.loadedCellStates.delete(key));
    }
}
```

#### 2.2.2 Update Persistence Manager with Cell State Manager
**File**: `electron/src/modules/game/persistence/PersistenceManager.js` (add CellStateManager)

```javascript
import { CellStateManager } from './CellStateManager.js';

export class PersistenceManager {
    constructor() {
        // ... existing constructor code ...
        this.cellStateManager = new CellStateManager(this);
    }

    // Add getter for cell state manager
    getCellStateManager() {
        return this.cellStateManager;
    }
}
```

### Step 2.3: World System Integration

#### 2.3.1 Create Enhanced World Class
**File**: `electron/src/modules/game/persistence/PersistentWorld.js`

```javascript
import { World } from '../world.js';

export class PersistentWorld extends World {
    constructor(persistenceManager) {
        super();
        this.persistenceManager = persistenceManager;
        this.cellStateManager = persistenceManager.getCellStateManager();
        this.worldManager = persistenceManager.getWorldManager();
        this.currentWorldId = null;
        this.currentCharacterId = null;
    }

    async initializeWithPersistence(worldId, characterId) {
        // Load world configuration from database
        const worldConfig = await this.worldManager.loadWorld(worldId);
        
        // Set world configuration
        this.setConfig(worldConfig);
        
        // Set current world in cell state manager
        this.cellStateManager.setCurrentWorld(worldId);
        
        // Load character
        const character = await this.worldManager.loadCharacter(characterId);
        
        this.currentWorldId = worldId;
        this.currentCharacterId = characterId;
        
        console.log('[PersistentWorld] Initialized with world ID:', worldId, 'character ID:', characterId);
    }

    // Override loadChunk to integrate with persistence
    async loadChunk(chunkX, chunkY) {
        const chunk = await super.loadChunk(chunkX, chunkY);
        
        // Load persisted changes for this chunk
        const persistedStates = await this.cellStateManager.loadChunkCellStates(chunkX, chunkY);
        
        // Apply persisted changes to chunk
        this.applyPersistedChangesToChunk(chunk, persistedStates);
        
        return chunk;
    }

    applyPersistedChangesToChunk(chunk, persistedStates) {
        if (!persistedStates || persistedStates.size === 0) {
            return; // No changes to apply
        }

        // Create a map of entities by cell position
        const entitiesByCell = new Map();
        chunk.entities.forEach(entity => {
            const cellX = Math.floor((entity.x - chunk.worldX) / this.config.tileSize) % this.config.chunkSize;
            const cellY = Math.floor((entity.y - chunk.worldY) / this.config.tileSize) % this.config.chunkSize;
            const cellKey = `${cellX},${cellY}`;
            
            if (!entitiesByCell.has(cellKey)) {
                entitiesByCell.set(cellKey, []);
            }
            entitiesByCell.get(cellKey).push(entity);
        });

        // Apply persisted changes
        for (const [cellKey, cellState] of persistedStates) {
            const [cellX, cellY] = cellKey.split(',').map(Number);
            
            if (cellState.entities.length === 0) {
                // Cell should be empty - remove all entities from this cell
                const entitiesToRemove = entitiesByCell.get(cellKey) || [];
                entitiesToRemove.forEach(entity => {
                    const index = chunk.entities.indexOf(entity);
                    if (index > -1) {
                        chunk.entities.splice(index, 1);
                    }
                });
            } else {
                // Replace entities in this cell with persisted entities
                const entitiesToRemove = entitiesByCell.get(cellKey) || [];
                entitiesToRemove.forEach(entity => {
                    const index = chunk.entities.indexOf(entity);
                    if (index > -1) {
                        chunk.entities.splice(index, 1);
                    }
                });

                // Add persisted entities
                cellState.entities.forEach(persistedEntity => {
                    const worldX = chunk.worldX + cellX * this.config.tileSize + this.config.tileSize / 2;
                    const worldY = chunk.worldY + cellY * this.config.tileSize + this.config.tileSize / 2;
                    
                    const entity = this.createEntityFromPersistedData(persistedEntity, worldX, worldY);
                    if (entity) {
                        chunk.entities.push(entity);
                    }
                });
            }
        }
    }

    createEntityFromPersistedData(persistedEntity, worldX, worldY) {
        // Create entity based on type and metadata
        const entity = {
            x: worldX,
            y: worldY,
            type: persistedEntity.type,
            metadata: persistedEntity.metadata
        };

        // Apply metadata if present
        if (persistedEntity.metadata) {
            if (persistedEntity.metadata.image_config) {
                // Apply custom image configuration
                Object.assign(entity, persistedEntity.metadata.image_config);
            }
        }

        // Add entity-specific properties
        switch (persistedEntity.type) {
            case 'tree':
                entity.collision = true;
                entity.collisionRadius = 18;
                break;
            case 'rock':
                entity.collision = true;
                entity.collisionRadius = 12;
                break;
            case 'wood_block':
                entity.collision = true;
                entity.collisionRadius = 16;
                break;
        }

        return entity;
    }

    // Method to mark entity as removed (for harvesting, etc.)
    async markEntityRemoved(entity, chunkX, chunkY) {
        const cellX = Math.floor((entity.x - chunkX * this.config.chunkSize * this.config.tileSize) / this.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.config.chunkSize * this.config.tileSize) / this.config.tileSize);
        
        await this.cellStateManager.removeEntityFromCell(chunkX, chunkY, cellX, cellY, entity.type);
    }

    // Method to add entity to world (for placement, etc.)
    async addEntityToWorld(entity, chunkX, chunkY) {
        const cellX = Math.floor((entity.x - chunkX * this.config.chunkSize * this.config.tileSize) / this.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.config.chunkSize * this.config.tileSize) / this.config.tileSize);
        
        const metadata = {};
        if (entity.size || entity.fixedScreenAngle || entity.drawOffsetX || entity.drawOffsetY) {
            metadata.image_config = {
                size: entity.size,
                fixedScreenAngle: entity.fixedScreenAngle,
                drawOffsetX: entity.drawOffsetX,
                drawOffsetY: entity.drawOffsetY
            };
        }
        
        await this.cellStateManager.addEntityToCell(chunkX, chunkY, cellX, cellY, entity.type, metadata);
    }
}
```

### Step 2.4: Game Integration

#### 2.4.1 Update Game Initialization
**File**: `electron/src/modules/game/index.js` (update to use PersistentWorld)

```javascript
import { PersistentWorld } from './persistence/PersistentWorld.js';

export class Game {
    constructor() {
        // ... existing constructor code ...
        this.world = null; // Will be set to PersistentWorld
    }

    async initializeGame() {
        // ... existing initialization code ...
        
        // Initialize persistence system first
        this.persistenceManager = new PersistenceManager();
        await this.persistenceManager.initialize();
        
        // Create persistent world
        this.world = new PersistentWorld(this.persistenceManager);
        
        // For now, create a default world or load existing
        await this.initializeWorld();
        
        // ... rest of initialization ...
    }

    async initializeWorld() {
        // Check if we have existing worlds
        const worlds = await this.persistenceManager.getWorldManager().getWorlds();
        
        if (worlds.length === 0) {
            // Create new world
            const worldConfig = {
                name: "My World",
                seed: 12345,
                chunkCount: 64,
                chunkSize: 64,
                tileSize: 32
            };
            
            const { worldId, characterId } = await this.persistenceManager.getWorldManager().createWorld(worldConfig);
            await this.world.initializeWithPersistence(worldId, characterId);
        } else {
            // Load first world and character
            const worldId = worlds[0].id;
            const characters = await this.persistenceManager.getWorldManager().getCharacters(worldId);
            const characterId = characters[0].id;
            
            await this.world.initializeWithPersistence(worldId, characterId);
        }
    }
}
```

## Testing Phase 2

### Test Cases
1. **World Creation**: Verify new worlds are created in database
2. **World Loading**: Verify existing worlds load correctly
3. **Chunk Loading**: Verify chunks load with persisted changes
4. **Entity Persistence**: Verify entity changes are tracked
5. **Cell State Management**: Verify cell states are cached and updated

### Manual Testing Steps
1. Start game and verify world is created/loaded
2. Check database for world and character records
3. Move around world and verify chunks load correctly
4. Monitor console for persistence messages

## Success Criteria
- [ ] Worlds can be created and loaded from database
- [ ] Chunks load with persisted changes applied
- [ ] Entity modifications are tracked in database
- [ ] Cell state caching works correctly
- [ ] No performance degradation during normal gameplay
- [ ] Database queries are efficient (sub-100ms)

## Next Phase
Phase 3 will focus on implementing the inventory system and entity harvesting mechanics. 