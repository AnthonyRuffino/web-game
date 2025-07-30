// Verify database contents after Phase 1 test
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function verifyDatabase() {
    console.log('=== Verifying Database Contents ===\n');
    
    try {
        const db = await open({
            filename: 'test-game.db',
            driver: sqlite3.Database
        });

        // Check worlds
        console.log('1. Worlds:');
        const worlds = await db.all('SELECT * FROM worlds');
        worlds.forEach(world => {
            console.log(`   - ${world.name} (ID: ${world.id}, Seed: ${world.seed})`);
        });

        // Check entity types
        console.log('\n2. Entity Types:');
        const entityTypes = await db.all('SELECT * FROM entity_types');
        entityTypes.forEach(et => {
            console.log(`   - ${et.type_name} (ID: ${et.id}, Placeable: ${et.is_placeable}, Harvest Intact: ${et.can_harvest_intact})`);
        });

        // Check characters
        console.log('\n3. Characters:');
        const characters = await db.all('SELECT * FROM characters');
        characters.forEach(char => {
            console.log(`   - ${char.name} (ID: ${char.id}, World: ${char.world_id}, Level: ${char.level})`);
        });

        // Check cell changes
        console.log('\n4. Cell Changes:');
        const cellChanges = await db.all('SELECT * FROM cell_changes');
        cellChanges.forEach(cc => {
            console.log(`   - World ${cc.world_id}, Chunk (${cc.chunk_x},${cc.chunk_y}), Cell (${cc.cell_x},${cc.cell_y})`);
        });

        // Check cell entities
        console.log('\n5. Cell Entities:');
        const cellEntities = await db.all(`
            SELECT ce.*, et.type_name 
            FROM cell_entities ce
            JOIN entity_types et ON ce.entity_type_id = et.id
        `);
        cellEntities.forEach(ce => {
            console.log(`   - ${ce.type_name} (ID: ${ce.id}, Cell Change: ${ce.cell_changes_id})`);
            if (ce.metadata) {
                console.log(`     Metadata: ${ce.metadata}`);
            }
        });

        // Check inventory entities
        console.log('\n6. Inventory Entities:');
        const inventoryEntities = await db.all(`
            SELECT ie.*, et.type_name 
            FROM inventory_entities ie
            JOIN entity_types et ON ie.entity_type_id = et.id
        `);
        inventoryEntities.forEach(ie => {
            console.log(`   - ${ie.type_name} (Character: ${ie.character_id}, Slot: ${ie.slot_index}, Qty: ${ie.quantity})`);
        });

        await db.close();
        console.log('\n=== Database Verification Complete ===');
        
    } catch (error) {
        console.error('Error verifying database:', error);
    }
}

verifyDatabase(); 