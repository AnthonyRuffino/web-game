package com.game.core;

import java.util.List;

/**
 * Interface for spatial indexing to support efficient collision detection.
 * Provides methods for inserting, removing, and querying entities in 2D space.
 */
public interface SpatialIndex {
    
    /**
     * Inserts an entity into the spatial index at the specified position.
     * 
     * @param entity The entity to insert
     * @param x X coordinate of the entity
     * @param y Y coordinate of the entity
     */
    void insert(Entity entity, double x, double y);
    
    /**
     * Removes an entity from the spatial index at the specified position.
     * 
     * @param entity The entity to remove
     * @param x X coordinate where the entity was located
     * @param y Y coordinate where the entity was located
     * @return true if the entity was found and removed, false otherwise
     */
    boolean remove(Entity entity, double x, double y);
    
    /**
     * Queries for entities within the specified rectangular area.
     * 
     * @param x X coordinate of the query area
     * @param y Y coordinate of the query area
     * @param width Width of the query area
     * @param height Height of the query area
     * @return List of entities found in the query area
     */
    List<Entity> queryRange(double x, double y, double width, double height);
    
    /**
     * Clears all entities from the spatial index.
     */
    void clear();
    
    /**
     * Gets the total number of entities in the spatial index.
     * 
     * @return Number of entities
     */
    int size();
} 