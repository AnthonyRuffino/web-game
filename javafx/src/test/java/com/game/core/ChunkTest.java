package com.game.core;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

class ChunkTest {
    
    private Chunk chunk;
    private WorldConfig worldConfig;
    
    @BeforeEach
    void setUp() {
        worldConfig = new WorldConfig(12345, 64, 32, 64, 0.5);
        chunk = new Chunk(5, 10, worldConfig);
    }
    
    @Test
    void testChunkInitialization() {
        // Assert - Verify initial state
        assertEquals(5, chunk.getChunkX());
        assertEquals(10, chunk.getChunkY());
        assertEquals(worldConfig, chunk.getConfig());
        assertTrue(chunk.getEntities().isEmpty());
    }
    
    @Test
    void testAddEntity() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 200.0);
        Entity rock = new Entity("rock", 150.0, 250.0);
        
        // Act
        chunk.addEntity(tree);
        chunk.addEntity(rock);
        
        // Assert
        assertEquals(2, chunk.getEntities().size());
        assertTrue(chunk.getEntities().contains(tree));
        assertTrue(chunk.getEntities().contains(rock));
    }
    
    @Test
    void testGetEntitiesReturnsActualList() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 200.0);
        chunk.addEntity(tree);
        
        // Act
        var entities = chunk.getEntities();
        entities.clear(); // Modify the returned list
        
        // Assert - Original chunk entities should be affected (it's the same list)
        assertEquals(0, chunk.getEntities().size());
        assertFalse(chunk.getEntities().contains(tree));
    }
    
    @Test
    void testMultipleEntitiesOfSameType() {
        // Arrange
        Entity tree1 = new Entity("tree", 100.0, 200.0);
        Entity tree2 = new Entity("tree", 300.0, 400.0);
        Entity grass = new Entity("grass", 500.0, 600.0);
        
        // Act
        chunk.addEntity(tree1);
        chunk.addEntity(tree2);
        chunk.addEntity(grass);
        
        // Assert
        assertEquals(3, chunk.getEntities().size());
        
        // Count entities by type
        long treeCount = chunk.getEntities().stream()
            .filter(e -> "tree".equals(e.type()))
            .count();
        long grassCount = chunk.getEntities().stream()
            .filter(e -> "grass".equals(e.type()))
            .count();
        
        assertEquals(2, treeCount);
        assertEquals(1, grassCount);
    }
    
    @Test
    void testChunkCoordinates() {
        // Test different chunk coordinates
        Chunk chunk1 = new Chunk(0, 0, worldConfig);
        Chunk chunk2 = new Chunk(-5, 10, worldConfig);
        Chunk chunk3 = new Chunk(100, -50, worldConfig);
        
        assertEquals(0, chunk1.getChunkX());
        assertEquals(0, chunk1.getChunkY());
        assertEquals(-5, chunk2.getChunkX());
        assertEquals(10, chunk2.getChunkY());
        assertEquals(100, chunk3.getChunkX());
        assertEquals(-50, chunk3.getChunkY());
    }
} 