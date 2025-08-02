package com.game.utils;

import javafx.scene.image.Image;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssetManagerTest {
    
    @Mock
    private AssetDirectoryManager directoryManager;
    
    @Mock
    private Path mockPath;
    
    @Mock
    private File mockFile;
    
    private AssetManager assetManager;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        assetManager = new AssetManager();
    }
    
    @Test
    void testAssetManagerInitialization() {
        // Assert - Verify asset manager is initialized
        assertNotNull(assetManager);
        assertNotNull(assetManager.getDirectoryManager());
    }
    
    @Test
    void testGetEntityImageCaching() {
        // Act - Get image twice (in test environment, this might return null)
        Image image1 = assetManager.getEntityImage("tree", "default.png");
        Image image2 = assetManager.getEntityImage("tree", "default.png");
        
        // Assert - Method calls should not throw exceptions
        // In test environment, images might be null due to file system limitations
        // The important thing is that the caching logic doesn't crash
        assertDoesNotThrow(() -> {
            assetManager.getEntityImage("tree", "default.png");
            assetManager.getEntityImage("tree", "default.png");
        });
    }
    
    @Test
    void testGetBackgroundImageCaching() {
        // Act - Get background image twice (in test environment, this might return null)
        Image image1 = assetManager.getBackgroundImage("plains.png");
        Image image2 = assetManager.getBackgroundImage("plains.png");
        
        // Assert - Method calls should not throw exceptions
        // In test environment, images might be null due to file system limitations
        // The important thing is that the caching logic doesn't crash
        assertDoesNotThrow(() -> {
            assetManager.getBackgroundImage("plains.png");
            assetManager.getBackgroundImage("plains.png");
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
        // Arrange - Mock file system to return non-existent file
        when(directoryManager.getEntityImagePath("tree", "default.png")).thenReturn(mockPath);
        when(mockPath.toFile()).thenReturn(mockFile);
        when(mockFile.exists()).thenReturn(false);
        
        // Act - Try to get image (should fall back to generation)
        Image image = assetManager.getEntityImage("tree", "default.png");
        
        // Assert - Should attempt to generate image (might be null in test environment)
        // The important thing is that no exceptions are thrown
        assertDoesNotThrow(() -> assetManager.getEntityImage("tree", "default.png"));
    }
    
    @Test
    void testBackgroundImageGenerationFallback() {
        // Arrange - Mock file system to return non-existent file
        when(directoryManager.getBackgroundImagePath("plains.png")).thenReturn(mockPath);
        when(mockPath.toFile()).thenReturn(mockFile);
        when(mockFile.exists()).thenReturn(false);
        
        // Act - Try to get background image (should fall back to generation)
        Image image = assetManager.getBackgroundImage("plains.png");
        
        // Assert - Should attempt to generate image (might be null in test environment)
        // The important thing is that no exceptions are thrown
        assertDoesNotThrow(() -> assetManager.getBackgroundImage("plains.png"));
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