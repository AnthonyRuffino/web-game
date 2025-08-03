package com.game.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

class CollisionSystemTest {
    
    private CollisionSystem collisionSystem;
    private World world;
    private Player player;
    
    @BeforeEach
    void setUp() {
        collisionSystem = new CollisionSystem();
        world = new World(null); // No database manager for tests
        player = new Player(100.0, 100.0, world.getConfig());
    }
    
    @Test
    void testCollisionSystemInitialization() {
        // Assert
        assertNotNull(collisionSystem);
        CollisionSystem.CollisionStats stats = collisionSystem.getCollisionStats();
        assertEquals(0, stats.totalEntities);
        assertEquals(64, stats.gridSize);
    }
    
    @Test
    void testCheckCollisionBetweenEntities() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity rock = new Entity("rock", 120.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity grass = new Entity("grass", 200.0, 200.0, 0.0, 32.0, false, 0.0, 0.0, null);
        
        // Act & Assert
        assertTrue(collisionSystem.checkCollision(tree, rock)); // Overlapping
        assertFalse(collisionSystem.checkCollision(tree, grass)); // Non-collidable
        assertFalse(collisionSystem.checkCollision(rock, grass)); // Non-collidable
    }
    
    @Test
    void testCheckCollisionWithNonOverlappingEntities() {
        // Arrange
        Entity tree1 = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity tree2 = new Entity("tree", 200.0, 200.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertFalse(collisionSystem.checkCollision(tree1, tree2));
    }
    
    @Test
    void testGetCollisionsAt() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity rock = new Entity("rock", 120.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Entity grass = new Entity("grass", 110.0, 110.0, 0.0, 32.0, false, 0.0, 0.0, null);
        
        // Add entities to a chunk and update spatial index
        Chunk chunk = new Chunk(0, 0, world.getConfig());
        chunk.addEntity(tree);
        chunk.addEntity(rock);
        chunk.addEntity(grass);
        
        // Mock the world to return our chunk
        world.getChunkCache().put("0_0", chunk);
        
        // Act
        collisionSystem.updateSpatialIndex(world);
        List<Entity> collisions = collisionSystem.getCollisionsAt(110.0, 110.0, 20.0);
        
        // Assert
        assertEquals(2, collisions.size()); // tree and rock, but not grass (non-collidable)
        assertTrue(collisions.contains(tree));
        assertTrue(collisions.contains(rock));
        assertFalse(collisions.contains(grass));
    }
    
    @Test
    void testIsPositionBlocked() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Chunk chunk = new Chunk(0, 0, world.getConfig());
        chunk.addEntity(tree);
        world.getChunkCache().put("0_0", chunk);
        
        // Act
        collisionSystem.updateSpatialIndex(world);
        
        // Assert
        assertTrue(collisionSystem.isPositionBlocked(100.0, 100.0, 16.0)); // Inside tree
        assertFalse(collisionSystem.isPositionBlocked(200.0, 200.0, 16.0)); // Far from tree
    }
    
    @Test
    void testGetCollisionResponse() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Chunk chunk = new Chunk(0, 0, world.getConfig());
        chunk.addEntity(tree);
        world.getChunkCache().put("0_0", chunk);
        
        // Act
        collisionSystem.updateSpatialIndex(world);
        
        // Test movement that would collide
        CollisionSystem.CollisionResponse blockedResponse = collisionSystem.getCollisionResponse(50.0, 50.0, 100.0, 100.0, 16.0);
        
        // Test movement that wouldn't collide
        CollisionSystem.CollisionResponse freeResponse = collisionSystem.getCollisionResponse(50.0, 50.0, 200.0, 200.0, 16.0);
        
        // Assert
        assertTrue(blockedResponse.blocked);
        assertEquals(50.0, blockedResponse.x); // Should return start position
        assertEquals(50.0, blockedResponse.y);
        
        assertFalse(freeResponse.blocked);
        assertEquals(200.0, freeResponse.x); // Should return end position
        assertEquals(200.0, freeResponse.y);
    }
    
    @Test
    void testUpdateCollisions() {
        // Arrange
        Entity tree = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        Chunk chunk = new Chunk(0, 0, world.getConfig());
        chunk.addEntity(tree);
        world.getChunkCache().put("0_0", chunk);
        
        // Position player near the tree
        player.setX(110.0);
        player.setY(110.0);
        
        // Act
        List<Entity> playerCollisions = collisionSystem.updateCollisions(world, player);
        
        // Assert
        assertEquals(1, playerCollisions.size());
        assertEquals(tree, playerCollisions.get(0));
    }
    
    @Test
    void testGetCollisionPosition() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 200.0, 45.0, 32.0, true, 24.0, 24.0, null);
        
        // Act
        CollisionSystem.CollisionPosition pos = collisionSystem.getCollisionPosition(entity);
        
        // Assert
        assertEquals(100.0, pos.x, 0.001);
        assertEquals(200.0, pos.y, 0.001);
    }
    
    @Test
    void testCircularCollisionDetection() {
        // Arrange - Create entities with different collision sizes
        Entity smallEntity = new Entity("grass", 100.0, 100.0, 0.0, 16.0, true, 16.0, 16.0, null);
        Entity largeEntity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        // Small entity radius = 8, large entity radius = 16
        // Distance = 0, combined radius = 24, should collide
        assertTrue(collisionSystem.checkCollision(smallEntity, largeEntity));
        
        // Move large entity away
        largeEntity.setX(130.0); // Distance = 30, should not collide
        assertFalse(collisionSystem.checkCollision(smallEntity, largeEntity));
        
        // Move large entity closer but still not touching
        largeEntity.setX(125.0); // Distance = 25, should not collide
        assertFalse(collisionSystem.checkCollision(smallEntity, largeEntity));
        
        // Move large entity to just touching
        largeEntity.setX(124.0); // Distance = 24, should collide
        assertTrue(collisionSystem.checkCollision(smallEntity, largeEntity));
    }
    
    @Test
    void testNonCollidableEntities() {
        // Arrange
        Entity nonCollidable = new Entity("grass", 100.0, 100.0, 0.0, 32.0, false, 0.0, 0.0, null);
        Entity collidable = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        // Non-collidable entities should not collide with anything
        assertFalse(collisionSystem.checkCollision(nonCollidable, collidable));
        assertFalse(collisionSystem.checkCollision(collidable, nonCollidable));
        assertFalse(collisionSystem.checkCollision(nonCollidable, nonCollidable));
    }
    
    @Test
    void testNullEntityHandling() {
        // Arrange
        Entity entity = new Entity("tree", 100.0, 100.0, 0.0, 32.0, true, 32.0, 32.0, null);
        
        // Act & Assert
        assertFalse(collisionSystem.checkCollision(null, entity));
        assertFalse(collisionSystem.checkCollision(entity, null));
        assertFalse(collisionSystem.checkCollision(null, null));
    }
} 