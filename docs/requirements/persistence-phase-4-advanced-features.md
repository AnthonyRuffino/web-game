# Persistence System - Phase 4: Advanced Features

## Overview
Phase 4 implements advanced features and optimizations for the persistence system. This phase focuses on entity modification capabilities, image config persistence, performance optimizations, and preparing for future enhancements like multi-cell entities and advanced harvesting mechanics.

## Prerequisites
- Phase 1 completed (database infrastructure)
- Phase 2 completed (world integration)
- Phase 3 completed (inventory system)
- Understanding of entity modification and image config systems

## Phase 4 Goals
- [ ] Implement entity modification system
- [ ] Add image config persistence and rendering
- [ ] Implement performance optimizations
- [ ] Add advanced harvesting mechanics
- [ ] Prepare for multi-cell entity support
- [ ] Add backup and recovery systems

## Implementation Steps

### Step 4.1: Entity Modification System

#### 4.1.1 Create Entity Modification Manager
**File**: `electron/src/modules/game/persistence/EntityModificationManager.js`

```javascript
export class EntityModificationManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.database = persistenceManager.database;
        this.world = null;
    }

    setWorld(world) {
        this.world = world;
    }

    // Modify entity's image configuration
    async modifyEntityImageConfig(entity, newImageConfig) {
        if (!this.world) {
            throw new Error('World not set in EntityModificationManager');
        }

        // Validate image config
        const validatedConfig = this.validateImageConfig(newImageConfig);
        if (!validatedConfig) {
            throw new Error('Invalid image configuration');
        }

        // Get entity's cell coordinates
        const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
        const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);

        // Mark cell as modified
        const worldX = chunkX * this.world.config.chunkSize * this.world.config.tileSize + cellX * this.world.config.tileSize;
        const worldY = chunkY * this.world.config.chunkSize * this.world.config.tileSize + cellY * this.world.config.tileSize;
        
        await this.world.cellStateManager.markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY);

        // Create metadata with image config
        const metadata = {
            image_config: validatedConfig,
            modification_time: Date.now(),
            modifier: 'player' // Could be 'wizard', 'system', etc.
        };

        // Add entity with modified config
        await this.world.cellStateManager.addEntityToCell(
            chunkX, chunkY, cellX, cellY, entity.type, metadata
        );

        console.log(`[EntityModificationManager] Modified image config for ${entity.type} at cell (${cellX}, ${cellY})`);
        return true;
    }

    validateImageConfig(imageConfig) {
        const requiredFields = ['size', 'fixedScreenAngle', 'drawOffsetX', 'drawOffsetY'];
        const optionalFields = ['customImageData'];

        // Check required fields
        for (const field of requiredFields) {
            if (imageConfig[field] === undefined || imageConfig[field] === null) {
                console.error(`[EntityModificationManager] Missing required field: ${field}`);
                return null;
            }
        }

        // Validate data types and ranges
        if (typeof imageConfig.size !== 'number' || imageConfig.size <= 0) {
            console.error('[EntityModificationManager] Invalid size value');
            return null;
        }

        if (typeof imageConfig.fixedScreenAngle !== 'number') {
            console.error('[EntityModificationManager] Invalid fixedScreenAngle value');
            return null;
        }

        if (typeof imageConfig.drawOffsetX !== 'number' || typeof imageConfig.drawOffsetY !== 'number') {
            console.error('[EntityModificationManager] Invalid draw offset values');
            return null;
        }

        // Validate custom image data if present
        if (imageConfig.customImageData && typeof imageConfig.customImageData !== 'string') {
            console.error('[EntityModificationManager] Invalid custom image data');
            return null;
        }

        return imageConfig;
    }

    // Reset entity to default configuration
    async resetEntityToDefault(entity) {
        if (!this.world) {
            throw new Error('World not set in EntityModificationManager');
        }

        // Get entity's cell coordinates
        const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
        const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);

        // Mark cell as modified (this will remove custom modifications)
        const worldX = chunkX * this.world.config.chunkSize * this.world.config.tileSize + cellX * this.world.config.tileSize;
        const worldY = chunkY * this.world.config.chunkSize * this.world.config.tileSize + cellY * this.world.config.tileSize;
        
        await this.world.cellStateManager.markCellModified(chunkX, chunkY, cellX, cellY, worldX, worldY);

        // Add entity without custom metadata (will use default config)
        await this.world.cellStateManager.addEntityToCell(
            chunkX, chunkY, cellX, cellY, entity.type, null
        );

        console.log(`[EntityModificationManager] Reset ${entity.type} to default config at cell (${cellX}, ${cellY})`);
        return true;
    }

    // Get entity's current configuration
    async getEntityConfiguration(entity) {
        if (!this.world) {
            throw new Error('World not set in EntityModificationManager');
        }

        const chunkX = Math.floor(entity.x / (this.world.config.chunkSize * this.world.config.tileSize));
        const chunkY = Math.floor(entity.y / (this.world.config.chunkSize * this.world.config.tileSize));
        const cellX = Math.floor((entity.x - chunkX * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);
        const cellY = Math.floor((entity.y - chunkY * this.world.config.chunkSize * this.world.config.tileSize) / this.world.config.tileSize);

        const cellState = await this.world.cellStateManager.loadCellState(chunkX, chunkY, cellX, cellY);
        
        if (!cellState || cellState.entities.length === 0) {
            // Entity uses default configuration
            return this.getDefaultConfiguration(entity.type);
        }

        // Find the specific entity
        const entityData = cellState.entities.find(e => e.type === entity.type);
        if (!entityData || !entityData.metadata) {
            return this.getDefaultConfiguration(entity.type);
        }

        return entityData.metadata.image_config || this.getDefaultConfiguration(entity.type);
    }

    getDefaultConfiguration(entityType) {
        // Return default configurations for each entity type
        const defaults = {
            tree: {
                size: 48,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            },
            rock: {
                size: 20,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            },
            grass: {
                size: 32,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            },
            wood_block: {
                size: 32,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            }
        };

        return defaults[entityType] || {
            size: 32,
            fixedScreenAngle: 0,
            drawOffsetX: 0,
            drawOffsetY: 0
        };
    }
}
```

