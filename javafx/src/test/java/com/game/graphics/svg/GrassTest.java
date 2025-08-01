package com.game.graphics.svg;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.awt.image.BufferedImage;

public class GrassTest {
    
    @Test
    public void testGrassGeneration() throws Exception {
        // Test basic grass generation
        BufferedImage grassImage = SvgGenerator.generateGrassImage(64);
        assertNotNull(grassImage);
        assertEquals(64, grassImage.getWidth());
        assertEquals(64, grassImage.getHeight());
        
        // Check that the image is not completely transparent/empty
        boolean hasVisiblePixels = false;
        for (int x = 0; x < grassImage.getWidth(); x++) {
            for (int y = 0; y < grassImage.getHeight(); y++) {
                int rgb = grassImage.getRGB(x, y);
                int alpha = (rgb >> 24) & 0xFF;
                if (alpha > 0) {
                    hasVisiblePixels = true;
                    break;
                }
            }
            if (hasVisiblePixels) break;
        }
        
        assertTrue(hasVisiblePixels, "Grass image should have visible pixels");
    }
    
    @Test
    public void testGrassConfigGeneration() throws Exception {
        // Test configurable grass generation
        EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
        config.size = 64;
        config.bladeColor = "#4CAF50";
        config.bladeWidth = 2.0;
        config.clusterCount = 3;
        config.bladeCount = 8;
        
        BufferedImage grassImage = SvgGenerator.generateGrassImage(config);
        assertNotNull(grassImage);
        assertEquals(64, grassImage.getWidth());
        assertEquals(64, grassImage.getHeight());
        
        // Check that the image is not completely transparent/empty
        boolean hasVisiblePixels = false;
        for (int x = 0; x < grassImage.getWidth(); x++) {
            for (int y = 0; y < grassImage.getHeight(); y++) {
                int rgb = grassImage.getRGB(x, y);
                int alpha = (rgb >> 24) & 0xFF;
                if (alpha > 0) {
                    hasVisiblePixels = true;
                    break;
                }
            }
            if (hasVisiblePixels) break;
        }
        
        assertTrue(hasVisiblePixels, "Configurable grass image should have visible pixels");
    }
    
    @Test
    public void testGrassSvgGeneration() {
        // Test that grass SVG is generated correctly
        EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
        config.size = 64;
        config.bladeColor = "#4CAF50";
        config.bladeWidth = 2.0;
        config.clusterCount = 3;
        config.bladeCount = 8;
        
        String svg = SvgGenerator.generateGrassSVG(config);
        assertNotNull(svg);
        assertTrue(svg.contains("<svg"), "SVG should contain svg tag");
        assertTrue(svg.contains("<line"), "SVG should contain line elements for grass blades");
        assertTrue(svg.contains("stroke=\"#4CAF50\""), "SVG should contain stroke color");
        assertTrue(svg.contains("stroke-width=\"2.0\""), "SVG should contain stroke width");
    }
} 