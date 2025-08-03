package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for instance-level configuration overrides and custom tree sizing.
 */
class InstanceLevelConfigTest {

    @Test
    void testInstanceConfigOverridesTypeConfig() {
        // Create tree with instance-level configuration
        Entity tree = new Entity("tree", 10.0, 20.0);
        ImageConfiguration instanceConfig = new ImageConfiguration(
            2.0,  // 67% wider than type config (1.2)
            3.0,  // 67% taller than type config (1.8)
            0.5,  // Custom angle (different from type config 0.0)
            RenderMode.CUSTOM_SIZE,  // Different render mode
            0.7,  // 30% transparent (different from type config 1.0)
            0.0,  // No X offset
            0.0   // No Y offset
        );
        tree.setImageConfig(instanceConfig);
        
        // Verify instance config overrides type config
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        assertEquals(instanceConfig, effective);
        assertEquals(2.0, effective.getWidth());
        assertEquals(3.0, effective.getHeight());
        assertEquals(0.5, effective.getFixedScreenAngle());
        assertEquals(RenderMode.CUSTOM_SIZE, effective.getRenderMode());
        assertEquals(0.7, effective.getOpacity());
    }

    @Test
    void testInstanceConfigInheritance() {
        // Create tree without instance config (should use type config)
        Entity tree = new Entity("tree", 10.0, 20.0);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        ImageConfiguration typeConfig = EntityConfigManager.getEntityTypeImageConfig("tree");
        
        // Should inherit from type config
        assertEquals(typeConfig.getWidth(), effective.getWidth());
        assertEquals(typeConfig.getHeight(), effective.getHeight());
        assertEquals(typeConfig.getFixedScreenAngle(), effective.getFixedScreenAngle());
        assertEquals(typeConfig.getRenderMode(), effective.getRenderMode());
        assertEquals(typeConfig.getOpacity(), effective.getOpacity());
    }

    @Test
    void testPartialInstanceConfigOverride() {
        // Create tree with partial instance config (only some properties)
        Entity tree = new Entity("tree", 10.0, 20.0);
        ImageConfiguration partialConfig = new ImageConfiguration(
            1.5,  // Only override width
            1.8,  // Keep type config height
            null,  // Keep type config angle
            RenderMode.CONFIGURED_SIZE,  // Keep type config render mode
            0.8,  // Only override opacity
            0.0,  // No X offset
            0.0   // No Y offset
        );
        tree.setImageConfig(partialConfig);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        
        // Verify partial overrides
        assertEquals(1.5, effective.getWidth());  // Overridden
        assertEquals(1.8, effective.getHeight()); // From type config
        assertNull(effective.getFixedScreenAngle()); // From type config
        assertEquals(RenderMode.CONFIGURED_SIZE, effective.getRenderMode()); // From type config
        assertEquals(0.8, effective.getOpacity()); // Overridden
    }

    @Test
    void testCustomTreeSizingExample() {
        // Example: Create a custom tall tree
        Entity tallTree = new Entity("tree", 15.0, 25.0);
        ImageConfiguration tallConfig = new ImageConfiguration(
            1.0,  // Normal width
            2.5,  // 39% taller than normal (1.8)
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            0.0,  // No X offset
            0.0   // No Y offset
        );
        tallTree.setImageConfig(tallConfig);
        
        // Example: Create a custom wide tree
        Entity wideTree = new Entity("tree", 20.0, 30.0);
        ImageConfiguration wideConfig = new ImageConfiguration(
            2.0,  // 67% wider than normal (1.2)
            1.8,  // Normal height
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            0.0,  // No X offset
            0.0   // No Y offset
        );
        wideTree.setImageConfig(wideConfig);
        
        // Example: Create a transparent tree
        Entity transparentTree = new Entity("tree", 25.0, 35.0);
        ImageConfiguration transparentConfig = new ImageConfiguration(
            1.2,  // Normal width
            1.8,  // Normal height
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            0.5,  // 50% transparent
            0.0,  // No X offset
            0.0   // No Y offset
        );
        transparentTree.setImageConfig(transparentConfig);
        
        // Verify custom configurations
        ImageConfiguration tallEffective = EntityConfigManager.getEffectiveImageConfig(tallTree);
        ImageConfiguration wideEffective = EntityConfigManager.getEffectiveImageConfig(wideTree);
        ImageConfiguration transparentEffective = EntityConfigManager.getEffectiveImageConfig(transparentTree);
        
        assertEquals(1.0, tallEffective.getWidth());
        assertEquals(2.5, tallEffective.getHeight());
        
        assertEquals(2.0, wideEffective.getWidth());
        assertEquals(1.8, wideEffective.getHeight());
        
        assertEquals(0.5, transparentEffective.getOpacity());
    }

    @Test
    void testInstanceConfigCopy() {
        // Test that instance config is properly copied
        Entity original = new Entity("tree", 10.0, 20.0);
        ImageConfiguration config = new ImageConfiguration(1.5, 2.0, 0.5, RenderMode.CUSTOM_SIZE, 0.8, 0.0, 0.0);
        original.setImageConfig(config);
        
        Entity copy = original.copy();
        
        // Verify copy has same configuration
        ImageConfiguration originalEffective = EntityConfigManager.getEffectiveImageConfig(original);
        ImageConfiguration copyEffective = EntityConfigManager.getEffectiveImageConfig(copy);
        
        assertEquals(originalEffective, copyEffective);
        assertNotSame(originalEffective, copyEffective); // Should be different objects
    }

    @Test
    void testInstanceConfigNullHandling() {
        // Test that null instance config is handled correctly
        Entity tree = new Entity("tree", 10.0, 20.0);
        tree.setImageConfig(null);
        
        ImageConfiguration effective = EntityConfigManager.getEffectiveImageConfig(tree);
        ImageConfiguration typeConfig = EntityConfigManager.getEntityTypeImageConfig("tree");
        
        // Should fall back to type config
        assertEquals(typeConfig, effective);
    }

    @Test
    void testInstanceConfigEquality() {
        // Test that entities with same instance config are equal
        Entity tree1 = new Entity("tree", 10.0, 20.0);
        Entity tree2 = new Entity("tree", 10.0, 20.0);
        
        ImageConfiguration config = new ImageConfiguration(1.5, 2.0, 0.5, RenderMode.CUSTOM_SIZE, 0.8, 0.0, 0.0);
        tree1.setImageConfig(config);
        tree2.setImageConfig(config.copy());
        
        assertEquals(tree1, tree2);
    }

    @Test
    void testInstanceConfigInequality() {
        // Test that entities with different instance configs are not equal
        Entity tree1 = new Entity("tree", 10.0, 20.0);
        Entity tree2 = new Entity("tree", 10.0, 20.0);
        
        ImageConfiguration config1 = new ImageConfiguration(1.5, 2.0, 0.5, RenderMode.CUSTOM_SIZE, 0.8, 0.0, 0.0);
        ImageConfiguration config2 = new ImageConfiguration(1.6, 2.0, 0.5, RenderMode.CUSTOM_SIZE, 0.8, 0.0, 0.0);
        
        tree1.setImageConfig(config1);
        tree2.setImageConfig(config2);
        
        assertNotEquals(tree1, tree2);
    }
} 