# Phase 8: Collision Detection and Chunk Loading Optimization

## Overview
Implement efficient collision detection system and optimize chunk loading to only load chunks within a 2-chunk radius around the player, improving performance and memory usage.

## Goals
- Implement collision detection for rocks and trees (not grass)
- Optimize chunk loading to 2-chunk radius around player
- Ensure efficient collision detection performance
- Maintain game performance with limited chunk loading

## Current Issues
1. **No Collision Detection**: Player can walk through rocks and trees
2. **Excessive Chunk Loading**: All chunks loaded regardless of player position
3. **Memory Waste**: Unnecessary chunks consuming memory
4. **Performance Impact**: Rendering and processing unused chunks
5. **Scalability**: Current approach doesn't scale with larger worlds

## Technical Requirements

### 1. Collision Detection System
```java
// Efficient collision detection using spatial partitioning
public class CollisionSystem {
    private SpatialIndex spatialIndex; // B-tree or similar for efficient queries
    
    public boolean checkCollision(Entity entity, double newX, double newY) {
        // Check if new position collides with any collidable entities
        List<Entity> nearbyEntities = spatialIndex.queryRange(newX, newY, entity.getWidth(), entity.getHeight());
        return nearbyEntities.stream().anyMatch(e -> e.isCollidable() && e.intersects(newX, newY, entity.getWidth(), entity.getHeight()));
    }
    
    public void updateEntityPosition(Entity entity, double oldX, double oldY) {
        spatialIndex.remove(entity, oldX, oldY);
        spatialIndex.insert(entity, entity.getX(), entity.getY());
    }
}

public interface SpatialIndex {
    void insert(Entity entity, double x, double y);
    void remove(Entity entity, double x, double y);
    List<Entity> queryRange(double x, double y, double width, double height);
}
```

### 2. Chunk Loading Optimization
```java
// Configurable chunk loading radius
public class ChunkManager {
    private static final int CHUNK_LOAD_RADIUS = 2; // Configurable
    private Map<ChunkCoordinate, Chunk> loadedChunks;
    
    public void updateLoadedChunks(Player player) {
        ChunkCoordinate playerChunk = ChunkCoordinate.fromWorldPosition(player.getX(), player.getY());
        Set<ChunkCoordinate> requiredChunks = getChunksInRadius(playerChunk, CHUNK_LOAD_RADIUS);
        
        // Unload chunks outside radius
        loadedChunks.entrySet().removeIf(entry -> !requiredChunks.contains(entry.getKey()));
        
        // Load new chunks within radius
        requiredChunks.stream()
            .filter(chunkCoord -> !loadedChunks.containsKey(chunkCoord))
            .forEach(this::loadChunk);
    }
    
    private Set<ChunkCoordinate> getChunksInRadius(ChunkCoordinate center, int radius) {
        Set<ChunkCoordinate> chunks = new HashSet<>();
        for (int dx = -radius; dx <= radius; dx++) {
            for (int dy = -radius; dy <= radius; dy++) {
                chunks.add(new ChunkCoordinate(center.getX() + dx, center.getY() + dy));
            }
        }
        return chunks;
    }
}
```

### 3. Entity Collision Properties
```java
public class Entity {
    private boolean collidable;     // Whether entity blocks movement
    private double collisionWidth;  // Collision box width
    private double collisionHeight; // Collision box height
    
    public boolean isCollidable() {
        return collidable;
    }
    
    public boolean intersects(double x, double y, double width, double height) {
        // AABB collision detection
        return this.x < x + width && this.x + collisionWidth > x &&
               this.y < y + height && this.y + collisionHeight > y;
    }
}
```

## Implementation Steps

### Step 1: Implement Spatial Index
- [ ] Create `SpatialIndex` interface
- [ ] Implement B-tree or quadtree spatial index
- [ ] Add unit tests for spatial index operations
- [ ] Benchmark performance with different data structures

