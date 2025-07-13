// core/entities/rock.js
// Rock entity module with encapsulated rendering logic

const RockEntity = {
  // Default rock configuration
  defaultConfig: {
    isSprite: true,
    size: 20,
    baseColor: '#757575',
    strokeColor: '#424242',
    textureColor: '#424242',
    opacity: 1.0,
    textureSpots: 3, // Number of texture spots
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
    return EntityRenderer.hashConfig(params);
  },

  // Generate SVG for a rock based on configuration
  generateSVG(config) {
    const size = config.size || this.defaultConfig.size;
    const baseColor = config.baseColor || this.defaultConfig.baseColor;
    const strokeColor = config.strokeColor || this.defaultConfig.strokeColor;
    const textureColor = config.textureColor || this.defaultConfig.textureColor;
    const opacity = config.opacity || this.defaultConfig.opacity;
    const textureSpots = config.textureSpots || this.defaultConfig.textureSpots;
    const strokeWidth = config.strokeWidth || this.defaultConfig.strokeWidth;

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
  },

  // Generate canvas drawing function that matches SVG parameters
  generateCanvasDraw(config) {
    const size = config.size || this.defaultConfig.size;
    const baseColor = config.baseColor || this.defaultConfig.baseColor;
    const strokeColor = config.strokeColor || this.defaultConfig.strokeColor;
    const textureColor = config.textureColor || this.defaultConfig.textureColor;
    const opacity = config.opacity || this.defaultConfig.opacity;
    const textureSpots = config.textureSpots || this.defaultConfig.textureSpots;
    const strokeWidth = config.strokeWidth || this.defaultConfig.strokeWidth;

    return function(ctx, x, y) {
      const radius = (size / 2) - strokeWidth;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Draw base circle
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
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
        const spotX = x + Math.cos(angle) * distance;
        const spotY = y + Math.sin(angle) * distance;
        const spotSize = radius * (0.1 + (i * 0.05) % 0.1);
        
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    };
  },

  // Create a rock entity with unified rendering
  create(config = {}, entityRenderer) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.getCacheKey(finalConfig);
    
    // Determine initial render type (default to sprite)
    const initialRenderType = finalConfig.isSprite ? 'sprite' : 'shape';
    
    // Lazy load: only cache what we need based on render type
    let sprite = null;
    let canvasImage = null;
    
    if (initialRenderType === 'sprite') {
      // Only load SVG sprite if we're using sprite mode
      sprite = entityRenderer.getCachedImage(cacheKey);
      if (!sprite) {
        const svg = this.generateSVG(finalConfig);
        sprite = entityRenderer.createAndCacheImage(cacheKey, svg);
      }
    } else if (initialRenderType === 'shape') {
      // Only load canvas image if we're using shape mode
      canvasImage = entityRenderer.getCachedCanvas(cacheKey);
      if (!canvasImage) {
        const drawFunction = this.generateCanvasDraw(finalConfig);
        canvasImage = entityRenderer.createAndCacheCanvas(cacheKey, drawFunction, finalConfig.size);
      }
    }
    
    return {
      type: 'rock',
      config: finalConfig,
      renderType: initialRenderType,
      sprite: sprite,
      canvasImage: canvasImage,
      drawShape: this.generateCanvasDraw(finalConfig), // Fallback draw function
      cacheKey: cacheKey, // Store cache key for lazy loading
      entityRenderer: entityRenderer, // Store reference for lazy loading
      
      // Method to switch render types with lazy loading
      setRenderType(newRenderType) {
        if (this.renderType === newRenderType) return; // No change needed
        
        this.renderType = newRenderType;
        
        if (newRenderType === 'sprite' && !this.sprite) {
          // Lazy load SVG sprite
          this.sprite = this.entityRenderer.getCachedImage(this.cacheKey);
          if (!this.sprite) {
            const svg = RockEntity.generateSVG(this.config);
            this.sprite = this.entityRenderer.createAndCacheImage(this.cacheKey, svg);
          }
        } else if (newRenderType === 'shape' && !this.canvasImage) {
          // Lazy load canvas image
          this.canvasImage = this.entityRenderer.getCachedCanvas(this.cacheKey);
          if (!this.canvasImage) {
            const drawFunction = RockEntity.generateCanvasDraw(this.config);
            this.canvasImage = this.entityRenderer.createAndCacheCanvas(this.cacheKey, drawFunction, this.config.size);
          }
        }
      },
      
      // Unified draw method
      draw(ctx) {
        if (this.renderType === 'sprite' && this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
          // Draw sprite
          const spriteWidth = this.sprite.width || this.config.size;
          const spriteHeight = this.sprite.height || this.config.size;
          ctx.drawImage(
            this.sprite,
            this.x - spriteWidth / 2,
            this.y - spriteHeight / 2,
            spriteWidth,
            spriteHeight
          );
        } else if (this.renderType === 'shape' && this.canvasImage && this.canvasImage.complete && this.canvasImage.naturalWidth > 0) {
          // Draw cached canvas image
          const imageWidth = this.canvasImage.width || this.config.size;
          const imageHeight = this.canvasImage.height || this.config.size;
          ctx.drawImage(
            this.canvasImage,
            this.x - imageWidth / 2,
            this.y - imageHeight / 2,
            imageWidth,
            imageHeight
          );
        } else {
          // Draw shape using canvas method (fallback)
          this.drawShape(ctx, this.x, this.y);
        }
      }
    };
  }
};

// Make globally available
window.RockEntity = RockEntity; // Console commands for testing