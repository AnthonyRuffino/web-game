// core/entities/grass.js
// Grass entity system

(() => {
  // core/entities/grass.js
  // Grass entity module with encapsulated rendering logic

  const GrassEntity = {
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
    getCacheKey(config) {
      const params = {
        type: 'grass',
        size: config.size || '-',
        bladeColor: config.bladeColor || '-',
        bladeWidth: config.bladeWidth || '-',
        clusterCount: config.clusterCount || '-',
        bladeCount: config.bladeCount || '-',
        bladeLength: config.bladeLength || '-',
        bladeAngleVariation: config.bladeAngleVariation || '-',
        opacity: config.opacity || '-'
      };
      return 'grass-' + EntityRenderer.hashConfig(params);
    },

    // Generate SVG for grass based on configuration
    generateSVG(config) {
      const size = config.size || this.defaultConfig.size;
      const bladeColor = config.bladeColor || this.defaultConfig.bladeColor;
      const bladeWidth = config.bladeWidth || this.defaultConfig.bladeWidth;
      const clusterCount = config.clusterCount || this.defaultConfig.clusterCount;
      const bladeCount = config.bladeCount || this.defaultConfig.bladeCount;
      const bladeLength = config.bladeLength || this.defaultConfig.bladeLength;
      const bladeAngleVariation = config.bladeAngleVariation || this.defaultConfig.bladeAngleVariation;
      const opacity = config.opacity || this.defaultConfig.opacity;

      const center = size / 2;
      const clusterRadius = size * 0.3; // Area where clusters can be placed

      // Generate grass clusters with deterministic positions
      let grassElements = '';
      
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        // Calculate cluster center using deterministic positioning
        const angle = (cluster * 120) * (Math.PI / 180); // Distribute clusters evenly
        const distance = clusterRadius * (0.3 + (cluster * 0.2) % 0.4); // Varying distances
        const clusterX = center + Math.cos(angle) * distance;
        const clusterY = center + Math.sin(angle) * distance;
        
        // Generate blades for this cluster
        const clusterBladeCount = bladeCount + (cluster % 2); // Vary blade count
        const baseAngle = (cluster * 137.5) * (Math.PI / 180); // Golden angle for natural distribution
        
        for (let blade = 0; blade < clusterBladeCount; blade++) {
          // Vary the angle slightly for each blade
          const angleVariation = ((cluster * 100 + blade * 50) % (bladeAngleVariation * 2) - bladeAngleVariation) * (Math.PI / 180);
          const bladeAngle = baseAngle + angleVariation;
          
          // Vary the length slightly
          const length = bladeLength + (cluster * 200 + blade * 30) % 6; // 8-13 pixels
          
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
    },

    // Generate canvas drawing function that matches SVG parameters
    generateCanvasDraw(config) {
      const size = config.size || this.defaultConfig.size;
      const bladeColor = config.bladeColor || this.defaultConfig.bladeColor;
      const bladeWidth = config.bladeWidth || this.defaultConfig.bladeWidth;
      const clusterCount = config.clusterCount || this.defaultConfig.clusterCount;
      const bladeCount = config.bladeCount || this.defaultConfig.bladeCount;
      const bladeLength = config.bladeLength || this.defaultConfig.bladeLength;
      const bladeAngleVariation = config.bladeAngleVariation || this.defaultConfig.bladeAngleVariation;
      const opacity = config.opacity || this.defaultConfig.opacity;

      return function(ctx, x, y) {
        const center = size / 2;
        const clusterRadius = size * 0.3;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = bladeColor;
        ctx.lineWidth = bladeWidth;
        
        // Generate grass clusters with deterministic positions
        for (let cluster = 0; cluster < clusterCount; cluster++) {
          // Calculate cluster center using deterministic positioning
          const angle = (cluster * 120) * (Math.PI / 180);
          const distance = clusterRadius * (0.3 + (cluster * 0.2) % 0.4);
          const clusterX = x + Math.cos(angle) * distance;
          const clusterY = y + Math.sin(angle) * distance;
          
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
            
            // Draw the grass blade
            ctx.beginPath();
            ctx.moveTo(clusterX, clusterY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
        
        ctx.restore();
      };
    },

    // Create a grass entity with unified rendering
    create(config = {}, entityRenderer) {
      return EntityRenderer.createEntityWithBoilerplate('grass', config, entityRenderer, GrassEntity);
    }
  };

  // Register with new system
  window.WebGame.Entities.Grass = GrassEntity;

  // Keep old global registration for backward compatibility
  window.GrassEntity = GrassEntity;
  
})(); 