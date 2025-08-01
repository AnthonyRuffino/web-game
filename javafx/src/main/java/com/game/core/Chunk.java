package com.game.core;

import java.util.ArrayList;
import java.util.List;

public class Chunk {
    private final int chunkX, chunkY;
    private final WorldConfig config;
    private final List<Entity> entities;
    
    public Chunk(int chunkX, int chunkY, WorldConfig config) {
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this.config = config;
        this.entities = new ArrayList<>();
    }
    
    public void addEntity(Entity entity) {
        entities.add(entity);
    }
    
    public List<Entity> getEntities() {
        return entities;
    }
    
    public int getChunkX() { return chunkX; }
    public int getChunkY() { return chunkY; }
    public WorldConfig getConfig() { return config; }
} 