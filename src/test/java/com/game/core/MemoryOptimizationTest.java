package com.game.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for memory optimization and image scaling functionality.
 */
class MemoryOptimizationTest {

    @Test
    void testLargeImageScaling() {
        // Test that large images are properly scaled for display
        Entity largeImageEntity = new Entity("tree", 10.0, 20.0);
        ImageConfiguration largeConfig = new ImageConfiguration(
            0.5,  // Small display size (50% of normal)
            0.8,  // Small display size (44% of normal)
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            true  // Render last
        );
        largeImageEntity.setImageConfig(largeConfig);
        
        // Calculate effective dimensions
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(largeImageEntity, 32);
        
        // Verify that display size is controlled by configuration, not file size
        assertEquals(16.0, dimensions[0]); // 0.5 * 32
        assertEquals(25.6, dimensions[1]); // 0.8 * 32
    }

    @Test
    void testSmallImageScaling() {
        // Test that small images are properly scaled for display
        Entity smallImageEntity = new Entity("grass", 15.0, 25.0);
        ImageConfiguration smallConfig = new ImageConfiguration(
            2.0,  // Large display size (200% of normal)
            1.5,  // Large display size (150% of normal)
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            false // Don't render last
        );
        smallImageEntity.setImageConfig(smallConfig);
        
        // Calculate effective dimensions
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(smallImageEntity, 32);
        
        // Verify that display size is controlled by configuration, not file size
        assertEquals(64.0, dimensions[0]); // 2.0 * 32
        assertEquals(48.0, dimensions[1]); // 1.5 * 32
    }

    @Test
    void testGridFitScaling() {
        // Test that GRID_FIT mode scales to tile size regardless of image size
        Entity gridFitEntity = new Entity("rock", 20.0, 30.0);
        ImageConfiguration gridConfig = new ImageConfiguration(
            5.0,  // Large configured size (should be ignored)
            3.0,  // Large configured size (should be ignored)
            0.0,  // Upright
            RenderMode.GRID_FIT,
            1.0,  // Full opacity
            false // Don't render last
        );
        gridFitEntity.setImageConfig(gridConfig);
        
        // Calculate effective dimensions
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(gridFitEntity, 32);
        
        // Verify that GRID_FIT ignores configured size and uses tile size
        assertEquals(32.0, dimensions[0]); // Tile size
        assertEquals(32.0, dimensions[1]); // Tile size
    }

    @Test
    void testAspectRatioFitScaling() {
        // Test that ASPECT_RATIO_FIT maintains aspect ratio
        Entity aspectRatioEntity = new Entity("tree", 25.0, 35.0);
        ImageConfiguration aspectConfig = new ImageConfiguration(
            2.0,  // Wide
            1.0,  // Tall
            0.0,  // Upright
            RenderMode.ASPECT_RATIO_FIT,
            1.0,  // Full opacity
            true  // Render last
        );
        aspectRatioEntity.setImageConfig(aspectConfig);
        
        // Calculate effective dimensions
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(aspectRatioEntity, 32);
        
        // Verify that aspect ratio is maintained
        assertEquals(64.0, dimensions[0]); // 2.0 * 32
        assertEquals(32.0, dimensions[1]); // 1.0 * 32
        
        // Aspect ratio should be 2:1
        double aspectRatio = dimensions[0] / dimensions[1];
        assertEquals(2.0, aspectRatio, 0.01);
    }

