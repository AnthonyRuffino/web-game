package com.game.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;

public class SvgGenerator {
    private static final Logger logger = LoggerFactory.getLogger(SvgGenerator.class);
    
    public static BufferedImage generateTreeImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        // Enable anti-aliasing
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw trunk
        g2d.setColor(new Color(139, 69, 19)); // Saddle brown
        g2d.fillRect(size / 2 - 4, size / 2 + 8, 8, 16);
        
        // Draw leaves
        g2d.setColor(new Color(34, 139, 34)); // Forest green
        g2d.fillOval(size / 2 - 12, size / 2 - 12, 24, 24);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generateRockImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw rock
        g2d.setColor(new Color(128, 128, 128)); // Gray
        g2d.fillOval(size / 2 - 8, size / 2 - 8, 16, 16);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generateGrassImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw grass
        g2d.setColor(new Color(124, 252, 0)); // Lawn green
        g2d.fillOval(size / 2 - 4, size / 2 - 4, 8, 8);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generatePlainsBackground(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Create gradient background
        GradientPaint gradient = new GradientPaint(
            0, 0, new Color(135, 206, 235), // Sky blue
            0, size, new Color(144, 238, 144) // Light green
        );
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, size, size);
        
        g2d.dispose();
        return image;
    }
    
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