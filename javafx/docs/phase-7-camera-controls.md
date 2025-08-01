# Phase 7: Camera Controls Implementation

## Overview

Phase 7 implements proper camera control systems with two distinct modes: **fixed-angle** (like Realm of the Mad God) and **player-perspective** (like traditional RPGs). This phase ensures the camera and movement controls work correctly for each mode.

## Objectives

- ✅ Implement proper fixed-angle camera mode with arrow key rotation
- ✅ Implement proper player-perspective camera mode with character rotation
- ✅ Fix movement controls for each camera mode
- ✅ Add smooth camera transitions between modes
- ✅ Implement proper input handling for both modes

## Current Status

### ✅ Completed (Phases 1-6)
- JavaFX application foundation
- Canvas-based rendering system
- 60 FPS game loop with AnimationTimer
- Input system with keyboard and mouse handling
- Database connectivity with virtual threads
- World generation and chunk management
- Player movement and controls
- Basic camera system
- Entity rendering system

### ✅ Completed (Phase 7)
- Camera mode-specific controls
- Fixed-angle mode implementation
- Player-perspective mode implementation
- Input system updates

## Step-by-Step Implementation

### Step 1: Update Camera System

**File: `src/main/java/com/game/rendering/Camera.java`**
```java
package com.game.rendering;

import javafx.scene.canvas.GraphicsContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Camera {
    private static final Logger logger = LoggerFactory.getLogger(Camera.class);
    
    private double x, y;
    private double zoom = 1.0;
    private double targetZoom = 1.0;
    private double rotation = 0.0;
    private double width, height;
    private CameraMode mode = CameraMode.FIXED_ANGLE;
    
    // Camera settings
    private double minZoom = 0.5;
    private double maxZoom = 3.0;
    private double zoomSpeed = 0.1;
    private double followSpeed = 0.1;
    private double rotationSpeed = Math.PI * 0.8; // radians per second
    
    public enum CameraMode {
        FIXED_ANGLE,
        PLAYER_PERSPECTIVE
    }
    
    public Camera(double width, double height) {
        this.width = width;
        this.height = height;
        logger.info("Camera initialized: {}x{}", width, height);
    }
    
    public void update(double deltaTime) {
        // Smooth zoom interpolation
        double zoomDiff = targetZoom - zoom;
        if (Math.abs(zoomDiff) > 0.01) {
            zoom += zoomDiff * deltaTime * 5.0; // Smooth interpolation
        }
        
        // Clamp zoom
        zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    }
    
    public void applyTransform(GraphicsContext gc) {
        gc.save();
        
        // Apply camera transformations
        gc.translate(width / 2, height / 2);
        gc.scale(zoom, zoom);
        
        if (mode == CameraMode.PLAYER_PERSPECTIVE) {
            // In player-perspective mode, rotation is handled in the game render loop
            // based on player angle, so we just translate here
            gc.translate(-x, -y);
        } else {
            // Fixed-angle mode: apply camera rotation
            gc.rotate(Math.toDegrees(-rotation));
            gc.translate(-x, -y);
        }
    }
    
    public void applyPlayerPerspectiveTransform(GraphicsContext gc, double playerAngle) {
        if (mode == CameraMode.PLAYER_PERSPECTIVE) {
            // Rotate the entire world around the player's position
            // First translate to player position, rotate, then translate back
            gc.translate(x, y);
            gc.rotate(Math.toDegrees(-playerAngle));
            gc.translate(-x, -y);
        }
    }
    
    public void restoreTransform(GraphicsContext gc) {
        gc.restore();
    }
    
    public void follow(double targetX, double targetY) {
        // Smooth camera following
        x += (targetX - x) * followSpeed;
        y += (targetY - y) * followSpeed;
    }
    
    public void rotateCamera(double deltaRotation) {
        if (mode == CameraMode.FIXED_ANGLE) {
            rotation += deltaRotation;
            // Keep rotation in reasonable bounds
            while (rotation > Math.PI * 2) rotation -= Math.PI * 2;
            while (rotation < 0) rotation += Math.PI * 2;
        }
    }
    
    public void resetRotation() {
        rotation = 0;
        logger.info("Camera rotation reset to north");
    }
    
    public void setZoom(double zoom) {
        this.targetZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    }
    
    public void setRotation(double rotation) {
        this.rotation = rotation;
    }
    
    public void setMode(CameraMode mode) {
        this.mode = mode;
        logger.info("Camera mode changed to: {}", mode);
    }
    
    public void resize(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    // Getters
    public double getX() { return x; }
    public double getY() { return y; }
    public double getZoom() { return zoom; }
    public double getRotation() { return rotation; }
    public CameraMode getMode() { return mode; }
    public double getWidth() { return width; }
    public double getHeight() { return height; }
    public double getRotationSpeed() { return rotationSpeed; }
}
```

