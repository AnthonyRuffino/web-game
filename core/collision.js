// collision.js
// Collision detection and spatial query system

const Collision = {
  // Collision detection configuration
  config: {
    enabled: true,
    debug: false,
    playerRadius: 15, // Collision radius for player
    spatialGridSize: 100 // Size of spatial partitioning grid cells
  },

  // Spatial partitioning grid for efficient collision detection
  spatialGrid: new Map(),

  // Initialize collision system
  init() {
    console.log('[Collision] Collision system initialized');
    console.log(`[Collision] Player collision radius: ${this.config.playerRadius}px`);
    console.log(`[Collision] Spatial grid size: ${this.config.spatialGridSize}px`);
  },

  // Clear spatial grid
  clearSpatialGrid() {
    this.spatialGrid.clear();
  },

  // Get grid cell key for spatial partitioning
  getGridKey(x, y) {
    const gridX = Math.floor(x / this.config.spatialGridSize);
    const gridY = Math.floor(y / this.config.spatialGridSize);
    return `${gridX},${gridY}`;
  },

  // Add entity to spatial grid
  addToSpatialGrid(entity) {
    if (!entity.collision) return; // Skip non-collidable entities
    
    const key = this.getGridKey(entity.x, entity.y);
    if (!this.spatialGrid.has(key)) {
      this.spatialGrid.set(key, []);
    }
    this.spatialGrid.get(key).push(entity);
  },

  // Get entities in grid cells that might collide with given position
  getNearbyEntities(x, y, radius = 50) {
    const entities = [];
    const gridRadius = Math.ceil(radius / this.config.spatialGridSize);
    const centerGridX = Math.floor(x / this.config.spatialGridSize);
    const centerGridY = Math.floor(y / this.config.spatialGridSize);

    for (let gridX = centerGridX - gridRadius; gridX <= centerGridX + gridRadius; gridX++) {
      for (let gridY = centerGridY - gridRadius; gridY <= centerGridY + gridRadius; gridY++) {
        const key = `${gridX},${gridY}`;
        if (this.spatialGrid.has(key)) {
          entities.push(...this.spatialGrid.get(key));
        }
      }
    }

    return entities;
  },

  // Check collision between two circular objects
  checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (r1 + r2);
  },

  // Check collision between player and entity
  checkPlayerEntityCollision(playerX, playerY, entity) {
    if (!entity.collision) return false;

    // Use entity-specific collision radius or default
    const entityRadius = entity.collisionRadius || 20; // Default radius for trees/rocks
    
    return this.checkCircleCollision(
      playerX, playerY, this.config.playerRadius,
      entity.x, entity.y, entityRadius
    );
  },

  // Check if a position would collide with any nearby entities
  checkPositionCollision(x, y) {
    if (!this.config.enabled) return false;

    const nearbyEntities = this.getNearbyEntities(x, y, 100);
    
    for (const entity of nearbyEntities) {
      if (this.checkPlayerEntityCollision(x, y, entity)) {
        if (this.config.debug) {
          console.log(`[Collision] Collision detected with ${entity.type} at (${entity.x}, ${entity.y})`);
        }
        return true;
      }
    }
    
    return false;
  },

  // Test movement and return valid position
  testMovement(fromX, fromY, toX, toY) {
    if (!this.config.enabled) {
      return { x: toX, y: toY, collided: false };
    }

    // Check if destination position collides
    if (this.checkPositionCollision(toX, toY)) {
      if (this.config.debug) {
        console.log(`[Collision] Movement blocked from (${fromX}, ${fromY}) to (${toX}, ${toY})`);
      }
      return { x: fromX, y: fromY, collided: true };
    }

    return { x: toX, y: toY, collided: false };
  },

  // Update spatial grid with current world entities
  updateSpatialGrid() {
    this.clearSpatialGrid();
    
    if (typeof World === 'undefined') return;

    // Get canvas dimensions from responsive canvas system
    const canvasWidth = UI.ResponsiveCanvas ? UI.ResponsiveCanvas.currentWidth : 800;
    const canvasHeight = UI.ResponsiveCanvas ? UI.ResponsiveCanvas.currentHeight : 600;

    // Get all visible chunks and their entities
    const visibleChunks = World.getVisibleChunks(
      Player.x, Player.y, 
      canvasWidth / ZOOM, canvasHeight / ZOOM
    );

    let totalEntities = 0;
    for (const chunk of visibleChunks) {
      // Load the chunk to get its entities
      const loadedChunk = World.loadChunk(chunk.x, chunk.y);
      if (loadedChunk && loadedChunk.entities) {
        for (const entity of loadedChunk.entities) {
          if (entity.collision) {
            this.addToSpatialGrid(entity);
            totalEntities++;
          }
        }
      }
    }

    if (this.config.debug && totalEntities > 0) {
      console.log(`[Collision] Updated spatial grid with ${totalEntities} collidable entities`);
    }
  },

  // Render collision debug information
  renderDebug(ctx) {
    if (!this.config.debug) return;

    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Draw player collision circle
    ctx.beginPath();
    ctx.arc(Player.x, Player.y, this.config.playerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw entity collision circles
    const nearbyEntities = this.getNearbyEntities(Player.x, Player.y, 200);
    for (const entity of nearbyEntities) {
      if (entity.collision) {
        const entityRadius = entity.collisionRadius || 20;
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, entityRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  },

  // Toggle collision detection
  toggleCollision() {
    this.config.enabled = !this.config.enabled;
    console.log(`[Collision] Collision detection ${this.config.enabled ? 'enabled' : 'disabled'}`);
  },

  // Toggle debug rendering
  toggleDebug() {
    this.config.debug = !this.config.debug;
    console.log(`[Collision] Debug rendering ${this.config.debug ? 'enabled' : 'disabled'}`);
  },

  // Set player collision radius
  setPlayerRadius(radius) {
    this.config.playerRadius = Math.max(5, Math.min(50, radius));
    console.log(`[Collision] Player collision radius set to ${this.config.playerRadius}px`);
  },

  // Get collision system info
  getInfo() {
    return {
      enabled: this.config.enabled,
      debug: this.config.debug,
      playerRadius: this.config.playerRadius,
      spatialGridSize: this.config.spatialGridSize,
      gridCellCount: this.spatialGrid.size,
      totalEntities: Array.from(this.spatialGrid.values()).reduce((sum, entities) => sum + entities.length, 0)
    };
  }
};

// Export for global access
window.Collision = Collision; 