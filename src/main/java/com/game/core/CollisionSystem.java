package com.game.core;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

/**
 * Collision detection system that integrates with spatial index for efficient collision detection.
 * Provides circular collision detection and collision response for player movement.
 */
public class CollisionSystem {
    private final SpatialIndex spatialIndex;
    private final Map<String, List<Entity>> spatialGrid;
    private final int gridSize;
    
    /**
     * Constructor with default grid size.
     */
    public CollisionSystem() {
        this(64);
    }
    
    /**
     * Constructor with custom grid size.
     * 
     * @param gridSize Size of grid cells for spatial partitioning
     */
    public CollisionSystem(int gridSize) {
        this.spatialIndex = new QuadtreeSpatialIndex();
        this.spatialGrid = new HashMap<>();
        this.gridSize = gridSize;
    }
    
    /**
     * Gets the collision position for an entity.
     * For entities with renderY offset (like trees), uses base position for collision.
     * 
     * @param entity The entity to get collision position for
     * @return Collision position coordinates
     */
    public CollisionPosition getCollisionPosition(Entity entity) {
        // For now, use the entity's position directly
        // In the future, this could handle renderY offsets for trees
        return new CollisionPosition(entity.getX(), entity.getY());
    }
    
    /**
     * Checks collision between two entities using circular collision detection.
     * 
     * @param entity1 First entity
     * @param entity2 Second entity
     * @return true if entities collide
     */
    public boolean checkCollision(Entity entity1, Entity entity2) {
        if (entity1 == null || entity2 == null) return false;
        
        // If either entity is not collidable, they cannot collide
        if (!entity1.isCollidable() || !entity2.isCollidable()) {
            return false;
        }
        
        CollisionPosition pos1 = getCollisionPosition(entity1);
        CollisionPosition pos2 = getCollisionPosition(entity2);
        
        double dx = pos1.x - pos2.x;
        double dy = pos1.y - pos2.y;
        double distance = Math.sqrt(dx * dx + dy * dy);
        
        double radius1 = getCollisionRadius(entity1);
        double radius2 = getCollisionRadius(entity2);
        
        return distance <= (radius1 + radius2);
    }
    
    /**
     * Gets the collision radius for an entity.
     * 
     * @param entity The entity
     * @return Collision radius
     */
    private double getCollisionRadius(Entity entity) {
        if (!entity.isCollidable()) {
            return 0.0;
        }
        // Use collision width/height for radius calculation
        return Math.max(entity.getCollisionWidth(), entity.getCollisionHeight()) / 2.0;
    }
    
    /**
     * Gets all entities colliding at a specific position.
     * 
     * @param x X coordinate
     * @param y Y coordinate
     * @param radius Collision radius to check
     * @return List of colliding entities
     */
    public List<Entity> getCollisionsAt(double x, double y, double radius) {
        List<Entity> collisions = new ArrayList<>();
        
        // Query spatial index for entities in the area
        double querySize = radius * 2;
        List<Entity> nearbyEntities = spatialIndex.queryRange(x - radius, y - radius, querySize, querySize);
        
        for (Entity entity : nearbyEntities) {
            if (entity.isCollidable()) {
                CollisionPosition collisionPos = getCollisionPosition(entity);
                double dx = x - collisionPos.x;
                double dy = y - collisionPos.y;
                double distance = Math.sqrt(dx * dx + dy * dy);
                double entityRadius = getCollisionRadius(entity);
                
                if (distance <= (radius + entityRadius)) {
                    collisions.add(entity);
                }
            }
        }
        
        return collisions;
    }
    
    /**
     * Updates the spatial index with current entity positions from the world.
     * 
     * @param world The game world
     */
    public void updateSpatialIndex(World world) {
        spatialIndex.clear();
        
        // Add all entities from loaded chunks to spatial index
        for (Chunk chunk : world.getChunkCache().values()) {
            if (chunk.getEntities() != null) {
                for (Entity entity : chunk.getEntities()) {
                    if (entity.isCollidable()) {
                        CollisionPosition collisionPos = getCollisionPosition(entity);
                        spatialIndex.insert(entity, collisionPos.x, collisionPos.y);
                    }
                }
            }
        }
    }
    
    /**
     * Checks if a position is blocked by collision.
     * 
     * @param x X coordinate
     * @param y Y coordinate
     * @param radius Collision radius
     * @return true if position is blocked
     */
    public boolean isPositionBlocked(double x, double y, double radius) {
        List<Entity> collisions = getCollisionsAt(x, y, radius);
        return !collisions.isEmpty();
    }
    
    /**
     * Gets collision response for movement.
     * 
     * @param startX Starting X coordinate
     * @param startY Starting Y coordinate
     * @param endX Ending X coordinate
     * @param endY Ending Y coordinate
     * @param radius Collision radius
     * @return Collision response with final position and blocked status
     */
    public CollisionResponse getCollisionResponse(double startX, double startY, double endX, double endY, double radius) {
        // Simple collision response - if blocked, return start position
        if (isPositionBlocked(endX, endY, radius)) {
            return new CollisionResponse(startX, startY, true);
        }
        
        return new CollisionResponse(endX, endY, false);
    }
    
    /**
     * Updates collision state for the player.
     * 
     * @param world The game world
     * @param player The player
     * @return List of entities the player is colliding with
     */
    public List<Entity> updateCollisions(World world, Player player) {
        // Update spatial index
        updateSpatialIndex(world);
        
        // Check player collisions
        double playerRadius = player.getSize() / 2.0;
        List<Entity> playerCollisions = getCollisionsAt(player.getX(), player.getY(), playerRadius);
        
        // Update player collision state (if Player class has these fields)
        // player.setColliding(!playerCollisions.isEmpty());
        // player.setCollidingEntities(playerCollisions);
        
        return playerCollisions;
    }
    
    /**
     * Update method for game loop integration.
     * 
     * @param deltaTime Time since last update
     * @param world The game world
     * @param player The player
     */
    public void update(double deltaTime, World world, Player player) {
        updateCollisions(world, player);
    }
    
    /**
     * Gets collision statistics for debugging.
     * 
     * @return Collision statistics
     */
    public CollisionStats getCollisionStats() {
        return new CollisionStats(spatialIndex.size(), spatialIndex.size(), 0, gridSize);
    }
    
    /**
     * Internal class for collision position.
     */
    public static class CollisionPosition {
        public final double x, y;
        
        public CollisionPosition(double x, double y) {
            this.x = x;
            this.y = y;
        }
    }
    
    /**
     * Internal class for collision response.
     */
    public static class CollisionResponse {
        public final double x, y;
        public final boolean blocked;
        
        public CollisionResponse(double x, double y, boolean blocked) {
            this.x = x;
            this.y = y;
            this.blocked = blocked;
        }
    }
    
    /**
     * Internal class for collision statistics.
     */
    public static class CollisionStats {
        public final int totalEntities;
        public final int collidingEntities;
        public final int gridCells;
        public final int gridSize;
        
        public CollisionStats(int totalEntities, int collidingEntities, int gridCells, int gridSize) {
            this.totalEntities = totalEntities;
            this.collidingEntities = collidingEntities;
            this.gridCells = gridCells;
            this.gridSize = gridSize;
        }
    }
} 