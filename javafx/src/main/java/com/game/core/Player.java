package com.game.core;

import com.game.rendering.Camera;
import javafx.scene.input.KeyCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.game.core.InputManager.MovementInput;

public class Player {
    private static final Logger logger = LoggerFactory.getLogger(Player.class);
    
    private double x, y;
    private double angle;
    private double speed = 200.0; // pixels per second
    private double rotationSpeed = 360.0; // degrees per second (doubled for faster response)
    private double size = 20.0;
    private boolean interacting = false;
    
    public Player(double startX, double startY) {
        this.x = startX;
        this.y = startY;
        this.angle = 0.0;
    }
    
    public void update(double deltaTime, InputManager inputManager, Camera camera) {
        MovementInput input = inputManager.getMovementInput();
        
        if (inputManager.getCameraMode() == Camera.CameraMode.FIXED_ANGLE) {
            // Fixed-angle mode: movement is relative to camera rotation
            updateFixedAngleMovement(deltaTime, input, camera.getRotation());
        } else {
            // Player-perspective mode: A/D rotates player, W/S moves forward/backward
            updatePlayerPerspectiveMovement(deltaTime, input);
        }
        
        // Handle interaction input
        interacting = inputManager.isKeyPressed(KeyCode.E);
    }
    
    private void updateFixedAngleMovement(double deltaTime, MovementInput input, double cameraRotation) {
        // Fixed-angle mode: WASD moves in fixed directions, arrow keys rotate camera
        double moveX = 0;
        double moveY = 0;

        // Movement relative to camera rotation (based on JavaScript implementation)
        if (input.forward()) {
            moveX += Math.sin(cameraRotation);
            moveY -= Math.cos(cameraRotation);
        }
        if (input.backward()) {
            moveX -= Math.sin(cameraRotation);
            moveY += Math.cos(cameraRotation);
        }
        if (input.left()) {
            moveX -= Math.cos(cameraRotation);
            moveY -= Math.sin(cameraRotation);
        }
        if (input.right()) {
            moveX += Math.cos(cameraRotation);
            moveY += Math.sin(cameraRotation);
        }
        if (input.strafeLeft()) {
            moveX -= Math.cos(cameraRotation);
            moveY -= Math.sin(cameraRotation);
        }
        if (input.strafeRight()) {
            moveX += Math.cos(cameraRotation);
            moveY += Math.sin(cameraRotation);
        }

        // Debug: Log input state
        if (input.forward() || input.backward() || input.left() || input.right() || input.strafeLeft() || input.strafeRight()) {
            logger.debug("Input: forward={}, backward={}, left={}, right={}, strafeLeft={}, strafeRight={}, moveX={}, moveY={}", 
                        input.forward(), input.backward(), input.left(), input.right(), input.strafeLeft(), input.strafeRight(), moveX, moveY);
        }



        // Normalize movement vector to ensure consistent speed
        double magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        if (magnitude > 0) {
            moveX /= magnitude;
            moveY /= magnitude;
        }

        // Calculate new position
        double newX = x + moveX * speed * deltaTime;
        double newY = y + moveY * speed * deltaTime;

        // Update position
        x = newX;
        y = newY;

        // Update player angle based on movement direction (player faces movement direction)
        if (magnitude > 0) {
            // Convert movement direction to angle (0 = north, π/2 = east, π = south, -π/2 = west)
            angle = Math.atan2(moveX, -moveY);
        }
    }
    
    private void updatePlayerPerspectiveMovement(double deltaTime, MovementInput input) {
        // Handle rotation
        if (input.left()) {
            rotateLeft(deltaTime);
        }
        if (input.right()) {
            rotateRight(deltaTime);
        }
        
        // Handle movement - combine all movement inputs for proper diagonal movement
        double moveX = 0;
        double moveY = 0;
        
        if (input.forward()) {
            moveX += Math.sin(angle);
            moveY -= Math.cos(angle);
        }
        if (input.backward()) {
            moveX -= Math.sin(angle);
            moveY += Math.cos(angle);
        }
        if (input.strafeLeft()) {
            moveX += Math.sin(angle - Math.PI / 2); // 90 degrees to the right (Q key)
            moveY -= Math.cos(angle - Math.PI / 2);
        }
        if (input.strafeRight()) {
            moveX += Math.sin(angle + Math.PI / 2); // 90 degrees to the left (E key)
            moveY -= Math.cos(angle + Math.PI / 2);
        }
        
        // Normalize movement vector to ensure consistent speed
        double magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        if (magnitude > 0) {
            moveX /= magnitude;
            moveY /= magnitude;
            
            // Apply movement
            x += moveX * speed * deltaTime;
            y += moveY * speed * deltaTime;
        }
    }
    
    private void moveInDirection(double deltaTime, double direction) {
        x += Math.sin(direction) * speed * deltaTime;
        y -= Math.cos(direction) * speed * deltaTime;
    }
    
    private void moveStrafeLeft(double deltaTime) {
        double radians = angle + Math.PI / 2; // 90 degrees in radians
        x += Math.sin(radians) * speed * deltaTime;
        y -= Math.cos(radians) * speed * deltaTime;
    }
    
    private void moveStrafeRight(double deltaTime) {
        double radians = angle - Math.PI / 2; // -90 degrees in radians
        x += Math.sin(radians) * speed * deltaTime;
        y -= Math.cos(radians) * speed * deltaTime;
    }
    
    private void moveForward(double deltaTime) {
        x += Math.sin(angle) * speed * deltaTime;
        y -= Math.cos(angle) * speed * deltaTime;
    }
    
    private void moveBackward(double deltaTime) {
        x -= Math.sin(angle) * speed * deltaTime;
        y += Math.cos(angle) * speed * deltaTime;
    }
    
    private void rotateLeft(double deltaTime) {
        double rotationAmount = Math.toRadians(rotationSpeed * deltaTime);
        angle -= rotationAmount;
    }
    
    private void rotateRight(double deltaTime) {
        double rotationAmount = Math.toRadians(rotationSpeed * deltaTime);
        angle += rotationAmount;
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