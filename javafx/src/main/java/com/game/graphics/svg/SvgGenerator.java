package com.game.graphics.svg;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SvgGenerator {
    private static final Logger logger = LoggerFactory.getLogger(SvgGenerator.class);
    
    /**
     * Parse SVG and render to BufferedImage
     */
    public static BufferedImage svgToImage(String svg, int size) {
        return svgToImage(svg, size, size);
    }
    
    /**
     * Parse SVG and render to BufferedImage with custom dimensions
     */
    public static BufferedImage svgToImage(String svg, int width, int height) {
        try {
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = image.createGraphics();
            
            // Enable anti-aliasing
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Parse and render SVG elements
            parseAndRenderSvg(svg, g2d, Math.max(width, height));
            
            g2d.dispose();
            return image;
        } catch (Exception e) {
            logger.error("Failed to parse SVG: {}", e.getMessage());
            // Fallback to basic shape
            return generateFallbackImage(Math.max(width, height));
        }
    }
    
    /**
     * Parse SVG string and render elements
     */
    private static void parseAndRenderSvg(String svg, Graphics2D g2d, int size) {
        // Extract SVG content (remove outer svg tags)
        String content = extractSvgContent(svg);
        
        // Parse and render each element
        parseRectangles(content, g2d, size);
        parseEllipses(content, g2d, size);
        parseCircles(content, g2d, size);
        parseLines(content, g2d, size);
    }
    
    /**
     * Extract content from SVG tags
     */
    private static String extractSvgContent(String svg) {
        Pattern pattern = Pattern.compile("<svg[^>]*>(.*)</svg>", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(svg);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return svg;
    }
    
    /**
     * Parse and render rectangle elements
     */
    private static void parseRectangles(String content, Graphics2D g2d, int size) {
        Pattern pattern = Pattern.compile(
            "<rect\\s+([^>]*)/?>", 
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            String attributes = matcher.group(1);
            renderRectangle(attributes, g2d, size);
        }
    }
    
    /**
     * Parse and render ellipse elements
     */
    private static void parseEllipses(String content, Graphics2D g2d, int size) {
        Pattern pattern = Pattern.compile(
            "<ellipse\\s+([^>]*)/?>", 
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            String attributes = matcher.group(1);
            renderEllipse(attributes, g2d, size);
        }
    }
    
    /**
     * Parse and render circle elements
     */
    private static void parseCircles(String content, Graphics2D g2d, int size) {
        Pattern pattern = Pattern.compile(
            "<circle\\s+([^>]*)/?>", 
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            String attributes = matcher.group(1);
            renderCircle(attributes, g2d, size);
        }
    }
    
    /**
     * Parse and render line elements
     */
    private static void parseLines(String content, Graphics2D g2d, int size) {
        Pattern pattern = Pattern.compile(
            "<line\\s+([^>]*)/?>", 
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            String attributes = matcher.group(1);
            renderLine(attributes, g2d, size);
        }
    }
    
    /**
     * Render a rectangle from SVG attributes
     */
    private static void renderRectangle(String attributes, Graphics2D g2d, int size) {
        double x = parseAttribute(attributes, "x", 0);
        double y = parseAttribute(attributes, "y", 0);
        double width = parseAttribute(attributes, "width", 0);
        double height = parseAttribute(attributes, "height", 0);
        String fill = parseStringAttribute(attributes, "fill", "#000000");
        double opacity = parseAttribute(attributes, "opacity", 1.0);
        double rotation = parseTransformRotation(attributes);
        
        // Apply rotation if specified
        if (rotation != 0) {
            g2d.rotate(Math.toRadians(rotation), x + width/2, y + height/2);
        }
        
        // Set color with opacity
        Color color = parseColor(fill, opacity);
        g2d.setColor(color);
        
        // Draw rectangle
        g2d.fillRect((int)x, (int)y, (int)width, (int)height);
        
        // Reset rotation
        if (rotation != 0) {
            g2d.rotate(-Math.toRadians(rotation), x + width/2, y + height/2);
        }
    }
    
    /**
     * Render an ellipse from SVG attributes
     */
    private static void renderEllipse(String attributes, Graphics2D g2d, int size) {
        double cx = parseAttribute(attributes, "cx", 0);
        double cy = parseAttribute(attributes, "cy", 0);
        double rx = parseAttribute(attributes, "rx", 0);
        double ry = parseAttribute(attributes, "ry", 0);
        String fill = parseStringAttribute(attributes, "fill", "#000000");
        double opacity = parseAttribute(attributes, "opacity", 1.0);
        String stroke = parseStringAttribute(attributes, "stroke", null);
        double strokeWidth = parseAttribute(attributes, "stroke-width", 0);
        double rotation = parseTransformRotation(attributes);
        
        // Apply rotation if specified
        if (rotation != 0) {
            g2d.rotate(Math.toRadians(rotation), cx, cy);
        }
        
        // Set fill color
        Color fillColor = parseColor(fill, opacity);
        g2d.setColor(fillColor);
        
        // Draw ellipse
        g2d.fillOval((int)(cx - rx), (int)(cy - ry), (int)(rx * 2), (int)(ry * 2));
        
        // Draw stroke if specified
        if (stroke != null && strokeWidth > 0) {
            Color strokeColor = parseColor(stroke, opacity);
            g2d.setColor(strokeColor);
            g2d.setStroke(new BasicStroke((float)strokeWidth));
            g2d.drawOval((int)(cx - rx), (int)(cy - ry), (int)(rx * 2), (int)(ry * 2));
        }
        
        // Reset rotation
        if (rotation != 0) {
            g2d.rotate(-Math.toRadians(rotation), cx, cy);
        }
    }
    
    /**
     * Render a circle from SVG attributes
     */
    private static void renderCircle(String attributes, Graphics2D g2d, int size) {
        double cx = parseAttribute(attributes, "cx", 0);
        double cy = parseAttribute(attributes, "cy", 0);
        double r = parseAttribute(attributes, "r", 0);
        String fill = parseStringAttribute(attributes, "fill", "#000000");
        double opacity = parseAttribute(attributes, "opacity", 1.0);
        
        // Set color with opacity
        Color color = parseColor(fill, opacity);
        g2d.setColor(color);
        
        // Draw circle
        g2d.fillOval((int)(cx - r), (int)(cy - r), (int)(r * 2), (int)(r * 2));
    }
    
    /**
     * Render a line from SVG attributes
     */
    private static void renderLine(String attributes, Graphics2D g2d, int size) {
        double x1 = parseAttribute(attributes, "x1", 0);
        double y1 = parseAttribute(attributes, "y1", 0);
        double x2 = parseAttribute(attributes, "x2", 0);
        double y2 = parseAttribute(attributes, "y2", 0);
        String stroke = parseStringAttribute(attributes, "stroke", "#000000");
        double strokeWidth = parseAttribute(attributes, "stroke-width", 1.0);
        double opacity = parseAttribute(attributes, "opacity", 1.0);
        
        // Set stroke color with opacity
        Color color = parseColor(stroke, opacity);
        g2d.setColor(color);
        g2d.setStroke(new BasicStroke((float)strokeWidth));
        
        // Draw line
        g2d.drawLine((int)x1, (int)y1, (int)x2, (int)y2);
    }
    
    /**
     * Parse numeric attribute from SVG
     */
    private static double parseAttribute(String attributes, String name, double defaultValue) {
        Pattern pattern = Pattern.compile(name + "\\s*=\\s*[\"']([^\"']*)[\"']");
        Matcher matcher = pattern.matcher(attributes);
        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1));
            } catch (NumberFormatException e) {
                logger.warn("Failed to parse attribute {}: {}", name, matcher.group(1));
            }
        }
        return defaultValue;
    }
    
    /**
     * Parse string attribute from SVG
     */
    private static String parseStringAttribute(String attributes, String name, String defaultValue) {
        Pattern pattern = Pattern.compile(name + "\\s*=\\s*[\"']([^\"']*)[\"']");
        Matcher matcher = pattern.matcher(attributes);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return defaultValue;
    }
    
    /**
     * Parse transform attribute from SVG (e.g., "rotate(45, 10, 10)")
     */
    private static double parseTransformRotation(String attributes) {
        String transform = parseStringAttribute(attributes, "transform", "");
        if (transform.isEmpty()) {
            return 0.0;
        }
        
        // Parse rotate(angle, cx, cy) format
        Pattern pattern = Pattern.compile("rotate\\(([^,]+)");
        Matcher matcher = pattern.matcher(transform);
        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1).trim());
            } catch (NumberFormatException e) {
                logger.warn("Failed to parse transform rotation: {}", transform);
            }
        }
        return 0.0;
    }
    
    /**
     * Parse color from SVG color string
     */
    private static Color parseColor(String colorStr, double opacity) {
        if (colorStr == null || colorStr.isEmpty()) {
            return new Color(0, 0, 0, (int)(opacity * 255));
        }
        
        // Handle named colors
        switch (colorStr.toLowerCase()) {
            case "red": return new Color(255, 0, 0, (int)(opacity * 255));
            case "green": return new Color(0, 255, 0, (int)(opacity * 255));
            case "blue": return new Color(0, 0, 255, (int)(opacity * 255));
            case "black": return new Color(0, 0, 0, (int)(opacity * 255));
            case "white": return new Color(255, 255, 255, (int)(opacity * 255));
            case "gray": return new Color(128, 128, 128, (int)(opacity * 255));
            case "yellow": return new Color(255, 255, 0, (int)(opacity * 255));
            case "cyan": return new Color(0, 255, 255, (int)(opacity * 255));
            case "magenta": return new Color(255, 0, 255, (int)(opacity * 255));
        }
        
        // Handle hex colors
        if (colorStr.startsWith("#")) {
            try {
                int rgb = Integer.parseInt(colorStr.substring(1), 16);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                return new Color(r, g, b, (int)(opacity * 255));
            } catch (NumberFormatException e) {
                logger.warn("Failed to parse hex color: {}", colorStr);
            }
        }
        
        // Handle rgb() format
        if (colorStr.startsWith("rgb(")) {
            Pattern pattern = Pattern.compile("rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)");
            Matcher matcher = pattern.matcher(colorStr);
            if (matcher.find()) {
                int r = Integer.parseInt(matcher.group(1));
                int g = Integer.parseInt(matcher.group(2));
                int b = Integer.parseInt(matcher.group(3));
                return new Color(r, g, b, (int)(opacity * 255));
            }
        }
        
        // Default to black
        return new Color(0, 0, 0, (int)(opacity * 255));
    }

    /**
     * Generate SVG for tree entity (matches JavaScript implementation)
     */
    public static String generateTreeSVG(EntityConfig.TreeConfig config) {
        int foliageRadius = config.foliageRadius;
        int width = foliageRadius * 2;
        int height = config.imageHeight;
        int trunkWidth = config.trunkWidth;

        // Trunk: from bottom center up
        int trunkX = (width / 2) - (trunkWidth / 2);
        int trunkY = (foliageRadius * 2) - 1;
        int trunkHeight = height - trunkY;
        
        double fixedAngle = config.fixedScreenAngle != null ? config.fixedScreenAngle : 0.0;
        
        String svg = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<rect x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" fill=\"%s\" opacity=\"%.1f\" " +
            "transform=\"rotate(%.1f, %d, %d)\"/>" +
            "<ellipse cx=\"%d\" cy=\"%d\" rx=\"%d\" ry=\"%d\" fill=\"%s\" opacity=\"%.1f\" " +
            "stroke=\"%s\" stroke-width=\"%d\" " +
            "transform=\"rotate(%.1f, %d, %d)\"/>" +
            "</svg>",
            width, height,
            trunkX, trunkY, trunkWidth, trunkHeight, config.trunkColor, config.opacity,
            fixedAngle, foliageRadius, foliageRadius,
            foliageRadius, foliageRadius, foliageRadius, foliageRadius, config.foliageColor, config.opacity,
            config.foliageBorderColor, config.foliageBorderWidth,
            fixedAngle, foliageRadius, foliageRadius
        );
        
        return svg;
    }
    
    /**
     * Generate SVG for rock entity (matches JavaScript implementation)
     */
    public static String generateRockSVG(EntityConfig.RockConfig config) {
        int center = config.size / 2;
        int radius = (config.size / 2) - config.strokeWidth;

        // Generate texture spots with deterministic positions
        StringBuilder textureElements = new StringBuilder();
        for (int i = 0; i < config.textureSpots; i++) {
            double angle = (i * 137.5) * (Math.PI / 180);
            double distance = radius * (0.3 + (i * 0.2) % 0.4);
            double spotX = center + Math.cos(angle) * distance;
            double spotY = center + Math.sin(angle) * distance;
            double spotSize = radius * (0.1 + (i * 0.05) % 0.1);
            
            textureElements.append(String.format(
                "<circle cx=\"%.1f\" cy=\"%.1f\" r=\"%.1f\" fill=\"%s\"/>",
                spotX, spotY, spotSize, config.textureColor
            ));
        }

        String svg = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<circle cx=\"%d\" cy=\"%d\" r=\"%d\" fill=\"%s\" opacity=\"%.1f\" " +
            "stroke=\"%s\" stroke-width=\"%d\"/>" +
            "%s" +
            "</svg>",
            config.size, config.size,
            center, center, radius, config.baseColor, config.opacity,
            config.strokeColor, config.strokeWidth,
            textureElements.toString()
        );
        
        return svg;
    }
    
    /**
     * Generate SVG for grass entity (matches JavaScript implementation)
     */
    public static String generateGrassSVG(EntityConfig.GrassConfig config) {
        int center = config.size / 2;
        double clusterRadius = config.size * 0.3;

        // Generate grass clusters with deterministic positions
        StringBuilder grassElements = new StringBuilder();
        
        for (int cluster = 0; cluster < config.clusterCount; cluster++) {
            // Calculate cluster center using deterministic positioning
            double angle = (cluster * 120) * (Math.PI / 180);
            double distance = clusterRadius * (0.3 + (cluster * 0.2) % 0.4);
            double clusterX = center + Math.cos(angle) * distance;
            double clusterY = center + Math.sin(angle) * distance;
            
            // Generate blades for this cluster
            int clusterBladeCount = config.bladeCount + (cluster % 2);
            double baseAngle = (cluster * 137.5) * (Math.PI / 180);
            
            for (int blade = 0; blade < clusterBladeCount; blade++) {
                // Vary the angle slightly for each blade
                double angleVariation = ((cluster * 100 + blade * 50) % (config.bladeAngleVariation * 2) - config.bladeAngleVariation) * (Math.PI / 180);
                double bladeAngle = baseAngle + angleVariation;
                
                // Vary the length slightly
                double length = config.bladeLength + (cluster * 200 + blade * 30) % 6;
                
                // Calculate blade end point
                double endX = clusterX + Math.cos(bladeAngle) * length;
                double endY = clusterY + Math.sin(bladeAngle) * length;
                
                // Create grass blade as a line
                grassElements.append(String.format(
                    "<line x1=\"%.1f\" y1=\"%.1f\" x2=\"%.1f\" y2=\"%.1f\" stroke=\"%s\" stroke-width=\"%.1f\" opacity=\"%.1f\"/>",
                    clusterX, clusterY, endX, endY, config.bladeColor, config.bladeWidth, config.opacity
                ));
            }
        }

        String svg = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "%s" +
            "</svg>",
            config.size, config.size,
            grassElements.toString()
        );

        return svg;
    }
    
    /**
     * Generate fallback image if SVG parsing fails
     */
    private static BufferedImage generateFallbackImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setColor(Color.GRAY);
        g2d.fillRect(0, 0, size, size);
        
        g2d.dispose();
        return image;
    }
    
    public static byte[] imageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }
    
    public static BufferedImage bytesToImage(byte[] bytes) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        return ImageIO.read(bais);
    }
} 