#### 4.1.2 Update Persistence Manager
**File**: `electron/src/modules/game/persistence/PersistenceManager.js` (add EntityModificationManager)

```javascript
import { EntityModificationManager } from './EntityModificationManager.js';

export class PersistenceManager {
    constructor() {
        // ... existing constructor code ...
        this.entityModificationManager = new EntityModificationManager(this);
    }

    // Add getter for entity modification manager
    getEntityModificationManager() {
        return this.entityModificationManager;
    }
}
```

### Step 4.2: Image Config Rendering Integration

#### 4.2.1 Update Entity Renderer
**File**: `electron/src/modules/game/entityRenderer.js` (add image config support)

```javascript
export class EntityRenderer {
    // ... existing code ...

    // Update entity rendering to use custom image configs
    renderEntity(ctx, entity, playerAngle) {
        // Get custom image config if available
        let imageConfig = null;
        if (window.game && window.game.persistenceManager) {
            const modificationManager = window.game.persistenceManager.getEntityModificationManager();
            if (modificationManager) {
                imageConfig = modificationManager.getEntityConfiguration(entity);
            }
        }

        // Use custom config or entity's default config
        const config = imageConfig || entity.imageConfig || this.getDefaultEntityConfig(entity.type);

        // Apply custom image if available
        if (imageConfig && imageConfig.customImageData) {
            this.renderCustomImage(ctx, entity, config);
        } else {
            // Use default rendering with custom config
            this.renderDefaultEntity(ctx, entity, config, playerAngle);
        }
    }

    renderCustomImage(ctx, entity, config) {
        const img = new Image();
        img.onload = () => {
            ctx.save();
            
            // Apply transformations
            ctx.translate(entity.x, entity.y);
            if (config.fixedScreenAngle !== null) {
                ctx.rotate(config.fixedScreenAngle);
            }
            
            // Apply offsets
            const offsetX = config.drawOffsetX || 0;
            const offsetY = config.drawOffsetY || 0;
            
            // Draw image
            ctx.drawImage(
                img,
                -config.size / 2 + offsetX,
                -config.size / 2 + offsetY,
                config.size,
                config.size
            );
            
            ctx.restore();
        };
        img.src = config.customImageData;
    }

    renderDefaultEntity(ctx, entity, config, playerAngle) {
        // Existing rendering logic with custom config applied
        ctx.save();
        
        ctx.translate(entity.x, entity.y);
        
        // Apply custom angle or default
        const angle = config.fixedScreenAngle !== null ? config.fixedScreenAngle : playerAngle;
        ctx.rotate(angle);
        
        // Apply custom size
        const size = config.size || entity.size || 32;
        
        // Apply custom offsets
        const offsetX = config.drawOffsetX || 0;
        const offsetY = config.drawOffsetY || 0;
        
        // Render based on entity type with custom size
        switch (entity.type) {
            case 'tree':
                this.renderTree(ctx, size, offsetX, offsetY);
                break;
            case 'rock':
                this.renderRock(ctx, size, offsetX, offsetY);
                break;
            case 'grass':
                this.renderGrass(ctx, size, offsetX, offsetY);
                break;
            case 'wood_block':
                this.renderWoodBlock(ctx, size, offsetX, offsetY);
                break;
            default:
                // Use entity's own draw method if available
                if (entity.draw) {
                    entity.draw(ctx, playerAngle);
                }
        }
        
        ctx.restore();
    }

    getDefaultEntityConfig(entityType) {
        const defaults = {
            tree: { size: 48, fixedScreenAngle: 0, drawOffsetX: 0, drawOffsetY: 0 },
            rock: { size: 20, fixedScreenAngle: 0, drawOffsetX: 0, drawOffsetY: 0 },
            grass: { size: 32, fixedScreenAngle: 0, drawOffsetX: 0, drawOffsetY: 0 },
            wood_block: { size: 32, fixedScreenAngle: 0, drawOffsetX: 0, drawOffsetY: 0 }
        };
        return defaults[entityType] || { size: 32, fixedScreenAngle: 0, drawOffsetX: 0, drawOffsetY: 0 };
    }

    // Add rendering methods for custom sizes
    renderTree(ctx, size, offsetX, offsetY) {
        // Tree rendering with custom size
        const trunkWidth = size * 0.25;
        const foliageRadius = size * 0.5;
        
        // Draw trunk
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(-trunkWidth/2 + offsetX, -size/2 + offsetY, trunkWidth, size * 0.6);
        
        // Draw foliage
        ctx.fillStyle = '#1B5E20';
        ctx.beginPath();
        ctx.arc(offsetX, -size/2 + foliageRadius + offsetY, foliageRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    renderRock(ctx, size, offsetX, offsetY) {
        // Rock rendering with custom size
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add texture
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, size/3, 0, Math.PI * 2);
        ctx.stroke();
    }

    renderGrass(ctx, size, offsetX, offsetY) {
        // Grass rendering with custom size
        const bladeCount = 5;
        const bladeLength = size * 0.3;
        
        ctx.strokeStyle = '#81C784';
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI - Math.PI/2;
            const x1 = offsetX;
            const y1 = offsetY;
            const x2 = offsetX + Math.cos(angle) * bladeLength;
            const y2 = offsetY + Math.sin(angle) * bladeLength;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    renderWoodBlock(ctx, size, offsetX, offsetY) {
        // Wood block rendering
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/2 + offsetX, -size/2 + offsetY, size, size);
        
        // Add wood grain
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const y = -size/2 + offsetY + (i + 1) * size/4;
            ctx.beginPath();
            ctx.moveTo(-size/2 + offsetX, y);
            ctx.lineTo(size/2 + offsetX, y);
            ctx.stroke();
        }
    }
}
```

