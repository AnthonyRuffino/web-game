package com.game.core;

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
        
        logger.info("Key pressed: {}", keyCode);
    }
    
    public void handleKeyReleased(KeyEvent event) {
        KeyCode keyCode = event.getCode();
        pressedKeys.remove(keyCode);
        
        logger.info("Key released: {}", keyCode);
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
    
    public boolean isKeyPressed(KeyCode keyCode) {
        return pressedKeys.contains(keyCode);
    }
    
    public boolean isKeyJustPressed(KeyCode keyCode) {
        return justPressedKeys.contains(keyCode);
    }
    
    public void update(double deltaTime) {
        // Clear just pressed keys
        justPressedKeys.clear();
        
        // Reset mouse wheel delta
        mouseWheelDelta = 0;
    }
    
    public double getMouseX() { return mouseX; }
    public double getMouseY() { return mouseY; }
    public double getMouseWheelDelta() { return mouseWheelDelta; }
    public boolean isMousePressed() { return mousePressed; }
} 