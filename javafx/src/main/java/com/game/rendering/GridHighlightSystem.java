package com.game.rendering;

import javafx.geometry.Point2D;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GridHighlightSystem {
    private static final Logger logger = LoggerFactory.getLogger(GridHighlightSystem.class);
    
    private double mouseX, mouseY;
    private double gridSize = 32.0; // Size of each grid cell
    private boolean highlightEnabled = true;
    
    public void updateMousePosition(double x, double y) {
        this.mouseX = x;
        this.mouseY = y;
        logger.debug("Mouse position updated: ({}, {})", x, y);
    }
    
    public void setGridSize(double gridSize) {
        this.gridSize = gridSize;
    }
    
    public void setHighlightEnabled(boolean enabled) {
        this.highlightEnabled = enabled;
    }
    
    public void drawGridHighlight(GraphicsContext gc, Camera camera, double playerAngle) {
        if (!highlightEnabled) return;
        
        // Use camera's screenToWorld method (like JavaScript implementation)
        Point2D worldPos = camera.screenToWorld(mouseX, mouseY, playerAngle);
        double worldX = worldPos.getX();
        double worldY = worldPos.getY();
        
        // Calculate grid cell coordinates (like JavaScript: tileX * tileSize, tileY * tileSize)
        int gridX = (int) Math.floor(worldX / gridSize);
        int gridY = (int) Math.floor(worldY / gridSize);
        
        // Debug: Log the coordinate conversion
                // Debug logging removed for performance
        
        // Draw highlight rectangle in world coordinates (before camera transform is restored)
        // This matches the JavaScript: ctx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
        double worldCellX = gridX * gridSize;
        double worldCellY = gridY * gridSize;
        
                // Debug logging removed for performance
        
        gc.setStroke(Color.YELLOW);
        gc.setLineWidth(2);
        gc.strokeRect(worldCellX, worldCellY, gridSize, gridSize);
    }
    

    
    private double worldToScreenX(double worldX, Camera camera) {
        return (worldX - camera.getX()) * camera.getZoom() + camera.getWidth() / 2;
    }
    
    private double worldToScreenY(double worldY, Camera camera) {
        return (worldY - camera.getY()) * camera.getZoom() + camera.getHeight() / 2;
    }
} 