### Step 4.3: Advanced Harvesting Mechanics

#### 4.3.1 Enhanced Harvesting Manager
**File**: `electron/src/modules/game/persistence/HarvestingManager.js` (update with advanced features)

```javascript
export class HarvestingManager {
    constructor(persistenceManager) {
        // ... existing constructor code ...
        this.tools = new Map(); // Track player's tools
        this.skills = new Map(); // Track player's skills
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

    // Enhanced harvesting rules with tools and skills
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

    // Enhanced harvesting with tools and skills
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

        // Check distance
        const distance = Math.sqrt(
            Math.pow(entity.x - playerPosition.x, 2) + 
            Math.pow(entity.y - playerPosition.y, 2)
        );

        if (distance > 50) {
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

        // Add items to inventory with enhanced metadata
        for (const yieldItem of yields) {
            try {
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
        
        await this.world.markEntityRemoved(entity, chunkX, chunkY);

        // Gain skill experience
        this.gainSkillExperience(entityRules.skill, 1);

        console.log(`[HarvestingManager] Successfully harvested ${entity.type} with skill level ${skillLevel}, got:`, yields);
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
```

### Step 4.4: Performance Optimizations

#### 4.4.1 Database Query Optimization
**File**: `electron/src/modules/game/persistence/database.js` (add performance optimizations)

