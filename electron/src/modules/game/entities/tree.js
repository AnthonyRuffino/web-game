// electron/src/modules/game/entities/tree.js
// Tree entity system for electron

import { EntityRenderer } from '../entityRenderer.js';

export const TreeEntity = {
    type: 'tree',
    // Default tree configuration
    defaultConfig: {
        size: 32, // base size (hitbox and world placement)
        imageHeight: 96, // 3x size for tall trees
        trunkWidth: 12, // trunk visual width
        trunkHeight: 60, // trunk visual height
        trunkColor: '#5C4033',
        foliageColor: '#1B5E20',
        foliageBorderColor: '#769e79',
        foliageBorderWidth: 2,
        foliageRadius: 24, // foliage visual radius
        opacity: 1.0,
        // Fixed-angle and offset support
        fixedScreenAngle: 0, // degrees; 0 = always up; null = normal rotation
        drawOffsetX: undefined,      // pixels; offset for rendering alignment
        drawOffsetY: -42 
    },

    // Generate a unique cache key for tree parameters (do NOT include angle/offset)
    getImageCacheKey() {
        return 'image:entity:tree';
    },

    // Hash configuration for cache keys
    hashConfig(config) {
        const str = JSON.stringify(config);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    },

    // Create a tree entity with unified rendering
    create(config = {}) {
        // Set default drawOffsetY so the base of the trunk aligns with (x, y)
        const mergedConfig = { ...this.defaultConfig, ...config };
        const entity = EntityRenderer.createEntityWithBoilerplate('tree', mergedConfig, TreeEntity);
        entity.fixedScreenAngle = mergedConfig.fixedScreenAngle;
        entity.drawOffsetX = mergedConfig.drawOffsetX;
        entity.drawOffsetY = mergedConfig.drawOffsetY;
        
        // Add optional properties for new rendering system
        if (config.imageCacheKey) {
            entity.imageCacheKey = config.imageCacheKey;
        }
        if (config.imageConfig) {
            entity.imageConfig = config.imageConfig;
        }
        
        return entity;
    },

    // Generate SVG for tree entity
    generateTreeSVG(config) {
        const foliageRadius = config.foliageRadius || 24;
        const width = (foliageRadius*2);
        const height = config.imageHeight || 96;
        const trunkWidth = config.trunkWidth || 12;

        // Trunk: from bottom center up
        const trunkX = (width / 2) - (trunkWidth / 2);
        const trunkY = (foliageRadius * 2) - 1;

        const trunkHeight = height - trunkY;
        const trunkColor = config.trunkColor || '#5C4033';
        const foliageColor = config.foliageColor || '#1B5E20';
        const foliageBorderColor = config.foliageBorderColor || '#1B5E20';
        const foliageBorderWidth = config.foliageBorderWidth || 2;
        const opacity = config.opacity || 1.0;

        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect 
                    x="${trunkX}" 
                    y="${trunkY}" 
                    width="${trunkWidth}" 
                    height="${trunkHeight}" 
                    fill="${trunkColor}" 
                    opacity="${opacity}"
                    transform="rotate(${config.fixedScreenAngle || 0}, ${foliageRadius}, ${foliageRadius})"
                />
                <ellipse 
                    cx="${foliageRadius}" 
                    cy="${foliageRadius}" 
                    rx="${foliageRadius}" 
                    ry="${foliageRadius}" 
                    fill="${foliageColor}" 
                    opacity="${opacity}"
                    stroke="${foliageBorderColor}"
                    stroke-width="${foliageBorderWidth}"
                    transform="rotate(${config.fixedScreenAngle || 0}, ${foliageRadius}, ${foliageRadius})"
                />
            </svg>
        `;
        
        return svg;
    }
}; 