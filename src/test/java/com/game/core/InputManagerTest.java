package com.game.core;

import com.game.rendering.Camera;
import javafx.scene.Scene;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InputManagerTest {
    
    @Mock
    private Scene scene;
    
    @Mock
    private KeyEvent keyEvent;
    
    @Mock
    private MouseEvent mouseEvent;
    
    private InputManager inputManager;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        inputManager = new InputManager();
    }
    
    @Test
    void testInputManagerInitialization() {
        // Assert - Verify initial state
        assertEquals(Camera.CameraMode.FIXED_ANGLE, inputManager.getCameraMode());
        assertEquals(0.0, inputManager.getMouseX(), 0.001);
        assertEquals(0.0, inputManager.getMouseY(), 0.001);
        assertEquals(0.0, inputManager.getMouseWheelDelta(), 0.001);
        assertFalse(inputManager.isMousePressed());
    }
    
    @Test
    void testKeyPressedAndReleased() {
        // Arrange
        when(keyEvent.getCode()).thenReturn(KeyCode.W);
        
        // Act - Press W key
        inputManager.handleKeyPressed(keyEvent);
        
        // Assert - Key should be pressed
        assertTrue(inputManager.isKeyPressed(KeyCode.W));
        assertTrue(inputManager.isKeyJustPressed(KeyCode.W));
        
        // Act - Release W key
        inputManager.handleKeyReleased(keyEvent);
        
        // Assert - Key should not be pressed
        assertFalse(inputManager.isKeyPressed(KeyCode.W));
    }
    
    @Test
    void testMovementInputGeneration() {
        // Arrange - Press movement keys
        when(keyEvent.getCode()).thenReturn(KeyCode.W);
        inputManager.handleKeyPressed(keyEvent);
        
        when(keyEvent.getCode()).thenReturn(KeyCode.A);
        inputManager.handleKeyPressed(keyEvent);
        
        // Act - Get movement input
        var movementInput = inputManager.getMovementInput();
        
        // Assert - Should have forward and left movement
        assertTrue(movementInput.forward());
        assertTrue(movementInput.left());
        assertFalse(movementInput.backward());
        assertFalse(movementInput.right());
    }
    
    @Test
    void testMouseInput() {
        // Arrange
        when(mouseEvent.getX()).thenReturn(100.0);
        when(mouseEvent.getY()).thenReturn(200.0);
        
        // Act - Move mouse
        inputManager.handleMouseMoved(mouseEvent);
        
        // Assert - Mouse position should be updated
        assertEquals(100.0, inputManager.getMouseX(), 0.001);
        assertEquals(200.0, inputManager.getMouseY(), 0.001);
    }
    
    @Test
    void testMousePressAndRelease() {
        // Act - Press mouse
        inputManager.handleMousePressed(mouseEvent);
        
        // Assert - Mouse should be pressed
        assertTrue(inputManager.isMousePressed());
        
        // Act - Release mouse
        inputManager.handleMouseReleased(mouseEvent);
        
        // Assert - Mouse should not be pressed
        assertFalse(inputManager.isMousePressed());
    }
    
    @Test
    void testMouseScroll() {
        // Act - Scroll mouse
        inputManager.handleMouseScroll(50.0);
        
        // Assert - Mouse wheel delta should be updated
        assertEquals(50.0, inputManager.getMouseWheelDelta(), 0.001);
    }
    
    @Test
    void testCameraModeChange() {
        // Act - Change camera mode
        inputManager.setCameraMode(Camera.CameraMode.PLAYER_PERSPECTIVE);
        
        // Assert - Camera mode should be updated
        assertEquals(Camera.CameraMode.PLAYER_PERSPECTIVE, inputManager.getCameraMode());
    }
    
    @Test
    void testClearJustPressedKeys() {
        // Arrange - Press a key
        when(keyEvent.getCode()).thenReturn(KeyCode.W);
        inputManager.handleKeyPressed(keyEvent);
        
        // Verify key is just pressed
        assertTrue(inputManager.isKeyJustPressed(KeyCode.W));
        
        // Act - Clear just pressed keys
        inputManager.clearJustPressedKeys();
        
        // Assert - Key should still be pressed but not just pressed
        assertTrue(inputManager.isKeyPressed(KeyCode.W));
        assertFalse(inputManager.isKeyJustPressed(KeyCode.W));
    }
    
    @Test
    void testUpdateResetsMouseWheel() {
        // Arrange - Set mouse wheel delta
        inputManager.handleMouseScroll(50.0);
        assertEquals(50.0, inputManager.getMouseWheelDelta(), 0.001);
        
        // Act - Update input manager
        inputManager.update(1.0);
        
        // Assert - Mouse wheel delta should be reset
        assertEquals(0.0, inputManager.getMouseWheelDelta(), 0.001);
    }
} 