package com.game.core;

import com.game.rendering.Camera;
import javafx.scene.Scene;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class InputManager {
    private static final Logger logger = LoggerFactory.getLogger(InputManager.class);
    
    private final Set<KeyCode> pressedKeys;
    private final Set<KeyCode> justPressedKeys;
    private double mouseX, mouseY;
    private double mouseWheelDelta;
    private boolean mousePressed;
    private Camera.CameraMode cameraMode = Camera.CameraMode.FIXED_ANGLE;
    
    public InputManager() {
        this.pressedKeys = ConcurrentHashMap.newKeySet();
        this.justPressedKeys = ConcurrentHashMap.newKeySet();
    }
    
    public void setupInputHandling(Scene scene) {
        // Keyboard events
        scene.setOnKeyPressed(this::handleKeyPressed);
        scene.setOnKeyReleased(this::handleKeyReleased);
        
        // Mouse events
        scene.setOnMouseMoved(this::handleMouseMoved);
        scene.setOnMousePressed(this::handleMousePressed);
        scene.setOnMouseReleased(this::handleMouseReleased);
        scene.setOnScroll(this::handleMouseScroll);
        
        logger.info("Input handling setup completed");
    }
    
    public void handleKeyPressed(KeyEvent event) {
        KeyCode keyCode = event.getCode();
        pressedKeys.add(keyCode);
        justPressedKeys.add(keyCode);
    }
    
    public void handleKeyReleased(KeyEvent event) {
        KeyCode keyCode = event.getCode();
        pressedKeys.remove(keyCode);
    }
    
    private void handleMouseMoved(MouseEvent event) {
        mouseX = event.getX();
        mouseY = event.getY();
    }
    
    private void handleMousePressed(MouseEvent event) {
        mousePressed = true;
    }
    
    private void handleMouseReleased(MouseEvent event) {
        mousePressed = false;
    }
    
    private void handleMouseScroll(javafx.scene.input.ScrollEvent event) {
        mouseWheelDelta = event.getDeltaY();
    }
    
    public void handleMouseScroll(double delta) {
        mouseWheelDelta = delta;
    }
    
    public boolean isKeyPressed(KeyCode keyCode) {
        return pressedKeys.contains(keyCode);
    }
    
    public boolean isKeyJustPressed(KeyCode keyCode) {
        return justPressedKeys.contains(keyCode);
    }
    
    public void update(double deltaTime) {
        // Reset mouse wheel delta
        mouseWheelDelta = 0;
    }
    
    public void clearJustPressedKeys() {
        // Clear just pressed keys - called after input handling
        justPressedKeys.clear();
    }
    
    public double getMouseX() { return mouseX; }
    public double getMouseY() { return mouseY; }
    public double getMouseWheelDelta() { return mouseWheelDelta; }
    public boolean isMousePressed() { return mousePressed; }
    
    public void setCameraMode(Camera.CameraMode mode) {
        this.cameraMode = mode;
    }
    
    public Camera.CameraMode getCameraMode() {
        return cameraMode;
    }
    
    public MovementInput getMovementInput() {
        MovementInput input;
        if (cameraMode == Camera.CameraMode.FIXED_ANGLE) {
            // Fixed-angle mode: WASD moves in fixed directions, arrow keys rotate camera
            input = new MovementInput(
                isKeyPressed(KeyCode.W),    // forward
                isKeyPressed(KeyCode.S),    // backward
                isKeyPressed(KeyCode.A),    // left
                isKeyPressed(KeyCode.D),    // right
                isKeyPressed(KeyCode.Q),    // strafeLeft
                isKeyPressed(KeyCode.E),    // strafeRight
                isKeyPressed(KeyCode.LEFT), // cameraLeft
                isKeyPressed(KeyCode.RIGHT) // cameraRight
            );
        } else {
            // Player-perspective mode: A/D rotates player, W/S moves forward/backward
            input = new MovementInput(
                isKeyPressed(KeyCode.W),    // forward
                isKeyPressed(KeyCode.S),    // backward
                isKeyPressed(KeyCode.A),    // left
                isKeyPressed(KeyCode.D),    // right
                isKeyPressed(KeyCode.Q),    // strafeLeft
                isKeyPressed(KeyCode.E),    // strafeRight
                false,                      // cameraLeft (not used in player-perspective)
                false                       // cameraRight (not used in player-perspective)
            );
        }
        
        // Debug: Log input state
        if (input.forward() || input.backward() || input.left() || input.right() || input.strafeLeft() || input.strafeRight()) {
            logger.debug("MovementInput: forward={}, backward={}, left={}, right={}, strafeLeft={}, strafeRight={}", 
                        input.forward(), input.backward(), input.left(), input.right(), input.strafeLeft(), input.strafeRight());
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
} 