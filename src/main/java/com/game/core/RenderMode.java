package com.game.core;

/**
 * Defines how an image should be sized during rendering.
 */
public enum RenderMode {
    /**
     * Scale to fit within a grid square (current behavior).
     */
    GRID_FIT,
    
    /**
     * Use width/height from configuration (new default).
     */
    CONFIGURED_SIZE,
    
    /**
     * Maintain aspect ratio within configured bounds.
     */
    ASPECT_RATIO_FIT,
    
    /**
     * Use instance-specific size overrides.
     */
    CUSTOM_SIZE
} 