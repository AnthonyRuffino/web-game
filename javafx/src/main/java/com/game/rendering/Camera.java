package com.game.rendering;

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
        gc.rotate(Math.toDegrees(rotation));
        gc.translate(-x, -y);
    }
    
    public void restoreTransform(GraphicsContext gc) {
        gc.restore();
    }
    
    public void follow(double targetX, double targetY) {
        this.x = targetX;
        this.y = targetY;
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