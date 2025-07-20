// electron/src/modules/game/entities/grass.js
// Grass entity system for electron

import { EntityRenderer } from '../entityRenderer.js';

export const GrassEntity = {
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
    getCacheKey(config) {
        const params = {
            type: 'grass',
            size: config.size || '-',
            bladeColor: config.bladeColor || '-',
            bladeWidth: config.bladeWidth || '-',
            clusterCount: config.clusterCount || '-',
            bladeCount: config.bladeCount || '-',
            bladeLength: config.bladeLength || '-',
            bladeAngleVariation: config.bladeAngleVariation || '-',
            opacity: config.opacity || '-'
        };
        return 'grass-' + this.hashConfig(params);
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

    // Create a grass entity with unified rendering
    create(config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        return EntityRenderer.createEntityWithBoilerplate('grass', mergedConfig, EntityRenderer, GrassEntity);
    }
}; 