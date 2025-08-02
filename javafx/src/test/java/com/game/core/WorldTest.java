package com.game.core;

import com.game.logging.GameLogger;
import com.game.persistence.DatabaseManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;

class WorldTest {
    
    @Mock
    private DatabaseManager databaseManager;
    
    private World world;
    private GameLogger testLogger;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Create a test logger that always enables debug mode
        testLogger = new GameLogger(() -> true);
        
        // Create world with mocked database manager
        world = new World(databaseManager);
    }
    
    @Test
    void testWorldChunkGenerationWithLogging() {
        // Arrange - Get the world config
        WorldConfig config = world.getConfig();
        
        // Act - Load a chunk which will trigger generation
        Chunk chunk = world.loadChunk(0, 0);
        
        // Assert - Verify chunk was created
        assertNotNull(chunk);
        assertEquals(0, chunk.getChunkX());
        assertEquals(0, chunk.getChunkY());
        
        // Verify chunk is cached
        var chunkCache = world.getChunkCache();
        assertTrue(chunkCache.containsKey("0_0"));
        
        // Act - Load the same chunk again (should use cache)
        Chunk cachedChunk = world.loadChunk(0, 0);
        
        // Assert - Should be the same instance (cached)
        assertSame(chunk, cachedChunk);
        
        // Act - Load a different chunk
        Chunk chunk2 = world.loadChunk(1, 1);
        
        // Assert - Verify new chunk was created
        assertNotNull(chunk2);
        assertEquals(1, chunk2.getChunkX());
        assertEquals(1, chunk2.getChunkY());
        
        // Verify both chunks are in cache
        assertEquals(2, chunkCache.size());
        assertTrue(chunkCache.containsKey("0_0"));
        assertTrue(chunkCache.containsKey("1_1"));
    }
    
    @Test
    void testWorldConfigProperties() {
        // Arrange
        WorldConfig config = world.getConfig();
        
        // Assert - Verify config has reasonable defaults
        assertNotNull(config);
        assertTrue(config.seed() > 0);
        assertTrue(config.chunkSize() > 0);
        assertTrue(config.tileSize() > 0);
        
        // Verify specific expected values
        assertEquals(12345, config.seed()); // Default seed from WorldConfig
        assertEquals(64, config.chunkSize()); // Default chunk size
        assertEquals(32, config.tileSize()); // Default tile size
    }
} 