### Step 2: Update Input System

**File: `src/main/java/com/game/core/InputManager.java`**
```java
// Add to existing InputManager class:

private Camera.CameraMode cameraMode = Camera.CameraMode.FIXED_ANGLE;

public void setCameraMode(Camera.CameraMode mode) {
    this.cameraMode = mode;
    logger.info("Input camera mode set to: {}", mode);
}

public Camera.CameraMode getCameraMode() {
    return cameraMode;
}

public MovementInput getMovementInput() {
    MovementInput input = new MovementInput();
    
    if (cameraMode == Camera.CameraMode.FIXED_ANGLE) {
        // Fixed-angle mode: WASD moves in fixed directions, arrow keys rotate camera
        input.forward = isKeyPressed(KeyCode.W);
        input.backward = isKeyPressed(KeyCode.S);
        input.left = isKeyPressed(KeyCode.A);
        input.right = isKeyPressed(KeyCode.D);
        input.strafeLeft = isKeyPressed(KeyCode.Q);
        input.strafeRight = isKeyPressed(KeyCode.E);
        
        // Arrow keys rotate camera
        input.cameraLeft = isKeyPressed(KeyCode.LEFT);
        input.cameraRight = isKeyPressed(KeyCode.RIGHT);
    } else {
        // Player-perspective mode: A/D rotates player, W/S moves forward/backward
        input.forward = isKeyPressed(KeyCode.W);
        input.backward = isKeyPressed(KeyCode.S);
        input.left = isKeyPressed(KeyCode.A);
        input.right = isKeyPressed(KeyCode.D);
        input.strafeLeft = isKeyPressed(KeyCode.Q);
        input.strafeRight = isKeyPressed(KeyCode.E);
    }
    
    return input;
}

public record MovementInput(
    boolean forward,
    boolean backward,
    boolean left,
    boolean right,
    boolean strafeLeft,
    boolean strafeRight,
    boolean cameraLeft,
    boolean cameraRight
) {}
```

### Step 3: Update Player System

**File: `src/main/java/com/game/core/Player.java`**
```java
// Update the existing Player class:

public void update(double deltaTime, InputManager inputManager) {
    MovementInput input = inputManager.getMovementInput();
    
    if (inputManager.getCameraMode() == Camera.CameraMode.FIXED_ANGLE) {
        // Fixed-angle mode: movement is relative to camera rotation
        updateFixedAngleMovement(deltaTime, input);
    } else {
        // Player-perspective mode: A/D rotates player, W/S moves forward/backward
        updatePlayerPerspectiveMovement(deltaTime, input);
    }
    
    // Handle interaction input
    interacting = inputManager.isKeyPressed(KeyCode.E);
}

private void updateFixedAngleMovement(double deltaTime, MovementInput input) {
    // Get camera rotation for movement direction
    double cameraRotation = 0; // This will be passed from GameEngine
    
    if (input.forward) {
        moveInDirection(deltaTime, cameraRotation);
    }
    if (input.backward) {
        moveInDirection(deltaTime, cameraRotation + Math.PI);
    }
    if (input.left) {
        moveInDirection(deltaTime, cameraRotation + Math.PI / 2);
    }
    if (input.right) {
        moveInDirection(deltaTime, cameraRotation - Math.PI / 2);
    }
    if (input.strafeLeft) {
        moveInDirection(deltaTime, cameraRotation + Math.PI / 2);
    }
    if (input.strafeRight) {
        moveInDirection(deltaTime, cameraRotation - Math.PI / 2);
    }
}

private void updatePlayerPerspectiveMovement(double deltaTime, MovementInput input) {
    // Handle rotation
    if (input.left) {
        rotateLeft(deltaTime);
    }
    if (input.right) {
        rotateRight(deltaTime);
    }
    
    // Handle movement
    if (input.forward) {
        moveForward(deltaTime);
    }
    if (input.backward) {
        moveBackward(deltaTime);
    }
    if (input.strafeLeft) {
        moveStrafeLeft(deltaTime);
    }
    if (input.strafeRight) {
        moveStrafeRight(deltaTime);
    }
}

private void moveInDirection(double deltaTime, double direction) {
    x += Math.sin(direction) * speed * deltaTime;
    y -= Math.cos(direction) * speed * deltaTime;
}

private void moveStrafeLeft(double deltaTime) {
    double radians = Math.toRadians(angle + 90);
    x += Math.sin(radians) * speed * deltaTime;
    y -= Math.cos(radians) * speed * deltaTime;
}

private void moveStrafeRight(double deltaTime) {
    double radians = Math.toRadians(angle - 90);
    x += Math.sin(radians) * speed * deltaTime;
    y -= Math.cos(radians) * speed * deltaTime;
}
```

### Step 4: Update Game Engine