```javascript
export class DatabaseManager {
    // ... existing code ...

    async createPerformanceIndexes() {
        // Additional indexes for performance
        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_cell_changes_world_chunk 
            ON cell_changes(world_id, chunk_x, chunk_y, cell_x, cell_y)
        `);

        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_cell_entities_changes 
            ON cell_entities(cell_changes_id)
        `);

        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_inventory_character_slot 
            ON inventory_entities(character_id, slot_index)
        `);

        // Analyze tables for query optimization
        await this.db.exec('ANALYZE');
    }

    async optimizeDatabase() {
        // Vacuum database to reclaim space
        await this.db.exec('VACUUM');
        
        // Update statistics
        await this.db.exec('ANALYZE');
        
        console.log('[DatabaseManager] Database optimized');
    }

    // Batch operations for better performance
    async batchInsertCellChanges(changes) {
        if (changes.length === 0) return;

        const placeholders = changes.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
        const values = changes.flatMap(change => [
            change.worldId, change.chunkX, change.chunkY, 
            change.cellX, change.cellY, change.worldX, change.worldY
        ]);

        await this.db.run(`
            INSERT OR REPLACE INTO cell_changes 
            (world_id, chunk_x, chunk_y, cell_x, cell_y, world_x, world_y)
            VALUES ${placeholders}
        `, values);
    }

    async batchInsertCellEntities(entities) {
        if (entities.length === 0) return;

        const placeholders = entities.map(() => '(?, ?, ?)').join(', ');
        const values = entities.flatMap(entity => [
            entity.cellChangesId, entity.entityTypeId, entity.metadata
        ]);

        await this.db.run(`
            INSERT OR REPLACE INTO cell_entities 
            (cell_changes_id, entity_type_id, metadata)
            VALUES ${placeholders}
        `, values);
    }
}
```

#### 4.4.2 Caching System
**File**: `electron/src/modules/game/persistence/CacheManager.js`

```javascript
export class CacheManager {
    constructor() {
        this.cellStateCache = new Map();
        this.inventoryCache = new Map();
        this.entityConfigCache = new Map();
        this.maxCacheSize = 1000;
        this.cacheTimeout = 300000; // 5 minutes
    }

    // Cell state caching
    getCellState(key) {
        const cached = this.cellStateCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cellStateCache.delete(key);
        return null;
    }

    setCellState(key, data) {
        this.cellStateCache.set(key, {
            data: data,
            timestamp: Date.now()
        });

        // Implement LRU eviction
        if (this.cellStateCache.size > this.maxCacheSize) {
            const oldestKey = this.cellStateCache.keys().next().value;
            this.cellStateCache.delete(oldestKey);
        }
    }

    clearCellStateCache() {
        this.cellStateCache.clear();
    }

    // Inventory caching
    getInventory(characterId) {
        const cached = this.inventoryCache.get(characterId);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.inventoryCache.delete(characterId);
        return null;
    }

