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
        try {
            BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = image.createGraphics();
            
            // Enable anti-aliasing
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Parse and render SVG elements
            parseAndRenderSvg(svg, g2d, size);
            
            g2d.dispose();
            return image;
        } catch (Exception e) {
            logger.error("Failed to parse SVG: {}", e.getMessage());
            // Fallback to basic shape
            return generateFallbackImage(size);
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
     * Render a rectangle from SVG attributes
     */
    private static void renderRectangle(String attributes, Graphics2D g2d, int size) {
        double x = parseAttribute(attributes, "x", 0);
        double y = parseAttribute(attributes, "y", 0);
        double width = parseAttribute(attributes, "width", 0);
        double height = parseAttribute(attributes, "height", 0);
        String fill = parseStringAttribute(attributes, "fill", "#000000");
        double opacity = parseAttribute(attributes, "opacity", 1.0);
        double rotation = parseAttribute(attributes, "transform", 0.0);
        
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
        double rotation = parseAttribute(attributes, "transform", 0.0);
        
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
     * Generate tree image using SVG-like approach
     */
    public static BufferedImage generateTreeImage(int size) {
        String svg = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<rect x=\"%d\" y=\"%d\" width=\"8\" height=\"16\" fill=\"#8B4513\" opacity=\"1.0\"/>" +
            "<ellipse cx=\"%d\" cy=\"%d\" rx=\"12\" ry=\"12\" fill=\"#228B22\" opacity=\"1.0\"/>" +
            "</svg>",
            size, size,
            size/2 - 4, size/2 + 8,
            size/2, size/2
        );
        
        return svgToImage(svg, size);
    }
    
    /**
     * Generate rock image using SVG-like approach
     */
    public static BufferedImage generateRockImage(int size) {
        String svg = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<circle cx=\"%d\" cy=\"%d\" r=\"8\" fill=\"#808080\" opacity=\"1.0\"/>" +
            "</svg>",
            size, size,
            size/2, size/2
        );
        
        return svgToImage(svg, size);
    }
    
    /**
     * Generate grass image using SVG-like approach
     */
    public static BufferedImage generateGrassImage(int size) {
        String svg = String.format(
            "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<circle cx=\"%d\" cy=\"%d\" r=\"4\" fill=\"#7CFC00\" opacity=\"1.0\"/>" +
            "</svg>",
            size, size,
            size/2, size/2
        );
        
        return svgToImage(svg, size);
    }
    
    /**
     * Generate plains background using SVG-like approach
     */
    public static BufferedImage generatePlainsBackground(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Create gradient background (similar to SVG gradient)
        GradientPaint gradient = new GradientPaint(
            0, 0, new Color(135, 206, 235), // Sky blue
            0, size, new Color(144, 238, 144) // Light green
        );
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, size, size);
        
        g2d.dispose();
        return image;
    }
    
    /**
     * Generate desert background using SVG-like approach
     */
    public static BufferedImage generateDesertBackground(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Create desert gradient
        GradientPaint gradient = new GradientPaint(
            0, 0, new Color(255, 215, 0), // Gold
            0, size, new Color(210, 180, 140) // Tan
        );
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, size, size);
        
        g2d.dispose();
        return image;
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