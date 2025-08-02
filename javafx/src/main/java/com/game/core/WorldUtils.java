package com.game.core;

public class WorldUtils {
    
    /**
     * Wrap world coordinates to world bounds using dynamic calculation
     * @param x The x coordinate to wrap
     * @param y The y coordinate to wrap
     * @param worldConfig The world configuration for dimensions
     * @return Wrapped coordinates as a Point2D
     */
    public static Point2D wrapWorldCoordinates(double x, double y, WorldConfig worldConfig) {
        double worldSize = worldConfig.chunkCount() * worldConfig.chunkSize() * worldConfig.tileSize();
        
        // Wrap coordinates using modulo arithmetic
        double wrappedX = ((x % worldSize) + worldSize) % worldSize;
        double wrappedY = ((y % worldSize) + worldSize) % worldSize;
        
        return new Point2D(wrappedX, wrappedY);
    }
    
    /**
     * Wrap a single coordinate to world bounds
     * @param coordinate The coordinate to wrap
     * @param worldConfig The world configuration for dimensions
     * @return The wrapped coordinate
     */
    public static double wrapCoordinate(double coordinate, WorldConfig worldConfig) {
        double worldSize = worldConfig.chunkCount() * worldConfig.chunkSize() * worldConfig.tileSize();
        return ((coordinate % worldSize) + worldSize) % worldSize;
    }
    
    /**
     * Check if coordinates are within world bounds
     * @param x The x coordinate to check
     * @param y The y coordinate to check
     * @param worldConfig The world configuration for dimensions
     * @return true if coordinates are within bounds, false otherwise
     */
    public static boolean isWithinWorldBounds(double x, double y, WorldConfig worldConfig) {
        double worldSize = worldConfig.chunkCount() * worldConfig.chunkSize() * worldConfig.tileSize();
        return x >= 0 && x < worldSize && y >= 0 && y < worldSize;
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