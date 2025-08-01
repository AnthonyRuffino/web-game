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
} 