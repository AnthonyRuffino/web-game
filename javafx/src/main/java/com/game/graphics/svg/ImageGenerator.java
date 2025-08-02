package com.game.graphics.svg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.imageio.ImageIO;


/**
 * SVG Generator using JavaFX WebView for rendering SVG content to images.
 * 
 * This implementation uses JavaFX WebView to render SVG content with full browser support,
 * including gradients, filters, text, and complex SVG features that Java2D cannot handle.
 */
public class ImageGenerator {
    private static final Logger logger = LoggerFactory.getLogger(ImageGenerator.class);
    
    /**
     * Convert BufferedImage to byte array
     */
    public static byte[] imageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }
    
    /**
     * Convert byte array to BufferedImage
     */
    public static BufferedImage bytesToImage(byte[] bytes) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        return ImageIO.read(bais);
    }

    
    /**
     * Generate tree image using SVG
     */
    public static BufferedImage generateTreeImage(int size) throws Exception {
        EntityConfig.TreeConfig config = new EntityConfig.TreeConfig();
        config.size = size;
        // Don't scale foliageRadius - keep the default behavior that matches the test
        return generateTreeImage(config);
    }
    
    /**
     * Generate tree image using configurable parameters
     */
    public static BufferedImage generateTreeImage(EntityConfig.TreeConfig config) throws Exception {
        logger.info("SvgGeneratorWebView.generateTreeImage(config) called with size={}, foliageRadius={}, imageHeight={}", 
                   config.size, config.foliageRadius, config.imageHeight);
        
        String svg = SvgGenerator.generateTreeSVG(config);
        int width = config.foliageRadius * 2;
        int height = config.imageHeight;
        return SvgGenerator.svgToImage(svg, width, height);
    }
    
    /**
     * Generate rock image using SVG
     */
    public static BufferedImage generateRockImage(int size) throws Exception {
        EntityConfig.RockConfig config = new EntityConfig.RockConfig();
        config.size = size;
        return generateRockImage(config);
    }
    
    /**
     * Generate rock image using configurable parameters
     */
    public static BufferedImage generateRockImage(EntityConfig.RockConfig config) throws Exception {
        logger.info("SvgGeneratorWebView.generateRockImage(config) called with size={}", config.size);
        
        String svg = SvgGenerator.generateRockSVG(config);
        return SvgGenerator.svgToImage(svg, config.size, config.size);
    }
    
        /**
     * Generate grass image using SVG
     */
    public static BufferedImage generateGrassImage(int size) throws Exception {
        logger.info("SvgGeneratorWebView.generateGrassImage(size={}) called", size);
        EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
        config.size = size;
        return generateGrassImage(config);
    }
    
    /**
     * Generate grass image using configurable parameters
     */
    public static BufferedImage generateGrassImage(EntityConfig.GrassConfig config) throws Exception {
        logger.info("SvgGeneratorWebView.generateGrassImage(config) called with size={}, bladeCount={}", 
                   config.size, config.bladeCount);
        
        String svg = SvgGenerator.generateGrassSVG(config);
        return SvgGenerator.svgToImage(svg, config.size, config.size);
    }
    
    /**
     * Generate plains background using SVG
     */
    public static BufferedImage generatePlainsBackground(int size) throws Exception {
        logger.info("SvgGeneratorWebView.generatePlainsBackground(size={}) called", size);
        
        String svg = SvgGenerator.generatePlainsBackgroundSVG(size);
        return SvgGenerator.svgToImage(svg, size, size);
    }
    
    /**
     * Generate desert background using SVG
     */
    public static BufferedImage generateDesertBackground(int size) throws Exception {
        logger.info("SvgGeneratorWebView.generateDesertBackground(size={}) called", size);
        
        String svg = SvgGenerator.generateDesertBackgroundSVG(size);
        return SvgGenerator.svgToImage(svg, size, size);
    }
    
}
