// electron/src/modules/game/entities/rock.js
// Rock entity system for electron

import { EntityRenderer } from '../entityRenderer.js';

export const RockEntity = {
    type: 'rock',
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
    getImageCacheKey() {
        return 'image:entity:rock';
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
        const entity = EntityRenderer.createEntityWithBoilerplate('rock', mergedConfig, RockEntity);
        
        // Add optional properties for new rendering system
        if (config.imageCacheKey) {
            entity.imageCacheKey = config.imageCacheKey;
        }
        if (config.imageConfig) {
            entity.imageConfig = config.imageConfig;
        }
        
        return entity;
    },

    // Generate SVG for rock entity
    generateRockSVG(config) {
        const size = config.size || 20;
        const baseColor = config.baseColor || '#757575';
        const strokeColor = config.strokeColor || '#424242';
        const textureColor = config.textureColor || '#424242';
        const opacity = config.opacity || 1.0;
        const textureSpots = config.textureSpots || 3;
        const strokeWidth = config.strokeWidth || 2;

        const center = size / 2;
        const radius = (size / 2) - strokeWidth;

        // Generate texture spots with deterministic positions
        let textureElements = '';
        for (let i = 0; i < textureSpots; i++) {
            const angle = (i * 137.5) * (Math.PI / 180);
            const distance = radius * (0.3 + (i * 0.2) % 0.4);
            const spotX = center + Math.cos(angle) * distance;
            const spotY = center + Math.sin(angle) * distance;
            const spotSize = radius * (0.1 + (i * 0.05) % 0.1);
            
            textureElements += `<circle cx="${spotX.toFixed(1)}" cy="${spotY.toFixed(1)}" r="${spotSize.toFixed(1)}" fill="${textureColor}"/>`;
        }

        const svg = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <circle 
                    cx="${center}" 
                    cy="${center}" 
                    r="${radius}" 
                    fill="${baseColor}" 
                    opacity="${opacity}"
                    stroke="${strokeColor}"
                    stroke-width="${strokeWidth}"
                />
                ${textureElements}
            </svg>
        `;
        
        return svg;
    }
}; 