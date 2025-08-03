package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for ImageConfiguration class.
 */
class ImageConfigurationTest {

    @Test
    void testDefaultConstructor() {
        ImageConfiguration config = new ImageConfiguration();
        
        assertEquals(1.0, config.getWidth());
        assertEquals(1.0, config.getHeight());
        assertNull(config.getFixedScreenAngle());
        assertEquals(RenderMode.CONFIGURED_SIZE, config.getRenderMode());
        assertEquals(1.0, config.getOpacity());
    }

    @Test
    void testFullConstructor() {
        ImageConfiguration config = new ImageConfiguration(
            1.5, 2.0, 0.5, RenderMode.GRID_FIT, 0.8, 0.0, 0.0
        );
        
        assertEquals(1.5, config.getWidth());
        assertEquals(2.0, config.getHeight());
        assertEquals(0.5, config.getFixedScreenAngle());
        assertEquals(RenderMode.GRID_FIT, config.getRenderMode());
        assertEquals(0.8, config.getOpacity());
    }

    @Test
    void testOpacityClamping() {
        // Test opacity below 0.0
        ImageConfiguration config1 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, -0.5, 0.0, 0.0);
        assertEquals(0.0, config1.getOpacity());
        
        // Test opacity above 1.0
        ImageConfiguration config2 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.5, 0.0, 0.0);
        assertEquals(1.0, config2.getOpacity());
        
        // Test valid opacity
        ImageConfiguration config3 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 0.7, 0.0, 0.0);
        assertEquals(0.7, config3.getOpacity());
    }

    @Test
    void testSetters() {
        ImageConfiguration config = new ImageConfiguration();
        
        config.setWidth(2.5);
        config.setHeight(3.0);
        config.setFixedScreenAngle(1.0);
        config.setRenderMode(RenderMode.ASPECT_RATIO_FIT);
        config.setOpacity(0.6);
        
        assertEquals(2.5, config.getWidth());
        assertEquals(3.0, config.getHeight());
        assertEquals(1.0, config.getFixedScreenAngle());
        assertEquals(RenderMode.ASPECT_RATIO_FIT, config.getRenderMode());
        assertEquals(0.6, config.getOpacity());
        
        // Test setting to null
        config.setFixedScreenAngle(null);
        assertNull(config.getFixedScreenAngle());
    }

    @Test
    void testSetOpacityClamping() {
        ImageConfiguration config = new ImageConfiguration();
        
        config.setOpacity(-0.3);
        assertEquals(0.0, config.getOpacity());
        
        config.setOpacity(1.2);
        assertEquals(1.0, config.getOpacity());
        
        config.setOpacity(0.5);
        assertEquals(0.5, config.getOpacity());
    }

    @Test
    void testCopy() {
        ImageConfiguration original = new ImageConfiguration(
            1.5, 2.0, 0.5, RenderMode.GRID_FIT, 0.8, 0.0, 0.0
        );
        
        ImageConfiguration copy = original.copy();
        
        assertNotSame(original, copy);
        assertEquals(original.getWidth(), copy.getWidth());
        assertEquals(original.getHeight(), copy.getHeight());
        assertEquals(original.getFixedScreenAngle(), copy.getFixedScreenAngle());
        assertEquals(original.getRenderMode(), copy.getRenderMode());
        assertEquals(original.getOpacity(), copy.getOpacity());
    }

    @Test
    void testEquals() {
        ImageConfiguration config1 = new ImageConfiguration(1.0, 2.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        ImageConfiguration config2 = new ImageConfiguration(1.0, 2.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        ImageConfiguration config3 = new ImageConfiguration(1.5, 2.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        
        assertEquals(config1, config2);
        assertNotEquals(config1, config3);
        assertNotEquals(config1, null);
        assertNotEquals(config1, "not a config");
    }

    @Test
    void testHashCode() {
        ImageConfiguration config1 = new ImageConfiguration(1.0, 2.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        ImageConfiguration config2 = new ImageConfiguration(1.0, 2.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        ImageConfiguration config3 = new ImageConfiguration(1.5, 2.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        
        assertEquals(config1.hashCode(), config2.hashCode());
        assertNotEquals(config1.hashCode(), config3.hashCode());
    }

    @Test
    void testToString() {
        ImageConfiguration config = new ImageConfiguration(1.5, 2.0, 0.5, RenderMode.GRID_FIT, 0.8, 0.0, 0.0);
        String result = config.toString();
        
        assertTrue(result.contains("width=1.50"));
        assertTrue(result.contains("height=2.00"));
        assertTrue(result.contains("angle=0.5"));
        assertTrue(result.contains("mode=GRID_FIT"));
        assertTrue(result.contains("opacity=0.80"));
    }
    
    @Test
    void testNullableFixedScreenAngle() {
        // Test with null fixedScreenAngle
        ImageConfiguration config1 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        assertNull(config1.getFixedScreenAngle());
        
        // Test with 0.0 fixedScreenAngle
        ImageConfiguration config2 = new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
        assertEquals(0.0, config2.getFixedScreenAngle());
        
        // Test toString with null angle
        String result = config1.toString();
        assertTrue(result.contains("angle=null"));
    }
    
    @Test
    void testDrawOffsets() {
        // Test draw offset getters and setters
        ImageConfiguration config = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.5, -0.3);
        assertEquals(0.5, config.getDrawOffsetX());
        assertEquals(-0.3, config.getDrawOffsetY());
        
        // Test setting offsets
        config.setDrawOffsetX(1.2);
        config.setDrawOffsetY(-0.8);
        assertEquals(1.2, config.getDrawOffsetX());
        assertEquals(-0.8, config.getDrawOffsetY());
    }
    
    @Test
    void testDrawOffsetsInCopy() {
        // Test that draw offsets are included in copy
        ImageConfiguration original = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.5, -0.3);
        ImageConfiguration copy = original.copy();
        
        assertEquals(original.getDrawOffsetX(), copy.getDrawOffsetX());
        assertEquals(original.getDrawOffsetY(), copy.getDrawOffsetY());
    }
    
    @Test
    void testDrawOffsetsInEquals() {
        // Test that draw offsets are included in equality comparison
        ImageConfiguration config1 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.5, -0.3);
        ImageConfiguration config2 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.5, -0.3);
        ImageConfiguration config3 = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.6, -0.3);
        
        assertEquals(config1, config2);
        assertNotEquals(config1, config3);
    }
    
    @Test
    void testDrawOffsetsInToString() {
        // Test that draw offsets are included in toString
        ImageConfiguration config = new ImageConfiguration(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.5, -0.3);
        String str = config.toString();
        assertTrue(str.contains("offsetX=0.50"));
        assertTrue(str.contains("offsetY=-0.30"));
    }
} 