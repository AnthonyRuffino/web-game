package com.game.graphics.svg;

import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.scene.SnapshotParameters;
import javafx.scene.image.WritableImage;
import javafx.scene.web.WebView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * SVG Generator using JavaFX WebView for rendering SVG content to images.
 * 
 * This implementation uses JavaFX WebView to render SVG content with full browser support,
 * including gradients, filters, text, and complex SVG features that Java2D cannot handle.
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
        return svgToImage(svgContent, width, height, true);
    }
    
    /**
     * Render SVG string to BufferedImage using WebView with load waiting option
     * 
     * @param svgContent The SVG content as a string
     * @param width The desired width of the output image
     * @param height The desired height of the output image
     * @param waitForLoad Whether to wait for the WebView to fully load
     * @return BufferedImage containing the rendered SVG
     * @throws Exception if rendering fails
     */
    public static BufferedImage svgToImage(String svgContent, int width, int height, boolean waitForLoad) throws Exception {
        if (Platform.isFxApplicationThread()) {
            return renderSvgOnFxThread(svgContent, width, height, waitForLoad);
        } else {
            return renderSvgOffFxThread(svgContent, width, height, waitForLoad);
        }
    }
    
    /**
     * Render SVG on the JavaFX Application Thread
     */
    private static BufferedImage renderSvgOnFxThread(String svgContent, int width, int height, boolean waitForLoad) throws Exception {
        logger.debug("Starting WebView SVG rendering: {}x{}", width, height);
        
        WebView webView = new WebView();
        webView.setPrefWidth(width);
        webView.setPrefHeight(height);
        webView.setMinWidth(width);
        webView.setMinHeight(height);
        webView.setMaxWidth(width);
        webView.setMaxHeight(height);
        
        // Create a scene to hold the WebView
        Scene scene = new Scene(webView);
        
        // Sanitize SVG content
        String sanitizedSvg = sanitizeSvg(svgContent);
        logger.debug("Sanitized SVG content length: {}", sanitizedSvg.length());
        
        // Create HTML wrapper for the SVG
        String htmlContent = createHtmlWrapper(sanitizedSvg, width, height);
        logger.debug("Created HTML wrapper, total length: {}", htmlContent.length());
        
        // Debug: Log HTML snippet
        String htmlSnippet = htmlContent.length() > 200 ? htmlContent.substring(0, 200) + "..." : htmlContent;
        logger.debug("HTML snippet: {}", htmlSnippet);
        
        // Load the HTML content
        logger.debug("Loading HTML content into WebView...");
        webView.getEngine().loadContent(htmlContent);
        
        // Add a longer delay to let WebView initialize and render
        logger.debug("Waiting for WebView to initialize...");
        Thread.sleep(500);
        
        if (waitForLoad) {
            // Try to wait for the WebView to load, but don't fail if it times out
            try {
                waitForWebViewLoad(webView);
            } catch (Exception e) {
                logger.warn("WebView load wait failed, proceeding anyway: {}", e.getMessage());
            }
        }
        
        // Take a snapshot
        logger.debug("Taking WebView snapshot...");
        SnapshotParameters params = new SnapshotParameters();
        WritableImage snapshot = webView.snapshot(params, null);
        
        // Convert to BufferedImage
        logger.debug("Converting snapshot to BufferedImage...");
        BufferedImage result = convertWritableImageToBufferedImage(snapshot);
        logger.debug("WebView rendering completed successfully");
        
        return result;
    }
    
    /**
     * Render SVG off the JavaFX Application Thread
     */
    private static BufferedImage renderSvgOffFxThread(String svgContent, int width, int height, boolean waitForLoad) throws Exception {
        // For now, fall back to the Java2D implementation when not on FX thread
        // This avoids complex threading issues with WebView
        logger.info("Not on FX thread, using Java2D fallback for SVG rendering");
        return SvgGenerator.svgToImage(svgContent, Math.max(width, height));
    }
    
    /**
     * Wait for WebView to finish loading
     */
    private static void waitForWebViewLoad(WebView webView) throws Exception {
        // Simple polling approach with better debugging
        int maxAttempts = 30; // 3 seconds with 100ms intervals
        int attempts = 0;
        
        logger.debug("Waiting for WebView to load...");
        
        while (attempts < maxAttempts) {
            javafx.concurrent.Worker.State state = webView.getEngine().getLoadWorker().getState();
            
            // Log every 5th attempt to avoid spam
            if (attempts % 5 == 0) {
                logger.debug("WebView state: {} (attempt {}/{})", state, attempts + 1, maxAttempts);
            }
            
            if (state == javafx.concurrent.Worker.State.SUCCEEDED) {
                logger.debug("WebView load succeeded");
                return;
            } else if (state == javafx.concurrent.Worker.State.FAILED) {
                String errorMessage = webView.getEngine().getLoadWorker().getException() != null ? 
                    webView.getEngine().getLoadWorker().getException().getMessage() : "Unknown error";
                logger.error("WebView load failed: {}", errorMessage);
                throw new RuntimeException("WebView load failed: " + errorMessage);
            } else if (state == javafx.concurrent.Worker.State.CANCELLED) {
                logger.error("WebView load cancelled");
                throw new RuntimeException("WebView load cancelled");
            }
            
            Thread.sleep(100);
            attempts++;
        }
        
        logger.error("WebView load timeout after {} attempts", maxAttempts);
        throw new RuntimeException("WebView load timeout");
    }
    
    /**
     * Create HTML wrapper for SVG content
     */
    private static String createHtmlWrapper(String svgContent, int width, int height) {
        return String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<style>" +
            "body { margin: 0; padding: 0; overflow: hidden; background: white; }" +
            "svg { display: block; width: %dpx; height: %dpx; }" +
            "</style>" +
            "<script>" +
            "window.onload = function() { console.log('Page loaded successfully'); };" +
            "</script>" +
            "</head>" +
            "<body>" +
            "%s" +
            "</body>" +
            "</html>",
            width, height, svgContent
        );
    }
    
    /**
     * Convert WritableImage to BufferedImage
     */
    private static BufferedImage convertWritableImageToBufferedImage(WritableImage fxImage) {
        int width = (int) fxImage.getWidth();
        int height = (int) fxImage.getHeight();
        
        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        
        // Get pixel data from WritableImage
        int[] pixels = new int[width * height];
        fxImage.getPixelReader().getPixels(0, 0, width, height, 
            javafx.scene.image.PixelFormat.getIntArgbInstance(), pixels, 0, width);
        
        // Set pixels in BufferedImage
        bufferedImage.setRGB(0, 0, width, height, pixels, 0, width);
        
        return bufferedImage;
    }
    
    /**
     * Sanitize SVG content to prevent security issues
     */
    public static String sanitizeSvg(String svgContent) {
        // Remove script tags and event handlers
        String sanitized = svgContent
            .replaceAll("<script[^>]*>.*?</script>", "")
            .replaceAll("on\\w+\\s*=\\s*[\"'][^\"']*[\"']", "")
            .replaceAll("javascript:", "");
        
        return sanitized;
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
        
        try {
            String svg = SvgGenerator.generateTreeSVG(config);
            logger.info("Generated tree SVG (length: {}), attempting WebView rendering...", svg.length());
            BufferedImage result = svgToImage(svg, config.foliageRadius * 2, config.imageHeight);
            logger.info("WebView tree rendering successful");
            return result;
        } catch (Exception e) {
            logger.error("WebView tree rendering failed: {}", e.getMessage());
            logger.info("Falling back to Java2D renderer for tree");
            return SvgGenerator.generateTreeImage(config);
        }
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
        
        try {
            String svg = SvgGenerator.generateRockSVG(config);
            logger.info("Generated rock SVG (length: {}), attempting WebView rendering...", svg.length());
            BufferedImage result = svgToImage(svg, config.size, config.size);
            logger.info("WebView rock rendering successful");
            return result;
        } catch (Exception e) {
            logger.error("WebView rock rendering failed: {}", e.getMessage());
            logger.info("Falling back to Java2D renderer for rock");
            return SvgGenerator.generateRockImage(config);
        }
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
        
        try {
            String svg = SvgGenerator.generateGrassSVG(config);
            logger.info("Generated grass SVG (length: {}), attempting WebView rendering...", svg.length());
            BufferedImage result = svgToImage(svg, config.size, config.size);
            logger.info("WebView grass rendering successful");
            return result;
        } catch (Exception e) {
            logger.error("WebView grass rendering failed: {}", e.getMessage());
            logger.info("Falling back to Java2D renderer for grass");
            return SvgGenerator.generateGrassImage(config);
        }
    }
    
    /**
     * Generate plains background using SVG
     */
    public static BufferedImage generatePlainsBackground(int size) throws Exception {
        logger.info("SvgGeneratorWebView.generatePlainsBackground(size={}) called", size);
        
        try {
            String svg = generatePlainsBackgroundSVG(size);
            logger.info("Generated plains background SVG (length: {}), attempting WebView rendering...", svg.length());
            BufferedImage result = svgToImage(svg, size, size);
            logger.info("WebView plains background rendering successful");
            return result;
        } catch (Exception e) {
            logger.error("WebView plains background rendering failed: {}", e.getMessage());
            logger.info("Falling back to Java2D renderer for plains background");
            return SvgGenerator.generatePlainsBackground(size);
        }
    }
    
    /**
     * Generate desert background using SVG
     */
    public static BufferedImage generateDesertBackground(int size) throws Exception {
        logger.info("SvgGeneratorWebView.generateDesertBackground(size={}) called", size);
        
        try {
            String svg = generateDesertBackgroundSVG(size);
            logger.info("Generated desert background SVG (length: {}), attempting WebView rendering...", svg.length());
            BufferedImage result = svgToImage(svg, size, size);
            logger.info("WebView desert background rendering successful");
            return result;
        } catch (Exception e) {
            logger.error("WebView desert background rendering failed: {}", e.getMessage());
            logger.info("Falling back to Java2D renderer for desert background");
            return SvgGenerator.generateDesertBackground(size);
        }
    }
    
    /**
     * Generate SVG for plains background (matches JavaScript implementation)
     */
    private static String generatePlainsBackgroundSVG(int size) {
        // Use the exact entityRenderer plains configuration from the JavaScript
        String baseColor = "#3cb043";
        String[] rectColors = {"#4fdc5a", "#2e8b3d", "#4fdc5a", "#2e8b3d", "#4fdc5a", "#2e8b3d", "#4fdc5a", "#2e8b3d"};
        int[] rectX = {40, 120, 320, 480, 600, 200, 560, 80};
        int[] rectY = {80, 200, 320, 560, 40, 400, 320, 600};
        
        StringBuilder rects = new StringBuilder();
        for (int i = 0; i < rectColors.length; i++) {
            rects.append(String.format(
                "<rect x=\"%d\" y=\"%d\" width=\"40\" height=\"40\" fill=\"%s\"/>",
                rectX[i], rectY[i], rectColors[i]
            ));
        }
        
        return String.format(
            "<svg width=\"%d\" height=\"%d\" viewBox=\"0 0 %d %d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<rect width=\"%d\" height=\"%d\" fill=\"%s\"/>" +
            "%s" +
            "</svg>",
            size, size, size, size,
            size, size, baseColor,
            rects.toString()
        );
    }
    
    /**
     * Generate SVG for desert background (matches JavaScript implementation)
     */
    private static String generateDesertBackgroundSVG(int size) {
        // Use the exact entityRenderer desert configuration from the JavaScript
        String baseColor = "#f7e9a0";
        String[] rectColors = {"#e6d17a", "#fff7c0", "#e6d17a", "#fff7c0", "#e6d17a", "#fff7c0", "#e6d17a", "#fff7c0"};
        int[] rectX = {40, 120, 320, 480, 600, 200, 560, 80};
        int[] rectY = {80, 200, 320, 560, 40, 400, 320, 600};
        
        StringBuilder rects = new StringBuilder();
        for (int i = 0; i < rectColors.length; i++) {
            rects.append(String.format(
                "<rect x=\"%d\" y=\"%d\" width=\"40\" height=\"40\" fill=\"%s\"/>",
                rectX[i], rectY[i], rectColors[i]
            ));
        }
        
        return String.format(
            "<svg width=\"%d\" height=\"%d\" viewBox=\"0 0 %d %d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<rect width=\"%d\" height=\"%d\" fill=\"%s\"/>" +
            "%s" +
            "</svg>",
            size, size, size, size,
            size, size, baseColor,
            rects.toString()
        );
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