package com.game.core;

import java.util.ArrayList;
import java.util.List;

/**
 * Quadtree-based spatial index implementation for efficient collision detection.
 * Divides 2D space into quadrants recursively for fast spatial queries.
 */
public class QuadtreeSpatialIndex implements SpatialIndex {
    
    private static final int MAX_ENTITIES = 10;
    private static final int MAX_DEPTH = 8;
    
    private final Quadtree root;
    private int entityCount;
    
    /**
     * Constructor with default bounds.
     * Creates a quadtree covering a large area suitable for most game worlds.
     */
    public QuadtreeSpatialIndex() {
        this(-10000, -10000, 20000, 20000);
    }
    
    /**
     * Constructor with custom bounds.
     * 
     * @param x X coordinate of the quadtree bounds
     * @param y Y coordinate of the quadtree bounds
     * @param width Width of the quadtree bounds
     * @param height Height of the quadtree bounds
     */
    public QuadtreeSpatialIndex(double x, double y, double width, double height) {
        this.root = new Quadtree(x, y, width, height, 0);
        this.entityCount = 0;
    }
    
    @Override
    public void insert(Entity entity, double x, double y) {
        if (root.insert(entity, x, y)) {
            entityCount++;
        }
    }
    
    @Override
    public boolean remove(Entity entity, double x, double y) {
        boolean removed = root.remove(entity, x, y);
        if (removed) {
            entityCount--;
        }
        return removed;
    }
    
    @Override
    public List<Entity> queryRange(double x, double y, double width, double height) {
        List<Entity> result = new ArrayList<>();
        root.queryRange(x, y, width, height, result);
        return result;
    }
    
    @Override
    public void clear() {
        root.clear();
        entityCount = 0;
    }
    
    @Override
    public int size() {
        return entityCount;
    }
    
    /**
     * Internal quadtree node class.
     */
    private static class Quadtree {
        private final double x, y, width, height;
        private final int depth;
        private final List<EntityEntry> entities;
        private Quadtree[] children;
        
        public Quadtree(double x, double y, double width, double height, int depth) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.depth = depth;
            this.entities = new ArrayList<>();
            this.children = null;
        }
        
        public boolean insert(Entity entity, double entityX, double entityY) {
            // Check if entity is within this quadtree bounds
            if (!contains(entityX, entityY)) {
                return false;
            }
            
            // If this is a leaf node and not at max capacity
            if (children == null && entities.size() < MAX_ENTITIES) {
                entities.add(new EntityEntry(entity, entityX, entityY));
                return true;
            }
            
            // If this is a leaf node at max capacity, subdivide
            if (children == null && depth < MAX_DEPTH) {
                subdivide();
            }
            
            // If subdivided, try to insert into children
            if (children != null) {
                for (Quadtree child : children) {
                    if (child.insert(entity, entityX, entityY)) {
                        return true;
                    }
                }
            }
            
            // If we can't subdivide or insert into children, add to this node
            entities.add(new EntityEntry(entity, entityX, entityY));
            return true;
        }
        
        public boolean remove(Entity entity, double entityX, double entityY) {
            // Check if entity is within this quadtree bounds
            if (!contains(entityX, entityY)) {
                return false;
            }
            
            // Try to remove from this node's entities
            for (int i = 0; i < entities.size(); i++) {
                if (entities.get(i).entity.equals(entity)) {
                    entities.remove(i);
                    return true;
                }
            }
            
            // Try to remove from children
            if (children != null) {
                for (Quadtree child : children) {
                    if (child.remove(entity, entityX, entityY)) {
                        return true;
                    }
                }
            }
            
            return false;
        }
        
        public void queryRange(double queryX, double queryY, double queryWidth, double queryHeight, List<Entity> result) {
            // Check if query area intersects with this quadtree
            if (!intersects(queryX, queryY, queryWidth, queryHeight)) {
                return;
            }
            
            // Add entities from this node that are in the query area
            for (EntityEntry entry : entities) {
                if (entry.x >= queryX && entry.x < queryX + queryWidth &&
                    entry.y >= queryY && entry.y < queryY + queryHeight) {
                    result.add(entry.entity);
                }
            }
            
            // Query children
            if (children != null) {
                for (Quadtree child : children) {
                    child.queryRange(queryX, queryY, queryWidth, queryHeight, result);
                }
            }
        }
        
        public void clear() {
            entities.clear();
            if (children != null) {
                for (Quadtree child : children) {
                    child.clear();
                }
                children = null;
            }
        }
        
        private void subdivide() {
            double halfWidth = width / 2;
            double halfHeight = height / 2;
            
            children = new Quadtree[4];
            children[0] = new Quadtree(x, y, halfWidth, halfHeight, depth + 1); // Top-left
            children[1] = new Quadtree(x + halfWidth, y, halfWidth, halfHeight, depth + 1); // Top-right
            children[2] = new Quadtree(x, y + halfHeight, halfWidth, halfHeight, depth + 1); // Bottom-left
            children[3] = new Quadtree(x + halfWidth, y + halfHeight, halfWidth, halfHeight, depth + 1); // Bottom-right
            
            // Redistribute existing entities to children
            List<EntityEntry> oldEntities = new ArrayList<>(entities);
            entities.clear();
            
            for (EntityEntry entry : oldEntities) {
                boolean inserted = false;
                for (Quadtree child : children) {
                    if (child.insert(entry.entity, entry.x, entry.y)) {
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    entities.add(entry);
                }
            }
        }
        
        private boolean contains(double px, double py) {
            return px >= x && px < x + width && py >= y && py < y + height;
        }
        
        private boolean intersects(double otherX, double otherY, double otherWidth, double otherHeight) {
            return x < otherX + otherWidth && x + width > otherX &&
                   y < otherY + otherHeight && y + height > otherY;
        }
    }
    
    /**
     * Internal class to store entity with its position.
     */
    private static class EntityEntry {
        final Entity entity;
        final double x, y;
        
        public EntityEntry(Entity entity, double x, double y) {
            this.entity = entity;
            this.x = x;
            this.y = y;
        }
    }
} 