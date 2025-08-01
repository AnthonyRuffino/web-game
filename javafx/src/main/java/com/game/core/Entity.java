package com.game.core;

public record Entity(
    String type,
    double x,
    double y,
    double angle,
    double size,
    boolean collision
) {
    public Entity(String type, double x, double y) {
        this(type, x, y, 0.0, 32.0, true);
    }
    
    public Entity(String type, double x, double y, double angle) {
        this(type, x, y, angle, 32.0, true);
    }
} 