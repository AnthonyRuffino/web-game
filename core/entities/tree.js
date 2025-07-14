// core/entities/tree.js
// Tree entity module with encapsulated rendering logic

const TreeEntity = {
  // Default tree configuration
  // size: base size (hitbox and world placement)
  // imageHeight: height of the tree image (for tall trees)
  // trunkWidth: width of the trunk (visual only)
  // trunkHeight: height of the trunk (visual only)
  // foliageRadius: radius of the foliage (visual only)
  defaultConfig: {
    size: 32, // base size (hitbox and base square)
    imageHeight: 96, // 3x size for tall trees
    trunkWidth: 12, // trunk visual width
    trunkHeight: 60, // trunk visual height
    trunkColor: '#5C4033',
    foliageColor: '#1B5E20',
    foliageRadius: 24, // foliage visual radius
    opacity: 1.0,
    // Fixed-angle and offset support
    fixedScreenAngle: 0, // degrees; 0 = always up; null = normal rotation
    drawOffsetX: 0,      // pixels; offset for rendering alignment
    drawOffsetY: -40 // will be computed
  },

  // Generate a unique cache key for tree parameters (do NOT include angle/offset)
  getCacheKey(config) {
    const params = {
      type: 'tree',
      size: config.size || '-',
      imageHeight: config.imageHeight || '-',
      trunkWidth: config.trunkWidth || '-',
      trunkHeight: config.trunkHeight || '-',
      trunkColor: config.trunkColor || '-',
      foliageColor: config.foliageColor || '-',
      foliageRadius: config.foliageRadius || '-',
      opacity: config.opacity || '-'
    };
    return 'tree-' + EntityRenderer.hashConfig(params);
  },

  // Generate SVG for tree based on configuration
  generateSVG(config) {
    const size = config.size || this.defaultConfig.size;
    const width = size;
    const height = config.imageHeight || this.defaultConfig.imageHeight;
    const trunkWidth = config.trunkWidth || this.defaultConfig.trunkWidth;
    const trunkHeight = config.trunkHeight || this.defaultConfig.trunkHeight;
    const trunkColor = config.trunkColor || this.defaultConfig.trunkColor;
    const foliageColor = config.foliageColor || this.defaultConfig.foliageColor;
    const foliageRadius = config.foliageRadius || this.defaultConfig.foliageRadius;
    const opacity = config.opacity || this.defaultConfig.opacity;

    // Trunk: from bottom center up
    const trunkX = width / 2 - trunkWidth / 2;
    const trunkY = height - size * 0.1; // Start a bit above the bottom

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
  },

  // Generate canvas drawing function that matches SVG parameters
  generateCanvasDraw(config) {
    const size = config.size || this.defaultConfig.size;
    const width = size;
    const height = config.imageHeight || this.defaultConfig.imageHeight;
    const trunkWidth = config.trunkWidth || this.defaultConfig.trunkWidth;
    const trunkHeight = config.trunkHeight || this.defaultConfig.trunkHeight;
    const trunkColor = config.trunkColor || this.defaultConfig.trunkColor;
    const foliageColor = config.foliageColor || this.defaultConfig.foliageColor;
    const foliageRadius = config.foliageRadius || this.defaultConfig.foliageRadius;
    const opacity = config.opacity || this.defaultConfig.opacity;

    return function(ctx, x, y) {
      ctx.save();
      ctx.globalAlpha = opacity;

      // Trunk (match SVG math)
      const trunkX = x - width / 2 + width / 2 - trunkWidth / 2;
      const trunkY = y + height / 2 - size * 0.1;
      ctx.fillStyle = trunkColor;
      ctx.fillRect(trunkX, trunkY - trunkHeight, trunkWidth, trunkHeight);

      // Foliage (match SVG math)
      const foliageCenterX = x;
      const foliageCenterY = y - height / 2 + height * 0.18;
      ctx.beginPath();
      ctx.ellipse(foliageCenterX, foliageCenterY, foliageRadius, foliageRadius * 1.2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = foliageColor;
      ctx.fill();

      ctx.restore();
    };
  },

  // Create a tree entity with unified rendering
  create(config = {}, entityRenderer) {
    // Set default drawOffsetY so the base of the trunk aligns with (x, y)
    const size = config.size || TreeEntity.defaultConfig.size;
    const imageHeight = config.imageHeight || TreeEntity.defaultConfig.imageHeight;
    const trunkY = imageHeight - size * 0.1;
    // The offset to align the bottom of the trunk with (x, y)
    let drawOffsetY = - (imageHeight - trunkY);
    // If user supplies a drawOffsetY, add it as a further offset

    let adjustedOffsetY = drawOffsetY = (config.drawOffsetY !== undefined) ? config.drawOffsetY : TreeEntity.defaultConfig.drawOffsetY;;
    if (typeof adjustedOffsetY === 'number') {
      drawOffsetY += adjustedOffsetY;
    }

    const mergedConfig = { ...config, drawOffsetY, imageHeight };
    const entity = EntityRenderer.createEntityWithBoilerplate('tree', mergedConfig, entityRenderer, TreeEntity);
    entity.fixedScreenAngle = (config.fixedScreenAngle !== undefined) ? config.fixedScreenAngle : TreeEntity.defaultConfig.fixedScreenAngle;
    entity.drawOffsetX = (config.drawOffsetX !== undefined) ? config.drawOffsetX : TreeEntity.defaultConfig.drawOffsetX;
    entity.drawOffsetY = drawOffsetY;
    return entity;
  }
};

// Make globally available
window.TreeEntity = TreeEntity; 