    setInventory(characterId, data) {
        this.inventoryCache.set(characterId, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearInventoryCache(characterId) {
        if (characterId) {
            this.inventoryCache.delete(characterId);
        } else {
            this.inventoryCache.clear();
        }
    }

    // Entity configuration caching
    getEntityConfig(entityId) {
        const cached = this.entityConfigCache.get(entityId);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.entityConfigCache.delete(entityId);
        return null;
    }

    setEntityConfig(entityId, data) {
        this.entityConfigCache.set(entityId, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Cache statistics
    getCacheStats() {
        return {
            cellStateCacheSize: this.cellStateCache.size,
            inventoryCacheSize: this.inventoryCache.size,
            entityConfigCacheSize: this.entityConfigCache.size,
            totalCacheSize: this.cellStateCache.size + this.inventoryCache.size + this.entityConfigCache.size
        };
    }

    // Clear all caches
    clearAllCaches() {
        this.cellStateCache.clear();
        this.inventoryCache.clear();
        this.entityConfigCache.clear();
    }
}
```

### Step 4.5: Backup and Recovery Systems

#### 4.5.1 Backup Manager
**File**: `electron/src/modules/game/persistence/BackupManager.js`

```javascript
import { DatabaseManager } from './database.js';

export class BackupManager {
    constructor(databaseManager) {
        this.databaseManager = databaseManager;
        this.backupInterval = 300000; // 5 minutes
        this.maxBackups = 10;
        this.backupTimer = null;
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = this.databaseManager.dbPath.replace('.db', `_backup_${timestamp}.db`);
            
            // Create backup using SQLite backup API
            const backupDb = await this.databaseManager.openDatabase(backupPath);
            
            await this.databaseManager.db.backup(backupDb);
            await backupDb.close();
            
            console.log(`[BackupManager] Created backup: ${backupPath}`);
            
            // Clean up old backups
            await this.cleanupOldBackups();
            
            return backupPath;
        } catch (error) {
            console.error('[BackupManager] Failed to create backup:', error);
            return null;
        }
    }

    async restoreBackup(backupPath) {
        try {
            // Close current database
            await this.databaseManager.close();
            
            // Copy backup to main database
            const fs = require('fs');
            fs.copyFileSync(backupPath, this.databaseManager.dbPath);
            
            // Reopen database
            await this.databaseManager.initialize();
            
            console.log(`[BackupManager] Restored from backup: ${backupPath}`);
            return true;
        } catch (error) {
            console.error('[BackupManager] Failed to restore backup:', error);
            return false;
        }
    }

    async cleanupOldBackups() {
        try {
            const fs = require('fs');
            const path = require('path');
            
            const backupDir = path.dirname(this.databaseManager.dbPath);
            const backupFiles = fs.readdirSync(backupDir)
                .filter(file => file.includes('_backup_') && file.endsWith('.db'))
                .map(file => ({
                    path: path.join(backupDir, file),
                    timestamp: fs.statSync(path.join(backupDir, file)).mtime.getTime()
                }))
                .sort((a, b) => b.timestamp - a.timestamp);

            // Remove old backups beyond max count
            for (let i = this.maxBackups; i < backupFiles.length; i++) {
                fs.unlinkSync(backupFiles[i].path);
                console.log(`[BackupManager] Removed old backup: ${backupFiles[i].path}`);
            }
        } catch (error) {
            console.error('[BackupManager] Failed to cleanup old backups:', error);
        }
    }

    startAutomaticBackups() {
        this.backupTimer = setInterval(() => {
            this.createBackup();
        }, this.backupInterval);
        
        console.log('[BackupManager] Automatic backups started');
    }

    stopAutomaticBackups() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
            console.log('[BackupManager] Automatic backups stopped');
        }
    }

    async getBackupList() {
        try {
            const fs = require('fs');
            const path = require('path');
            
            const backupDir = path.dirname(this.databaseManager.dbPath);
            const backupFiles = fs.readdirSync(backupDir)
                .filter(file => file.includes('_backup_') && file.endsWith('.db'))
                .map(file => {
                    const filePath = path.join(backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created);

            return backupFiles;
        } catch (error) {
            console.error('[BackupManager] Failed to get backup list:', error);
            return [];
        }
    }
}
```

### Step 4.6: Multi-Cell Entity Preparation

#### 4.6.1 Multi-Cell Entity Manager
**File**: `electron/src/modules/game/persistence/MultiCellEntityManager.js`

```javascript
export class MultiCellEntityManager {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.database = persistenceManager.database;
    }

    // Define multi-cell entity types
    getMultiCellEntityTypes() {
        return {
            building: {
                width: 3,
                height: 2,
                primaryCell: { x: 1, y: 0 }, // Primary cell for entity data
                collisionCells: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }
                ]
            },
            large_tree: {
                width: 2,
                height: 2,
                primaryCell: { x: 0, y: 0 },
                collisionCells: [
                    { x: 0, y: 0 }, { x: 1, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }
                ]
            }
        };
    }

