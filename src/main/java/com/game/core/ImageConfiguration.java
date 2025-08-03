package com.game.core;

import java.util.Objects;

/**
 * Configuration for image rendering properties.
 * Controls how an entity's image is displayed in the game world.
 */
public class ImageConfiguration {
    private double width;
    private double height;
    private Double fixedScreenAngle;
    private RenderMode renderMode;
    private double opacity;
    private double drawOffsetX;
    private double drawOffsetY;

    /**
     * Default constructor with sensible defaults.
     */
    public ImageConfiguration() {
        this(1.0, 1.0, null, RenderMode.CONFIGURED_SIZE, 1.0, 0.0, 0.0);
    }

    /**
     * Constructor with all parameters.
     * 
     * @param width Display width in world units
     * @param height Display height in world units
     * @param fixedScreenAngle Angle in radians (null for no fixed angle, 0.0 for upright)
     * @param renderMode How the image should be sized
     * @param opacity Opacity from 0.0 to 1.0
     * @param drawOffsetX Horizontal offset for drawing (positive = right, negative = left)
     * @param drawOffsetY Vertical offset for drawing (positive = down, negative = up)
     */
    public ImageConfiguration(double width, double height, Double fixedScreenAngle, 
                            RenderMode renderMode, double opacity, double drawOffsetX, double drawOffsetY) {
        this.width = width;
        this.height = height;
        this.fixedScreenAngle = fixedScreenAngle;
        this.renderMode = renderMode;
        this.opacity = Math.max(0.0, Math.min(1.0, opacity)); // Clamp to 0.0-1.0
        this.drawOffsetX = drawOffsetX;
        this.drawOffsetY = drawOffsetY;
    }

    // Getters
    public double getWidth() { return width; }
    public double getHeight() { return height; }
    public Double getFixedScreenAngle() { return fixedScreenAngle; }
    public RenderMode getRenderMode() { return renderMode; }
    public double getOpacity() { return opacity; }
    public double getDrawOffsetX() { return drawOffsetX; }
    public double getDrawOffsetY() { return drawOffsetY; }

    // Setters
    public void setWidth(double width) { this.width = width; }
    public void setHeight(double height) { this.height = height; }
    public void setFixedScreenAngle(Double fixedScreenAngle) { this.fixedScreenAngle = fixedScreenAngle; }
    public void setRenderMode(RenderMode renderMode) { this.renderMode = renderMode; }
    public void setOpacity(double opacity) { this.opacity = Math.max(0.0, Math.min(1.0, opacity)); }
    public void setDrawOffsetX(double drawOffsetX) { this.drawOffsetX = drawOffsetX; }
    public void setDrawOffsetY(double drawOffsetY) { this.drawOffsetY = drawOffsetY; }

    /**
     * Creates a copy of this configuration.
     * 
     * @return A new ImageConfiguration with the same values
     */
    public ImageConfiguration copy() {
        return new ImageConfiguration(width, height, fixedScreenAngle, renderMode, opacity, drawOffsetX, drawOffsetY);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        ImageConfiguration that = (ImageConfiguration) obj;
        return Double.compare(that.width, width) == 0 &&
               Double.compare(that.height, height) == 0 &&
               Objects.equals(that.fixedScreenAngle, fixedScreenAngle) &&
               Double.compare(that.opacity, opacity) == 0 &&
               Double.compare(that.drawOffsetX, drawOffsetX) == 0 &&
               Double.compare(that.drawOffsetY, drawOffsetY) == 0 &&
               renderMode == that.renderMode;
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + Double.hashCode(width);
        result = 31 * result + Double.hashCode(height);
        result = 31 * result + Objects.hashCode(fixedScreenAngle);
        result = 31 * result + renderMode.hashCode();
        result = 31 * result + Double.hashCode(opacity);
        result = 31 * result + Double.hashCode(drawOffsetX);
        result = 31 * result + Double.hashCode(drawOffsetY);
        return result;
    }

    @Override
    public String toString() {
        return String.format("ImageConfiguration{width=%.2f, height=%.2f, angle=%s, mode=%s, opacity=%.2f, offsetX=%.2f, offsetY=%.2f}",
                width, height, fixedScreenAngle, renderMode, opacity, drawOffsetX, drawOffsetY);
    }
} 