// Rock entity system with SVG generation

export class RockEntity {
    static defaultConfig = {
        size: 20,
        baseColor: '#757575',
        strokeColor: '#424242',
        textureColor: '#424242',
        opacity: 1.0,
        textureSpots: 3,
        strokeWidth: 2
    };

    static create(config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        
        // Generate SVG for this rock configuration
        const svgData = this.generateSVG(mergedConfig);
        
        return {
            type: 'rock',
            x: config.x || 0,
            y: config.y || 0,
            size: mergedConfig.size,
            config: mergedConfig,
            svgData: svgData,
            collision: config.collision || false,
            collisionRadius: config.collisionRadius || 12,
            
            // Render method
            render(ctx) {
                // For now, we'll use canvas rendering
                // Later this will be replaced with SVG-to-image loading
                this.renderCanvas(ctx);
            },
            
            // Canvas rendering fallback
            renderCanvas(ctx) {
                const size = this.config.size;
                const baseColor = this.config.baseColor;
                const strokeColor = this.config.strokeColor;
                const textureColor = this.config.textureColor;
                const opacity = this.config.opacity;
                const textureSpots = this.config.textureSpots;
                const strokeWidth = this.config.strokeWidth;

                const radius = (size / 2) - strokeWidth;
                
                ctx.save();
                ctx.globalAlpha = opacity;
                
                // Draw base circle
                ctx.fillStyle = baseColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw stroke
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
                
                // Draw texture spots (matching SVG positions)
                ctx.fillStyle = textureColor;
                for (let i = 0; i < textureSpots; i++) {
                    const angle = (i * 137.5) * (Math.PI / 180);
                    const distance = radius * (0.3 + (i * 0.2) % 0.4);
                    const spotX = this.x + Math.cos(angle) * distance;
                    const spotY = this.y + Math.sin(angle) * distance;
                    const spotSize = radius * (0.1 + (i * 0.05) % 0.1);
                    
                    ctx.beginPath();
                    ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        };
    }

    static generateSVG(config) {
        const size = config.size;
        const baseColor = config.baseColor;
        const strokeColor = config.strokeColor;
        const textureColor = config.textureColor;
        const opacity = config.opacity;
        const textureSpots = config.textureSpots;
        const strokeWidth = config.strokeWidth;

        const center = size / 2;
        const radius = (size / 2) - strokeWidth;

        // Generate texture spots with deterministic positions
        let textureElements = '';
        for (let i = 0; i < textureSpots; i++) {
            const angle = (i * 137.5) * (Math.PI / 180); // Golden angle for good distribution
            const distance = radius * (0.3 + (i * 0.2) % 0.4); // Varying distances
            const spotX = center + Math.cos(angle) * distance;
            const spotY = center + Math.sin(angle) * distance;
            const spotSize = radius * (0.1 + (i * 0.05) % 0.1); // Varying sizes
            
            textureElements += `<circle cx="${spotX.toFixed(1)}" cy="${spotY.toFixed(1)}" r="${spotSize.toFixed(1)}" fill="${textureColor}"/>`;
        }

        const svg = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${center}" cy="${center}" r="${radius}" fill="${baseColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"/>
                ${textureElements}
            </svg>
        `;

        return svg;
    }

    // Generate a unique cache key for rock parameters
    static getCacheKey(config) {
        const params = {
            type: 'rock',
            size: config.size || this.defaultConfig.size,
            baseColor: config.baseColor || this.defaultConfig.baseColor,
            strokeColor: config.strokeColor || this.defaultConfig.strokeColor,
            textureColor: config.textureColor || this.defaultConfig.textureColor,
            opacity: config.opacity || this.defaultConfig.opacity,
            textureSpots: config.textureSpots || this.defaultConfig.textureSpots,
            strokeWidth: config.strokeWidth || this.defaultConfig.strokeWidth
        };
        
        return 'rock-' + this.hashConfig(params);
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