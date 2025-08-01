package com.game.core;

import com.game.persistence.DatabaseManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class World {
    private static final Logger logger = LoggerFactory.getLogger(World.class);
    
    private final DatabaseManager databaseManager;
    private final Map<String, Chunk> chunkCache;
    private final WorldConfig config;
    
    public World(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
        this.chunkCache = new ConcurrentHashMap<>();
        this.config = new WorldConfig();
        
        logger.info("World initialized with seed: {}", config.seed());
    }
    
    public Chunk loadChunk(int chunkX, int chunkY) {
        String chunkKey = getChunkKey(chunkX, chunkY);
        
        return chunkCache.computeIfAbsent(chunkKey, key -> {
            logger.debug("Loading chunk: ({}, {})", chunkX, chunkY);
            return generateChunk(chunkX, chunkY);
        });
    }
    
    private Chunk generateChunk(int chunkX, int chunkY) {
        Chunk chunk = new Chunk(chunkX, chunkY, config);
        
        // Generate chunk content based on seed and position
        for (int tileY = 0; tileY < config.chunkSize(); tileY++) {
            for (int tileX = 0; tileX < config.chunkSize(); tileX++) {
                generateTile(chunk, tileX, tileY);
            }
        }
        
        return chunk;
    }
    
    private void generateTile(Chunk chunk, int tileX, int tileY) {
        // Simple procedural generation based on position and seed
        int worldX = chunk.getChunkX() * config.chunkSize() + tileX;
        int worldY = chunk.getChunkY() * config.chunkSize() + tileY;
        
        // Use simple hash for deterministic generation
        int hash = simpleHash(worldX + "_" + worldY + "_" + config.seed());
        double random = (hash % 1000) / 1000.0;
        
        // Place entities based on probability
        if (random < 0.01) {
            chunk.addEntity(new Entity("grass", worldX * config.tileSize(), worldY * config.tileSize()));
        } else if (random < 0.025) {
            chunk.addEntity(new Entity("tree", worldX * config.tileSize(), worldY * config.tileSize()));
        } else if (random < 0.04) {
            chunk.addEntity(new Entity("rock", worldX * config.tileSize(), worldY * config.tileSize()));
        }
    }
    
    private String getChunkKey(int chunkX, int chunkY) {
        return chunkX + "_" + chunkY;
    }
    
    private int simpleHash(String input) {
        int hash = 0;
        for (char c : input.toCharArray()) {
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    public WorldConfig getConfig() {
        return config;
    }
    
    public Map<String, Chunk> getChunkCache() {
        return chunkCache;
    }
} 