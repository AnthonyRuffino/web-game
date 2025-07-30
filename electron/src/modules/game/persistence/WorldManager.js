class WorldManager {
    constructor(databaseManager) {
        this.database = databaseManager;
        this.db = null;
    }

    async initialize() {
        this.db = this.database.getDatabase();
        await this.initializeEntityTypes();
    }

    // Initialize default entity types
    async initializeEntityTypes() {
        try {
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

            console.log('[WorldManager] Entity types initialized');
        } catch (error) {
            console.error('[WorldManager] Failed to initialize entity types:', error);
            throw error;
        }
    }

    // Create a new world
    async createWorld(worldConfig) {
        try {
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
            console.log(`[WorldManager] Created world: ${worldConfig.name} (ID: ${worldId})`);
            
            return {
                id: worldId,
                ...worldConfig
            };
        } catch (error) {
            console.error('[WorldManager] Failed to create world:', error);
            throw error;
        }
    }

    // Load an existing world
    async loadWorld(worldId) {
        try {
            const world = await this.db.get(`
                SELECT * FROM worlds WHERE id = ?
            `, [worldId]);

            if (!world) {
                throw new Error(`World with ID ${worldId} not found`);
            }

            // Convert to WORLD_CONFIG format
            const worldConfig = {
                id: world.id,
                name: world.name,
                seed: world.seed,
                chunkSize: world.chunk_size,
                tileSize: world.tile_size,
                chunkCount: world.chunk_count,
                biomePlainsFraction: world.biome_plains_fraction,
                created_at: world.created_at
            };

            console.log(`[WorldManager] Loaded world: ${world.name} (ID: ${world.id})`);
            return worldConfig;
        } catch (error) {
            console.error('[WorldManager] Failed to load world:', error);
            throw error;
        }
    }

    // Get all worlds
    async getWorlds() {
        try {
            const worlds = await this.db.all(`
                SELECT * FROM worlds ORDER BY created_at DESC
            `);

            return worlds.map(world => ({
                id: world.id,
                name: world.name,
                seed: world.seed,
                chunkSize: world.chunk_size,
                tileSize: world.tile_size,
                chunkCount: world.chunk_count,
                biomePlainsFraction: world.biome_plains_fraction,
                created_at: world.created_at
            }));
        } catch (error) {
            console.error('[WorldManager] Failed to get worlds:', error);
            throw error;
        }
    }

    // Create a new character
    async createCharacter(worldId, characterName, startingPosition = { x: 0, y: 0 }) {
        try {
            const result = await this.db.run(`
                INSERT INTO characters (world_id, name, position_x, position_y)
                VALUES (?, ?, ?, ?)
            `, [worldId, characterName, startingPosition.x, startingPosition.y]);

            const characterId = result.lastID;
            console.log(`[WorldManager] Created character: ${characterName} (ID: ${characterId})`);
            
            return {
                id: characterId,
                worldId: worldId,
                name: characterName,
                level: 1,
                experience: 0,
                position_x: startingPosition.x,
                position_y: startingPosition.y
            };
        } catch (error) {
            console.error('[WorldManager] Failed to create character:', error);
            throw error;
        }
    }

    // Load a character
    async loadCharacter(characterId) {
        try {
            const character = await this.db.get(`
                SELECT * FROM characters WHERE id = ?
            `, [characterId]);

            if (!character) {
                throw new Error(`Character with ID ${characterId} not found`);
            }

            console.log(`[WorldManager] Loaded character: ${character.name} (ID: ${character.id})`);
            return {
                id: character.id,
                worldId: character.world_id,
                name: character.name,
                level: character.level,
                experience: character.experience,
                position_x: character.position_x,
                position_y: character.position_y,
                last_saved: character.last_saved
            };
        } catch (error) {
            console.error('[WorldManager] Failed to load character:', error);
            throw error;
        }
    }

    // Get all characters for a world
    async getCharacters(worldId) {
        try {
            const characters = await this.db.all(`
                SELECT * FROM characters WHERE world_id = ? ORDER BY created_at DESC
            `, [worldId]);

            return characters.map(character => ({
                id: character.id,
                worldId: character.world_id,
                name: character.name,
                level: character.level,
                experience: character.experience,
                position_x: character.position_x,
                position_y: character.position_y,
                last_saved: character.last_saved,
                created_at: character.created_at
            }));
        } catch (error) {
            console.error('[WorldManager] Failed to get characters:', error);
            throw error;
        }
    }

    // Save character position
    async saveCharacterPosition(characterId, position) {
        try {
            await this.db.run(`
                UPDATE characters 
                SET position_x = ?, position_y = ?, last_saved = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [position.x, position.y, characterId]);

            console.log(`[WorldManager] Saved character position: ${characterId} -> (${position.x}, ${position.y})`);
        } catch (error) {
            console.error('[WorldManager] Failed to save character position:', error);
            throw error;
        }
    }

    // Get entity type ID by name
    async getEntityTypeId(typeName) {
        try {
            const result = await this.db.get(`
                SELECT id FROM entity_types WHERE type_name = ?
            `, [typeName]);

            if (!result) {
                throw new Error(`Entity type '${typeName}' not found`);
            }

            return result.id;
        } catch (error) {
            console.error(`[WorldManager] Failed to get entity type ID for '${typeName}':`, error);
            throw error;
        }
    }

    // Get entity type name by ID
    async getEntityTypeName(entityTypeId) {
        try {
            const result = await this.db.get(`
                SELECT type_name FROM entity_types WHERE id = ?
            `, [entityTypeId]);

            if (!result) {
                throw new Error(`Entity type with ID ${entityTypeId} not found`);
            }

            return result.type_name;
        } catch (error) {
            console.error(`[WorldManager] Failed to get entity type name for ID ${entityTypeId}:`, error);
            throw error;
        }
    }

    // Get all entity types
    async getAllEntityTypes() {
        try {
            const entityTypes = await this.db.all(`
                SELECT * FROM entity_types ORDER BY type_name
            `);

            return entityTypes.map(et => ({
                id: et.id,
                type_name: et.type_name,
                is_placeable: et.is_placeable === 1,
                can_harvest_intact: et.can_harvest_intact === 1
            }));
        } catch (error) {
            console.error('[WorldManager] Failed to get entity types:', error);
            throw error;
        }
    }

    // Delete a world (cascades to characters and all related data)
    async deleteWorld(worldId) {
        try {
            await this.db.run(`
                DELETE FROM worlds WHERE id = ?
            `, [worldId]);

            console.log(`[WorldManager] Deleted world: ${worldId}`);
        } catch (error) {
            console.error('[WorldManager] Failed to delete world:', error);
            throw error;
        }
    }

    // Delete a character (cascades to inventory)
    async deleteCharacter(characterId) {
        try {
            await this.db.run(`
                DELETE FROM characters WHERE id = ?
            `, [characterId]);

            console.log(`[WorldManager] Deleted character: ${characterId}`);
        } catch (error) {
            console.error('[WorldManager] Failed to delete character:', error);
            throw error;
        }
    }
}

module.exports = { WorldManager }; 