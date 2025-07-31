import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { app } from 'electron';

export class DatabaseService {
    constructor() {
        this.db = null;
        this.dbPath = null;
    }

    async initialize() {
        try {
            const userDataPath = app.getPath('userData');
            this.dbPath = path.join(userDataPath, 'game.db');
            
            console.log(`[DatabaseService] Initializing database at: ${this.dbPath}`);
            
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });

            await this.createTables();
            await this.createIndexes();
            await this.migrateDatabase();
            
            console.log('[DatabaseService] Database initialized successfully');
            return true;
        } catch (error) {
            console.error('[DatabaseService] Failed to initialize database:', error);
            throw error;
        }
    }

    async createTables() {
        // Create worlds table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS worlds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                seed INTEGER NOT NULL,
                chunk_size INTEGER NOT NULL DEFAULT 64,
                tile_size INTEGER NOT NULL DEFAULT 32,
                chunk_count INTEGER NOT NULL DEFAULT 64,
                biome_plains_fraction REAL NOT NULL DEFAULT 0.5,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create entity_types table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS entity_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type_name TEXT UNIQUE NOT NULL,
                is_placeable BOOLEAN NOT NULL DEFAULT 0,
                can_harvest_intact BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create characters table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                world_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                experience INTEGER NOT NULL DEFAULT 0,
                position_x REAL NOT NULL DEFAULT 0,
                position_y REAL NOT NULL DEFAULT 0,
                player_rotation REAL NOT NULL DEFAULT 0,
                camera_mode TEXT NOT NULL DEFAULT 'fixed-angle',
                camera_rotation REAL NOT NULL DEFAULT 0,
                camera_zoom REAL NOT NULL DEFAULT 1.0,
                last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE
            )
        `);

        // Create cell_changes table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS cell_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                world_id INTEGER NOT NULL,
                chunk_x INTEGER NOT NULL,
                chunk_y INTEGER NOT NULL,
                cell_x INTEGER NOT NULL,
                cell_y INTEGER NOT NULL,
                world_x REAL NOT NULL,
                world_y REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE,
                UNIQUE(world_id, chunk_x, chunk_y, cell_x, cell_y)
            )
        `);

        // Create cell_entities table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS cell_entities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cell_changes_id INTEGER NOT NULL,
                entity_type_id INTEGER NOT NULL,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cell_changes_id) REFERENCES cell_changes (id) ON DELETE CASCADE,
                FOREIGN KEY (entity_type_id) REFERENCES entity_types (id) ON DELETE CASCADE
            )
        `);

        // Create inventory_entities table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS inventory_entities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_id INTEGER NOT NULL,
                slot_index INTEGER NOT NULL,
                entity_type_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
                FOREIGN KEY (entity_type_id) REFERENCES entity_types (id) ON DELETE CASCADE
            )
        `);
    }

    async createIndexes() {
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_cell_changes_world ON cell_changes (world_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_cell_changes_chunk ON cell_changes (world_id, chunk_x, chunk_y)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_cell_entities_cell ON cell_entities (cell_changes_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_inventory_entities_character ON inventory_entities (character_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_characters_world ON characters (world_id)');
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }

    async migrateDatabase() {
        try {
            // Check if new columns exist in characters table
            const columns = await this.db.all("PRAGMA table_info(characters)");
            const columnNames = columns.map(col => col.name);
            
            // Add new columns if they don't exist
            if (!columnNames.includes('player_rotation')) {
                await this.db.exec('ALTER TABLE characters ADD COLUMN player_rotation REAL NOT NULL DEFAULT 0');
                console.log('[DatabaseService] Added player_rotation column');
            }
            
            if (!columnNames.includes('camera_mode')) {
                await this.db.exec('ALTER TABLE characters ADD COLUMN camera_mode TEXT NOT NULL DEFAULT "fixed-angle"');
                console.log('[DatabaseService] Added camera_mode column');
            }
            
            if (!columnNames.includes('camera_rotation')) {
                await this.db.exec('ALTER TABLE characters ADD COLUMN camera_rotation REAL NOT NULL DEFAULT 0');
                console.log('[DatabaseService] Added camera_rotation column');
            }
            
            if (!columnNames.includes('camera_zoom')) {
                await this.db.exec('ALTER TABLE characters ADD COLUMN camera_zoom REAL NOT NULL DEFAULT 1.0');
                console.log('[DatabaseService] Added camera_zoom column');
            }
            
            console.log('[DatabaseService] Database migration completed');
        } catch (error) {
            console.error('[DatabaseService] Migration failed:', error);
            // Don't throw - migration failures shouldn't break the app
        }
    }

    // World management methods
    async createWorld(worldConfig) {
        const result = await this.db.run(`
            INSERT INTO worlds (name, seed, chunk_size, tile_size, chunk_count, biome_plains_fraction)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            worldConfig.name,
            worldConfig.seed,
            worldConfig.chunkSize || 64,
            worldConfig.tileSize || 32,
            worldConfig.chunkCount || 64,
            worldConfig.biomePlainsFraction || 0.5
        ]);

        const worldId = result.lastID;
        
        // Create default character
        const characterResult = await this.db.run(`
            INSERT INTO characters (world_id, name, position_x, position_y)
            VALUES (?, ?, ?, ?)
        `, [worldId, 'Player', 0, 0]);

        return {
            worldId,
            characterId: characterResult.lastID,
            config: worldConfig
        };
    }

    async getWorlds() {
        return await this.db.all(`
            SELECT id, name, seed, created_at FROM worlds
            ORDER BY created_at DESC
        `);
    }

    async getWorld(worldId) {
        return await this.db.get(`
            SELECT * FROM worlds WHERE id = ?
        `, [worldId]);
    }

    async getCharacters(worldId) {
        return await this.db.all(`
            SELECT id, name, level, experience, last_saved FROM characters
            WHERE world_id = ?
            ORDER BY created_at DESC
        `, [worldId]);
    }

    async getCharacter(characterId) {
        return await this.db.get(`
            SELECT * FROM characters WHERE id = ?
        `, [characterId]);
    }

    async saveCharacterPosition(characterId, x, y) {
        await this.db.run(`
            UPDATE characters 
            SET position_x = ?, position_y = ?, last_saved = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [x, y, characterId]);
        
        console.log(`[DatabaseService] Saved character ${characterId} position: (${x}, ${y})`);
        return true;
    }

    async saveCharacterState(characterId, x, y, playerRotation, cameraMode, cameraRotation, cameraZoom) {
        await this.db.run(`
            UPDATE characters 
            SET position_x = ?, position_y = ?, player_rotation = ?, camera_mode = ?, camera_rotation = ?, camera_zoom = ?, last_saved = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [x, y, playerRotation, cameraMode, cameraRotation, cameraZoom, characterId]);
        
        console.log(`[DatabaseService] Saved character ${characterId} state: pos(${x}, ${y}), rot(${playerRotation}), camera(${cameraMode}, ${cameraRotation}, zoom:${cameraZoom})`);
        return true;
    }

    // Entity type management
    async initializeEntityTypes() {
        const defaultEntityTypes = [
            { type_name: 'tree', is_placeable: true, can_harvest_intact: false },
            { type_name: 'rock', is_placeable: true, can_harvest_intact: true },
            { type_name: 'grass', is_placeable: true, can_harvest_intact: false },
            { type_name: 'wood_block', is_placeable: true, can_harvest_intact: false },
            { type_name: 'stone', is_placeable: true, can_harvest_intact: false },
            { type_name: 'tree_sapling', is_placeable: true, can_harvest_intact: false }
        ];

        for (const entityType of defaultEntityTypes) {
            await this.db.run(`
                INSERT OR IGNORE INTO entity_types (type_name, is_placeable, can_harvest_intact)
                VALUES (?, ?, ?)
            `, [entityType.type_name, entityType.is_placeable ? 1 : 0, entityType.can_harvest_intact ? 1 : 0]);
        }
    }

    async getEntityTypeId(typeName) {
        const result = await this.db.get(`
            SELECT id FROM entity_types WHERE type_name = ?
        `, [typeName]);
        return result ? result.id : null;
    }

    async getAllEntityTypes() {
        return await this.db.all(`
            SELECT * FROM entity_types ORDER BY type_name
        `);
    }

    // Cell state management
    async getCellState(worldId, chunkX, chunkY, cellX, cellY) {
        const cellChange = await this.db.get(`
            SELECT * FROM cell_changes 
            WHERE world_id = ? AND chunk_x = ? AND chunk_y = ? AND cell_x = ? AND cell_y = ?
        `, [worldId, chunkX, chunkY, cellX, cellY]);

        if (!cellChange) {
            return null;
        }

        const entities = await this.db.all(`
            SELECT ce.*, et.type_name 
            FROM cell_entities ce
            JOIN entity_types et ON ce.entity_type_id = et.id
            WHERE ce.cell_changes_id = ?
        `, [cellChange.id]);

        return {
            cellChange,
            entities: entities.map(e => ({
                id: e.id,
                type: e.type_name,
                metadata: e.metadata ? JSON.parse(e.metadata) : null
            }))
        };
    }

    async getChunkCellStates(worldId, chunkX, chunkY) {
        const cellChanges = await this.db.all(`
            SELECT * FROM cell_changes 
            WHERE world_id = ? AND chunk_x = ? AND chunk_y = ?
        `, [worldId, chunkX, chunkY]);

        const chunkStates = new Map();

        for (const cellChange of cellChanges) {
            const entities = await this.db.all(`
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

    // Inventory management
    async getInventoryContents(characterId) {
        const items = await this.db.all(`
            SELECT ie.*, et.type_name 
            FROM inventory_entities ie
            JOIN entity_types et ON ie.entity_type_id = et.id
            WHERE ie.character_id = ?
            ORDER BY ie.slot_index
        `, [characterId]);

        return items.map(item => ({
            slotIndex: item.slot_index,
            entityType: item.type_name,
            entityTypeId: item.entity_type_id,
            quantity: item.quantity,
            metadata: item.metadata ? JSON.parse(item.metadata) : null
        }));
    }

    async getItemInSlot(characterId, slotIndex) {
        const item = await this.db.get(`
            SELECT ie.*, et.type_name 
            FROM inventory_entities ie
            JOIN entity_types et ON ie.entity_type_id = et.id
            WHERE ie.character_id = ? AND ie.slot_index = ?
        `, [characterId, slotIndex]);

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

    async addItemToInventory(characterId, slotIndex, entityTypeId, quantity, metadata) {
        await this.db.run(`
            INSERT OR REPLACE INTO inventory_entities 
            (character_id, slot_index, entity_type_id, quantity, metadata)
            VALUES (?, ?, ?, ?, ?)
        `, [characterId, slotIndex, entityTypeId, quantity, metadata]);
        
        console.log(`[DatabaseService] Added item to inventory: character ${characterId}, slot ${slotIndex}, type ${entityTypeId}, quantity ${quantity}`);
        return true;
    }

    async removeItemFromInventory(characterId, slotIndex, quantity) {
        if (quantity <= 0) {
            // Remove item completely
            await this.db.run(`
                DELETE FROM inventory_entities 
                WHERE character_id = ? AND slot_index = ?
            `, [characterId, slotIndex]);
        } else {
            // Update quantity
            await this.db.run(`
                UPDATE inventory_entities 
                SET quantity = quantity - ?
                WHERE character_id = ? AND slot_index = ?
            `, [quantity, characterId, slotIndex]);
        }
        
        console.log(`[DatabaseService] Removed item from inventory: character ${characterId}, slot ${slotIndex}, quantity ${quantity}`);
        return true;
    }

    // Transaction methods for batch operations
    async beginTransaction() {
        await this.db.run('BEGIN TRANSACTION');
    }

    async commitTransaction() {
        await this.db.run('COMMIT');
    }

    async rollbackTransaction() {
        await this.db.run('ROLLBACK');
    }
} 