package com.game.core;

import javafx.scene.input.KeyCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Player {
    private static final Logger logger = LoggerFactory.getLogger(Player.class);
    
    private double x, y;
    private double angle;
    private double speed = 200.0; // pixels per second
    private double rotationSpeed = 180.0; // degrees per second
    private double size = 20.0;
    private boolean interacting = false;
    
    public Player(double startX, double startY) {
        this.x = startX;
        this.y = startY;
        this.angle = 0.0;
    }
    
    public void update(double deltaTime, InputManager inputManager) {
        // Handle movement input
        if (inputManager.isKeyPressed(KeyCode.W)) {
            moveForward(deltaTime);
            logger.debug("Moving forward");
        }
        if (inputManager.isKeyPressed(KeyCode.S)) {
            moveBackward(deltaTime);
            logger.debug("Moving backward");
        }
        if (inputManager.isKeyPressed(KeyCode.A)) {
            rotateLeft(deltaTime);
            logger.debug("Rotating left");
        }
        if (inputManager.isKeyPressed(KeyCode.D)) {
            rotateRight(deltaTime);
            logger.debug("Rotating right");
        }
        
        // Handle interaction input
        interacting = inputManager.isKeyPressed(KeyCode.E);
    }
    
    private void moveForward(double deltaTime) {
        double radians = Math.toRadians(angle);
        x += Math.sin(radians) * speed * deltaTime;
        y -= Math.cos(radians) * speed * deltaTime;
    }
    
    private void moveBackward(double deltaTime) {
        double radians = Math.toRadians(angle);
        x -= Math.sin(radians) * speed * deltaTime;
        y += Math.cos(radians) * speed * deltaTime;
    }
    
    private void rotateLeft(double deltaTime) {
        angle -= rotationSpeed * deltaTime;
    }
    
    private void rotateRight(double deltaTime) {
        angle += rotationSpeed * deltaTime;
    }
    
    // Getters
    public double getX() { return x; }
    public double getY() { return y; }
    public double getAngle() { return angle; }
    public double getSize() { return size; }
    public boolean isInteracting() { return interacting; }
    
    // Setters
    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public void setAngle(double angle) { this.angle = angle; }
} 