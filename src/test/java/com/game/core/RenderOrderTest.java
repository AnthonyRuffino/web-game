package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for render order and 2.5D layering functionality.
 */
class RenderOrderTest {

    @Test
    void testRenderOrderSorting() {
        // Create entities with different render orders
        Entity grass = new Entity("grass", 10.0, 20.0);
        grass.setImageConfig(new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, false));
        
        Entity rock = new Entity("rock", 15.0, 25.0);
        rock.setImageConfig(new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, false));
        
        Entity tree = new Entity("tree", 20.0, 30.0);
        tree.setImageConfig(new ImageConfiguration(1.2, 1.8, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true));
        
        Entity tree2 = new Entity("tree", 25.0, 35.0);
        tree2.setImageConfig(new ImageConfiguration(1.5, 2.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true));
        
        // Create list and sort by render order
        java.util.List<Entity> entities = java.util.List.of(grass, rock, tree, tree2);
        java.util.List<Entity> sortedEntities = new java.util.ArrayList<>(entities);
        
        sortedEntities.sort((e1, e2) -> {
            ImageConfiguration config1 = EntityConfigManager.getEffectiveImageConfig(e1);
            ImageConfiguration config2 = EntityConfigManager.getEffectiveImageConfig(e2);
            return Boolean.compare(config1.isRenderLast(), config2.isRenderLast());
        });
        
        // Verify order: renderLast=false entities first, then renderLast=true entities
        assertEquals("grass", sortedEntities.get(0).getType());
        assertEquals("rock", sortedEntities.get(1).getType());
        assertEquals("tree", sortedEntities.get(2).getType());
        assertEquals("tree", sortedEntities.get(3).getType());
        
        // Verify renderLast values
        assertFalse(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(0)).isRenderLast());
        assertFalse(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(1)).isRenderLast());
        assertTrue(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(2)).isRenderLast());
        assertTrue(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(3)).isRenderLast());
    }

    @Test
    void testRenderOrderWithTypeConfig() {
        // Create entities without instance config (should use type config)
        Entity grass = new Entity("grass", 10.0, 20.0);
        Entity rock = new Entity("rock", 15.0, 25.0);
        Entity tree = new Entity("tree", 20.0, 30.0);
        
        // Create list and sort by render order
        java.util.List<Entity> entities = java.util.List.of(grass, rock, tree);
        java.util.List<Entity> sortedEntities = new java.util.ArrayList<>(entities);
        
        sortedEntities.sort((e1, e2) -> {
            ImageConfiguration config1 = EntityConfigManager.getEffectiveImageConfig(e1);
            ImageConfiguration config2 = EntityConfigManager.getEffectiveImageConfig(e2);
            return Boolean.compare(config1.isRenderLast(), config2.isRenderLast());
        });
        
        // Verify order based on type configurations
        assertEquals("grass", sortedEntities.get(0).getType());
        assertEquals("rock", sortedEntities.get(1).getType());
        assertEquals("tree", sortedEntities.get(2).getType());
        
        // Verify renderLast values from type configs
        assertFalse(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(0)).isRenderLast()); // grass
        assertFalse(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(1)).isRenderLast()); // rock
        assertTrue(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(2)).isRenderLast());  // tree
    }

    @Test
    void testRenderOrderWithMixedConfigs() {
        // Create entities with mixed instance and type configs
        Entity grass = new Entity("grass", 10.0, 20.0);
        grass.setImageConfig(new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true)); // Override to render last
        
        Entity rock = new Entity("rock", 15.0, 25.0); // Use type config (renderLast=false)
        
        Entity tree = new Entity("tree", 20.0, 30.0);
        tree.setImageConfig(new ImageConfiguration(1.2, 1.8, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, false)); // Override to render first
        
        // Create list and sort by render order
        java.util.List<Entity> entities = java.util.List.of(grass, rock, tree);
        java.util.List<Entity> sortedEntities = new java.util.ArrayList<>(entities);
        
        sortedEntities.sort((e1, e2) -> {
            ImageConfiguration config1 = EntityConfigManager.getEffectiveImageConfig(e1);
            ImageConfiguration config2 = EntityConfigManager.getEffectiveImageConfig(e2);
            return Boolean.compare(config1.isRenderLast(), config2.isRenderLast());
        });
        
        // Verify order: renderLast=false first, then renderLast=true
        // Both tree and rock have renderLast=false, so order is based on original list order
        assertTrue(sortedEntities.get(0).getType().equals("tree") || sortedEntities.get(0).getType().equals("rock"));
        assertTrue(sortedEntities.get(1).getType().equals("tree") || sortedEntities.get(1).getType().equals("rock"));
        assertEquals("grass", sortedEntities.get(2).getType()); // Overridden to true
        
        // Verify renderLast values
        assertFalse(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(0)).isRenderLast());
        assertFalse(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(1)).isRenderLast());
        assertTrue(EntityConfigManager.getEffectiveImageConfig(sortedEntities.get(2)).isRenderLast());
    }

    @Test
    void testRenderOrderStability() {
        // Test that entities with same renderLast value maintain relative order
        Entity grass1 = new Entity("grass", 10.0, 20.0);
        Entity grass2 = new Entity("grass", 15.0, 25.0);
        Entity tree1 = new Entity("tree", 20.0, 30.0);
        Entity tree2 = new Entity("tree", 25.0, 35.0);
        
        // Create list and sort by render order
        java.util.List<Entity> entities = java.util.List.of(grass1, grass2, tree1, tree2);
        java.util.List<Entity> sortedEntities = new java.util.ArrayList<>(entities);
        
        sortedEntities.sort((e1, e2) -> {
            ImageConfiguration config1 = EntityConfigManager.getEffectiveImageConfig(e1);
            ImageConfiguration config2 = EntityConfigManager.getEffectiveImageConfig(e2);
            return Boolean.compare(config1.isRenderLast(), config2.isRenderLast());
        });
        
        // Verify order: all grass entities first, then all tree entities
        assertEquals("grass", sortedEntities.get(0).getType());
        assertEquals("grass", sortedEntities.get(1).getType());
        assertEquals("tree", sortedEntities.get(2).getType());
        assertEquals("tree", sortedEntities.get(3).getType());
        
        // Verify relative positions are maintained
        assertTrue(sortedEntities.get(0).getX() < sortedEntities.get(1).getX()); // grass1 before grass2
        assertTrue(sortedEntities.get(2).getX() < sortedEntities.get(3).getX()); // tree1 before tree2
    }
} 