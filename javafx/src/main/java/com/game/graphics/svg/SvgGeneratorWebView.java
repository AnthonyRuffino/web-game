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
        
        // Create HTML wrapper for the SVG
        String htmlContent = createHtmlWrapper(sanitizedSvg, width, height);
        
        // Load the HTML content
        webView.getEngine().loadContent(htmlContent);
        
        if (waitForLoad) {
            // Wait for the WebView to load
            waitForWebViewLoad(webView);
        }
        
        // Take a snapshot
        SnapshotParameters params = new SnapshotParameters();
        WritableImage snapshot = webView.snapshot(params, null);
        
        // Convert to BufferedImage
        return convertWritableImageToBufferedImage(snapshot);
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
        // Simple polling approach instead of CompletableFuture
        int maxAttempts = 50; // 5 seconds with 100ms intervals
        int attempts = 0;
        
        while (attempts < maxAttempts) {
            if (webView.getEngine().getLoadWorker().getState() == javafx.concurrent.Worker.State.SUCCEEDED) {
                return;
            } else if (webView.getEngine().getLoadWorker().getState() == javafx.concurrent.Worker.State.FAILED) {
                throw new RuntimeException("WebView load failed");
            } else if (webView.getEngine().getLoadWorker().getState() == javafx.concurrent.Worker.State.CANCELLED) {
                throw new RuntimeException("WebView load cancelled");
            }
            
            Thread.sleep(100);
            attempts++;
        }
        
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
            "<style>" +
            "body { margin: 0; padding: 0; overflow: hidden; }" +
            "svg { display: block; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "%s" +
            "</body>" +
            "</html>",
            svgContent
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
        // For now, use Java2D fallback to avoid WebView timeout issues
        return SvgGenerator.generateTreeImage(config);
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
        // For now, use Java2D fallback to avoid WebView timeout issues
        return SvgGenerator.generateRockImage(config);
    }
    
    /**
     * Generate grass image using SVG
     */
    public static BufferedImage generateGrassImage(int size) throws Exception {
        EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
        config.size = size;
        return generateGrassImage(config);
    }
    
    /**
     * Generate grass image using configurable parameters
     */
    public static BufferedImage generateGrassImage(EntityConfig.GrassConfig config) throws Exception {
        // For now, use Java2D fallback to avoid WebView timeout issues
        return SvgGenerator.generateGrassImage(config);
    }
    
    /**
     * Generate plains background using SVG
     */
    public static BufferedImage generatePlainsBackground(int size) throws Exception {
        // For now, use the Java2D implementation since it doesn't generate SVG strings
        return SvgGenerator.generatePlainsBackground(size);
    }
    
    /**
     * Generate desert background using SVG
     */
    public static BufferedImage generateDesertBackground(int size) throws Exception {
        // For now, use the Java2D implementation since it doesn't generate SVG strings
        return SvgGenerator.generateDesertBackground(size);
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