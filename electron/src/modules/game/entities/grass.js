// Grass entity system with SVG generation

export class GrassEntity {
    static defaultConfig = {
        size: 32,
        bladeColor: '#81C784',
        bladeWidth: 1.5,
        clusterCount: 3,
        bladeCount: 5,
        bladeLength: 10,
        bladeAngleVariation: 30,
        opacity: 1.0
    };

    static create(config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        
        // Generate SVG for this grass configuration
        const svgData = this.generateSVG(mergedConfig);
        
        return {
            type: 'grass',
            x: config.x || 0,
            y: config.y || 0,
            size: mergedConfig.size,
            config: mergedConfig,
            svgData: svgData,
            
            // Render method
            render(ctx) {
                // For now, we'll use a simple canvas rendering
                // Later this will be replaced with SVG-to-image loading
                this.renderCanvas(ctx);
            },
            
            // Canvas rendering fallback
            renderCanvas(ctx) {
                const center = this.size / 2;
                const clusterRadius = this.size * 0.3;
                
                ctx.save();
                ctx.globalAlpha = this.config.opacity;
                ctx.strokeStyle = this.config.bladeColor;
                ctx.lineWidth = this.config.bladeWidth;
                
                // Generate grass clusters with deterministic positions
                for (let cluster = 0; cluster < this.config.clusterCount; cluster++) {
                    // Calculate cluster center using deterministic positioning
                    const angle = (cluster * 120) * (Math.PI / 180);
                    const distance = clusterRadius * (0.3 + (cluster * 0.2) % 0.4);
                    const clusterX = this.x + Math.cos(angle) * distance;
                    const clusterY = this.y + Math.sin(angle) * distance;
                    
                    // Generate blades for this cluster
                    const clusterBladeCount = this.config.bladeCount + (cluster % 2);
                    const baseAngle = (cluster * 137.5) * (Math.PI / 180);
                    
                    for (let blade = 0; blade < clusterBladeCount; blade++) {
                        // Vary the angle slightly for each blade
                        const angleVariation = ((cluster * 100 + blade * 50) % (this.config.bladeAngleVariation * 2) - this.config.bladeAngleVariation) * (Math.PI / 180);
                        const bladeAngle = baseAngle + angleVariation;
                        
                        // Vary the length slightly
                        const length = this.config.bladeLength + (cluster * 200 + blade * 30) % 6;
                        
                        // Calculate blade end point
                        const endX = clusterX + Math.cos(bladeAngle) * length;
                        const endY = clusterY + Math.sin(bladeAngle) * length;
                        
                        // Draw the grass blade
                        ctx.beginPath();
                        ctx.moveTo(clusterX, clusterY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                    }
                }
                
                ctx.restore();
            }
        };
    }

    static generateSVG(config) {
        const size = config.size;
        const bladeColor = config.bladeColor;
        const bladeWidth = config.bladeWidth;
        const clusterCount = config.clusterCount;
        const bladeCount = config.bladeCount;
        const bladeLength = config.bladeLength;
        const bladeAngleVariation = config.bladeAngleVariation;
        const opacity = config.opacity;

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

    // Generate a unique cache key for grass parameters
    static getCacheKey(config) {
        const params = {
            type: 'grass',
            size: config.size || this.defaultConfig.size,
            bladeColor: config.bladeColor || this.defaultConfig.bladeColor,
            bladeWidth: config.bladeWidth || this.defaultConfig.bladeWidth,
            clusterCount: config.clusterCount || this.defaultConfig.clusterCount,
            bladeCount: config.bladeCount || this.defaultConfig.bladeCount,
            bladeLength: config.bladeLength || this.defaultConfig.bladeLength,
            bladeAngleVariation: config.bladeAngleVariation || this.defaultConfig.bladeAngleVariation,
            opacity: config.opacity || this.defaultConfig.opacity
        };
        
        return 'grass-' + this.hashConfig(params);
    }

    // Simple hash function for config
    static hashConfig(config) {
        const str = JSON.stringify(config);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
} 