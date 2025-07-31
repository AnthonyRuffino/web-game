# Persistence System - Phase 1: Core Database Implementation

## Overview
Phase 1 establishes the foundational database infrastructure and basic persistence system. This phase focuses on creating the database schema, implementing core persistence classes, and setting up the basic transaction system.

## Prerequisites
- Existing game systems (World, EntityRenderer, AssetManager)
- Electron environment with SQLite support
- Basic understanding of the persistence system design (see `persistence-system-design.md`)

## Phase 1 Goals
- [x] Implement database schema and initialization
- [x] Create core persistence manager class
- [x] Implement basic world state tracking
- [x] Set up transaction batching system
- [x] Add database connection management

## Implementation Steps

### Step 1.1: Database Schema Implementation

#### 1.1.1 Create Database Initialization Module
**File**: `electron/src/modules/game/persistence/database.js`

```javascript
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = null;
    }

    async initialize() {
        // Get user data directory from Electron
        const userDataPath = await window.electronAPI.getAppPath();
        this.dbPath = path.join(userDataPath, 'game.db');
        
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.createTables();
        console.log('[DatabaseManager] Database initialized at:', this.dbPath);
    }

    async createTables() {
        // Worlds table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS worlds (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                seed INTEGER NOT NULL,
                world_width_in_chunks INTEGER NOT NULL,
                world_height_in_chunks INTEGER NOT NULL,
                chunk_edge_length_in_cells INTEGER NOT NULL,
                cell_edge_length_in_pixels INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Entity types table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS entity_types (
                id INTEGER PRIMARY KEY,
                type_name TEXT UNIQUE NOT NULL,
                is_placeable BOOLEAN DEFAULT FALSE,
                can_harvest_intact BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Characters table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY,
                world_id INTEGER REFERENCES worlds(id),
                name TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                experience INTEGER DEFAULT 0,
                position_x REAL,
                position_y REAL,
                last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Cell changes table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS cell_changes (
                id INTEGER PRIMARY KEY,
                world_id INTEGER REFERENCES worlds(id),
                chunk_x INTEGER NOT NULL,
                chunk_y INTEGER NOT NULL,
                cell_x INTEGER NOT NULL,
                cell_y INTEGER NOT NULL,
                world_x REAL NOT NULL,
                world_y REAL NOT NULL,
                UNIQUE(world_id, chunk_x, chunk_y, cell_x, cell_y)
            )
        `);

        // Cell entities table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS cell_entities (
                id INTEGER PRIMARY KEY,
                cell_changes_id INTEGER REFERENCES cell_changes(id),
                entity_type_id INTEGER REFERENCES entity_types(id),
                metadata TEXT
            )
        `);

        // Inventory table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS inventory_entities (
                id INTEGER PRIMARY KEY,
                character_id INTEGER REFERENCES characters(id),
                slot_index INTEGER NOT NULL,
                entity_type_id INTEGER REFERENCES entity_types(id),
                quantity INTEGER DEFAULT 1,
                metadata TEXT
            )
        `);

        // Create indexes for performance
        await this.createIndexes();
    }

    async createIndexes() {
        // Index for chunk-based queries
        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_cell_changes_chunk 
            ON cell_changes(world_id, chunk_x, chunk_y)
        `);

        // Index for cell-based queries
        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_cell_changes_cell 
            ON cell_changes(world_id, chunk_x, chunk_y, cell_x, cell_y)
        `);

        // Index for character inventory
        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_inventory_character 
            ON inventory_entities(character_id, slot_index)
        `);
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}
```

#### 1.1.2 Add Electron API Support for Database Path
**File**: `electron/preload.js` (add to existing electronAPI)

```javascript
// Add to existing electronAPI object
getAppPath: () => ipcRenderer.invoke('get-app-path'),
```

**File**: `electron/main.js` (ensure handler exists)

