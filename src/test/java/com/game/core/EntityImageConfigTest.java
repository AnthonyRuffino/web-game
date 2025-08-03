package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for Entity ImageConfiguration integration.
 */
class EntityImageConfigTest {

    @Test
    void testEntityWithNoImageConfig() {
        Entity entity = new Entity("grass", 10.0, 20.0);
        
        assertEquals("grass", entity.getType());
        assertEquals(10.0, entity.getX());
        assertEquals(20.0, entity.getY());
        assertEquals(0.0, entity.getAngle());
        assertEquals(32.0, entity.getSize());
        assertTrue(entity.isCollision());
        assertNull(entity.getImageConfig());
        assertNull(entity.getEffectiveImageConfig());
    }

    @Test
    void testEntityWithImageConfig() {
        ImageConfiguration config = new ImageConfiguration(1.5, 2.0, 0.0, RenderMode.CONFIGURED_SIZE, 0.8, 0.0, 0.0);
        Entity entity = new Entity("tree", 15.0, 25.0, 0.5, 48.0, true, 48.0, 48.0, config);
        
        assertEquals("tree", entity.getType());
        assertEquals(15.0, entity.getX());
        assertEquals(25.0, entity.getY());
        assertEquals(0.5, entity.getAngle());
        assertEquals(48.0, entity.getSize());
        assertTrue(entity.isCollision());
        assertEquals(config, entity.getImageConfig());
        assertEquals(config, entity.getEffectiveImageConfig());
    }

    @Test
    void testSetImageConfig() {
        Entity entity = new Entity("rock", 5.0, 10.0);
        ImageConfiguration config = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.GRID_FIT, 1.0, 0.0, 0.0);
        
        entity.setImageConfig(config);
        assertEquals(config, entity.getImageConfig());
        assertEquals(config, entity.getEffectiveImageConfig());
    }

    @Test
    void testSetImageConfigToNull() {
        ImageConfiguration config = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        Entity entity = new Entity("grass", 1.0, 1.0, 0.0, 32.0, true, 32.0, 32.0, config);
        
        entity.setImageConfig(null);
        assertNull(entity.getImageConfig());
        assertNull(entity.getEffectiveImageConfig());
    }

    @Test
    void testEntityCopy() {
        ImageConfiguration config = new ImageConfiguration(1.2, 1.8, 0.0, RenderMode.CONFIGURED_SIZE, 0.9, 0.0, 0.0);
        Entity original = new Entity("tree", 10.0, 20.0, 0.3, 48.0, true, 48.0, 48.0, config);
        
        Entity copy = original.copy();
        
        assertNotSame(original, copy);
        assertEquals(original.getType(), copy.getType());
        assertEquals(original.getX(), copy.getX());
        assertEquals(original.getY(), copy.getY());
        assertEquals(original.getAngle(), copy.getAngle());
        assertEquals(original.getSize(), copy.getSize());
        assertEquals(original.isCollision(), copy.isCollision());
        assertNotSame(original.getImageConfig(), copy.getImageConfig());
        assertEquals(original.getImageConfig(), copy.getImageConfig());
    }

    @Test
    void testEntityCopyWithNullImageConfig() {
        Entity original = new Entity("grass", 5.0, 10.0);
        
        Entity copy = original.copy();
        
        assertNotSame(original, copy);
        assertEquals(original.getType(), copy.getType());
        assertEquals(original.getX(), copy.getX());
        assertEquals(original.getY(), copy.getY());
        assertNull(copy.getImageConfig());
    }

    @Test
    void testEntityEquals() {
        ImageConfiguration config1 = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        ImageConfiguration config2 = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        
        Entity entity1 = new Entity("grass", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, config1);
        Entity entity2 = new Entity("grass", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, config2);
        Entity entity3 = new Entity("tree", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, config1);
        
        assertEquals(entity1, entity2);
        assertNotEquals(entity1, entity3);
        assertNotEquals(entity1, null);
        assertNotEquals(entity1, "not an entity");
    }

    @Test
    void testEntityEqualsWithNullImageConfig() {
        Entity entity1 = new Entity("grass", 10.0, 20.0);
        Entity entity2 = new Entity("grass", 10.0, 20.0);
        Entity entity3 = new Entity("grass", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, new ImageConfiguration());
        
        assertEquals(entity1, entity2);
        assertNotEquals(entity1, entity3);
    }

    @Test
    void testEntityHashCode() {
        ImageConfiguration config1 = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        ImageConfiguration config2 = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        
        Entity entity1 = new Entity("grass", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, config1);
        Entity entity2 = new Entity("grass", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, config2);
        Entity entity3 = new Entity("tree", 10.0, 20.0, 0.0, 32.0, true, 32.0, 32.0, config1);
        
        assertEquals(entity1.hashCode(), entity2.hashCode());
        assertNotEquals(entity1.hashCode(), entity3.hashCode());
    }

    @Test
    void testEntityToString() {
        ImageConfiguration config = new ImageConfiguration(1.2, 1.8, 0.0, RenderMode.CONFIGURED_SIZE, 0.8, 0.0, 0.0);
        Entity entity = new Entity("tree", 10.0, 20.0, 0.5, 48.0, true, 48.0, 48.0, config);
        
        String result = entity.toString();
        
        assertTrue(result.contains("type='tree'"));
        assertTrue(result.contains("x=10.00"));
        assertTrue(result.contains("y=20.00"));
        assertTrue(result.contains("angle=0.50"));
        assertTrue(result.contains("size=48.00"));
        assertTrue(result.contains("collision=true"));
        assertTrue(result.contains("imageConfig="));
    }

    @Test
    void testEntityToStringWithNullImageConfig() {
        Entity entity = new Entity("grass", 5.0, 10.0);
        
        String result = entity.toString();
        
        assertTrue(result.contains("type='grass'"));
        assertTrue(result.contains("imageConfig=null"));
    }
} 