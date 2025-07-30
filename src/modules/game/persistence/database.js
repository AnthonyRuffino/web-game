const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = null;
    }

    async initialize(userDataPath = null) {
        try {
            // Use provided user data path or get from Electron app
            if (!userDataPath) {
                // Try to get from Electron app if available
                try {
                    const { app } = require('electron');
                    userDataPath = app.getPath('userData');
                } catch (e) {
                    // Fallback to current directory if Electron not available (e.g., in tests)
                    userDataPath = process.cwd();
                }
            }
            
            // If userDataPath is a full path to a database file, use it directly
            if (userDataPath.endsWith('.db')) {
                this.dbPath = userDataPath;
            } else {
                this.dbPath = path.join(userDataPath, 'game.db');
            }
            
            console.log(`[DatabaseManager] Initializing database at: ${this.dbPath}`);
            
            // Open database connection
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });

            // Create tables
            await this.createTables();
            
            // Create indexes
            await this.createIndexes();
            
            console.log('[DatabaseManager] Database initialized successfully');
            return true;
        } catch (error) {
            console.error('[DatabaseManager] Failed to initialize database:', error);
            throw error;
        }
    }

    async createTables() {
        try {
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

            // Create entity_types table (enum-like)
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
                    last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE
                )
            `);

            // Create cell_changes table (tracks modified cells)
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

            // Create cell_entities table (entities in modified cells)
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS cell_entities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cell_changes_id INTEGER NOT NULL,
                    entity_type_id INTEGER NOT NULL,
                    metadata TEXT, -- JSON metadata
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (cell_changes_id) REFERENCES cell_changes (id) ON DELETE CASCADE,
                    FOREIGN KEY (entity_type_id) REFERENCES entity_types (id)
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
                    metadata TEXT, -- JSON metadata
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
                    FOREIGN KEY (entity_type_id) REFERENCES entity_types (id),
                    UNIQUE(character_id, slot_index)
                )
            `);

            console.log('[DatabaseManager] All tables created successfully');
        } catch (error) {
            console.error('[DatabaseManager] Failed to create tables:', error);
            throw error;
        }
    }

    async createIndexes() {
        try {
            // Index for cell_changes lookups
            await this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_cell_changes_world_chunk 
                ON cell_changes(world_id, chunk_x, chunk_y, cell_x, cell_y)
            `);

            // Index for cell_entities lookups
            await this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_cell_entities_changes 
                ON cell_entities(cell_changes_id)
            `);

            // Index for inventory lookups
            await this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_inventory_character_slot 
                ON inventory_entities(character_id, slot_index)
            `);

            // Index for character lookups
            await this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_characters_world 
                ON characters(world_id)
            `);

            console.log('[DatabaseManager] All indexes created successfully');
        } catch (error) {
            console.error('[DatabaseManager] Failed to create indexes:', error);
            throw error;
        }
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            console.log('[DatabaseManager] Database connection closed');
        }
    }

    // Helper method to get database instance
    getDatabase() {
        return this.db;
    }

    // Helper method to get database path
    getDatabasePath() {
        return this.dbPath;
    }
}

module.exports = { DatabaseManager }; 