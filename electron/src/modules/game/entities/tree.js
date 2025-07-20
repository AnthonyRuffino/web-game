// Tree entity system with SVG generation

export class TreeEntity {
    static defaultConfig = {
        size: 32,
        imageHeight: 96,
        trunkWidth: 12,
        trunkHeight: 60,
        trunkColor: '#5C4033',
        foliageColor: '#1B5E20',
        foliageRadius: 24,
        opacity: 1.0,
        fixedScreenAngle: 0,
        drawOffsetX: undefined,
        drawOffsetY: -42
    };

    static create(config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };
        
        // Generate SVG for this tree configuration
        const svgData = this.generateSVG(mergedConfig);
        
        return {
            type: 'tree',
            x: config.x || 0,
            y: config.y || 0,
            size: mergedConfig.size,
            config: mergedConfig,
            svgData: svgData,
            fixedScreenAngle: mergedConfig.fixedScreenAngle,
            drawOffsetX: mergedConfig.drawOffsetX,
            drawOffsetY: mergedConfig.drawOffsetY,
            collision: config.collision || false,
            collisionRadius: config.collisionRadius || 18,
            
            // Render method
            render(ctx, playerAngle = 0) {
                // For now, we'll use canvas rendering
                // Later this will be replaced with SVG-to-image loading
                this.renderCanvas(ctx, playerAngle);
            },
            
            // Canvas rendering fallback
            renderCanvas(ctx, playerAngle = 0) {
                const size = this.config.size;
                const width = size;
                const height = this.config.imageHeight;
                const trunkWidth = this.config.trunkWidth;
                const trunkHeight = this.config.trunkHeight;
                const trunkColor = this.config.trunkColor;
                const foliageColor = this.config.foliageColor;
                const foliageRadius = this.config.foliageRadius;
                const opacity = this.config.opacity;

                ctx.save();
                ctx.globalAlpha = opacity;

                // Apply fixed screen angle if specified
                if (this.fixedScreenAngle !== null && this.fixedScreenAngle !== undefined) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate((this.fixedScreenAngle * Math.PI) / 180);
                    ctx.translate(-this.x, -this.y);
                }

                // Trunk
                const trunkX = this.x - width / 2 + width / 2 - trunkWidth / 2;
                const trunkY = this.y + height / 2 - size * 0.1;
                ctx.fillStyle = trunkColor;
                ctx.fillRect(trunkX, trunkY - trunkHeight, trunkWidth, trunkHeight);

                // Foliage
                const foliageCenterX = this.x;
                const foliageCenterY = this.y - height / 2 + height * 0.18;
                ctx.beginPath();
                ctx.ellipse(foliageCenterX, foliageCenterY, foliageRadius, foliageRadius * 1.2, 0, 0, 2 * Math.PI);
                ctx.fillStyle = foliageColor;
                ctx.fill();

                if (this.fixedScreenAngle !== null && this.fixedScreenAngle !== undefined) {
                    ctx.restore();
                }

                ctx.restore();
            }
        };
    }

    static generateSVG(config) {
        const size = config.size;
        const width = size;
        const height = config.imageHeight;
        const trunkWidth = config.trunkWidth;
        const trunkHeight = config.trunkHeight;
        const trunkColor = config.trunkColor;
        const foliageColor = config.foliageColor;
        const foliageRadius = config.foliageRadius;
        const opacity = config.opacity;

        // Trunk: from bottom center up
        const trunkX = width / 2 - trunkWidth / 2;
        const trunkY = height - size * 0.1;

        // Foliage: centered near the top
        const foliageCenterX = width / 2;
        const foliageCenterY = height * 0.18;

        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect x="${trunkX}" y="${trunkY - trunkHeight}" width="${trunkWidth}" height="${trunkHeight}" fill="${trunkColor}" opacity="${opacity}"/>
                <ellipse cx="${foliageCenterX}" cy="${foliageCenterY}" rx="${foliageRadius}" ry="${foliageRadius * 1.2}" fill="${foliageColor}" opacity="${opacity}"/>
            </svg>
        `;
        
        return svg;
    }

    // Generate a unique cache key for tree parameters
    static getCacheKey(config) {
        const params = {
            type: 'tree',
            size: config.size || this.defaultConfig.size,
            imageHeight: config.imageHeight || this.defaultConfig.imageHeight,
            trunkWidth: config.trunkWidth || this.defaultConfig.trunkWidth,
            trunkHeight: config.trunkHeight || this.defaultConfig.trunkHeight,
            trunkColor: config.trunkColor || this.defaultConfig.trunkColor,
            foliageColor: config.foliageColor || this.defaultConfig.foliageColor,
            foliageRadius: config.foliageRadius || this.defaultConfig.foliageRadius,
            opacity: config.opacity || this.defaultConfig.opacity
        };
        
        return 'tree-' + this.hashConfig(params);
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