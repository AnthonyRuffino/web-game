// core/entities/tree.js
// Tree entity module with encapsulated rendering logic

const TreeEntity = {
  // Default tree configuration
  defaultConfig: {
    size: 24,
    trunkColor: '#5C4033',
    foliageColor: '#1B5E20',
    trunkWidth: 12,
    foliageRadius: 12,
    opacity: 1.0
  },

  // Generate a unique cache key for tree parameters
  getCacheKey(config) {
    const params = {
      type: 'tree',
      size: config.size || this.defaultConfig.size,
      trunkColor: config.trunkColor || this.defaultConfig.trunkColor,
      foliageColor: config.foliageColor || this.defaultConfig.foliageColor,
      trunkWidth: config.trunkWidth || this.defaultConfig.trunkWidth,
      foliageRadius: config.foliageRadius || this.defaultConfig.foliageRadius,
      opacity: config.opacity || this.defaultConfig.opacity
    };
    return EntityRenderer.hashConfig(params);
  },

  // Generate SVG for a tree based on configuration
  generateSVG(config) {
    const size = config.size || this.defaultConfig.size;
    const trunkColor = config.trunkColor || this.defaultConfig.trunkColor;
    const foliageColor = config.foliageColor || this.defaultConfig.foliageColor;
    const trunkWidth = config.trunkWidth || this.defaultConfig.trunkWidth;
    const foliageRadius = config.foliageRadius || this.defaultConfig.foliageRadius;
    const opacity = config.opacity || this.defaultConfig.opacity;

    const center = size / 2;
    const trunkX = center - trunkWidth / 2;
    const trunkY = center - trunkWidth / 2;
    const foliageY = center - foliageRadius - trunkWidth / 2;

    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- Tree trunk -->
        <rect x="${trunkX}" y="${trunkY}" width="${trunkWidth}" height="${trunkWidth}" 
              fill="${trunkColor}" opacity="${opacity}"/>
        <!-- Tree foliage -->
        <circle cx="${center}" cy="${foliageY}" r="${foliageRadius}" 
                fill="${foliageColor}" opacity="${opacity}"/>
      </svg>
    `;

    return svg;
  },

  // Generate canvas drawing function that matches SVG parameters
  generateCanvasDraw(config) {
    const size = config.size || this.defaultConfig.size;
    const trunkColor = config.trunkColor || this.defaultConfig.trunkColor;
    const foliageColor = config.foliageColor || this.defaultConfig.foliageColor;
    const trunkWidth = config.trunkWidth || this.defaultConfig.trunkWidth;
    const foliageRadius = config.foliageRadius || this.defaultConfig.foliageRadius;
    const opacity = config.opacity || this.defaultConfig.opacity;

    return function(ctx, x, y) {
      const center = size / 2;
      const trunkX = x - trunkWidth / 2;
      const trunkY = y - trunkWidth / 2;
      const foliageY = y - foliageRadius - trunkWidth / 2;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Draw tree trunk
      ctx.fillStyle = trunkColor;
      ctx.fillRect(trunkX, trunkY, trunkWidth, trunkWidth);
      
      // Draw tree foliage
      ctx.fillStyle = foliageColor;
      ctx.beginPath();
      ctx.arc(x, foliageY, foliageRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };
  },

  // Create a tree entity with unified rendering
  create(config = {}, entityRenderer) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.getCacheKey(finalConfig);
    
    // Determine initial render type (default to sprite)
    const initialRenderType = finalConfig.renderType || 'sprite';
    
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
      type: 'tree',
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
            const svg = TreeEntity.generateSVG(this.config);
            this.sprite = this.entityRenderer.createAndCacheImage(this.cacheKey, svg);
          }
        } else if (newRenderType === 'shape' && !this.canvasImage) {
          // Lazy load canvas image
          this.canvasImage = this.entityRenderer.getCachedCanvas(this.cacheKey);
          if (!this.canvasImage) {
            const drawFunction = TreeEntity.generateCanvasDraw(this.config);
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
window.TreeEntity = TreeEntity; 