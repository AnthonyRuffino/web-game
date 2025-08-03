package com.game.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Random;

class SpatialIndexTest {
    
    private QuadtreeSpatialIndex spatialIndex;
    private Random random;
    
    @BeforeEach
    void setUp() {
        spatialIndex = new QuadtreeSpatialIndex();
        random = new Random(42); // Fixed seed for reproducible tests
    }
    
    @Test
    void testInsertAndQuerySingleEntity() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        
        // Act
        spatialIndex.insert(entity, 100.0, 200.0);
        List<Entity> result = spatialIndex.queryRange(90.0, 190.0, 30.0, 30.0);
        
        // Assert
        assertEquals(1, result.size());
        assertEquals(entity, result.get(0));
    }
    
    @Test
    void testInsertAndQueryMultipleEntities() {
        // Arrange
        Entity tree1 = new Entity("tree", 100.0, 200.0);
        Entity tree2 = new Entity("tree", 150.0, 250.0);
        Entity rock = new Entity("rock", 200.0, 300.0);
        
        // Act
        spatialIndex.insert(tree1, 100.0, 200.0);
        spatialIndex.insert(tree2, 150.0, 250.0);
        spatialIndex.insert(rock, 200.0, 300.0);
        
        List<Entity> result = spatialIndex.queryRange(90.0, 190.0, 80.0, 80.0);
        
        // Assert
        assertEquals(2, result.size());
        assertTrue(result.contains(tree1));
        assertTrue(result.contains(tree2));
        assertFalse(result.contains(rock));
    }
    
    @Test
    void testRemoveEntity() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        spatialIndex.insert(entity, 100.0, 200.0);
        
        // Act
        spatialIndex.remove(entity, 100.0, 200.0);
        List<Entity> result = spatialIndex.queryRange(90.0, 190.0, 30.0, 30.0);
        
        // Assert
        assertEquals(0, result.size());
        assertEquals(0, spatialIndex.size());
    }
    
    @Test
    void testRemoveNonExistentEntity() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        
        // Act
        boolean removed = spatialIndex.remove(entity, 100.0, 200.0);
        
        // Assert
        assertFalse(removed);
        assertEquals(0, spatialIndex.size());
    }
    
    @Test
    void testQueryEmptyRange() {
        // Act
        List<Entity> result = spatialIndex.queryRange(100.0, 200.0, 50.0, 50.0);
        
        // Assert
        assertEquals(0, result.size());
    }
    
    @Test
    void testQueryOutsideBounds() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        spatialIndex.insert(entity, 100.0, 200.0);
        
        // Act
        List<Entity> result = spatialIndex.queryRange(1000.0, 2000.0, 50.0, 50.0);
        
        // Assert
        assertEquals(0, result.size());
    }
    
    @Test
    void testClear() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 200.0);
        Entity rock = new Entity("rock", 150.0, 250.0);
        spatialIndex.insert(tree, 100.0, 200.0);
        spatialIndex.insert(rock, 150.0, 250.0);
        
        // Act
        spatialIndex.clear();
        
        // Assert
        assertEquals(0, spatialIndex.size());
        List<Entity> result = spatialIndex.queryRange(90.0, 190.0, 100.0, 100.0);
        assertEquals(0, result.size());
    }
    
    @Test
    void testSize() {
        // Assert initial size
        assertEquals(0, spatialIndex.size());
        
        // Add entities and check size
        Entity tree = new Entity("tree", 100.0, 200.0);
        spatialIndex.insert(tree, 100.0, 200.0);
        assertEquals(1, spatialIndex.size());
        
        Entity rock = new Entity("rock", 150.0, 250.0);
        spatialIndex.insert(rock, 150.0, 250.0);
        assertEquals(2, spatialIndex.size());
        
        // Remove entity and check size
        spatialIndex.remove(tree, 100.0, 200.0);
        assertEquals(1, spatialIndex.size());
    }
    
    @Test
    void testQuadtreeSubdivision() {
        // Arrange - Insert more entities than MAX_ENTITIES to force subdivision
        List<Entity> entities = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            Entity entity = new Entity("tree", 100.0 + i, 200.0 + i);
            entities.add(entity);
            spatialIndex.insert(entity, 100.0 + i, 200.0 + i);
        }
        
        // Act
        List<Entity> result = spatialIndex.queryRange(90.0, 190.0, 50.0, 50.0);
        
        // Assert
        assertEquals(15, spatialIndex.size());
        assertEquals(15, result.size());
        for (Entity entity : entities) {
            assertTrue(result.contains(entity));
        }
    }
    
    @Test
    void testUpdateEntityPosition() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        spatialIndex.insert(entity, 100.0, 200.0);
        
        // Act - Remove from old position and insert at new position
        spatialIndex.remove(entity, 100.0, 200.0);
        spatialIndex.insert(entity, 300.0, 400.0);
        
        // Assert
        List<Entity> oldPosition = spatialIndex.queryRange(90.0, 190.0, 30.0, 30.0);
        List<Entity> newPosition = spatialIndex.queryRange(290.0, 390.0, 30.0, 30.0);
        
        assertEquals(0, oldPosition.size());
        assertEquals(1, newPosition.size());
        assertEquals(entity, newPosition.get(0));
    }
    
    @Test
    @Timeout(1) // Should complete within 1 second
    void testPerformanceWithManyEntities() {
        // Arrange - Insert 1000 entities
        List<Entity> entities = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            double x = random.nextDouble() * 1000;
            double y = random.nextDouble() * 1000;
            Entity entity = new Entity("tree", x, y);
            entities.add(entity);
            spatialIndex.insert(entity, x, y);
        }
        
        // Act - Query a large area
        long startTime = System.nanoTime();
        List<Entity> result = spatialIndex.queryRange(0.0, 0.0, 500.0, 500.0);
        long endTime = System.nanoTime();
        
        // Assert
        long durationMs = (endTime - startTime) / 1_000_000;
        assertTrue(durationMs < 10, "Query should complete in less than 10ms, took: " + durationMs + "ms");
        assertTrue(result.size() > 0, "Should find some entities in the query area");
        assertEquals(1000, spatialIndex.size());
    }
    
    @Test
    void testQueryWithZeroDimensions() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        spatialIndex.insert(entity, 100.0, 200.0);
        
        // Act
        List<Entity> result = spatialIndex.queryRange(100.0, 200.0, 0.0, 0.0);
        
        // Assert
        assertEquals(0, result.size());
    }
    
    @Test
    void testQueryWithNegativeDimensions() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        spatialIndex.insert(entity, 100.0, 200.0);
        
        // Act
        List<Entity> result = spatialIndex.queryRange(100.0, 200.0, -10.0, -10.0);
        
        // Assert
        assertEquals(0, result.size());
    }
    
    @Test
    void testCustomBounds() {
        // Arrange - Create spatial index with custom bounds
        QuadtreeSpatialIndex customIndex = new QuadtreeSpatialIndex(0.0, 0.0, 100.0, 100.0);
        Entity entity = new Entity("tree", 50.0, 50.0);
        
        // Act
        customIndex.insert(entity, 50.0, 50.0);
        List<Entity> result = customIndex.queryRange(40.0, 40.0, 30.0, 30.0);
        
        // Assert
        assertEquals(1, result.size());
        assertEquals(entity, result.get(0));
    }
    
    @Test
    void testEntityOutsideCustomBounds() {
        // Arrange - Create spatial index with custom bounds
        QuadtreeSpatialIndex customIndex = new QuadtreeSpatialIndex(0.0, 0.0, 100.0, 100.0);
        Entity entity = new Entity("tree", 150.0, 150.0);
        
        // Act
        customIndex.insert(entity, 150.0, 150.0);
        List<Entity> result = customIndex.queryRange(140.0, 140.0, 30.0, 30.0);
        
        // Assert
        assertEquals(0, result.size());
        assertEquals(0, customIndex.size());
    }
} 