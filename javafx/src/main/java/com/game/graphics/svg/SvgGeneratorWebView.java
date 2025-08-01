package com.game.graphics.svg;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;

/**
 * SVG Generator using JavaFX WebView for rendering SVG content to images.
 * 
 * NOTE: This is currently a simplified implementation that delegates to SvgGenerator.
 * The full WebView implementation is in progress and will provide complete SVG support.
 * 
 * For now, this class provides the same interface as the planned WebView version
 * but uses the pure Java implementation as a fallback.
 */
public class SvgGeneratorWebView {
    private static final Logger logger = LoggerFactory.getLogger(SvgGeneratorWebView.class);
    
    // Default dimensions for rendering
    private static final int DEFAULT_WIDTH = 64;
    private static final int DEFAULT_HEIGHT = 64;
    
    /**
     * Render SVG string to BufferedImage using WebView
     * 
     * @param svgContent The SVG content as a string
     * @param width The desired width of the output image
     * @param height The desired height of the output image
     * @return BufferedImage containing the rendered SVG
     * @throws Exception if rendering fails
     */
    public static BufferedImage svgToImage(String svgContent, int width, int height) throws Exception {
        logger.info("Using fallback SvgGenerator implementation. WebView version in progress.");
        return SvgGenerator.svgToImage(svgContent, Math.max(width, height));
    }
    
    /**
     * Save SVG content as PNG file
     * 
     * @param svgContent The SVG content as a string
     * @param outputPath The path where to save the PNG file
     * @param width The desired width of the output image
     * @param height The desired height of the output image
     * @throws Exception if saving fails
     */
    public static void svgToPngFile(String svgContent, Path outputPath, int width, int height) throws Exception {
        BufferedImage image = svgToImage(svgContent, width, height);
        ImageIO.write(image, "PNG", outputPath.toFile());
        logger.info("Saved SVG to PNG: {}", outputPath);
    }
    
    /**
     * Save SVG content as PNG file with default dimensions
     * 
     * @param svgContent The SVG content as a string
     * @param outputPath The path where to save the PNG file
     * @throws Exception if saving fails
     */
    public static void svgToPngFile(String svgContent, Path outputPath) throws Exception {
        svgToPngFile(svgContent, outputPath, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }
    
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
        return SvgGenerator.generateTreeImage(size);
    }
    
    /**
     * Generate tree image using configurable parameters
     */
    public static BufferedImage generateTreeImage(EntityConfig.TreeConfig config) throws Exception {
        return SvgGenerator.generateTreeImage(config);
    }
    
    /**
     * Generate rock image using SVG
     */
    public static BufferedImage generateRockImage(int size) throws Exception {
        return SvgGenerator.generateRockImage(size);
    }
    
    /**
     * Generate rock image using configurable parameters
     */
    public static BufferedImage generateRockImage(EntityConfig.RockConfig config) throws Exception {
        return SvgGenerator.generateRockImage(config);
    }
    
    /**
     * Generate grass image using SVG
     */
    public static BufferedImage generateGrassImage(int size) throws Exception {
        return SvgGenerator.generateGrassImage(size);
    }
    
    /**
     * Generate grass image using configurable parameters
     */
    public static BufferedImage generateGrassImage(EntityConfig.GrassConfig config) throws Exception {
        return SvgGenerator.generateGrassImage(config);
    }
    
    /**
     * Sanitize SVG content for security
     * 
     * @param svgContent The SVG content to sanitize
     * @return Sanitized SVG content
     */
    public static String sanitizeSvg(String svgContent) {
        if (svgContent == null || svgContent.trim().isEmpty()) {
            return "";
        }
        
        // Remove script tags and event handlers for security
        String sanitized = svgContent
            .replaceAll("(?s)<script[^>]*>.*?</script>", "")
            .replaceAll("(?i)on\\w+\\s*=\\s*[\"'][^\"']*[\"']", "")
            .replaceAll("(?i)javascript:", "");
        
        return sanitized;
    }
    
    /**
     * Test method to demonstrate usage
     */
    public static void main(String[] args) {
        try {
            // Test SVG rendering
            String testSvg = """
                <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="20" fill="red" stroke="black" stroke-width="2"/>
                </svg>
                """;
            
            BufferedImage image = svgToImage(testSvg, 64, 64);
            Path outputPath = Path.of("test-output.png");
            ImageIO.write(image, "PNG", outputPath.toFile());
            
            logger.info("Test completed successfully. Output saved to: {}", outputPath);
            
        } catch (Exception e) {
            logger.error("Test failed", e);
        }
    }
} 