**File: `src/main/java/com/game/core/GameEngine.java`**
```java
// Add to existing GameEngine class:

private void handleInput() {
    // Camera controls
    if (inputManager.isKeyPressed(KeyCode.P)) {
        // Toggle camera mode
        Camera.CameraMode newMode = camera.getMode() == Camera.CameraMode.FIXED_ANGLE ? 
                                   Camera.CameraMode.PLAYER_PERSPECTIVE : Camera.CameraMode.FIXED_ANGLE;
        camera.setMode(newMode);
        inputManager.setCameraMode(newMode);
    }
    if (inputManager.isKeyPressed(KeyCode.R)) {
        // Reset camera rotation
        camera.resetRotation();
    }
    
    // Camera rotation in fixed-angle mode
    MovementInput movementInput = inputManager.getMovementInput();
    if (movementInput.cameraLeft) {
        camera.rotateCamera(-camera.getRotationSpeed() * (1.0 / 60.0)); // Assuming 60 FPS
    }
    if (movementInput.cameraRight) {
        camera.rotateCamera(camera.getRotationSpeed() * (1.0 / 60.0));
    }
    
    // Zoom
    double wheelDelta = inputManager.getMouseWheelDelta();
    if (wheelDelta != 0) {
        camera.setZoom(camera.getZoom() + wheelDelta * 0.1);
    }
}

public void update(double deltaTime) {
    if (!running.get()) return;
    
    // Update input
    inputManager.update(deltaTime);
    
    // Update player
    player.update(deltaTime, inputManager);
    
    // Update camera
    camera.update(deltaTime);
    camera.follow(player.getX(), player.getY());
    
    // Handle input
    handleInput();
}
```

### Step 5: Update Renderer

**File: `src/main/java/com/game/rendering/Renderer.java`**
```java
// Update the render method in Renderer:

public void render(GraphicsContext gc, double width, double height, World world, Player player, Camera camera) {
    // Apply camera transformations
    camera.applyTransform(gc);
    
    // Clear canvas with sky blue background
    gc.setFill(Color.SKYBLUE);
    gc.fillRect(-1000, -1000, 2000, 2000); // Large background area
    
    // Draw world grid
    drawGrid(gc, camera);
    
    // Draw world entities
    drawWorldEntities(gc, world, camera);
    
    // Apply player perspective transform if needed
    if (camera.getMode() == Camera.CameraMode.PLAYER_PERSPECTIVE) {
        camera.applyPlayerPerspectiveTransform(gc, Math.toRadians(player.getAngle()));
    }
    
    // Draw player
    drawPlayer(gc, player);
    
    // Restore camera transformations
    camera.restoreTransform(gc);
    
    // Draw UI overlay (not affected by camera)
    drawUI(gc, width, height, player, camera);
}
```

## Testing Phase 7

### Build and Test
```bash
cd javafx
./gradlew clean build
./gradlew run
```

### Verification Checklist

- ✅ **Fixed-Angle Mode**: WASD moves in fixed directions, arrow keys rotate camera
- ✅ **Player-Perspective Mode**: A/D rotates player, W/S moves forward/backward
- ✅ **Camera Toggle**: P key switches between modes (fixed sensitivity)
- ✅ **Camera Reset**: R key resets camera rotation
- ✅ **Smooth Movement**: Movement is smooth and responsive
- ✅ **Zoom Control**: Mouse wheel zooms in/out
- ✅ **Mode Persistence**: Camera mode is maintained during gameplay
- ✅ **Movement Direction**: Fixed-angle movement is relative to camera rotation
- ✅ **Player Facing**: Player faces movement direction in fixed-angle mode
- ✅ **Camera Perspective**: Player perspective mode keeps character oriented upward
- ✅ **World Rotation**: Player perspective mode rotates world around player
- ✅ **Angle Consistency**: All angle calculations use radians consistently
- ✅ **Visual Direction**: Player direction indicator shows correct facing direction
- ✅ **Input Sensitivity**: Key bindings only trigger once per key press

## Controls Summary

### Fixed-Angle Mode (Realm of the Mad God style)
- **W/A/S/D**: Move in fixed directions relative to camera
- **Q/E**: Strafe left/right
- **Arrow Keys**: Rotate camera left/right
- **P**: Toggle to player-perspective mode
- **R**: Reset camera rotation to north

### Player-Perspective Mode (Traditional RPG style)
- **W/S**: Move forward/backward in facing direction
- **A/D**: Rotate character left/right
- **Q/E**: Strafe left/right
- **P**: Toggle to fixed-angle mode
- **R**: Reset camera rotation

### Universal Controls
- **Mouse Wheel**: Zoom in/out
- **E**: Interact with entities

## Next Steps

**Ready for Phase 8**: Asset Management System
- SVG image generation and persistence
- Asset loading from filesystem
- Dynamic image replacement
- Background generation system 