    // Create multi-cell entity
    async createMultiCellEntity(entityType, worldPosition, worldId) {
        const entityConfig = this.getMultiCellEntityTypes()[entityType];
        if (!entityConfig) {
            throw new Error(`Unknown multi-cell entity type: ${entityType}`);
        }

        // Calculate chunk and cell coordinates for primary position
        const chunkX = Math.floor(worldPosition.x / (64 * 32));
        const chunkY = Math.floor(worldPosition.y / (64 * 32));
        const cellX = Math.floor((worldPosition.x - chunkX * 64 * 32) / 32) % 64;
        const cellY = Math.floor((worldPosition.y - chunkY * 64 * 32) / 32) % 64;

        // Mark all affected cells as modified
        for (const cellOffset of entityConfig.collisionCells) {
            const affectedCellX = cellX + cellOffset.x;
            const affectedCellY = cellY + cellOffset.y;
            const affectedChunkX = chunkX + Math.floor(affectedCellX / 64);
            const affectedChunkY = chunkY + Math.floor(affectedCellY / 64);
            const localCellX = affectedCellX % 64;
            const localCellY = affectedCellY % 64;

            const worldX = affectedChunkX * 64 * 32 + localCellX * 32;
            const worldY = affectedChunkY * 64 * 32 + localCellY * 32;

            // Mark cell as modified
            this.persistenceManager.changeTracker.trackCellChange(
                worldId, affectedChunkX, affectedChunkY, localCellX, localCellY, worldX, worldY
            );
        }

        // Store multi-cell entity data in primary cell
        const primaryCellX = cellX + entityConfig.primaryCell.x;
        const primaryCellY = cellY + entityConfig.primaryCell.y;
        const primaryChunkX = chunkX + Math.floor(primaryCellX / 64);
        const primaryChunkY = chunkY + Math.floor(primaryCellY / 64);
        const localPrimaryCellX = primaryCellX % 64;
        const localPrimaryCellY = primaryCellY % 64;

        const metadata = {
            multiCellEntity: {
                type: entityType,
                width: entityConfig.width,
                height: entityConfig.height,
                primaryCell: entityConfig.primaryCell,
                collisionCells: entityConfig.collisionCells,
                worldPosition: worldPosition
            }
        };

        // Add entity to primary cell
        this.persistenceManager.changeTracker.trackCellEntity(
            'pending', // Will be resolved during batch processing
            0, // entityTypeId - will be resolved
            JSON.stringify(metadata)
        );

        console.log(`[MultiCellEntityManager] Created ${entityType} at position:`, worldPosition);
    }

    // Check if position is occupied by multi-cell entity
    async isPositionOccupied(worldPosition, worldId) {
        const chunkX = Math.floor(worldPosition.x / (64 * 32));
        const chunkY = Math.floor(worldPosition.y / (64 * 32));
        const cellX = Math.floor((worldPosition.x - chunkX * 64 * 32) / 32) % 64;
        const cellY = Math.floor((worldPosition.y - chunkY * 64 * 32) / 32) % 64;

        const cellState = await this.persistenceManager.cellStateManager.loadCellState(
            chunkX, chunkY, cellX, cellY
        );

        if (!cellState || cellState.entities.length === 0) {
            return false;
        }

        // Check if any entity in this cell is a multi-cell entity
        for (const entity of cellState.entities) {
            if (entity.metadata && entity.metadata.multiCellEntity) {
                return true;
            }
        }

        return false;
    }
}
```

## Testing Phase 4

### Test Cases
1. **Entity Modification**: Verify entities can be modified and changes persist
2. **Image Config Rendering**: Verify custom image configs render correctly
3. **Advanced Harvesting**: Verify tool and skill systems work
4. **Performance**: Verify optimizations improve performance
5. **Backup System**: Verify backup and restore functionality
6. **Multi-Cell Preparation**: Verify multi-cell entity infrastructure

### Manual Testing Steps
1. Modify entity image configs and verify persistence
2. Test advanced harvesting with different tools and skill levels
3. Monitor performance during extended gameplay
4. Create and restore database backups
5. Test multi-cell entity creation (when implemented)

## Success Criteria
- [ ] Entity modifications persist correctly
- [ ] Custom image configs render properly
- [ ] Advanced harvesting mechanics work
- [ ] Performance is acceptable during extended gameplay
- [ ] Backup and restore systems function correctly
- [ ] Multi-cell entity infrastructure is ready
- [ ] All features integrate seamlessly with existing systems

## Future Enhancements
- **Multi-Cell Entities**: Full implementation of large entities
- **Advanced AI**: NPC entities with persistent state
- **Quest System**: Persistent quest tracking
- **Crafting System**: Complex crafting with persistent recipes
- **Economy System**: Persistent currency and trading
- **Achievement System**: Persistent achievement tracking

## Conclusion
Phase 4 completes the advanced features of the persistence system, providing a robust foundation for future game enhancements while maintaining performance and reliability. 