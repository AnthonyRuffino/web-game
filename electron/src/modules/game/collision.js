// Collision detection system

export class CollisionSystem {
    constructor() {
        this.collisionLayers = new Map();
        this.spatialGrid = new Map(); // Simple spatial partitioning
        this.gridSize = 64; // Grid cell size for spatial partitioning
    }

    // Check collision between two entities using circular collision
    checkCollision(entity1, entity2) {
        if (!entity1 || !entity2) return false;
        
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const radius1 = entity1.collisionRadius || entity1.size / 2 || 10;
        const radius2 = entity2.collisionRadius || entity2.size / 2 || 10;
        
        return distance < (radius1 + radius2);
    }

    // Get all entities colliding at a specific position
    getCollisionsAt(x, y, radius) {
        const collisions = [];
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        // Check current grid cell and adjacent cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cellKey = `${gridX + dx},${gridY + dy}`;
                const entities = this.spatialGrid.get(cellKey) || [];
                
                for (const entity of entities) {
                    if (entity.collision) {
                        const dx = x - entity.x;
                        const dy = y - entity.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const entityRadius = entity.collisionRadius || entity.size / 2 || 10;
                        
                        if (distance < (radius + entityRadius)) {
                            collisions.push(entity);
                        }
                    }
                }
            }
        }
        
        return collisions;
    }

    // Update spatial grid with current entity positions
    updateSpatialGrid(world) {
        this.spatialGrid.clear();
        
        // Add all entities from loaded chunks to spatial grid
        for (const chunk of world.chunkCache.values()) {
            if (chunk.entities && Array.isArray(chunk.entities)) {
                for (const entity of chunk.entities) {
                    if (entity.collision) {
                        const gridX = Math.floor(entity.x / this.gridSize);
                        const gridY = Math.floor(entity.y / this.gridSize);
                        const cellKey = `${gridX},${gridY}`;
                        
                        if (!this.spatialGrid.has(cellKey)) {
                            this.spatialGrid.set(cellKey, []);
                        }
                        this.spatialGrid.get(cellKey).push(entity);
                    }
                }
            }
        }
    }

    // Check if a position is blocked by collision
    isPositionBlocked(x, y, radius = 10) {
        const collisions = this.getCollisionsAt(x, y, radius);
        return collisions.length > 0;
    }

    // Get collision response for movement
    getCollisionResponse(startX, startY, endX, endY, radius = 10) {
        // Simple collision response - if blocked, return start position
        if (this.isPositionBlocked(endX, endY, radius)) {
            return { x: startX, y: startY, blocked: true };
        }
        
        return { x: endX, y: endY, blocked: false };
    }

    // Update collision state for all entities
    updateCollisions(world, player) {
        // Update spatial grid
        this.updateSpatialGrid(world);
        
        // Check player collisions
        const playerCollisions = this.getCollisionsAt(player.x, player.y, player.size / 2);
        
        // Update player collision state
        player.colliding = playerCollisions.length > 0;
        player.collidingEntities = playerCollisions;
        
        return playerCollisions;
    }

    // Debug: Render collision zones
    renderCollisionDebug(ctx, world, player) {
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        
        // Draw player collision zone
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw entity collision zones
        for (const chunk of world.chunkCache.values()) {
            if (chunk.entities && Array.isArray(chunk.entities)) {
                for (const entity of chunk.entities) {
                    if (entity.collision) {
                        const radius = entity.collisionRadius || entity.size / 2 || 10;
                        ctx.beginPath();
                        ctx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
        }
        
        ctx.restore();
    }

    // Get collision statistics for debugging
    getCollisionStats() {
        let totalEntities = 0;
        let collidingEntities = 0;
        
        for (const entities of this.spatialGrid.values()) {
            totalEntities += entities.length;
            collidingEntities += entities.filter(e => e.collision).length;
        }
        
        return {
            totalEntities,
            collidingEntities,
            gridCells: this.spatialGrid.size,
            gridSize: this.gridSize
        };
    }
} 