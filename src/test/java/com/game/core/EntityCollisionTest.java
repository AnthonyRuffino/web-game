package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EntityCollisionTest {
    
    @Test
    void testEntityCreationWithCollisionProperties() {
        // Act
        Entity entity = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 24.0, 24.0, null);
        
        // Assert
        assertEquals("tree", entity.getType());
        assertEquals(100.0, entity.getX(), 0.001);
        assertEquals(200.0, entity.getY(), 0.001);
        assertEquals(45.0, entity.getAngle(), 0.001);
        assertEquals(32.0, entity.getSize(), 0.001);
        assertTrue(entity.isCollision());
        assertEquals(24.0, entity.getCollisionWidth(), 0.001);
        assertEquals(24.0, entity.getCollisionHeight(), 0.001);
    }
    
    @Test
    void testDefaultCollisionProperties() {
        // Act
        Entity entity = new Entity("tree", 100.0, 200.0);
        
        // Assert
        assertTrue(entity.isCollision());
        assertEquals(32.0, entity.getCollisionWidth(), 0.001);
        assertEquals(32.0, entity.getCollisionHeight(), 0.001);
    }
    
    @Test
    void testIsCollidable() {
        // Arrange
        Entity collidableEntity = new Entity("tree", 100.0, 200.0, 0.0, 32.0, true, 24.0, 24.0, null);
        Entity nonCollidableEntity = new Entity("grass", 100.0, 200.0, 0.0, 32.0, false, 0.0, 0.0, null);
        
        // Assert
        assertTrue(collidableEntity.isCollidable());
        assertFalse(nonCollidableEntity.isCollidable());
    }
    
    @Test
    void testIntersectsWithOverlappingEntities() {
        // Arrange
        Entity entity1 = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity entity2 = new Entity("rock", 120.0, 120.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertTrue(entity1.intersects(120.0, 120.0, 32.0, 32.0));
        assertTrue(entity2.intersects(100.0, 100.0, 32.0, 32.0));
    }
    
    @Test
    void testIntersectsWithNonOverlappingEntities() {
        // Arrange
        Entity entity1 = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity entity2 = new Entity("rock", 200.0, 200.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertFalse(entity1.intersects(200.0, 200.0, 32.0, 32.0));
        assertFalse(entity2.intersects(100.0, 100.0, 32.0, 32.0));
    }
    
    @Test
    void testIntersectsWithTouchingEntities() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert - Entities touching at edges should not intersect
        assertFalse(entity.intersects(132.0, 100.0, 32.0, 32.0)); // Right edge
        assertFalse(entity.intersects(100.0, 132.0, 32.0, 32.0)); // Bottom edge
        assertFalse(entity.intersects(68.0, 100.0, 32.0, 32.0));  // Left edge
        assertFalse(entity.intersects(100.0, 68.0, 32.0, 32.0));  // Top edge
    }
    
    @Test
    void testIntersectsWithPartiallyOverlappingEntities() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertTrue(entity.intersects(110.0, 110.0, 32.0, 32.0)); // Overlapping
        assertTrue(entity.intersects(90.0, 90.0, 32.0, 32.0));   // Overlapping
        assertTrue(entity.intersects(110.0, 90.0, 32.0, 32.0));  // Overlapping
        assertTrue(entity.intersects(90.0, 110.0, 32.0, 32.0));  // Overlapping
    }
    
    @Test
    void testIntersectsWithDifferentCollisionSizes() {
        // Arrange
        Entity smallEntity = new Entity("grass", 100.0, 100.0, 0.0, 16.0, true, 16.0, 16.0, null);
        Entity largeEntity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertTrue(smallEntity.intersects(110.0, 110.0, 16.0, 16.0));
        assertTrue(largeEntity.intersects(110.0, 110.0, 16.0, 16.0));
        assertFalse(smallEntity.intersects(120.0, 120.0, 16.0, 16.0));
        assertTrue(largeEntity.intersects(120.0, 120.0, 16.0, 16.0));
    }
    
    @Test
    void testIntersectsWithZeroCollisionSize() {
        // Arrange
        Entity zeroCollisionEntity = new Entity("grass", 100.0, 100.0, 0.0, 32.0, false, 0.0, 0.0, null);
        
        // Act & Assert
        assertFalse(zeroCollisionEntity.intersects(100.0, 100.0, 32.0, 32.0));
        assertFalse(zeroCollisionEntity.intersects(0.0, 0.0, 1000.0, 1000.0));
    }
    
    @Test
    void testIntersectsWithNegativeQueryArea() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertFalse(entity.intersects(100.0, 100.0, -10.0, 32.0));
        assertFalse(entity.intersects(100.0, 100.0, 32.0, -10.0));
        assertFalse(entity.intersects(100.0, 100.0, -10.0, -10.0));
    }
    
    @Test
    void testIntersectsWithZeroQueryArea() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertFalse(entity.intersects(100.0, 100.0, 0.0, 32.0));
        assertFalse(entity.intersects(100.0, 100.0, 32.0, 0.0));
        assertFalse(entity.intersects(100.0, 100.0, 0.0, 0.0));
    }
    
    @Test
    void testSetCollisionProperties() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0);
        
        // Act
        entity.setCollisionWidth(24.0);
        entity.setCollisionHeight(16.0);
        
        // Assert
        assertEquals(24.0, entity.getCollisionWidth(), 0.001);
        assertEquals(16.0, entity.getCollisionHeight(), 0.001);
    }
    
    @Test
    void testEntityEqualityWithCollisionProperties() {
        // Arrange
        Entity entity1 = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 24.0, 24.0, null);
        Entity entity2 = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 24.0, 24.0, null);
        Entity entity3 = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 32.0, 32.0, null);
        
        // Assert
        assertEquals(entity1, entity2);
        assertNotEquals(entity1, entity3);
    }
    
    @Test
    void testEntityCopyWithCollisionProperties() {
        // Arrange
        Entity original = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 24.0, 24.0, null);
        
        // Act
        Entity copy = original.copy();
        
        // Assert
        assertEquals(original, copy);
        assertNotSame(original, copy);
        assertEquals(24.0, copy.getCollisionWidth(), 0.001);
        assertEquals(24.0, copy.getCollisionHeight(), 0.001);
    }
    
    @Test
    void testEntityToStringWithCollisionProperties() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 24.0, 24.0, null);
        
        // Act
        String toString = entity.toString();
        
        // Assert
        assertTrue(toString.contains("tree"));
        assertTrue(toString.contains("100.0"));
        assertTrue(toString.contains("200.0"));
        assertTrue(toString.contains("45.0"));
        assertTrue(toString.contains("24.0"));
        assertTrue(toString.contains("collisionWidth"));
        assertTrue(toString.contains("collisionHeight"));
    }
} 