    @Test
    void testMemoryVsDisplaySizeRelationship() {
        // Test that memory usage and display size are independent
        Entity entity1 = new Entity("tree", 10.0, 20.0);
        ImageConfiguration config1 = new ImageConfiguration(
            0.5,  // Small display size
            0.5,  // Small display size
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            true  // Render last
        );
        entity1.setImageConfig(config1);
        
        Entity entity2 = new Entity("tree", 15.0, 25.0);
        ImageConfiguration config2 = new ImageConfiguration(
            2.0,  // Large display size
            2.0,  // Large display size
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            true  // Render last
        );
        entity2.setImageConfig(config2);
        
        // Calculate effective dimensions
        double[] dimensions1 = EntityConfigManager.calculateEffectiveDimensions(entity1, 32);
        double[] dimensions2 = EntityConfigManager.calculateEffectiveDimensions(entity2, 32);
        
        // Verify that display sizes are different
        assertNotEquals(dimensions1[0], dimensions2[0]);
        assertNotEquals(dimensions1[1], dimensions2[1]);
        
        // Small entity should have smaller display size
        assertTrue(dimensions1[0] < dimensions2[0]);
        assertTrue(dimensions1[1] < dimensions2[1]);
    }

    @Test
    void testDifferentImageSizes() {
        // Test different image sizes with same display configuration
        Entity entity1 = new Entity("tree", 10.0, 20.0);
        Entity entity2 = new Entity("tree", 15.0, 25.0);
        Entity entity3 = new Entity("tree", 20.0, 30.0);
        
        // All entities use same display configuration
        ImageConfiguration displayConfig = new ImageConfiguration(
            1.0,  // Normal display size
            1.0,  // Normal display size
            0.0,  // Upright
            RenderMode.CONFIGURED_SIZE,
            1.0,  // Full opacity
            true  // Render last
        );
        
        entity1.setImageConfig(displayConfig);
        entity2.setImageConfig(displayConfig);
        entity3.setImageConfig(displayConfig);
        
        // Calculate effective dimensions
        double[] dimensions1 = EntityConfigManager.calculateEffectiveDimensions(entity1, 32);
        double[] dimensions2 = EntityConfigManager.calculateEffectiveDimensions(entity2, 32);
        double[] dimensions3 = EntityConfigManager.calculateEffectiveDimensions(entity3, 32);
        
        // All entities should have same display size regardless of position
        assertEquals(dimensions1[0], dimensions2[0]);
        assertEquals(dimensions1[0], dimensions3[0]);
        assertEquals(dimensions1[1], dimensions2[1]);
        assertEquals(dimensions1[1], dimensions3[1]);
    }

    @Test
    void testConfigurationDrivenSizing() {
        // Test that sizing is driven by configuration, not file properties
        Entity entity = new Entity("tree", 10.0, 20.0);
        
        // Test multiple configurations
        ImageConfiguration[] configs = {
            new ImageConfiguration(0.5, 0.5, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true),
            new ImageConfiguration(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true),
            new ImageConfiguration(2.0, 2.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true),
            new ImageConfiguration(3.0, 1.5, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, true)
        };
        
        double[] expectedSizes = {16.0, 32.0, 64.0, 96.0}; // 0.5*32, 1.0*32, 2.0*32, 3.0*32
        
        for (int i = 0; i < configs.length; i++) {
            entity.setImageConfig(configs[i]);
            double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
            
            assertEquals(expectedSizes[i], dimensions[0]);
            assertEquals(expectedSizes[i] * configs[i].getHeight() / configs[i].getWidth(), dimensions[1]);
        }
    }

    @Test
    void testPerformanceOptimization() {
        // Test that effective configuration calculation is efficient
        Entity entity = new Entity("tree", 10.0, 20.0);
        
        // Measure performance of multiple configuration calculations
        long startTime = System.nanoTime();
        
        for (int i = 0; i < 1000; i++) {
            EntityConfigManager.getEffectiveImageConfig(entity);
            EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        }
        
        long endTime = System.nanoTime();
        long duration = endTime - startTime;
        
        // Should complete 1000 calculations in reasonable time (less than 1 second)
        assertTrue(duration < 1_000_000_000L); // 1 second in nanoseconds
        
        // Verify results are consistent
        ImageConfiguration config = EntityConfigManager.getEffectiveImageConfig(entity);
        double[] dimensions = EntityConfigManager.calculateEffectiveDimensions(entity, 32);
        
        assertNotNull(config);
        assertNotNull(dimensions);
        assertEquals(2, dimensions.length);
    }
} 