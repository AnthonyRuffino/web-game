package com.game.core;

/**
 * Configuration for image rendering properties.
 * Controls how an entity's image is displayed in the game world.
 */
public class ImageConfiguration {
    private double width;
    private double height;
    private double fixedScreenAngle;
    private RenderMode renderMode;
    private double opacity;
    private boolean renderLast;

    /**
     * Default constructor with sensible defaults.
     */
    public ImageConfiguration() {
        this(1.0, 1.0, 0.0, RenderMode.CONFIGURED_SIZE, 1.0, false);
    }

    /**
     * Constructor with all parameters.
     * 
     * @param width Display width in world units
     * @param height Display height in world units
     * @param fixedScreenAngle Angle in radians (0.0 for upright)
     * @param renderMode How the image should be sized
     * @param opacity Opacity from 0.0 to 1.0
     * @param renderLast Whether to render after other entities (for 2.5D layering)
     */
    public ImageConfiguration(double width, double height, double fixedScreenAngle, 
                            RenderMode renderMode, double opacity, boolean renderLast) {
        this.width = width;
        this.height = height;
        this.fixedScreenAngle = fixedScreenAngle;
        this.renderMode = renderMode;
        this.opacity = Math.max(0.0, Math.min(1.0, opacity)); // Clamp to 0.0-1.0
        this.renderLast = renderLast;
    }

    // Getters
    public double getWidth() { return width; }
    public double getHeight() { return height; }
    public double getFixedScreenAngle() { return fixedScreenAngle; }
    public RenderMode getRenderMode() { return renderMode; }
    public double getOpacity() { return opacity; }
    public boolean isRenderLast() { return renderLast; }

    // Setters
    public void setWidth(double width) { this.width = width; }
    public void setHeight(double height) { this.height = height; }
    public void setFixedScreenAngle(double fixedScreenAngle) { this.fixedScreenAngle = fixedScreenAngle; }
    public void setRenderMode(RenderMode renderMode) { this.renderMode = renderMode; }
    public void setOpacity(double opacity) { this.opacity = Math.max(0.0, Math.min(1.0, opacity)); }
    public void setRenderLast(boolean renderLast) { this.renderLast = renderLast; }

    /**
     * Creates a copy of this configuration.
     * 
     * @return A new ImageConfiguration with the same values
     */
    public ImageConfiguration copy() {
        return new ImageConfiguration(width, height, fixedScreenAngle, renderMode, opacity, renderLast);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        ImageConfiguration that = (ImageConfiguration) obj;
        return Double.compare(that.width, width) == 0 &&
               Double.compare(that.height, height) == 0 &&
               Double.compare(that.fixedScreenAngle, fixedScreenAngle) == 0 &&
               Double.compare(that.opacity, opacity) == 0 &&
               renderMode == that.renderMode &&
               renderLast == that.renderLast;
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + Double.hashCode(width);
        result = 31 * result + Double.hashCode(height);
        result = 31 * result + Double.hashCode(fixedScreenAngle);
        result = 31 * result + renderMode.hashCode();
        result = 31 * result + Double.hashCode(opacity);
        result = 31 * result + Boolean.hashCode(renderLast);
        return result;
    }

    @Override
    public String toString() {
        return String.format("ImageConfiguration{width=%.2f, height=%.2f, angle=%.2f, mode=%s, opacity=%.2f, renderLast=%s}",
                width, height, fixedScreenAngle, renderMode, opacity, renderLast);
    }
} 