// Test script for Phase 1: Core Database Implementation
const { PersistenceManager } = require('../../src/modules/game/persistence/PersistenceManager.js');
const path = require('path');

async function testPhase1() {
    console.log('=== Testing Phase 1: Core Database Implementation ===\n');
    
    const persistenceManager = new PersistenceManager();
    
    try {
        // Test 1: Initialize persistence system
        console.log('1. Testing initialization...');
        // Use a test-specific database path
        const testDbPath = path.join(process.cwd(), 'test-game.db');
        await persistenceManager.initialize(testDbPath);
        console.log('✅ Persistence system initialized successfully\n');
        
        // Test 2: Create a world
        console.log('2. Testing world creation...');
        const worldConfig = {
            name: 'Test World',
            seed: 12345,
            chunkSize: 64,
            tileSize: 32,
            chunkCount: 64,
            biomePlainsFraction: 0.5
        };
        
        const world = await persistenceManager.createWorld(worldConfig);
        console.log(`✅ Created world: ${world.name} (ID: ${world.id})\n`);
        
        // Test 3: Load the world
        console.log('3. Testing world loading...');
        const loadedWorld = await persistenceManager.loadWorld(world.id);
        console.log(`✅ Loaded world: ${loadedWorld.name} (ID: ${loadedWorld.id})\n`);
        
        // Test 4: Set current world
        console.log('4. Testing world setting...');
        persistenceManager.setCurrentWorld(world.id);
        console.log('✅ Set current world\n');
        
        // Test 5: Create a character
        console.log('5. Testing character creation...');
        const character = await persistenceManager.createCharacter(
            world.id, 
            'Test Character', 
            { x: 100, y: 100 }
        );
        console.log(`✅ Created character: ${character.name} (ID: ${character.id})\n`);
        
        // Test 6: Load the character
        console.log('6. Testing character loading...');
        const loadedCharacter = await persistenceManager.loadCharacter(character.id);
        console.log(`✅ Loaded character: ${loadedCharacter.name} (ID: ${loadedCharacter.id})\n`);
        
        // Test 7: Set current character
        console.log('7. Testing character setting...');
        persistenceManager.setCurrentCharacter(character.id);
        console.log('✅ Set current character\n');
        
        // Test 8: Test cell state operations
        console.log('8. Testing cell state operations...');
        
        // Mark a cell as modified
        await persistenceManager.markCellModified(0, 0, 10, 10, 320, 320);
        console.log('✅ Marked cell as modified');
        
        // Add an entity to the cell
        await persistenceManager.addEntityToCell(0, 0, 10, 10, 'tree', { 
            size: 48, 
            custom: true 
        });
        console.log('✅ Added entity to cell');
        
        // Load the cell state
        const cellState = await persistenceManager.loadCellState(0, 0, 10, 10);
        console.log(`✅ Loaded cell state with ${cellState.entities.length} entities`);
        
        // Test 9: Test entity type operations
        console.log('\n9. Testing entity type operations...');
        const entityTypes = await persistenceManager.getAllEntityTypes();
        console.log(`✅ Retrieved ${entityTypes.length} entity types`);
        
        const treeTypeId = await persistenceManager.getEntityTypeId('tree');
        console.log(`✅ Tree entity type ID: ${treeTypeId}`);
        
        const treeTypeName = await persistenceManager.getEntityTypeName(treeTypeId);
        console.log(`✅ Entity type name for ID ${treeTypeId}: ${treeTypeName}\n`);
        
        // Test 10: Test pending changes
        console.log('10. Testing pending changes...');
        const pendingStats = persistenceManager.getPendingChangesStats();
        console.log(`✅ Pending changes stats:`, pendingStats);
        
        // Test 11: Test manual save
        console.log('\n11. Testing manual save...');
        const saveResult = await persistenceManager.manualSave();
        console.log(`✅ Manual save result: ${saveResult}`);
        
        // Test 12: Test statistics
        console.log('\n12. Testing statistics...');
        const cellStats = await persistenceManager.getCellStateStats();
        console.log(`✅ Cell state stats:`, cellStats);
        
        const config = persistenceManager.getConfig();
        console.log(`✅ Persistence config:`, config);
        
        // Test 13: Test auto-save
        console.log('\n13. Testing auto-save...');
        persistenceManager.startAutoSave();
        console.log('✅ Auto-save started');
        
        // Wait a moment, then stop auto-save
        await new Promise(resolve => setTimeout(resolve, 1000));
        persistenceManager.stopAutoSave();
        console.log('✅ Auto-save stopped\n');
        
        // Test 14: Test world and character listing
        console.log('14. Testing listing operations...');
        const worlds = await persistenceManager.getWorlds();
        console.log(`✅ Found ${worlds.length} worlds`);
        
        const characters = await persistenceManager.getCharacters(world.id);
        console.log(`✅ Found ${characters.length} characters in world ${world.id}\n`);
        
        // Test 15: Test shutdown
        console.log('15. Testing shutdown...');
        await persistenceManager.shutdown();
        console.log('✅ Persistence system shut down successfully\n');
        
        console.log('=== Phase 1 Tests Completed Successfully! ===');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error(error.stack);
        
        // Try to shutdown gracefully
        try {
            await persistenceManager.shutdown();
        } catch (shutdownError) {
            console.error('Error during shutdown:', shutdownError);
        }
    }
}

// Run the test
testPhase1(); 