package com.game.rendering;

import javafx.geometry.Point2D;
import javafx.scene.canvas.GraphicsContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Camera {
    private static final Logger logger = LoggerFactory.getLogger(Camera.class);
    
    private double x, y;
    private double zoom = 1.0;
    private double targetZoom = 1.0;
    private double rotation = 0.0;
    private double width, height;
    private CameraMode mode = CameraMode.FIXED_ANGLE;
    
    public enum CameraMode {
        FIXED_ANGLE,
        PLAYER_PERSPECTIVE
    }
    
    public Camera(double width, double height) {
        this.width = width;
        this.height = height;
        logger.info("Camera initialized: {}x{}", width, height);
    }
    
    public void update(double deltaTime) {
        // Smooth zoom interpolation
        double zoomDiff = targetZoom - zoom;
        if (Math.abs(zoomDiff) > 0.01) {
            zoom += zoomDiff * deltaTime * 5.0; // Smooth interpolation
        }
        
        // Clamp zoom
        zoom = Math.max(0.1, Math.min(5.0, zoom));
    }
    
    public void applyTransform(GraphicsContext gc) {
        gc.save();
        
        // Apply camera transformations
        gc.translate(width / 2, height / 2);
        gc.scale(zoom, zoom);
        
        if (mode == CameraMode.PLAYER_PERSPECTIVE) {
            // In player-perspective mode, we'll apply rotation in the game render loop
            // based on player angle, so we just translate here
            gc.translate(-x, -y);
        } else {
            // Fixed-angle mode: apply camera rotation
            gc.rotate(Math.toDegrees(-rotation));
            gc.translate(-x, -y);
        }
    }
    
    public void restoreTransform(GraphicsContext gc) {
        gc.restore();
    }
    
    public void applyPlayerPerspectiveTransform(GraphicsContext gc, double playerAngle) {
        if (mode == CameraMode.PLAYER_PERSPECTIVE) {
            // Rotate the entire world around the player's position
            // First translate to player position, rotate, then translate back
            gc.translate(x, y);
            gc.rotate(-Math.toDegrees(playerAngle)); // Convert radians to degrees and negate
            gc.translate(-x, -y);
        }
    }
    
    public void follow(double targetX, double targetY) {
        // Smooth camera following (like JavaScript implementation)
        double followSpeed = 0.1; // Same as JavaScript
        this.x += (targetX - this.x) * followSpeed;
        this.y += (targetY - this.y) * followSpeed;
    }
    
    public void setZoom(double zoom) {
        this.targetZoom = Math.max(0.1, Math.min(5.0, zoom));
    }
    
    public void setRotation(double rotation) {
        this.rotation = rotation;
    }
    
    public void setMode(CameraMode mode) {
        this.mode = mode;
        logger.info("Camera mode changed to: {}", mode);
    }
    
    public void rotateCamera(double deltaRotation) {
        if (mode == CameraMode.FIXED_ANGLE) {
            rotation += deltaRotation;
            // Keep rotation in reasonable bounds
            while (rotation > Math.PI * 2) rotation -= Math.PI * 2;
            while (rotation < 0) rotation += Math.PI * 2;
        }
    }
    
    public double getRotationSpeed() {
        return Math.PI * 0.8; // radians per second
    }
    
    // Convert screen coordinates to world coordinates (like JavaScript implementation)
    public Point2D screenToWorld(double screenX, double screenY, double playerAngle) {
        // Undo zoom and center translation
        double x = (screenX - width / 2) / zoom;
        double y = (screenY - height / 2) / zoom;
        double undoAngle = (mode == CameraMode.PLAYER_PERSPECTIVE) ? playerAngle : rotation;
        
        // Undo rotation
        double cos = Math.cos(undoAngle);
        double sin = Math.sin(undoAngle);
        double worldX = x * cos - y * sin + this.x;
        double worldY = x * sin + y * cos + this.y;
        
        return new Point2D(worldX, worldY);
    }
    
    public void resize(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    // Getters
    public double getX() { return x; }
    public double getY() { return y; }
    public double getZoom() { return zoom; }
    public double getRotation() { return rotation; }
    public CameraMode getMode() { return mode; }
    public double getWidth() { return width; }
    public double getHeight() { return height; }
} 