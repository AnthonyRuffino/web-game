// Local EntityRenderer for the electron game
// Simplified version with just the methods needed by world.js

export class EntityRenderer {
    static createGrass(config = {}) {
        const size = config.size || 32;
        const bladeColor = config.bladeColor || '#81C784';
        const bladeWidth = config.bladeWidth || 1.5;
        const clusterCount = config.clusterCount || 3;
        const bladeCount = config.bladeCount || 5;
        const bladeLength = config.bladeLength || 10;
        const bladeAngleVariation = config.bladeAngleVariation || 30;
        const opacity = config.opacity || 1.0;

        return {
            type: 'grass',
            size: size,
            render: function(ctx) {
                ctx.save();
                ctx.globalAlpha = opacity;
                
                const center = size / 2;
                const clusterRadius = size * 0.3;

                // Generate grass clusters with deterministic positions
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
                        
                        // Draw blade
                        ctx.strokeStyle = bladeColor;
                        ctx.lineWidth = bladeWidth;
                        ctx.lineCap = 'round';
                        
                        ctx.beginPath();
                        ctx.moveTo(clusterX, clusterY);
                        ctx.lineTo(
                            clusterX + Math.cos(bladeAngle) * bladeLength,
                            clusterY + Math.sin(bladeAngle) * bladeLength
                        );
                        ctx.stroke();
                    }
                }
                
                ctx.restore();
            }
        };
    }

    static createTree(config = {}) {
        const size = config.size || 32;
        const trunkColor = config.trunkColor || '#5C4033';
        const foliageColor = config.foliageColor || '#1B5E20';
        const trunkWidth = config.trunkWidth || 12;
        const foliageRadius = config.foliageRadius || 12;
        const opacity = config.opacity || 1.0;

        return {
            type: 'tree',
            size: size,
            render: function(ctx) {
                ctx.save();
                ctx.globalAlpha = opacity;
                
                const center = size / 2;
                const trunkHeight = size * 0.6;
                const trunkTop = center + trunkHeight / 2;
                
                // Draw trunk
                ctx.fillStyle = trunkColor;
                ctx.fillRect(center - trunkWidth / 2, center - trunkHeight / 2, trunkWidth, trunkHeight);
                
                // Draw foliage
                ctx.fillStyle = foliageColor;
                ctx.beginPath();
                ctx.arc(center, trunkTop - foliageRadius / 2, foliageRadius, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.restore();
            }
        };
    }

    static createRock(config = {}) {
        const size = config.size || 20;
        const baseColor = config.baseColor || '#757575';
        const strokeColor = config.strokeColor || '#424242';
        const textureColor = config.textureColor || '#424242';
        const opacity = config.opacity || 1.0;
        const textureSpots = config.textureSpots || 3;
        const strokeWidth = config.strokeWidth || 2;

        return {
            type: 'rock',
            size: size,
            render: function(ctx) {
                ctx.save();
                ctx.globalAlpha = opacity;
                
                const center = size / 2;
                const radius = size * 0.4;
                
                // Draw base rock shape
                ctx.fillStyle = baseColor;
                ctx.beginPath();
                ctx.arc(center, center, radius, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw stroke
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
                
                // Add texture spots
                ctx.fillStyle = textureColor;
                for (let i = 0; i < textureSpots; i++) {
                    const angle = (i * 137.5) * (Math.PI / 180);
                    const distance = radius * 0.6;
                    const spotX = center + Math.cos(angle) * distance;
                    const spotY = center + Math.sin(angle) * distance;
                    const spotRadius = radius * 0.15;
                    
                    ctx.beginPath();
                    ctx.arc(spotX, spotY, spotRadius, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        };
    }
} 