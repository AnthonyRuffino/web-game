// core/entities/tree.js
// Tree entity module with encapsulated rendering logic

const TreeEntity = {
  // Default tree configuration
  defaultConfig: {
    isSprite: true,
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
      size: config.size || '-',
      trunkColor: config.trunkColor || '-',
      foliageColor: config.foliageColor || '-',
      trunkWidth: config.trunkWidth || '-',
      foliageRadius: config.foliageRadius || '-',
      opacity: config.opacity || '-'
    };
    return 'tree-' + EntityRenderer.hashConfig(params);
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

    // Generate foliage texture with multiple overlapping circles for more natural look
    let foliageElements = '';
    const foliageSpots = 5; // Number of overlapping foliage circles
    
    for (let i = 0; i < foliageSpots; i++) {
      const angle = (i * 72) * (Math.PI / 180); // Distribute evenly around the main foliage
      const distance = foliageRadius * (0.3 + (i * 0.15) % 0.4); // Varying distances
      const spotX = center + Math.cos(angle) * distance;
      const spotY = foliageY + Math.sin(angle) * distance;
      const spotRadius = foliageRadius * (0.4 + (i * 0.1) % 0.3); // Varying sizes
      
      foliageElements += `<circle cx="${spotX.toFixed(1)}" cy="${spotY.toFixed(1)}" r="${spotRadius.toFixed(1)}" fill="${foliageColor}"/>`;
    }

    // Add trunk texture with a darker outline
    const trunkOutline = `
      <rect x="${trunkX - 1}" y="${trunkY - 1}" width="${trunkWidth + 2}" height="${trunkWidth + 2}" 
            fill="#3E2723" opacity="${opacity * 0.8}"/>
    `;

    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- Tree trunk outline -->
        ${trunkOutline}
        <!-- Tree trunk -->
        <rect x="${trunkX}" y="${trunkY}" width="${trunkWidth}" height="${trunkWidth}" 
              fill="${trunkColor}" opacity="${opacity}"/>
        <!-- Tree foliage -->
        <circle cx="${center}" cy="${foliageY}" r="${foliageRadius}" 
                fill="${foliageColor}" opacity="${opacity}"/>
        <!-- Foliage texture -->
        ${foliageElements}
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
      
      // Draw tree trunk outline
      ctx.fillStyle = '#3E2723';
      ctx.globalAlpha = opacity * 0.8;
      ctx.fillRect(trunkX - 1, trunkY - 1, trunkWidth + 2, trunkWidth + 2);
      
      // Draw tree trunk
      ctx.fillStyle = trunkColor;
      ctx.globalAlpha = opacity;
      ctx.fillRect(trunkX, trunkY, trunkWidth, trunkWidth);
      
      // Draw main tree foliage
      ctx.fillStyle = foliageColor;
      ctx.beginPath();
      ctx.arc(x, foliageY, foliageRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw foliage texture (matching SVG)
      const foliageSpots = 5;
      for (let i = 0; i < foliageSpots; i++) {
        const angle = (i * 72) * (Math.PI / 180);
        const distance = foliageRadius * (0.3 + (i * 0.15) % 0.4);
        const spotX = x + Math.cos(angle) * distance;
        const spotY = foliageY + Math.sin(angle) * distance;
        const spotRadius = foliageRadius * (0.4 + (i * 0.1) % 0.3);
        
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    };
  },

  // Create a tree entity with unified rendering
  create(config = {}, entityRenderer) {
    return EntityRenderer.createEntityWithBoilerplate('tree', config, entityRenderer, TreeEntity);
  }
};

// Make globally available
window.TreeEntity = TreeEntity; 