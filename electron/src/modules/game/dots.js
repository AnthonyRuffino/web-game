export class DotsSystem {
    constructor() {
        this.config = {
            dotSize: 4,
            dotSpacing: 32,
            dotColor: '#ffffff',
            dotAlpha: 0.8
        };
        this.testMode = true; // Enable test mode for debugging
    }
    
    // Render background dots across the visible world area
    render(ctx, cameraX, cameraY, cameraWidth, cameraHeight, zoom = 1) {
        ctx.save();
        
        // Set dots properties
        ctx.fillStyle = this.config.dotColor;
        ctx.globalAlpha = this.config.dotAlpha;
        
        // Calculate the area we need to render based on camera view
        // Extend the area to prevent void corners during movement
        const extensionFactor = 1.5; // Extend by 50%
        
        const startX = Math.floor(cameraX - (cameraWidth / 2) * extensionFactor);
        const endX = Math.ceil(cameraX + (cameraWidth / 2) * extensionFactor);
        const startY = Math.floor(cameraY - (cameraHeight / 2) * extensionFactor);
        const endY = Math.ceil(cameraY + (cameraHeight / 2) * extensionFactor);
        
        // Calculate dot spacing (fixed in world coordinates, not affected by zoom)
        const spacing = this.config.dotSpacing;
        const dotSize = this.config.dotSize;
        
        // Draw dots in a grid pattern at fixed world coordinates
        // Start from the nearest grid position to ensure consistent pattern
        const gridStartX = Math.floor(startX / spacing) * spacing;
        const gridStartY = Math.floor(startY / spacing) * spacing;
        
        // Debug logging (only log occasionally to avoid spam)
        if (Math.random() < 0.01) { // 1% chance to log
            console.log('[DotsSystem] Rendering dots:', {
                camera: { x: cameraX, y: cameraY },
                area: { startX, endX, startY, endY },
                grid: { startX: gridStartX, startY: gridStartY },
                config: this.config
            });
        }
        
        // Since we're already in camera-transformed coordinates, we need to draw dots
        // at their world positions, which will be transformed to screen positions
        for (let worldX = gridStartX; worldX <= endX; worldX += spacing) {
            for (let worldY = gridStartY; worldY <= endY; worldY += spacing) {
                // Draw a small dot at world position (will be transformed by camera)
                ctx.beginPath();
                ctx.arc(worldX, worldY, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Test mode: Draw some obvious dots at fixed positions
        if (this.testMode) {
            ctx.fillStyle = '#ff0000';
            ctx.globalAlpha = 1.0;
            
            // Draw a red dot at the origin
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw red dots at regular intervals
            for (let x = -200; x <= 200; x += 100) {
                for (let y = -200; y <= 200; y += 100) {
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        ctx.restore();
    }
    
    // Update dots configuration
    setConfig(newConfig) {
        // Handle type conversion for numeric values
        const processedConfig = {};
        
        for (const [key, value] of Object.entries(newConfig)) {
            if (key === 'dotSize' || key === 'dotSpacing') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue >= 0) {
                    processedConfig[key] = numValue;
                } else {
                    console.warn(`[DotsSystem] Invalid ${key} value: ${value}. Must be a positive number.`);
                    continue;
                }
            } else if (key === 'dotAlpha') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
                    processedConfig[key] = numValue;
                } else {
                    console.warn(`[DotsSystem] Invalid ${key} value: ${value}. Must be between 0 and 1.`);
                    continue;
                }
            } else if (key === 'dotColor') {
                // Basic color validation
                if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
                    processedConfig[key] = value;
                } else {
                    console.warn(`[DotsSystem] Invalid ${key} value: ${value}. Must be a valid color.`);
                    continue;
                }
            } else {
                console.warn(`[DotsSystem] Unknown configuration property: ${key}`);
                continue;
            }
        }
        
        this.config = { ...this.config, ...processedConfig };
        console.log('[DotsSystem] Configuration updated:', this.config);
    }
    
    // Get current configuration
    getConfig() {
        return { ...this.config };
    }
    
    // Reset to default configuration
    resetConfig() {
        this.config = {
            dotSize: 1,
            dotSpacing: 32,
            dotColor: '#333333',
            dotAlpha: 0.3
        };
        console.log('[DotsSystem] Configuration reset to defaults');
    }
} 