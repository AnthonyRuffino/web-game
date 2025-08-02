package com.game.graphics.svg;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.io.TempDir;

import java.awt.image.BufferedImage;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for SvgGeneratorWebView
 * Note: These tests require JavaFX runtime to be available
 */
public class SvgGeneratorWebViewTest {
    
    @TempDir
    Path tempDir;
    
    @BeforeAll
    static void setupJavaFX() {
        // Ensure JavaFX is initialized for testing
        try {
            javafx.application.Platform.startup(() -> {});
        } catch (Exception e) {
            // JavaFX might already be initialized
        }
    }
    
    @Test
    void testGenerateTreeImage() throws Exception {
        BufferedImage treeImage = ImageGenerator.generateTreeImage(64);
        
        assertNotNull(treeImage);
        // Tree uses configurable dimensions: width = foliageRadius*2 (48), height = imageHeight (96)
        assertEquals(48, treeImage.getWidth());
        assertEquals(96, treeImage.getHeight());
    }
    
    @Test
    void testGenerateRockImage() throws Exception {
        BufferedImage rockImage = ImageGenerator.generateRockImage(64);
        
        assertNotNull(rockImage);
        assertEquals(64, rockImage.getWidth());
        assertEquals(64, rockImage.getHeight());
    }
    
    @Test
    void testGenerateGrassImage() throws Exception {
        BufferedImage grassImage = ImageGenerator.generateGrassImage(64);
        
        assertNotNull(grassImage);
        assertEquals(64, grassImage.getWidth());
        assertEquals(64, grassImage.getHeight());
    }
} 