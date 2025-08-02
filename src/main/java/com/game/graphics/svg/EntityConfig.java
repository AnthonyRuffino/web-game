package com.game.graphics.svg;

/**
 * Configuration classes for entity SVG generation.
 * These match the JavaScript configurations in grass.js, tree.js, and rock.js
 */
public class EntityConfig {
    
    /**
     * Configuration for grass entities
     */
    public static class GrassConfig {
        public int size = 32;
        public String bladeColor = "#81C784";
        public double bladeWidth = 1.5;
        public int clusterCount = 3;
        public int bladeCount = 5;
        public int bladeLength = 10;
        public int bladeAngleVariation = 30;
        public double opacity = 1.0;
        
        public GrassConfig() {}
        
        public GrassConfig(int size, String bladeColor, double bladeWidth, int clusterCount, 
                          int bladeCount, int bladeLength, int bladeAngleVariation, double opacity) {
            this.size = size;
            this.bladeColor = bladeColor;
            this.bladeWidth = bladeWidth;
            this.clusterCount = clusterCount;
            this.bladeCount = bladeCount;
            this.bladeLength = bladeLength;
            this.bladeAngleVariation = bladeAngleVariation;
            this.opacity = opacity;
        }
    }
    
    /**
     * Configuration for tree entities
     */
    public static class TreeConfig {
        public int size = 32;
        public int imageHeight = 96;
        public int trunkWidth = 12;
        public int trunkHeight = 60;
        public String trunkColor = "#5C4033";
        public String foliageColor = "#1B5E20";
        public String foliageBorderColor = "#769e79";
        public int foliageBorderWidth = 2;
        public int foliageRadius = 24;
        public double opacity = 1.0;
        public Double fixedScreenAngle = null;
        public Integer drawOffsetX = null;
        public Integer drawOffsetY = -42;
        
        public TreeConfig() {}
        
        public TreeConfig(int size, int imageHeight, int trunkWidth, int trunkHeight,
                         String trunkColor, String foliageColor, String foliageBorderColor,
                         int foliageBorderWidth, int foliageRadius, double opacity,
                         Double fixedScreenAngle, Integer drawOffsetX, Integer drawOffsetY) {
            this.size = size;
            this.imageHeight = imageHeight;
            this.trunkWidth = trunkWidth;
            this.trunkHeight = trunkHeight;
            this.trunkColor = trunkColor;
            this.foliageColor = foliageColor;
            this.foliageBorderColor = foliageBorderColor;
            this.foliageBorderWidth = foliageBorderWidth;
            this.foliageRadius = foliageRadius;
            this.opacity = opacity;
            this.fixedScreenAngle = fixedScreenAngle;
            this.drawOffsetX = drawOffsetX;
            this.drawOffsetY = drawOffsetY;
        }
    }
    
    /**
     * Configuration for rock entities
     */
    public static class RockConfig {
        public int size = 20;
        public String baseColor = "#757575";
        public String strokeColor = "#424242";
        public String textureColor = "#424242";
        public double opacity = 1.0;
        public int textureSpots = 3;
        public int strokeWidth = 2;
        
        public RockConfig() {}
        
        public RockConfig(int size, String baseColor, String strokeColor, String textureColor,
                         double opacity, int textureSpots, int strokeWidth) {
            this.size = size;
            this.baseColor = baseColor;
            this.strokeColor = strokeColor;
            this.textureColor = textureColor;
            this.opacity = opacity;
            this.textureSpots = textureSpots;
            this.strokeWidth = strokeWidth;
        }
    }
} 