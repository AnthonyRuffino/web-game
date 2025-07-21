// electron/src/modules/game/entities/rock.js
// Rock entity system for electron

import { EntityRenderer } from '../entityRenderer.js';

export const RockEntity = {
    // Default rock configuration
    defaultConfig: {
        size: 20,
        baseColor: '#757575',
        strokeColor: '#424242',
        textureColor: '#424242',
        opacity: 1.0,
        textureSpots: 3,
        strokeWidth: 2
    },

    // Generate a unique cache key for rock parameters
    getCacheKey(config) {
        const params = {
            type: 'rock',
            size: config.size || '-',
            baseColor: config.baseColor || '-',
            strokeColor: config.strokeColor || '-',
            textureColor: config.textureColor || '-',
            opacity: config.opacity || '-',
            textureSpots: config.textureSpots || '-',
            strokeWidth: config.strokeWidth || '-'
        };
        return 'rock-' + this.hashConfig(params);
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

    // Create a rock entity with unified rendering
    create(config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        const entity = EntityRenderer.createEntityWithBoilerplate('rock', mergedConfig, EntityRenderer, RockEntity);
        
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