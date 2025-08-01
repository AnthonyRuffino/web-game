package com.game.graphics.svg;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.io.TempDir;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Path;
import java.nio.file.Files;

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
    void testSimpleSvgRendering() throws Exception {
        String simpleSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="20" fill="red"/>
            </svg>
            """;
        
        BufferedImage image = SvgGeneratorWebView.svgToImage(simpleSvg, 64, 64);
        
        assertNotNull(image);
        assertEquals(64, image.getWidth());
        assertEquals(64, image.getHeight());
    }
    
    @Test
    void testSvgToPngFile() throws Exception {
        String testSvg = """
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="24" height="24" fill="blue"/>
            </svg>
            """;
        
        Path outputPath = tempDir.resolve("test-output.png");
        SvgGeneratorWebView.svgToPngFile(testSvg, outputPath, 32, 32);
        
        assertTrue(Files.exists(outputPath));
        assertTrue(Files.size(outputPath) > 0);
        
        // Verify the image can be read back
        BufferedImage readImage = ImageIO.read(outputPath.toFile());
        assertNotNull(readImage);
        assertEquals(32, readImage.getWidth());
        assertEquals(32, readImage.getHeight());
    }
    
    @Test
    void testGenerateTreeImage() throws Exception {
        BufferedImage treeImage = SvgGeneratorWebView.generateTreeImage(64);
        
        assertNotNull(treeImage);
        // Tree uses configurable dimensions: width = foliageRadius*2 (48), height = imageHeight (96)
        assertEquals(48, treeImage.getWidth());
        assertEquals(96, treeImage.getHeight());
    }
    
    @Test
    void testGenerateRockImage() throws Exception {
        BufferedImage rockImage = SvgGeneratorWebView.generateRockImage(64);
        
        assertNotNull(rockImage);
        assertEquals(64, rockImage.getWidth());
        assertEquals(64, rockImage.getHeight());
    }
    
    @Test
    void testGenerateGrassImage() throws Exception {
        BufferedImage grassImage = SvgGeneratorWebView.generateGrassImage(64);
        
        assertNotNull(grassImage);
        assertEquals(64, grassImage.getWidth());
        assertEquals(64, grassImage.getHeight());
    }
    
    @Test
    void testSvgSanitization() {
        String maliciousSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <script>alert('malicious')</script>
                <circle cx="32" cy="32" r="20" fill="red" onclick="alert('click')"/>
            </svg>
            """;
        
        String sanitized = SvgGeneratorWebView.sanitizeSvg(maliciousSvg);
        
        assertFalse(sanitized.contains("<script>"));
        assertFalse(sanitized.contains("onclick"));
        assertTrue(sanitized.contains("<circle"));
        assertTrue(sanitized.contains("fill=\"red\""));
    }
    
    @Test
    void testImageToBytesConversion() throws Exception {
        String testSvg = """
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="12" height="12" fill="green"/>
            </svg>
            """;
        
        BufferedImage image = SvgGeneratorWebView.svgToImage(testSvg, 16, 16);
        byte[] bytes = SvgGeneratorWebView.imageToBytes(image);
        BufferedImage restoredImage = SvgGeneratorWebView.bytesToImage(bytes);
        
        assertNotNull(bytes);
        assertTrue(bytes.length > 0);
        assertNotNull(restoredImage);
        assertEquals(16, restoredImage.getWidth());
        assertEquals(16, restoredImage.getHeight());
    }
} 