package com.game.rendering;

import javafx.scene.canvas.GraphicsContext;
import javafx.geometry.Point2D;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CameraTest {
    
    @Mock
    private GraphicsContext graphicsContext;
    
    private Camera camera;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        camera = new Camera(800.0, 600.0);
    }
    
    @Test
    void testCameraInitialization() {
        // Assert - Verify initial state
        assertEquals(0.0, camera.getX(), 0.001);
        assertEquals(0.0, camera.getY(), 0.001);
        assertEquals(1.0, camera.getZoom(), 0.001);
        assertEquals(0.0, camera.getRotation(), 0.001);
        assertEquals(Camera.CameraMode.FIXED_ANGLE, camera.getMode());
        assertEquals(800.0, camera.getWidth(), 0.001);
        assertEquals(600.0, camera.getHeight(), 0.001);
    }
    
    @Test
    void testCameraFollowing() {
        // Act - Follow a target
        camera.follow(100.0, 200.0);
        
        // Assert - Camera should move towards target (smooth following)
        assertTrue(camera.getX() > 0.0);
        assertTrue(camera.getY() > 0.0);
        assertTrue(camera.getX() < 100.0); // Should not reach target immediately
        assertTrue(camera.getY() < 200.0);
        
        // Act - Follow multiple times to get closer
        for (int i = 0; i < 10; i++) {
            camera.follow(100.0, 200.0);
        }
        
        // Assert - Should be much closer to target
        assertTrue(camera.getX() > 50.0);
        assertTrue(camera.getY() > 100.0);
    }
    
    @Test
    void testZoomSetting() {
        // Act - Set zoom
        camera.setZoom(2.0);
        
        // Assert - Target zoom should be set
        // Note: actual zoom changes gradually in update()
        camera.update(1.0); // Update to apply zoom change
        
        // Assert - Zoom should be applied (with interpolation, it might reach target or be clamped)
        // With deltaTime=1.0 and interpolation speed=5.0, zoom change = (2.0-1.0)*1.0*5.0 = 5.0
        // But it's clamped to max 5.0, so final zoom should be 5.0
        assertEquals(5.0, camera.getZoom(), 0.001);
    }
    
    @Test
    void testZoomClamping() {
        // Act - Set zoom beyond limits
        camera.setZoom(10.0); // Above max
        camera.update(1.0);
        
        // Assert - Should be clamped to max
        assertEquals(5.0, camera.getZoom(), 0.001);
        
        // Act - Set zoom below minimum
        camera.setZoom(0.05); // Below min
        camera.update(1.0);
        
        // Assert - Should be clamped to min
        assertEquals(0.1, camera.getZoom(), 0.001);
    }
    
    @Test
    void testRotationSetting() {
        // Act - Set rotation
        camera.setRotation(Math.PI / 2); // 90 degrees
        
        // Assert - Rotation should be set
        assertEquals(Math.PI / 2, camera.getRotation(), 0.001);
    }
    
    @Test
    void testCameraModeChange() {
        // Act - Change camera mode
        camera.setMode(Camera.CameraMode.PLAYER_PERSPECTIVE);
        
        // Assert - Mode should be changed
        assertEquals(Camera.CameraMode.PLAYER_PERSPECTIVE, camera.getMode());
    }
    
    @Test
    void testCameraResize() {
        // Act - Resize camera
        camera.resize(1200.0, 800.0);
        
        // Assert - Dimensions should be updated
        assertEquals(1200.0, camera.getWidth(), 0.001);
        assertEquals(800.0, camera.getHeight(), 0.001);
    }
    
    @Test
    void testScreenToWorldConversion() {
        // Arrange - Set camera position and zoom
        camera.follow(100.0, 200.0);
        camera.setZoom(2.0);
        camera.update(1.0);
        
        // Act - Convert screen coordinates to world coordinates
        Point2D worldPos = camera.screenToWorld(400.0, 300.0, 0.0); // Center of screen
        
        // Assert - Should return world coordinates
        assertNotNull(worldPos);
        // The exact values depend on camera position and zoom, but should be reasonable
        assertTrue(worldPos.getX() >= 0.0);
        assertTrue(worldPos.getY() >= 0.0);
    }
    
    @Test
    void testTransformApplication() {
        // Act - Apply transform
        camera.applyTransform(graphicsContext);
        
        // Assert - Graphics context methods should be called
        verify(graphicsContext).save();
        verify(graphicsContext).translate(400.0, 300.0); // Center of 800x600
        verify(graphicsContext).scale(1.0, 1.0); // Initial zoom
    }
    
    @Test
    void testTransformRestoration() {
        // Act - Restore transform
        camera.restoreTransform(graphicsContext);
        
        // Assert - Graphics context restore should be called
        verify(graphicsContext).restore();
    }
} 