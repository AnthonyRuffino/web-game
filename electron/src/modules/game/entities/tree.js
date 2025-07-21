// electron/src/modules/game/entities/tree.js
// Tree entity system for electron

import { EntityRenderer } from '../entityRenderer.js';

export const TreeEntity = {
    // Default tree configuration
    defaultConfig: {
        size: 32, // base size (hitbox and world placement)
        imageHeight: 96, // 3x size for tall trees
        trunkWidth: 12, // trunk visual width
        trunkHeight: 60, // trunk visual height
        trunkColor: '#5C4033',
        foliageColor: '#1B5E20',
        foliageRadius: 24, // foliage visual radius
        opacity: 1.0,
        // Fixed-angle and offset support
        fixedScreenAngle: 0, // degrees; 0 = always up; null = normal rotation
        drawOffsetX: undefined,      // pixels; offset for rendering alignment
        drawOffsetY: -42 
    },

    // Generate a unique cache key for tree parameters (do NOT include angle/offset)
    getCacheKey(config) {
        const params = {
            type: 'tree',
            size: config.size || '-',
            imageHeight: config.imageHeight || '-',
            trunkWidth: config.trunkWidth || '-',
            trunkHeight: config.trunkHeight || '-',
            trunkColor: config.trunkColor || '-',
            foliageColor: config.foliageColor || '-',
            foliageRadius: config.foliageRadius || '-',
            opacity: config.opacity || '-'
        };
        return 'tree-' + this.hashConfig(params);
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
        const entity = EntityRenderer.createEntityWithBoilerplate('tree', mergedConfig, EntityRenderer, TreeEntity);
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
    }
}; 