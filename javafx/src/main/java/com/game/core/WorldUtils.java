package com.game.core;

public class WorldUtils {
    
    /**
     * Wrap world coordinates to world bounds using dynamic calculation
     * @param x The x coordinate to wrap
     * @param y The y coordinate to wrap
     * @param worldConfig The world configuration for dimensions
     * @return Wrapped coordinates as a Point2D
     */
    public static Point2D wrapWorldCoordinates(double x, double y, double worldSize) {
        // Wrap coordinates using modulo arithmetic
        
        double wrappedX = x;
        double wrappedY = y;

        if (x > worldSize || x < 0) {
            wrappedX = ((x % worldSize) + worldSize) % worldSize;
            System.out.println("World Wrap X: " + x + " -> " + wrappedX + " (worldSize: " + worldSize + ")");
        }
        if (y > worldSize || y < 0) {
            wrappedY = ((y % worldSize) + worldSize) % worldSize;
            System.out.println("World Wrap Y: " + y + " -> " + wrappedY + " (worldSize: " + worldSize + ")");
        }
        
        return new Point2D(wrappedX, wrappedY);
    }
    
    /**
     * Simple Point2D class for coordinate pairs
     */
    public static class Point2D {
        public final double x;
        public final double y;
        
        public Point2D(double x, double y) {
            this.x = x;
            this.y = y;
        }
    }
} 