### Step 2: Create Collision System
- [ ] Implement `CollisionSystem` class
- [ ] Add collision detection methods
- [ ] Integrate with spatial index for efficient queries
- [ ] Add tests for collision detection accuracy

### Step 3: Update Entity System
- [ ] Add collision properties to `Entity` class
- [ ] Implement `intersects()` method for AABB collision
- [ ] Update entity creation to set collision properties
- [ ] Add tests for entity collision behavior

### Step 4: Integrate Collision with Player Movement
- [ ] Update `Player` movement to check collisions
- [ ] Prevent movement into collidable entities
- [ ] Add collision feedback (optional: visual/sound)
- [ ] Test player collision with rocks and trees

### Step 5: Implement Chunk Loading Optimization
- [ ] Create `ChunkManager` with configurable radius
- [ ] Implement chunk loading/unloading logic
- [ ] Add chunk coordinate system
- [ ] Test chunk loading performance

### Step 6: Update World System
- [ ] Integrate `ChunkManager` with `World` class
- [ ] Update chunk loading based on player position
- [ ] Ensure proper chunk unloading
- [ ] Test world generation with limited chunks

### Step 7: Optimize Rendering
- [ ] Update `Renderer` to only render loaded chunks
- [ ] Implement efficient chunk rendering
- [ ] Add visual indicators for unloaded areas
- [ ] Test rendering performance improvements

### Step 8: Configuration and Tuning
- [ ] Make chunk radius configurable
- [ ] Add performance monitoring
- [ ] Tune collision detection parameters
- [ ] Document configuration options

## Testing Strategy

### Unit Tests
- [ ] `SpatialIndexTest` - Spatial index operations and performance
- [ ] `CollisionSystemTest` - Collision detection accuracy
- [ ] `EntityCollisionTest` - Entity collision properties
- [ ] `ChunkManagerTest` - Chunk loading/unloading logic

### Integration Tests
- [ ] `PlayerCollisionTest` - Player movement with obstacles
- [ ] `ChunkLoadingTest` - Chunk loading based on player position
- [ ] `PerformanceTest` - Memory and performance improvements

### Visual Tests
- [ ] Player collision with rocks and trees
- [ ] Chunk loading/unloading during movement
- [ ] Performance with large world areas
- [ ] Visual indicators for unloaded chunks

## Success Criteria
- [ ] Player cannot walk through rocks or trees
- [ ] Only chunks within 2-chunk radius are loaded
- [ ] Unloaded areas show as background color (black/default)
- [ ] Collision detection performance is efficient
- [ ] Memory usage reduced with limited chunk loading
- [ ] All existing tests pass
- [ ] Coverage requirements met
- [ ] Checkstyle compliance maintained

## Performance Targets
- **Collision Detection**: < 1ms per frame for typical scenarios
- **Chunk Loading**: < 100ms for loading new chunks
- **Memory Usage**: 50% reduction in memory usage
- **Rendering**: Maintain 60 FPS with optimized chunk loading

## Configuration Examples

### Collision Configuration
```json
{
  "entityTypes": {
    "tree": {
      "collidable": true,
      "collisionWidth": 0.8,
      "collisionHeight": 0.8
    },
    "rock": {
      "collidable": true,
      "collisionWidth": 1.0,
      "collisionHeight": 1.0
    },
    "grass": {
      "collidable": false,
      "collisionWidth": 0.0,
      "collisionHeight": 0.0
    }
  }
}
```

### Chunk Loading Configuration
```json
{
  "chunkLoading": {
    "radius": 2,
    "loadTimeout": 100,
    "unloadDelay": 5000
  }
}
```

## Dependencies
- Existing entity system
- Current chunk system
- Player movement system
- Rendering pipeline
- World generation system

## Risk Mitigation
- **Performance**: Benchmark collision detection with different approaches
- **Memory**: Monitor memory usage during chunk loading/unloading
- **Compatibility**: Ensure existing entities work with new collision system
- **Testing**: Comprehensive testing to prevent movement regressions
- **Scalability**: Test with larger world sizes and more entities 