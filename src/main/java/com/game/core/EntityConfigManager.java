package com.game.core;

import com.game.graphics.svg.EntityConfig;

/**
 * Manages entity type configurations and provides effective image configurations.
 * Handles the inheritance chain: instance config → entity type config → default config.
 */
public class EntityConfigManager {
    
    /**
     * Gets the effective image configuration for an entity.
     * Priority: instance config → entity type config → default config
     * 
     * @param entity The entity to get configuration for
     * @return The effective image configuration
     */
    public static ImageConfiguration getEffectiveImageConfig(Entity entity) {
        // First, check if entity has instance-level configuration
        if (entity.getImageConfig() != null) {
            return entity.getImageConfig();
        }
        
        // Otherwise, get the entity type configuration
        return getEntityTypeImageConfig(entity.getType());
    }
    
    /**
     * Gets the image configuration for an entity type.
     * 
     * @param entityType The entity type (e.g., "tree", "rock", "grass")
     * @return The image configuration for the entity type, or default if not found
     */
    public static ImageConfiguration getEntityTypeImageConfig(String entityType) {
        return switch (entityType) {
            case "tree" -> new EntityConfig.TreeConfig().imageConfig;
            case "rock" -> new EntityConfig.RockConfig().imageConfig;
            case "grass" -> new EntityConfig.GrassConfig().imageConfig;
            default -> new ImageConfiguration(); // Default configuration
        };
    }
    
    /**
     * Calculates the effective size for rendering an entity based on its configuration.
     * 
     * @param entity The entity to calculate size for
     * @param tileSize The size of a tile in pixels
     * @return The effective size in pixels
     */
    public static double calculateEffectiveSize(Entity entity, int tileSize) {
        ImageConfiguration config = getEffectiveImageConfig(entity);
        
        return switch (config.getRenderMode()) {
            case GRID_FIT -> tileSize; // Scale to fit grid square
            case CONFIGURED_SIZE -> config.getWidth() * tileSize; // Use configured width
            case ASPECT_RATIO_FIT -> {
                // Maintain aspect ratio within configured bounds
                double width = config.getWidth() * tileSize;
                double height = config.getHeight() * tileSize;
                yield Math.min(width, height);
            }
            case CUSTOM_SIZE -> config.getWidth() * tileSize; // Use instance-specific size
        };
    }
    
    /**
     * Calculates the effective width and height for rendering an entity.
     * 
     * @param entity The entity to calculate dimensions for
     * @param tileSize The size of a tile in pixels
     * @return Array with [width, height] in pixels
     */
    public static double[] calculateEffectiveDimensions(Entity entity, int tileSize) {
        ImageConfiguration config = getEffectiveImageConfig(entity);
        
        return switch (config.getRenderMode()) {
            case GRID_FIT -> new double[]{tileSize, tileSize}; // Square grid fit
            case CONFIGURED_SIZE -> new double[]{
                config.getWidth() * tileSize, 
                config.getHeight() * tileSize
            };
            case ASPECT_RATIO_FIT -> {
                // Maintain aspect ratio within configured bounds
                double width = config.getWidth() * tileSize;
                double height = config.getHeight() * tileSize;
                double maxDimension = Math.max(width, height);
                double aspectRatio = width / height;
                
                if (width > height) {
                    yield new double[]{maxDimension, maxDimension / aspectRatio};
                } else {
                    yield new double[]{maxDimension * aspectRatio, maxDimension};
                }
            }
            case CUSTOM_SIZE -> new double[]{
                config.getWidth() * tileSize, 
                config.getHeight() * tileSize
            };
        };
    }
} 