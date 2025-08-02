package com.game.utils;

import javafx.scene.image.Image;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssetManagerTest {
    
    @TempDir
    Path tempDir;
    
    private AssetManager assetManager;
    private AssetDirectoryManager testDirectoryManager;
    
    @BeforeEach
    void setUp() {
        // Create test-specific assets directory
        Path testAssetsDir = tempDir.resolve("test-assets");
        testDirectoryManager = new AssetDirectoryManager(testAssetsDir);
        
        // Create a custom AssetManager with test directory
        assetManager = new AssetManager(testDirectoryManager);
    }
    
    @AfterEach
    void tearDown() {
        // Clean up test assets directory
        try {
            if (tempDir != null && Files.exists(tempDir)) {
                Files.walk(tempDir)
                    .sorted((a, b) -> b.compareTo(a)) // Delete files before directories
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            // Ignore cleanup errors
                        }
                    });
            }
        } catch (IOException e) {
            // Ignore cleanup errors
        }
    }
    
    @Test
    void testAssetManagerInitialization() {
        // Assert - Verify asset manager is initialized
        assertNotNull(assetManager);
        assertNotNull(assetManager.getDirectoryManager());
    }
    
    @Test
    void testGetEntityImageCaching() {
        // Act - Get image twice (this will generate images on-demand)
        assertDoesNotThrow(() -> {
            Image image1 = assetManager.getEntityImage("tree", "default");
            Image image2 = assetManager.getEntityImage("tree", "default");
            
            // Assert - Both calls should return the same image (cached)
            assertNotNull(image1);
            assertNotNull(image2);
            assertSame(image1, image2); // Should be the same cached instance
        });
    }
    
    @Test
    void testGetBackgroundImageCaching() {
        // Act - Get background image twice (this will generate images on-demand)
        assertDoesNotThrow(() -> {
            Image image1 = assetManager.getBackgroundImage("plains");
            Image image2 = assetManager.getBackgroundImage("plains");
            
            // Assert - Both calls should return the same image (cached)
            assertNotNull(image1);
            assertNotNull(image2);
            assertSame(image1, image2); // Should be the same cached instance
        });
    }
    
    @Test
    void testClearCache() {
        // Act - Clear cache
        assetManager.clearCache();
        
        // Assert - Cache should be cleared (no exceptions thrown)
        // In a real scenario, we would verify the cache is empty
        assertDoesNotThrow(() -> assetManager.clearCache());
    }
    
    @Test
    void testReplaceEntityImage() {
        // Arrange - Create test image data
        byte[] testImageData = createTestImageData();
        
        // Act - Replace entity image
        assetManager.replaceEntityImage("tree", "custom.png", testImageData);
        
        // Assert - No exceptions should be thrown
        assertDoesNotThrow(() -> assetManager.replaceEntityImage("tree", "custom.png", testImageData));
    }
    
    @Test
    void testGetDirectoryManager() {
        // Act
        AssetDirectoryManager manager = assetManager.getDirectoryManager();
        
        // Assert
        assertNotNull(manager);
        assertTrue(manager instanceof AssetDirectoryManager);
    }
    
    @Test
    void testImageGenerationFallback() {
        // Act - Try to get image (should generate on-demand)
        assertDoesNotThrow(() -> {
            Image image = assetManager.getEntityImage("tree", "default");
            
            // Assert - Should generate image successfully
            assertNotNull(image);
            assertTrue(image.getWidth() > 0);
            assertTrue(image.getHeight() > 0);
        });
    }
    
    @Test
    void testBackgroundImageGenerationFallback() {
        // Act - Try to get background image (should generate on-demand)
        assertDoesNotThrow(() -> {
            Image image = assetManager.getBackgroundImage("plains");
            
            // Assert - Should generate image successfully
            assertNotNull(image);
            assertTrue(image.getWidth() > 0);
            assertTrue(image.getHeight() > 0);
        });
    }
    
    private byte[] createTestImageData() {
        // Create a minimal PNG image data for testing
        // This is a 1x1 transparent PNG
        return new byte[] {
            (byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, // PNG signature
            (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A,
            // Minimal PNG data (simplified for testing)
            0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
            0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x00, 0x01, // width: 1
            0x00, 0x00, 0x00, 0x01, // height: 1
            0x08, 0x06, 0x00, 0x00, 0x00 // bit depth, color type, etc.
        };
    }
} 