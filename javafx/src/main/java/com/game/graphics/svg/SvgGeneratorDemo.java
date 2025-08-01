package com.game.graphics.svg;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Demo class showing how to use SvgGeneratorWebView for generating game assets.
 * This class demonstrates various SVG rendering capabilities and asset generation.
 */
public class SvgGeneratorDemo {
    
    public static void main(String[] args) {
        try {
            // Ensure JavaFX is initialized
            javafx.application.Platform.startup(() -> {});
            
            System.out.println("Starting SVG Generator Demo...");
            
            // Create output directory
            Path outputDir = Paths.get("generated-assets");
            outputDir.toFile().mkdirs();
            
            // Demo 1: Simple shapes
            demoSimpleShapes(outputDir);
            
            // Demo 2: Game assets
            demoGameAssets(outputDir);
            
            // Demo 3: Complex SVG
            demoComplexSvg(outputDir);
            
            // Demo 4: Player custom content
            demoPlayerContent(outputDir);
            
            System.out.println("Demo completed successfully! Check the 'generated-assets' directory.");
            
        } catch (Exception e) {
            System.err.println("Demo failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Demo simple SVG shapes
     */
    private static void demoSimpleShapes(Path outputDir) throws Exception {
        System.out.println("Generating simple shapes...");
        
        // Circle
        String circleSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="24" fill="red" stroke="black" stroke-width="2"/>
            </svg>
            """;
        SvgGeneratorWebView.svgToPngFile(circleSvg, outputDir.resolve("circle.png"), 64, 64);
        
        // Rectangle
        String rectSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="48" height="48" fill="blue" stroke="white" stroke-width="3"/>
            </svg>
            """;
        SvgGeneratorWebView.svgToPngFile(rectSvg, outputDir.resolve("rectangle.png"), 64, 64);
        
        // Triangle
        String triangleSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <polygon points="32,8 56,56 8,56" fill="green" stroke="black" stroke-width="2"/>
            </svg>
            """;
        SvgGeneratorWebView.svgToPngFile(triangleSvg, outputDir.resolve("triangle.png"), 64, 64);
    }
    
    /**
     * Demo game asset generation
     */
    private static void demoGameAssets(Path outputDir) throws Exception {
        System.out.println("Generating game assets...");
        
        // Tree asset
        BufferedImage treeImage = SvgGeneratorWebView.generateTreeImage(64);
        ImageIO.write(treeImage, "PNG", outputDir.resolve("tree.png").toFile());
        
        // Rock asset
        BufferedImage rockImage = SvgGeneratorWebView.generateRockImage(64);
        ImageIO.write(rockImage, "PNG", outputDir.resolve("rock.png").toFile());
        
        // Grass asset
        BufferedImage grassImage = SvgGeneratorWebView.generateGrassImage(64);
        ImageIO.write(grassImage, "PNG", outputDir.resolve("grass.png").toFile());
        
        // Custom game object
        String customObjectSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <ellipse cx="32" cy="32" rx="20" ry="16" fill="url(#grad1)" stroke="#c44569" stroke-width="2"/>
                <circle cx="28" cy="28" r="3" fill="white"/>
                <circle cx="36" cy="28" r="3" fill="white"/>
                <path d="M 24 40 Q 32 48 40 40" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            """;
        SvgGeneratorWebView.svgToPngFile(customObjectSvg, outputDir.resolve("custom-object.png"), 64, 64);
    }
    
    /**
     * Demo complex SVG features
     */
    private static void demoComplexSvg(Path outputDir) throws Exception {
        System.out.println("Generating complex SVG...");
        
        String complexSvg = """
            <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="radialGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#ff9ff3;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#f368e0;stop-opacity:1" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- Background -->
                <rect width="128" height="128" fill="url(#radialGrad)"/>
                
                <!-- Glowing star -->
                <polygon points="64,20 70,40 90,40 75,55 80,75 64,65 48,75 53,55 38,40 58,40" 
                         fill="yellow" filter="url(#glow)"/>
                
                <!-- Text -->
                <text x="64" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
                    Complex SVG
                </text>
            </svg>
            """;
        
        SvgGeneratorWebView.svgToPngFile(complexSvg, outputDir.resolve("complex-svg.png"), 128, 128);
    }
    
    /**
     * Demo player-created content (with sanitization)
     */
    private static void demoPlayerContent(Path outputDir) throws Exception {
        System.out.println("Generating player content (with sanitization)...");
        
        // Simulate player-provided SVG (potentially malicious)
        String playerSvg = """
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <script>alert('This should be removed!')</script>
                <circle cx="32" cy="32" r="20" fill="purple" onclick="alert('This too!')"/>
                <text x="32" y="45" text-anchor="middle" fill="white" font-size="8">Player</text>
            </svg>
            """;
        
        // Sanitize the SVG
        String sanitizedSvg = SvgGeneratorWebView.sanitizeSvg(playerSvg);
        System.out.println("Sanitized SVG (removed scripts and event handlers)");
        
        // Generate both versions for comparison
        SvgGeneratorWebView.svgToPngFile(playerSvg, outputDir.resolve("player-raw.png"), 64, 64);
        SvgGeneratorWebView.svgToPngFile(sanitizedSvg, outputDir.resolve("player-sanitized.png"), 64, 64);
    }
    
    /**
     * Utility method to generate a simple icon
     */
    public static void generateIcon(String name, String color, Path outputPath) throws Exception {
        String iconSvg = String.format("""
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="%s" stroke="black" stroke-width="1"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">%s</text>
            </svg>
            """, color, name.substring(0, 1).toUpperCase());
        
        SvgGeneratorWebView.svgToPngFile(iconSvg, outputPath, 32, 32);
    }
} 