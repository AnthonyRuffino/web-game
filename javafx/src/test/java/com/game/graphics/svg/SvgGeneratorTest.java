package com.game.graphics.svg;

import java.awt.image.BufferedImage;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SvgGeneratorTest {
    
    @Test
    void testSvgToImageBasicConversion() {
        // Arrange - Simple SVG with a red circle
        String simpleSvg = "<svg width=\"32\" height=\"32\"><circle cx=\"16\" cy=\"16\" r=\"8\" fill=\"red\"/></svg>";
        
        // Act
        BufferedImage image = SvgGenerator.svgToImage(simpleSvg, 32, 32);
        
        // Assert
        assertNotNull(image);
        assertEquals(32, image.getWidth());
        assertEquals(32, image.getHeight());
        assertEquals(BufferedImage.TYPE_INT_ARGB, image.getType());
    }
    
    @Test
    void testSvgToImageWithDifferentDimensions() {
        // Arrange - Simple SVG
        String simpleSvg = "<svg width=\"64\" height=\"32\"><rect x=\"0\" y=\"0\" width=\"64\" height=\"32\" fill=\"blue\"/></svg>";
        
        // Act
        BufferedImage image = SvgGenerator.svgToImage(simpleSvg, 64, 32);
        
        // Assert
        assertNotNull(image);
        assertEquals(64, image.getWidth());
        assertEquals(32, image.getHeight());
    }
    
    @Test
    void testSvgToImageFallbackOnInvalidSvg() {
        // Arrange - Invalid SVG
        String invalidSvg = "invalid svg content";
        
        // Act
        BufferedImage image = SvgGenerator.svgToImage(invalidSvg, 32, 32);
        
        // Assert - Should return fallback image instead of throwing exception
        assertNotNull(image);
        assertEquals(32, image.getWidth());
        assertEquals(32, image.getHeight());
    }
    
    @Test
    void testGenerateTreeSVG() {
        // Arrange
        EntityConfig.TreeConfig config = new EntityConfig.TreeConfig();
        config.foliageRadius = 16;
        config.imageHeight = 48;
        config.trunkWidth = 4;
        config.foliageColor = "#228B22";
        config.trunkColor = "#8B4513";
        config.opacity = 1.0;
        
        // Act
        String treeSvg = SvgGenerator.generateTreeSVG(config);
        
        // Assert
        assertNotNull(treeSvg);
        assertTrue(treeSvg.contains("<svg"));
        assertTrue(treeSvg.contains("<ellipse")); // Foliage
        assertTrue(treeSvg.contains("<rect")); // Trunk
        assertTrue(treeSvg.contains("#228B22")); // Foliage color
        assertTrue(treeSvg.contains("#8B4513")); // Trunk color
    }
    
    @Test
    void testGenerateRockSVG() {
        // Arrange
        EntityConfig.RockConfig config = new EntityConfig.RockConfig();
        config.size = 32;
        config.baseColor = "#696969";
        config.strokeColor = "#404040";
        config.strokeWidth = 2;
        config.textureColor = "#808080";
        config.textureSpots = 5;
        config.opacity = 1.0;
        
        // Act
        String rockSvg = SvgGenerator.generateRockSVG(config);
        
        // Assert
        assertNotNull(rockSvg);
        assertTrue(rockSvg.contains("<svg"));
        assertTrue(rockSvg.contains("<circle")); // Rock shape
        assertTrue(rockSvg.contains("#696969")); // Base color
        assertTrue(rockSvg.contains("#404040")); // Stroke color
    }
    
    @Test
    void testGenerateGrassSVG() {
        // Arrange
        EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
        config.size = 32;
        config.bladeColor = "#228B22";
        config.bladeWidth = 1.0;
        config.bladeLength = 8;
        config.bladeAngleVariation = 30;
        config.clusterCount = 3;
        config.bladeCount = 4;
        config.opacity = 1.0;
        
        // Act
        String grassSvg = SvgGenerator.generateGrassSVG(config);
        
        // Assert
        assertNotNull(grassSvg);
        assertTrue(grassSvg.contains("<svg"));
        assertTrue(grassSvg.contains("<line")); // Grass blades
        assertTrue(grassSvg.contains("#228B22")); // Blade color
    }
    
    @Test
    void testGeneratePlainsBackgroundSVG() {
        // Act
        String plainsSvg = SvgGenerator.generatePlainsBackgroundSVG(64);
        
        // Assert
        assertNotNull(plainsSvg);
        assertTrue(plainsSvg.contains("<svg"));
        assertTrue(plainsSvg.contains("width=\"64\""));
        assertTrue(plainsSvg.contains("height=\"64\""));
    }
    
    @Test
    void testGenerateDesertBackgroundSVG() {
        // Act
        String desertSvg = SvgGenerator.generateDesertBackgroundSVG(64);
        
        // Assert
        assertNotNull(desertSvg);
        assertTrue(desertSvg.contains("<svg"));
        assertTrue(desertSvg.contains("width=\"64\""));
        assertTrue(desertSvg.contains("height=\"64\""));
    }
    
    @Test
    void testImageToBytesAndBack() throws IOException {
        // Arrange - Create a simple image
        BufferedImage originalImage = new BufferedImage(32, 32, BufferedImage.TYPE_INT_ARGB);
        
        // Act - Convert to bytes and back
        byte[] imageBytes = SvgGenerator.imageToBytes(originalImage);
        BufferedImage restoredImage = SvgGenerator.bytesToImage(imageBytes);
        
        // Assert
        assertNotNull(imageBytes);
        assertTrue(imageBytes.length > 0);
        assertNotNull(restoredImage);
        assertEquals(32, restoredImage.getWidth());
        assertEquals(32, restoredImage.getHeight());
        // ImageIO.read might return a different type, so just check it's a valid image type
        assertTrue(restoredImage.getType() >= 0);
    }
    
    @Test
    void testSvgToImageWithComplexSvg() {
        // Arrange - Complex SVG with multiple elements
        String complexSvg = """
            <svg width="64" height="64">
                <rect x="0" y="0" width="64" height="64" fill="#87CEEB"/>
                <circle cx="32" cy="32" r="16" fill="#FFD700"/>
                <ellipse cx="16" cy="16" rx="8" ry="4" fill="#FF6B6B"/>
                <line x1="0" y1="0" x2="64" y2="64" stroke="#000000" stroke-width="2"/>
            </svg>
            """;
        
        // Act
        BufferedImage image = SvgGenerator.svgToImage(complexSvg, 64, 64);
        
        // Assert
        assertNotNull(image);
        assertEquals(64, image.getWidth());
        assertEquals(64, image.getHeight());
    }
    
    @Test
    void testSvgToImageWithEmptySvg() {
        // Arrange - Empty SVG
        String emptySvg = "<svg width=\"32\" height=\"32\"></svg>";
        
        // Act
        BufferedImage image = SvgGenerator.svgToImage(emptySvg, 32, 32);
        
        // Assert - Should handle empty SVG gracefully
        assertNotNull(image);
        assertEquals(32, image.getWidth());
        assertEquals(32, image.getHeight());
    }
} 