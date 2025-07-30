// electron/src/modules/game/entities/grass.js
// Grass entity system for electron

import { EntityRenderer } from '../rendering/entityRenderer.js';

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
    },

    // Generate SVG for grass entity
    generateGrassSVG(config) {
        const size = config.size || 32;
        const bladeColor = config.bladeColor || '#81C784';
        const bladeWidth = config.bladeWidth || 1.5;
        const clusterCount = config.clusterCount || 3;
        const bladeCount = config.bladeCount || 5;
        const bladeLength = config.bladeLength || 10;
        const bladeAngleVariation = config.bladeAngleVariation || 30;
        const opacity = config.opacity || 1.0;

        const center = size / 2;
        const clusterRadius = size * 0.3;

        // Generate grass clusters with deterministic positions
        let grassElements = '';
        
        for (let cluster = 0; cluster < clusterCount; cluster++) {
            // Calculate cluster center using deterministic positioning
            const angle = (cluster * 120) * (Math.PI / 180);
            const distance = clusterRadius * (0.3 + (cluster * 0.2) % 0.4);
            const clusterX = center + Math.cos(angle) * distance;
            const clusterY = center + Math.sin(angle) * distance;
            
            // Generate blades for this cluster
            const clusterBladeCount = bladeCount + (cluster % 2);
            const baseAngle = (cluster * 137.5) * (Math.PI / 180);
            
            for (let blade = 0; blade < clusterBladeCount; blade++) {
                // Vary the angle slightly for each blade
                const angleVariation = ((cluster * 100 + blade * 50) % (bladeAngleVariation * 2) - bladeAngleVariation) * (Math.PI / 180);
                const bladeAngle = baseAngle + angleVariation;
                
                // Vary the length slightly
                const length = bladeLength + (cluster * 200 + blade * 30) % 6;
                
                // Calculate blade end point
                const endX = clusterX + Math.cos(bladeAngle) * length;
                const endY = clusterY + Math.sin(bladeAngle) * length;
                
                // Create grass blade as a line
                grassElements += `<line x1="${clusterX.toFixed(1)}" y1="${clusterY.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}" stroke="${bladeColor}" stroke-width="${bladeWidth}" opacity="${opacity}"/>`;
            }
        }

        const svg = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                ${grassElements}
            </svg>
        `;

        return svg;
    }
}; 