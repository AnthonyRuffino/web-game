import { PersistenceManager } from '../../src/modules/game/persistence/PersistenceManager.js';
import { PersistentWorld } from '../../src/modules/game/persistence/PersistentWorld.js';

async function testPhase2Integration() {
    console.log('=== Phase 2 Integration Test ===');
    
    try {
        // Initialize persistence manager
        const persistenceManager = new PersistenceManager();
        await persistenceManager.initialize();
        console.log('✅ PersistenceManager initialized');
        
        // Test world creation
        const worldConfig = {
            name: "Test World",
            seed: 99999,
            chunkCount: 64,
            chunkSize: 64,
            tileSize: 32
        };
        
        const { worldId, characterId } = await persistenceManager.getWorldManager().createWorld(worldConfig);
        console.log('✅ World created with ID:', worldId, 'Character ID:', characterId);
        
        // Test persistent world initialization
        const persistentWorld = new PersistentWorld(persistenceManager);
        await persistentWorld.initializeWithPersistence(worldId, characterId);
        console.log('✅ PersistentWorld initialized');
        
        // Test chunk loading with persistence
        const chunk = await persistentWorld.loadChunk(0, 0);
        console.log('✅ Chunk loaded with persistence, entities:', chunk.entities.length);
        
        // Test cell state management
        const cellStateManager = persistenceManager.getCellStateManager();
        const cellState = await cellStateManager.loadCellState(0, 0, 0, 0);
        console.log('✅ Cell state loaded:', cellState ? 'has changes' : 'no changes');
        
        // Test world listing
        const worlds = await persistenceManager.getWorldManager().getWorlds();
        console.log('✅ Worlds listed:', worlds.length, 'worlds found');
        
        // Test character listing
        const characters = await persistenceManager.getWorldManager().getCharacters(worldId);
        console.log('✅ Characters listed:', characters.length, 'characters found');
        
        console.log('=== Phase 2 Integration Test PASSED ===');
        
    } catch (error) {
        console.error('❌ Phase 2 Integration Test FAILED:', error);
        throw error;
    } finally {
        // Clean up
        if (persistenceManager) {
            await persistenceManager.shutdown();
        }
    }
}

// Run the test
testPhase2Integration().catch(console.error); 