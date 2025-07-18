// core/entities/rock.js
// Rock entity system

(() => {
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
      return 'rock-' + EntityRenderer.hashConfig(params);
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
      return EntityRenderer.createEntityWithBoilerplate('rock', config, entityRenderer, RockEntity);
    }
  };

  // Register with new system
  window.WebGame = window.WebGame || {};
  window.WebGame.Entities = window.WebGame.Entities || {};
  window.WebGame.Entities.Rock = RockEntity;

  // Keep old global registration for backward compatibility
  window.RockEntity = RockEntity; // Console commands for testing
  
})();