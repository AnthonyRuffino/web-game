package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for tree orientation and fixed screen angle functionality.
 */
class TreeOrientationTest {

    @Test
    void testTreeDefaultConfiguration() {
        // Test that tree type configuration has fixedScreenAngle = 0.0
        ImageConfiguration treeConfig = EntityConfigManager.getEntityTypeImageConfig("tree");
        
        assertEquals(0.0, treeConfig.getFixedScreenAngle());
        assertEquals(1.2, treeConfig.getWidth());
        assertEquals(1.8, treeConfig.getHeight());
    }

    @Test
    void testTreeInstanceConfiguration() {
        // Test tree with instance-level configuration
        Entity tree = new Entity("tree", 10.0, 20.0);
        ImageConfiguration customConfig = new ImageConfiguration(1.5, 2.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0);
        tree.setImageConfig(customConfig);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        
        assertEquals(0.0, effective.getFixedScreenAngle());
        assertEquals(1.5, effective.getWidth());
        assertEquals(2.0, effective.getHeight());
    }

    @Test
    void testTreeWithCustomFixedScreenAngle() {
        // Test tree with custom fixed screen angle
        Entity tree = new Entity("tree", 10.0, 20.0);
        ImageConfiguration customConfig = new ImageConfiguration(1.2, 1.8, 0.5, RenderMode.CONFIGURED_SIZE, 1.0);
        tree.setImageConfig(customConfig);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        
        assertEquals(0.5, effective.getFixedScreenAngle());
    }

    @Test
    void testNonTreeEntitiesFixedScreenAngle() {
        // Test that non-tree entities have different fixed screen angle behavior
        Entity grass = new Entity("grass", 10.0, 20.0);
        Entity rock = new Entity("rock", 15.0, 25.0);
        
        ImageConfiguration grassConfig = EntityConfigManager.getEffectiveImageConfig(grass);
        ImageConfiguration rockConfig = EntityConfigManager.getEffectiveImageConfig(rock);
        
        // Both grass and rock should have fixedScreenAngle = null (default)
        assertNull(grassConfig.getFixedScreenAngle());
        assertNull(rockConfig.getFixedScreenAngle());
    }

    @Test
    void testTreeConfigurationInheritance() {
        // Test that tree entities without instance config use type config
        Entity tree = new Entity("tree", 10.0, 20.0);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        
        // Should inherit from tree type configuration
        assertEquals(0.0, effective.getFixedScreenAngle());
        assertEquals(1.2, effective.getWidth());
        assertEquals(1.8, effective.getHeight());
    }

    @Test
    void testTreeConfigurationOverride() {
        // Test that instance config overrides type config
        Entity tree = new Entity("tree", 10.0, 20.0);
        ImageConfiguration instanceConfig = new ImageConfiguration(2.0, 3.0, 1.0, RenderMode.CUSTOM_SIZE, 0.8);
        tree.setImageConfig(instanceConfig);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        
        // Should use instance config values
        assertEquals(1.0, effective.getFixedScreenAngle());
        assertEquals(2.0, effective.getWidth());
        assertEquals(3.0, effective.getHeight());
        assertEquals(0.8, effective.getOpacity());
        assertEquals(RenderMode.CUSTOM_SIZE, effective.getRenderMode());
    }

    @Test
    void testTreeUprightRequirement() {
        // Test that trees are configured to always appear upright
        ImageConfiguration treeConfig = EntityConfigManager.getEntityTypeImageConfig("tree");
        
        // Trees should have fixedScreenAngle = 0.0 to appear upright
        assertEquals(0.0, treeConfig.getFixedScreenAngle());
        
        // This ensures trees always face upward (fixed angle of 0.0)
        assertEquals(0.0, treeConfig.getFixedScreenAngle());
    }


} 