package com.game.core;

public record WorldConfig(
    int seed,
    int chunkSize,
    int tileSize,
    int chunkCount,
    double biomePlainsFraction
) {
    public WorldConfig() {
        this(12345, 64, 32, 64, 0.5);
    }
    
    public WorldConfig withSeed(int seed) {
        return new WorldConfig(seed, chunkSize, tileSize, chunkCount, biomePlainsFraction);
    }
    
    /**
     * Get the world size in pixels (precomputed)
     * @return The world size in pixels
     */
    public double worldSize() {
        return chunkCount * chunkSize * tileSize;
    }
} 