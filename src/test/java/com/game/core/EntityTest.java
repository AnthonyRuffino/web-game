package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {
    
    @Test
    void testEntityCreationWithTypeAndPosition() {
        // Act
        Entity entity = new Entity("tree", 100.0, 200.0);
        
        // Assert
        assertEquals("tree", entity.getType());
        assertEquals(100.0, entity.getX(), 0.001);
        assertEquals(200.0, entity.getY(), 0.001);
        assertEquals(0.0, entity.getAngle(), 0.001);
        assertEquals(32.0, entity.getSize(), 0.001);
        assertTrue(entity.isCollision());
    }
    
    @Test
    void testEntityCreationWithTypePositionAndAngle() {
        // Act
        Entity entity = new Entity("rock", 150.0, 250.0, 45.0);
        
        // Assert
        assertEquals("rock", entity.getType());
        assertEquals(150.0, entity.getX(), 0.001);
        assertEquals(250.0, entity.getY(), 0.001);
        assertEquals(45.0, entity.getAngle(), 0.001);
        assertEquals(32.0, entity.getSize(), 0.001);
        assertTrue(entity.isCollision());
    }
    
    @Test
    void testEntityCreationWithAllParameters() {
        // Act
        Entity entity = new Entity("grass", 300.0, 400.0, 90.0, 16.0, false, null);
        
        // Assert
        assertEquals("grass", entity.getType());
        assertEquals(300.0, entity.getX(), 0.001);
        assertEquals(400.0, entity.getY(), 0.001);
        assertEquals(90.0, entity.getAngle(), 0.001);
        assertEquals(16.0, entity.getSize(), 0.001);
        assertFalse(entity.isCollision());
    }
    
    @Test
    void testEntityEquality() {
        // Arrange
        Entity entity1 = new Entity("tree", 100.0, 200.0);
        Entity entity2 = new Entity("tree", 100.0, 200.0);
        Entity entity3 = new Entity("rock", 100.0, 200.0);
        
        // Assert
        assertEquals(entity1, entity2);
        assertNotEquals(entity1, entity3);
    }
    
    @Test
    void testEntityToString() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, null);
        
        // Act
        String toString = entity.toString();
        
        // Assert
        assertTrue(toString.contains("tree"));
        assertTrue(toString.contains("100.0"));
        assertTrue(toString.contains("200.0"));
        assertTrue(toString.contains("45.0"));
    }
} 