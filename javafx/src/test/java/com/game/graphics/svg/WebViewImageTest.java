package com.game.graphics.svg;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import static org.junit.jupiter.api.Assertions.*;

import java.awt.image.BufferedImage;
import java.awt.Color;
import java.awt.image.DataBufferInt;
import java.io.File;
import javax.imageio.ImageIO;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Test to verify that WebView SVG rendering produces correct, non-empty images
 */
public class WebViewImageTest {
    
    @BeforeAll
    static void setup() {
        // Ensure JavaFX is initialized for tests
        try {
            javafx.application.Platform.startup(() -> {});
        } catch (Exception e) {
            // JavaFX might already be initialized
        }
    }
    
    /**
     * Safe WebView snapshot method that waits for proper loading and rendering
     */
    public static BufferedImage snapshotWebView(String htmlContent, double width, double height) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<BufferedImage> resultRef = new AtomicReference<>();

        javafx.application.Platform.runLater(() -> {
            javafx.scene.web.WebView webView = new javafx.scene.web.WebView();
            webView.setPrefSize(width, height);
            webView.setMinSize(width, height);
            webView.setMaxSize(width, height);

            javafx.scene.web.WebEngine engine = webView.getEngine();
            javafx.scene.Scene scene = new javafx.scene.Scene(new javafx.scene.layout.StackPane(webView));
            
            // Set scene size to match WebView size
            scene.setRoot(new javafx.scene.layout.StackPane(webView));
            scene.setFill(javafx.scene.paint.Color.TRANSPARENT);

            engine.loadContent(htmlContent);

            engine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
                if (newState == javafx.concurrent.Worker.State.SUCCEEDED) {
                    // Add a small delay to ensure rendering is complete
                    javafx.application.Platform.runLater(() -> {
                        try {
                            Thread.sleep(100); // Small delay for rendering
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                        
                        javafx.scene.image.WritableImage fxImage = webView.snapshot(new javafx.scene.SnapshotParameters(), null);

                        int w = (int) fxImage.getWidth();
                        int h = (int) fxImage.getHeight();
                        BufferedImage bufferedImage = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);

                        fxImage.getPixelReader().getPixels(0, 0, w, h, 
                            javafx.scene.image.PixelFormat.getIntArgbInstance(),
                            ((DataBufferInt) bufferedImage.getRaster().getDataBuffer()).getData(),
                            0, w
                        );

                        resultRef.set(bufferedImage);
                        latch.countDown();
                    });
                }
            });
        });

        if (!latch.await(10, TimeUnit.SECONDS)) {
            throw new TimeoutException("WebView snapshot timed out.");
        }

        return resultRef.get();
    }
    
    @Test
    void testWebViewRenderingCorrectly() throws Exception {
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0; background:red; color:white;">
                <h1>Red Test</h1>
            </body>
            </html>
            """;

        BufferedImage image = snapshotWebView(html, 200, 150);
        ImageIO.write(image, "PNG", new File("webview-test-rendered.png"));

        boolean hasRed = false;
        for (int x = 0; x < image.getWidth(); x += 5) {
            for (int y = 0; y < image.getHeight(); y += 5) {
                Color color = new Color(image.getRGB(x, y), true);
                if (color.getRed() > 200 && color.getGreen() < 100 && color.getBlue() < 100) {
                    hasRed = true;
                    break;
                }
            }
            if (hasRed) break;
        }

        assertTrue(hasRed, "Should contain red background after rendering");
    }
    
    @Test
    void testSimpleSvgRendering() throws Exception {
        // Test with a simple red circle SVG
        String testSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="20" fill="red" stroke="black" stroke-width="2"/>
            </svg>
            """;
        
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
                    svg { display: block; width: 64px; height: 64px; }
                </style>
            </head>
            <body>
            %s
            </body>
            </html>
            """.formatted(testSvg);
        
        BufferedImage image = snapshotWebView(htmlContent, 64, 64);
        
        // Verify image dimensions
        assertEquals(64, image.getWidth());
        assertEquals(64, image.getHeight());
        
        // Verify image is not empty (should have red pixels)
        assertFalse(isImageEmpty(image), "Image should not be empty");
        assertFalse(isImageAllWhite(image), "Image should not be all white");
        
        // Check for red pixels in the center (where the circle should be)
        boolean hasRedPixels = false;
        for (int x = 20; x < 44; x++) {
            for (int y = 20; y < 44; y++) {
                Color pixel = new Color(image.getRGB(x, y));
                if (pixel.getRed() > 200 && pixel.getGreen() < 100 && pixel.getBlue() < 100) {
                    hasRedPixels = true;
                    break;
                }
            }
            if (hasRedPixels) break;
        }
        
        assertTrue(hasRedPixels, "Image should contain red pixels from the circle");
        
        // Save test image for visual inspection
        ImageIO.write(image, "PNG", new File("test-simple-svg.png"));
    }
    
    @Test
    void testTreeSvgRendering() throws Exception {
        // Test with tree SVG
        EntityConfig.TreeConfig config = new EntityConfig.TreeConfig();
        config.size = 32;
        
        String treeSvg = SvgGenerator.generateTreeSVG(config);
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
                    svg { display: block; width: 48px; height: 96px; }
                </style>
            </head>
            <body>
            %s
            </body>
            </html>
            """.formatted(treeSvg);
        
        BufferedImage image = snapshotWebView(htmlContent, 48, 96);
        
        // Verify image dimensions
        assertEquals(48, image.getWidth());
        assertEquals(96, image.getHeight());
        
        // Verify image is not empty
        assertFalse(isImageEmpty(image), "Tree image should not be empty");
        assertFalse(isImageAllWhite(image), "Tree image should not be all white");
        
        // Save test image for visual inspection
        ImageIO.write(image, "PNG", new File("test-tree-svg.png"));
    }
    
    @Test
    void testGrassSvgRendering() throws Exception {
        // Test with grass SVG
        EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
        config.size = 32;
        
        String grassSvg = SvgGenerator.generateGrassSVG(config);
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
                    svg { display: block; width: 32px; height: 32px; }
                </style>
            </head>
            <body>
            %s
            </body>
            </html>
            """.formatted(grassSvg);
        
        BufferedImage image = snapshotWebView(htmlContent, 32, 32);
        
        // Verify image dimensions
        assertEquals(32, image.getWidth());
        assertEquals(32, image.getHeight());
        
        // Verify image is not empty
        assertFalse(isImageEmpty(image), "Grass image should not be empty");
        assertFalse(isImageAllWhite(image), "Grass image should not be all white");
        
        // Save test image for visual inspection
        ImageIO.write(image, "PNG", new File("test-grass-svg.png"));
    }
    
    @Test
    void testPlainsBackgroundSvgRendering() throws Exception {
        // Test with plains background SVG
        String plainsSvg = ImageGenerator.generatePlainsBackgroundSVG(640);
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
                    svg { display: block; width: 640px; height: 640px; }
                </style>
            </head>
            <body>
            %s
            </body>
            </html>
            """.formatted(plainsSvg);
        
        BufferedImage image = snapshotWebView(htmlContent, 640, 640);
        
        // Verify image dimensions
        assertEquals(640, image.getWidth());
        assertEquals(640, image.getHeight());
        
        // Verify image is not empty
        assertFalse(isImageEmpty(image), "Plains background image should not be empty");
        assertFalse(isImageAllWhite(image), "Plains background image should not be all white");
        
        // Check for green pixels (plains should be green)
        boolean hasGreenPixels = false;
        for (int x = 0; x < 640; x += 64) {
            for (int y = 0; y < 640; y += 64) {
                Color pixel = new Color(image.getRGB(x, y));
                if (pixel.getGreen() > 150 && pixel.getRed() < 100 && pixel.getBlue() < 100) {
                    hasGreenPixels = true;
                    break;
                }
            }
            if (hasGreenPixels) break;
        }
        
        assertTrue(hasGreenPixels, "Plains background should contain green pixels");
        
        // Save test image for visual inspection
        ImageIO.write(image, "PNG", new File("test-plains-background.png"));
    }
    
    /**
     * Check if image is completely empty (all pixels are transparent)
     */
    private boolean isImageEmpty(BufferedImage image) {
        for (int x = 0; x < image.getWidth(); x++) {
            for (int y = 0; y < image.getHeight(); y++) {
                int rgb = image.getRGB(x, y);
                int alpha = (rgb >> 24) & 0xFF;
                if (alpha > 0) {
                    return false; // Found a non-transparent pixel
                }
            }
        }
        return true; // All pixels are transparent
    }
    
    /**
     * Check if image is all white (all pixels are white or transparent)
     */
    private boolean isImageAllWhite(BufferedImage image) {
        for (int x = 0; x < image.getWidth(); x++) {
            for (int y = 0; y < image.getHeight(); y++) {
                int rgb = image.getRGB(x, y);
                int alpha = (rgb >> 24) & 0xFF;
                int red = (rgb >> 16) & 0xFF;
                int green = (rgb >> 8) & 0xFF;
                int blue = rgb & 0xFF;
                
                // If pixel is not transparent and not white, return false
                if (alpha > 0 && (red < 250 || green < 250 || blue < 250)) {
                    return false;
                }
            }
        }
        return true; // All pixels are white or transparent
    }
} 