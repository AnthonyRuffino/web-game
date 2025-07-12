// world.js
// World structure, wrapping, and coordinate management

const World = {
  // World configuration
  config: {
    // World size in grid cells (tiles) - easily configurable
    gridWidth: 100,   // 100 tiles wide
    gridHeight: 100,  // 100 tiles tall
    tileSize: 40,     // pixels per tile
    seed: 42,         // default seed
    chunkSize: 16     // tiles per chunk (16x16 chunks)
  },

  // Chunk cache for loaded chunks
  chunkCache: new Map(),

  // Initialize world system
  init() {
    console.log('[World] World system initialized');
    console.log(`[World] World size: ${this.config.gridWidth}x${this.config.gridHeight} tiles`);
    console.log(`[World] World size: ${this.width}x${this.height} pixels`);
    console.log(`[World] Chunk size: ${this.config.chunkSize}x${this.config.chunkSize} tiles`);
    console.log(`[World] Total chunks: ${this.getChunkCount().total}`);
    console.log(`[World] Traversal time: ~${this.calculateTraversalTime()} seconds`);
  },

  // Calculate world dimensions in pixels
  get width() {
    return this.config.gridWidth * this.config.tileSize;
  },

  get height() {
    return this.config.gridHeight * this.config.tileSize;
  },

  // Calculate approximate traversal time based on player speed
  calculateTraversalTime() {
    const playerSpeed = 200; // pixels per second (default)
    const traversalDistance = Math.min(this.width, this.height);
    return Math.round(traversalDistance / playerSpeed);
  },

  // Get chunk count
  getChunkCount() {
    const chunksX = Math.ceil(this.config.gridWidth / this.config.chunkSize);
    const chunksY = Math.ceil(this.config.gridHeight / this.config.chunkSize);
    return { x: chunksX, y: chunksY, total: chunksX * chunksY };
  },

  // Convert world coordinates to chunk coordinates
  worldToChunk(x, y) {
    const chunkX = Math.floor(x / this.config.chunkSize);
    const chunkY = Math.floor(y / this.config.chunkSize);
    return { x: chunkX, y: chunkY };
  },

  // Convert chunk coordinates to world coordinates (top-left of chunk)
  chunkToWorld(chunkX, chunkY) {
    return {
      x: chunkX * this.config.chunkSize,
      y: chunkY * this.config.chunkSize
    };
  },

  // Get chunk key for cache
  getChunkKey(chunkX, chunkY) {
    return `${chunkX},${chunkY}`;
  },

  // Load or generate a chunk
  loadChunk(chunkX, chunkY) {
    const key = this.getChunkKey(chunkX, chunkY);
    
    if (this.chunkCache.has(key)) {
      return this.chunkCache.get(key);
    }

    // Generate new chunk
    const chunk = this.generateChunk(chunkX, chunkY);
    this.chunkCache.set(key, chunk);
    
    return chunk;
  },

  // Generate chunk data
  generateChunk(chunkX, chunkY) {
    const chunk = {
      x: chunkX,
      y: chunkY,
      worldX: chunkX * this.config.chunkSize,
      worldY: chunkY * this.config.chunkSize,
      tiles: [],
      objects: [],
      lastAccessed: Date.now()
    };

    // Generate tiles for this chunk
    const startTileX = chunkX * this.config.chunkSize;
    const startTileY = chunkY * this.config.chunkSize;
    const endTileX = Math.min(startTileX + this.config.chunkSize, this.config.gridWidth);
    const endTileY = Math.min(startTileY + this.config.chunkSize, this.config.gridHeight);

    for (let tileY = startTileY; tileY < endTileY; tileY++) {
      for (let tileX = startTileX; tileX < endTileX; tileX++) {
        // Generate tile based on position and seed
        const tile = this.generateTile(tileX, tileY);
        chunk.tiles.push(tile);
      }
    }

    return chunk;
  },

  // Generate a single tile
  generateTile(tileX, tileY) {
    // Simple deterministic generation based on position and seed
    const hash = this.simpleHash(`${this.config.seed}-${tileX}-${tileY}`);
    
    return {
      x: tileX,
      y: tileY,
      type: 'empty', // Will be expanded with grass, trees, etc.
      worldX: tileX * this.config.tileSize,
      worldY: tileY * this.config.tileSize,
      hash: hash
    };
  },

  // Get chunks that need to be rendered based on camera view
  getVisibleChunks(cameraX, cameraY, cameraWidth, cameraHeight) {
    const chunks = new Set();
    
    // Calculate visible world area
    const left = cameraX - cameraWidth / 2;
    const right = cameraX + cameraWidth / 2;
    const top = cameraY - cameraHeight / 2;
    const bottom = cameraY + cameraHeight / 2;
    
    // Convert to tile coordinates first, then to chunk coordinates
    const leftTile = Math.floor(left / this.config.tileSize);
    const rightTile = Math.floor(right / this.config.tileSize);
    const topTile = Math.floor(top / this.config.tileSize);
    const bottomTile = Math.floor(bottom / this.config.tileSize);
    
    // Convert tile coordinates to chunk coordinates
    const leftChunk = Math.floor(leftTile / this.config.chunkSize);
    const rightChunk = Math.floor(rightTile / this.config.chunkSize);
    const topChunk = Math.floor(topTile / this.config.chunkSize);
    const bottomChunk = Math.floor(bottomTile / this.config.chunkSize);
    
    // Get chunk dimensions
    const chunkCount = this.getChunkCount();
    
    // Add all visible chunks (including wrapped ones)
    for (let chunkY = topChunk; chunkY <= bottomChunk; chunkY++) {
      for (let chunkX = leftChunk; chunkX <= rightChunk; chunkX++) {
        // Handle wrapping for chunks
        let wrappedChunkX = chunkX;
        let wrappedChunkY = chunkY;
        
        // Wrap X coordinates
        while (wrappedChunkX < 0) wrappedChunkX += chunkCount.x;
        while (wrappedChunkX >= chunkCount.x) wrappedChunkX -= chunkCount.x;
        
        // Wrap Y coordinates
        while (wrappedChunkY < 0) wrappedChunkY += chunkCount.y;
        while (wrappedChunkY >= chunkCount.y) wrappedChunkY -= chunkCount.y;
        
        chunks.add(this.getChunkKey(wrappedChunkX, wrappedChunkY));
      }
    }
    
    return Array.from(chunks).map(key => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, key };
    });
  },

  // Clean up chunks that are far from the player
  cleanupChunks(playerX, playerY, keepDistance = 5) {
    const playerChunk = this.worldToChunk(
      playerX / this.config.tileSize, 
      playerY / this.config.tileSize
    );
    
    const chunksToRemove = [];
    
    for (const [key, chunk] of this.chunkCache) {
      const distance = Math.max(
        Math.abs(chunk.x - playerChunk.x),
        Math.abs(chunk.y - playerChunk.y)
      );
      
      if (distance > keepDistance) {
        chunksToRemove.push(key);
      }
    }
    
    chunksToRemove.forEach(key => {
      this.chunkCache.delete(key);
    });
  },

  // Wrap coordinates to world boundaries
  wrapCoordinates(x, y) {
    let wrappedX = x;
    let wrappedY = y;

    // Wrap X coordinate (east/west)
    if (wrappedX < 0) {
      wrappedX = this.width + wrappedX;
    } else if (wrappedX >= this.width) {
      wrappedX = wrappedX - this.width;
    }

    // Wrap Y coordinate (north/south)
    if (wrappedY < 0) {
      wrappedY = this.height + wrappedY;
    } else if (wrappedY >= this.height) {
      wrappedY = wrappedY - this.height;
    }

    return { x: wrappedX, y: wrappedY };
  },

  // Check if coordinates are within world bounds (before wrapping)
  isOutOfBounds(x, y) {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  },

  // Get world dimensions in tiles
  getTileDimensions() {
    return {
      width: this.config.gridWidth,
      height: this.config.gridHeight
    };
  },

  // Convert pixel coordinates to tile coordinates
  pixelToTile(x, y) {
    return {
      x: Math.floor(x / this.config.tileSize),
      y: Math.floor(y / this.config.tileSize)
    };
  },

  // Convert tile coordinates to pixel coordinates (center of tile)
  tileToPixel(tileX, tileY) {
    return {
      x: tileX * this.config.tileSize + this.config.tileSize / 2,
      y: tileY * this.config.tileSize + this.config.tileSize / 2
    };
  },

  // Get deterministic starting position based on seed
  getStartingPosition() {
    // Simple hash-based starting position
    const hash = this.simpleHash(this.config.seed);
    const tileDims = this.getTileDimensions();
    
    // Use hash to determine starting tile (avoid edges)
    const startTileX = 1 + (hash % (tileDims.width - 2));
    const startTileY = 1 + ((hash * 2) % (tileDims.height - 2));
    
    // Convert to pixel coordinates
    const pixelPos = this.tileToPixel(startTileX, startTileY);
    
    return pixelPos;
  },

  // Simple hash function for deterministic values
  simpleHash(str) {
    let hash = 0;
    const seedStr = str.toString();
    for (let i = 0; i < seedStr.length; i++) {
      const char = seedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  },

  // Set world seed and recalculate starting position
  setSeed(seed) {
    this.config.seed = seed;
    // Clear chunk cache when seed changes
    this.chunkCache.clear();
    console.log(`[World] Seed set to: ${seed}`);
    return this.getStartingPosition();
  },

  // Get current world configuration
  getConfig() {
    return { ...this.config };
  },

  // Update world configuration
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // Clear chunk cache when config changes
    this.chunkCache.clear();
    console.log('[World] Configuration updated:', this.config);
  },

  // Render world using chunk system
  render(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
    ctx.save();
    
    // Draw world boundary
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, this.width, this.height);
    
    // Get visible chunks
    const visibleChunks = this.getVisibleChunks(cameraX, cameraY, cameraWidth, cameraHeight);
    
    // Render each visible chunk at its correct world position
    visibleChunks.forEach(chunkInfo => {
      const chunk = this.loadChunk(chunkInfo.x, chunkInfo.y);
      this.renderChunk(ctx, chunk);
    });
    
    // Handle wrapping by rendering chunks that should be visible on the opposite side
    this.renderWrappedChunks(ctx, cameraX, cameraY, cameraWidth, cameraHeight);
    
    // Directly render the starting position marker with wrapping
    this.renderStartingMarker(ctx, cameraX, cameraY, cameraWidth, cameraHeight);
    
    // Clean up distant chunks (silently)
    this.cleanupChunks(cameraX / this.config.tileSize, cameraY / this.config.tileSize);
    
    ctx.restore();
  },

  // Directly render the starting position marker with proper wrapping
  renderStartingMarker(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
    const startPos = this.getStartingPosition();
    const worldWidth = this.width;
    const worldHeight = this.height;
    
    // Calculate visible world area
    const left = cameraX - cameraWidth / 2;
    const right = cameraX + cameraWidth / 2;
    const top = cameraY - cameraHeight / 2;
    const bottom = cameraY + cameraHeight / 2;
    
    // Check if starting position is in view (including wrapping)
    const positions = [startPos];
    
    // Add wrapped positions if needed
    if (left < 0 && startPos.x > worldWidth + left) {
      positions.push({ x: startPos.x - worldWidth, y: startPos.y });
    }
    if (right > worldWidth && startPos.x < right - worldWidth) {
      positions.push({ x: startPos.x + worldWidth, y: startPos.y });
    }
    if (top < 0 && startPos.y > worldHeight + top) {
      positions.push({ x: startPos.x, y: startPos.y - worldHeight });
    }
    if (bottom > worldHeight && startPos.y < bottom - worldHeight) {
      positions.push({ x: startPos.x, y: startPos.y + worldHeight });
    }
    
    // Render the X marker at all relevant positions
    positions.forEach(pos => {
      ctx.fillStyle = 'red';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('X', pos.x, pos.y);
    });
  },

  // Render chunks that appear on the opposite side due to wrapping
  renderWrappedChunks(ctx, cameraX, cameraY, cameraWidth, cameraHeight) {
    const worldWidth = this.width;
    const worldHeight = this.height;
    
    // Calculate visible world area
    const left = cameraX - cameraWidth / 2;
    const right = cameraX + cameraWidth / 2;
    const top = cameraY - cameraHeight / 2;
    const bottom = cameraY + cameraHeight / 2;
    
    // Check if we need to render wrapped chunks
    let needsWrappedRendering = false;
    let wrappedOffsets = [];
    
    // Check horizontal wrapping
    if (left < 0) {
      needsWrappedRendering = true;
      wrappedOffsets.push({ x: worldWidth, y: 0 });
    }
    if (right > worldWidth) {
      needsWrappedRendering = true;
      wrappedOffsets.push({ x: -worldWidth, y: 0 });
    }
    
    // Check vertical wrapping
    if (top < 0) {
      needsWrappedRendering = true;
      wrappedOffsets.push({ x: 0, y: worldHeight });
    }
    if (bottom > worldHeight) {
      needsWrappedRendering = true;
      wrappedOffsets.push({ x: 0, y: -worldHeight });
    }
    
    // Check corner wrapping
    if (left < 0 && top < 0) {
      wrappedOffsets.push({ x: worldWidth, y: worldHeight });
    }
    if (right > worldWidth && top < 0) {
      wrappedOffsets.push({ x: -worldWidth, y: worldHeight });
    }
    if (left < 0 && bottom > worldHeight) {
      wrappedOffsets.push({ x: worldWidth, y: -worldHeight });
    }
    if (right > worldWidth && bottom > worldHeight) {
      wrappedOffsets.push({ x: -worldWidth, y: -worldHeight });
    }
    
    // Render wrapped chunks if needed
    if (needsWrappedRendering) {
      wrappedOffsets.forEach(offset => {
        // Get chunks for the wrapped area
        const wrappedVisibleChunks = this.getVisibleChunks(
          cameraX - offset.x, 
          cameraY - offset.y, 
          cameraWidth, 
          cameraHeight
        );
        
        // Render each wrapped chunk at the offset position
        wrappedVisibleChunks.forEach(chunkInfo => {
          const chunk = this.loadChunk(chunkInfo.x, chunkInfo.y);
          
          // Save context, apply offset, render chunk, restore context
          ctx.save();
          ctx.translate(offset.x, offset.y);
          this.renderChunk(ctx, chunk);
          ctx.restore();
        });
      });
    }
  },

  // Render a single chunk
  renderChunk(ctx, chunk) {
    // Render chunk objects only (no X marker here anymore)
    chunk.objects.forEach(obj => {
      // Future objects will be rendered here
    });
  },

  // Get world info for debugging
  getInfo() {
    const tileDims = this.getTileDimensions();
    const startPos = this.getStartingPosition();
    const chunkCount = this.getChunkCount();
    return {
      size: `${this.width}x${this.height} pixels`,
      tiles: `${tileDims.width}x${tileDims.height} tiles`,
      tileSize: this.config.tileSize,
      seed: this.config.seed,
      startingPosition: startPos,
      traversalTime: this.calculateTraversalTime(),
      chunks: `${chunkCount.x}x${chunkCount.y} chunks`,
      loadedChunks: this.chunkCache.size,
      chunkSize: this.config.chunkSize
    };
  }
};

// Expose to global scope
window.World = World; 