```javascript
// Ensure this handler exists
ipcMain.handle('get-app-path', () => {
    return app.getPath('userData');
});
```

### Step 1.2: Core Persistence Manager

#### 1.2.1 Create Persistence Manager Class
**File**: `electron/src/modules/game/persistence/PersistenceManager.js`

```javascript
import { DatabaseManager } from './database.js';

export class PersistenceManager {
    constructor() {
        this.database = new DatabaseManager();
        this.pendingChanges = new Map(); // Track changes before persistence
        this.batchSize = 100;
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        this.isInitialized = false;
    }

    async initialize() {
        await this.database.initialize();
        await this.initializeEntityTypes();
        this.startAutoSave();
        this.isInitialized = true;
        console.log('[PersistenceManager] Initialized');
    }

    async initializeEntityTypes() {
        // Insert default entity types if they don't exist
        const defaultTypes = [
            { type_name: 'grass', is_placeable: false, can_harvest_intact: false },
            { type_name: 'tree', is_placeable: false, can_harvest_intact: false },
            { type_name: 'rock', is_placeable: false, can_harvest_intact: true },
            { type_name: 'wood_block', is_placeable: true, can_harvest_intact: true }
        ];

        for (const entityType of defaultTypes) {
            await this.database.db.run(`
                INSERT OR IGNORE INTO entity_types (type_name, is_placeable, can_harvest_intact)
                VALUES (?, ?, ?)
            `, [entityType.type_name, entityType.is_placeable, entityType.can_harvest_intact]);
        }
    }

    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.savePendingChanges();
        }, this.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    async savePendingChanges() {
        if (this.pendingChanges.size === 0) return;

        try {
            await this.database.db.run('BEGIN TRANSACTION');
            
            // Process pending changes in batches
            const changes = Array.from(this.pendingChanges.values());
            for (let i = 0; i < changes.length; i += this.batchSize) {
                const batch = changes.slice(i, i + this.batchSize);
                await this.processBatch(batch);
            }

            await this.database.db.run('COMMIT');
            this.pendingChanges.clear();
            console.log('[PersistenceManager] Saved pending changes');
        } catch (error) {
            await this.database.db.run('ROLLBACK');
            console.error('[PersistenceManager] Error saving changes:', error);
        }
    }

    async processBatch(changes) {
        // Implementation will be added in Step 1.3
    }

    async shutdown() {
        this.stopAutoSave();
        await this.savePendingChanges();
        await this.database.close();
    }
}
```

### Step 1.3: Basic Transaction System

#### 1.3.1 Implement Change Tracking
**File**: `electron/src/modules/game/persistence/ChangeTracker.js`

```javascript
export class ChangeTracker {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.pendingChanges = new Map();
    }

    // Track cell modifications
    trackCellChange(worldId, chunkX, chunkY, cellX, cellY, worldX, worldY) {
        const key = `cell:${worldId}:${chunkX}:${chunkY}:${cellX}:${cellY}`;
        this.pendingChanges.set(key, {
            type: 'cell_change',
            worldId,
            chunkX,
            chunkY,
            cellX,
            cellY,
            worldX,
            worldY,
            timestamp: Date.now()
        });
    }

    // Track entity changes in cells
    trackCellEntity(cellChangeId, entityTypeId, metadata) {
        const key = `entity:${cellChangeId}:${entityTypeId}`;
        this.pendingChanges.set(key, {
            type: 'cell_entity',
            cellChangeId,
            entityTypeId,
            metadata,
            timestamp: Date.now()
        });
    }

    // Track inventory changes
    trackInventoryChange(characterId, slotIndex, entityTypeId, quantity, metadata) {
        const key = `inventory:${characterId}:${slotIndex}`;
        this.pendingChanges.set(key, {
            type: 'inventory',
            characterId,
            slotIndex,
            entityTypeId,
            quantity,
            metadata,
            timestamp: Date.now()
        });
    }

    // Get all pending changes
    getPendingChanges() {
        return Array.from(this.pendingChanges.values());
    }

    // Clear pending changes
    clearPendingChanges() {
        this.pendingChanges.clear();
    }
}
```

