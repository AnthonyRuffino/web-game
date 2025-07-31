import pkg from '../../src/modules/game/persistence/PersistenceManager.js';
const { PersistenceManager } = pkg;
import worldPkg from '../../src/modules/game/persistence/PersistentWorld.js';
const { PersistentWorld } = worldPkg;

async function testPhase2Comprehensive() {
    console.log('=== Phase 2 Comprehensive Test ===');
    
    let persistenceManager = null;
    
    try {
        // Initialize persistence manager
        persistenceManager = new PersistenceManager();
        await persistenceManager.initialize();
        console.log('✅ PersistenceManager initialized');
        
        // Test world creation
        const worldConfig = {
            name: "Comprehensive Test World",
            seed: 123456,
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
        
        // Test inventory manager
        const inventoryManager = persistenceManager.getInventoryManager();
        inventoryManager.setCurrentCharacter(characterId);
        console.log('✅ InventoryManager initialized');
        
        // Test adding items to inventory
        await inventoryManager.addItemToInventory('wood_block', 5);
        await inventoryManager.addItemToInventory('stone', 3);
        await inventoryManager.addItemToInventory('grass', 2);
        console.log('✅ Items added to inventory');
        
        // Test getting inventory contents
        const contents = await inventoryManager.getInventoryContents();
        console.log('✅ Inventory contents:', contents.length, 'items');
        
        // Test harvesting manager
        const harvestingManager = persistenceManager.getHarvestingManager();
        console.log('✅ HarvestingManager initialized');
        
        // Test harvesting a tree
        const treeEntity = { type: 'tree', x: 100, y: 100 };
        const yieldItems = await harvestingManager.harvestEntity(treeEntity, 100, 100);
        console.log('✅ Tree harvested, yielded:', yieldItems.length, 'items');
        
        // Test harvesting stats
        const stats = await harvestingManager.getHarvestingStats();
        console.log('✅ Harvesting stats:', stats);
        
        // Test cell state management
        const cellStateManager = persistenceManager.getCellStateManager();
        const cellState = await cellStateManager.loadCellState(0, 0, 0, 0);
        console.log('✅ Cell state loaded:', cellState ? 'has changes' : 'no changes');
        
        // Test chunk loading with persistence
        const chunk = await persistentWorld.loadChunk(0, 0);
        console.log('✅ Chunk loaded with persistence, entities:', chunk.entities.length);
        
        // Test world listing
        const worlds = await persistenceManager.getWorldManager().getWorlds();
        console.log('✅ Worlds listed:', worlds.length, 'worlds found');
        
        // Test character listing
        const characters = await persistenceManager.getWorldManager().getCharacters(worldId);
        console.log('✅ Characters listed:', characters.length, 'characters found');
        
        // Test entity type management
        const entityTypes = await persistenceManager.getWorldManager().getAllEntityTypes();
        console.log('✅ Entity types loaded:', entityTypes.length, 'types');
        
        // Test pending changes
        const pendingStats = persistenceManager.getPendingChangesStats();
        console.log('✅ Pending changes stats:', pendingStats);
        
        // Test manual save
        const saveResult = await persistenceManager.manualSave();
        console.log('✅ Manual save completed:', saveResult);
        
        console.log('=== Phase 2 Comprehensive Test PASSED ===');
        
    } catch (error) {
        console.error('❌ Phase 2 Comprehensive Test FAILED:', error);
        throw error;
    } finally {
        // Clean up
        if (persistenceManager) {
            await persistenceManager.shutdown();
        }
    }
}

// Run the test
testPhase2Comprehensive().catch(console.error); 