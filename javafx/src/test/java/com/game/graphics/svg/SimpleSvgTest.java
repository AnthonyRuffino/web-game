package com.game.graphics.svg;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Simple test to verify SVG generator functionality
 */
public class SimpleSvgTest {
    
    @TempDir
    Path tempDir;
    
    @Test
    void testBasicSvgGeneration() throws Exception {
        // Test the fallback implementation
        String simpleSvg = """
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="red"/>
            </svg>
            """;
        
        // Test SvgGenerator (fallback)
        BufferedImage image1 = SvgGenerator.svgToImage(simpleSvg, 32);
        assertNotNull(image1);
        assertEquals(32, image1.getWidth());
        assertEquals(32, image1.getHeight());
        
        // Test SvgGeneratorWebView (delegates to SvgGenerator)
        BufferedImage image2 = SvgGeneratorWebView.svgToImage(simpleSvg, 32, 32);
        assertNotNull(image2);
        assertEquals(32, image2.getWidth());
        assertEquals(32, image2.getHeight());
        
        // Save test image
        Path outputPath = tempDir.resolve("test-circle.png");
        ImageIO.write(image1, "PNG", outputPath.toFile());
        assertTrue(outputPath.toFile().exists());
        assertTrue(outputPath.toFile().length() > 0);
        
        System.out.println("Test completed successfully. Image saved to: " + outputPath);
    }
    
    @Test
    void testGameAssets() throws Exception {
        // Test tree generation (now uses configurable size)
        BufferedImage treeImage = SvgGenerator.generateTreeImage(64);
        assertNotNull(treeImage);
        // Tree uses imageHeight from config (96) and width based on foliageRadius*2 (48)
        assertEquals(48, treeImage.getWidth());
        assertEquals(96, treeImage.getHeight());
        
        // Test rock generation
        BufferedImage rockImage = SvgGenerator.generateRockImage(64);
        assertNotNull(rockImage);
        assertEquals(64, rockImage.getWidth());
        assertEquals(64, rockImage.getHeight());
        
        // Test grass generation
        BufferedImage grassImage = SvgGenerator.generateGrassImage(64);
        assertNotNull(grassImage);
        assertEquals(64, grassImage.getWidth());
        assertEquals(64, grassImage.getHeight());
        
        // Save test images
        ImageIO.write(treeImage, "PNG", tempDir.resolve("tree.png").toFile());
        ImageIO.write(rockImage, "PNG", tempDir.resolve("rock.png").toFile());
        ImageIO.write(grassImage, "PNG", tempDir.resolve("grass.png").toFile());
        
        System.out.println("Game assets generated successfully in: " + tempDir);
    }
    
    @Test
    void testSvgSanitization() {
        String maliciousSvg = """
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <script>alert('malicious')</script>
                <circle cx="16" cy="16" r="12" fill="red" onclick="alert('click')"/>
            </svg>
            """;
        
        String sanitized = SvgGeneratorWebView.sanitizeSvg(maliciousSvg);
        
        assertFalse(sanitized.contains("<script>"));
        assertFalse(sanitized.contains("onclick"));
        assertTrue(sanitized.contains("<circle"));
        assertTrue(sanitized.contains("fill=\"red\""));
        
        System.out.println("SVG sanitization test passed");
    }
} 