#### 1.3.2 Complete Batch Processing
**File**: `electron/src/modules/game/persistence/PersistenceManager.js` (update processBatch method)

```javascript
async processBatch(changes) {
    for (const change of changes) {
        switch (change.type) {
            case 'cell_change':
                await this.processCellChange(change);
                break;
            case 'cell_entity':
                await this.processCellEntity(change);
                break;
            case 'inventory':
                await this.processInventoryChange(change);
                break;
        }
    }
}

async processCellChange(change) {
    // Insert or update cell_changes record
    await this.database.db.run(`
        INSERT OR REPLACE INTO cell_changes 
        (world_id, chunk_x, chunk_y, cell_x, cell_y, world_x, world_y)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [change.worldId, change.chunkX, change.chunkY, change.cellX, change.cellY, change.worldX, change.worldY]);
}

async processCellEntity(change) {
    // Insert cell_entities record
    await this.database.db.run(`
        INSERT OR REPLACE INTO cell_entities 
        (cell_changes_id, entity_type_id, metadata)
        VALUES (?, ?, ?)
    `, [change.cellChangeId, change.entityTypeId, change.metadata]);
}

async processInventoryChange(change) {
    if (change.quantity <= 0) {
        // Remove item from inventory
        await this.database.db.run(`
            DELETE FROM inventory_entities 
            WHERE character_id = ? AND slot_index = ?
        `, [change.characterId, change.slotIndex]);
    } else {
        // Insert or update inventory item
        await this.database.db.run(`
            INSERT OR REPLACE INTO inventory_entities 
            (character_id, slot_index, entity_type_id, quantity, metadata)
            VALUES (?, ?, ?, ?, ?)
        `, [change.characterId, change.slotIndex, change.entityTypeId, change.quantity, change.metadata]);
    }
}
```

### Step 1.4: Integration with Game Systems

#### 1.4.1 Update Game Initialization
**File**: `electron/src/modules/game/index.js` (add to existing initialization)

```javascript
// Add to imports
import { PersistenceManager } from './persistence/PersistenceManager.js';

// Add to game initialization
async initializeGame() {
    // ... existing initialization code ...
    
    // Initialize persistence system
    this.persistenceManager = new PersistenceManager();
    await this.persistenceManager.initialize();
    
    // ... rest of initialization ...
}

// Add to cleanup
async cleanup() {
    if (this.persistenceManager) {
        await this.persistenceManager.shutdown();
    }
    // ... existing cleanup code ...
}
```

#### 1.4.2 Add Database Path to Electron API
**File**: `electron/preload.js` (ensure this exists)

```javascript
// Ensure this is in the electronAPI object
getAppPath: () => ipcRenderer.invoke('get-app-path'),
```

## Testing Phase 1

### Test Cases
1. **Database Creation**: Verify database file is created in correct location
2. **Schema Creation**: Verify all tables and indexes are created
3. **Entity Types**: Verify default entity types are inserted
4. **Transaction System**: Verify pending changes are tracked and saved
5. **Auto-Save**: Verify changes are persisted every 30 seconds

### Manual Testing Steps
1. Start the game and check console for database initialization messages
2. Verify database file exists in user data directory
3. Use SQLite browser to inspect created tables and data
4. Monitor console for auto-save messages

## Success Criteria
- [x] Database file created successfully in user data directory
- [x] All tables and indexes created without errors
- [x] Default entity types inserted correctly
- [x] Auto-save system working (console messages every 30 seconds)
- [x] No errors in console during normal gameplay
- [x] Database can be opened and inspected with SQLite browser

## Next Phase
Phase 2 will focus on implementing world state tracking and integrating with the existing World system. 