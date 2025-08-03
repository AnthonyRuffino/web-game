package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for EntityConfigManager configuration inheritance and sizing calculations.
 */
class EntityConfigManagerTest {

    @Test
    void testGetEffectiveImageConfigWithInstanceConfig() {
        // Entity with instance-level configuration
        ImageConfiguration instanceConfig = new ImageConfiguration(2.0, 3.0, 0.5, RenderMode.CUSTOM_SIZE, 0.8, true);
        Entity entity = new Entity("tree", 10.0, 20.0);
        entity.setImageConfig(instanceConfig);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(entity);
        
        assertEquals(instanceConfig, effective);
    }

    @Test
    void testGetEffectiveImageConfigWithoutInstanceConfig() {
        // Entity without instance-level configuration
        Entity entity = new Entity("tree", 10.0, 20.0);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(entity);
        
        // Should get tree type configuration
        assertNotNull(effective);
        assertEquals(1.2, effective.getWidth());
        assertEquals(1.8, effective.getHeight());
        assertEquals(0.0, effective.getFixedScreenAngle());
        assertEquals(RenderMode.CONFIGURED_SIZE, effective.getRenderMode());
        assertEquals(1.0, effective.getOpacity());
        assertTrue(effective.isRenderLast());
    }

    @Test
    void testGetEntityTypeImageConfig() {
        // Test tree configuration
        ImageConfiguration treeConfig = EntityConfigManager.getEntityTypeImageConfig("tree");
        assertEquals(1.2, treeConfig.getWidth());
        assertEquals(1.8, treeConfig.getHeight());
        assertTrue(treeConfig.isRenderLast());
        
        // Test rock configuration
        ImageConfiguration rockConfig = EntityConfigManager.getEntityTypeImageConfig("rock");
        assertEquals(1.0, rockConfig.getWidth());
        assertEquals(1.0, rockConfig.getHeight());
        assertFalse(rockConfig.isRenderLast());
        
        // Test grass configuration
        ImageConfiguration grassConfig = EntityConfigManager.getEntityTypeImageConfig("grass");
        assertEquals(1.0, grassConfig.getWidth());
        assertEquals(1.0, grassConfig.getHeight());
        assertFalse(grassConfig.isRenderLast());
        
        // Test unknown type (should return default)
        ImageConfiguration defaultConfig = EntityConfigManager.getEntityTypeImageConfig("unknown");
        assertEquals(1.0, defaultConfig.getWidth());
        assertEquals(1.0, defaultConfig.getHeight());
        assertEquals(RenderMode.CONFIGURED_SIZE, defaultConfig.getRenderMode());
    }

    @Test
    void testCalculateEffectiveSizeGridFit() {
        Entity entity = new Entity("grass", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.GRID_FIT, 1.0, false));
        
        double size = EntityConfigManager.calculateEffectiveSize(entity, 32);
        
        assertEquals(32.0, size); // Should be tile size
    }

    @Test
    void testCalculateEffectiveSizeConfiguredSize() {
        Entity entity = new Entity("tree", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(1.5, 2.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true));
        
        double size = EntityConfigManager.calculateEffectiveSize(entity, 32);
        
        assertEquals(48.0, size); // 1.5 * 32
    }

    @Test
    void testCalculateEffectiveSizeAspectRatioFit() {
        Entity entity = new Entity("rock", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(2.0, 1.0, 0.0, RenderMode.ASPECT_RATIO_FIT, 1.0, false));
        
        double size = EntityConfigManager.calculateEffectiveSize(entity, 32);
        
        assertEquals(32.0, size); // Min of width (64) and height (32)
    }

    @Test
    void testCalculateEffectiveDimensionsGridFit() {
        Entity entity = new Entity("grass", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.GRID_FIT, 1.0, false));
        
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        
        assertEquals(32.0, dimensions[0]); // width
        assertEquals(32.0, dimensions[1]); // height
    }

    @Test
    void testCalculateEffectiveDimensionsConfiguredSize() {
        Entity entity = new Entity("tree", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(1.5, 2.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true));
        
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        
        assertEquals(48.0, dimensions[0]); // width: 1.5 * 32
        assertEquals(64.0, dimensions[1]); // height: 2.0 * 32
    }

    @Test
    void testCalculateEffectiveDimensionsAspectRatioFitWide() {
        Entity entity = new Entity("rock", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(2.0, 1.0, 0.0, RenderMode.ASPECT_RATIO_FIT, 1.0, false));
        
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        
        assertEquals(64.0, dimensions[0]); // width: 2.0 * 32
        assertEquals(32.0, dimensions[1]); // height: 1.0 * 32
    }

    @Test
    void testCalculateEffectiveDimensionsAspectRatioFitTall() {
        Entity entity = new Entity("tree", 10.0, 20.0);
        entity.setImageConfig(new ImageConfiguration(1.0, 2.0, 0.0, RenderMode.ASPECT_RATIO_FIT, 1.0, true));
        
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        
        assertEquals(32.0, dimensions[0]); // width: 1.0 * 32
        assertEquals(64.0, dimensions[1]); // height: 2.0 * 32
    }

    @Test
    void testCalculateEffectiveSizeWithTypeConfig() {
        // Entity without instance config should use type config
        Entity entity = new Entity("tree", 10.0, 20.0);
        
        double size = EntityConfigManager.calculateEffectiveSize(entity, 32);
        
        assertEquals(38.4, size, 0.1); // 1.2 * 32 (tree config width)
    }

    @Test
    void testCalculateEffectiveDimensionsWithTypeConfig() {
        // Entity without instance config should use type config
        Entity entity = new Entity("tree", 10.0, 20.0);
        
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        
        assertEquals(38.4, dimensions[0], 0.1); // width: 1.2 * 32
        assertEquals(57.6, dimensions[1], 0.1); // height: 1.8 * 32
    }
} 