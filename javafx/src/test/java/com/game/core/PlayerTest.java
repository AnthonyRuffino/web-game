package com.game.core;

import com.game.rendering.Camera;
import com.game.core.InputManager.MovementInput;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PlayerTest {
    
    @Mock
    private InputManager inputManager;
    
    @Mock
    private Camera camera;
    
    private Player player;
    private WorldConfig worldConfig;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Create world config for testing
        worldConfig = new WorldConfig(12345, 64, 32, 64, 0.5);
        
        // Create player at origin
        player = new Player(0, 0, worldConfig);
    }
    
    @Test
    void testPlayerInitialization() {
        // Assert - Verify initial state
        assertEquals(0.0, player.getX(), 0.001);
        assertEquals(0.0, player.getY(), 0.001);
        assertEquals(0.0, player.getAngle(), 0.001);
        assertEquals(20.0, player.getSize(), 0.001);
        assertFalse(player.isInteracting());
    }
    
    @Test
    void testPlayerMovementWithFixedAngleMode() {
        // Arrange - Set up fixed angle mode
        when(inputManager.getCameraMode()).thenReturn(Camera.CameraMode.FIXED_ANGLE);
        when(camera.getRotation()).thenReturn(0.0); // Camera facing north
        
        // Create movement input for forward movement
        MovementInput forwardInput = new MovementInput(true, false, false, false, false, false, false, false);
        when(inputManager.getMovementInput()).thenReturn(forwardInput);
        when(inputManager.isKeyPressed(any())).thenReturn(false);
        
        // Act - Update player for 1 second
        player.update(1.0, inputManager, camera);
        
        // Assert - Player should move north (negative Y direction, but wrapped due to world bounds)
        assertEquals(0.0, player.getX(), 0.001);
        // World size is 64*64*32 = 131072, so -200 wraps to 131072-200 = 130872
        assertEquals(130872.0, player.getY(), 0.001);
    }
    
    @Test
    void testPlayerMovementWithPlayerPerspectiveMode() {
        // Arrange - Set up player perspective mode
        when(inputManager.getCameraMode()).thenReturn(Camera.CameraMode.PLAYER_PERSPECTIVE);
        
        // Create movement input for forward movement
        MovementInput forwardInput = new MovementInput(true, false, false, false, false, false, false, false);
        when(inputManager.getMovementInput()).thenReturn(forwardInput);
        when(inputManager.isKeyPressed(any())).thenReturn(false);
        
        // Act - Update player for 1 second
        player.update(1.0, inputManager, camera);
        
        // Assert - Player should move forward in current direction (wrapped due to world bounds)
        assertEquals(0.0, player.getX(), 0.001);
        // World size is 64*64*32 = 131072, so -200 wraps to 131072-200 = 130872
        assertEquals(130872.0, player.getY(), 0.001);
    }
    
    @Test
    void testPlayerInteraction() {
        // Arrange - Set up interaction key press
        when(inputManager.getCameraMode()).thenReturn(Camera.CameraMode.FIXED_ANGLE);
        when(inputManager.getMovementInput()).thenReturn(new MovementInput(false, false, false, false, false, false, false, false));
        when(inputManager.isKeyPressed(any())).thenReturn(true); // E key pressed
        
        // Act - Update player
        player.update(1.0, inputManager, camera);
        
        // Assert - Player should be interacting
        assertTrue(player.isInteracting());
    }
    
    @Test
    void testPlayerPositionSetters() {
        // Act - Set new position and angle
        player.setX(100.0);
        player.setY(200.0);
        player.setAngle(45.0);
        
        // Assert - Verify new values
        assertEquals(100.0, player.getX(), 0.001);
        assertEquals(200.0, player.getY(), 0.001);
        assertEquals(45.0, player.getAngle(), 0.001);
    }
} 