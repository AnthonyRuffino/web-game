// electron/src/modules/game/entities/grass.js
// Grass entity system for electron

import { EntityRenderer } from '../entityRenderer.js';

export const GrassEntity = {
    type: 'grass',
    // Default grass configuration
    defaultConfig: {
        isSprite: true,
        size: 32, // Tile size for grass
        bladeColor: '#81C784',
        bladeWidth: 1.5,
        clusterCount: 3, // Number of grass clusters
        bladeCount: 5, // Average blades per cluster
        bladeLength: 10, // Average blade length
        bladeAngleVariation: 30, // Degrees of angle variation
        opacity: 1.0
    },

    // Generate a unique cache key for grass parameters
    getImageCacheKey() {
        return 'image:entity:grass';
    },

    // Create a grass entity with unified rendering
    create(config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        const entity = EntityRenderer.createEntityWithBoilerplate('grass', mergedConfig, GrassEntity);
        
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