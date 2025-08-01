// Collision detection system

export class CollisionSystem {
    constructor() {
        this.collisionLayers = new Map();
        this.spatialGrid = new Map(); // Simple spatial partitioning
        this.gridSize = 64; // Grid cell size for spatial partitioning
    }

    // Get collision position for an entity (base position for trees, visual position for others)
    getCollisionPosition(entity) {
        // For entities with renderY offset (like trees), use base position for collision
        if (entity.renderY !== undefined) {
            return { x: entity.x, y: entity.y }; // Base position (without renderY offset)
        }
        return { x: entity.x, y: entity.y }; // Normal position
    }

    // Check collision between two entities using circular collision
    checkCollision(entity1, entity2) {
        if (!entity1 || !entity2) return false;
        
        const pos1 = this.getCollisionPosition(entity1);
        const pos2 = this.getCollisionPosition(entity2);
        
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
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
                        const collisionPos = this.getCollisionPosition(entity);
                        const dx = x - collisionPos.x;
                        const dy = y - collisionPos.y;
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
                        const collisionPos = this.getCollisionPosition(entity);
                        const gridX = Math.floor(collisionPos.x / this.gridSize);
                        const gridY = Math.floor(collisionPos.y / this.gridSize);
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

    // Update method for game loop integration
    update(deltaTime, world, player) {
        // Update spatial grid and collision state
        this.updateCollisions(world, player);
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
                        const collisionPos = this.getCollisionPosition(entity);
                        const radius = entity.collisionRadius || entity.size / 2 || 10;
                        ctx.beginPath();
                        ctx.arc(collisionPos.x, collisionPos.y, radius, 0, Math.PI * 2);
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