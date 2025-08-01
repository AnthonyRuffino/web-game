package com.game.rendering;

import com.game.core.World;
import com.game.core.Player;
import com.game.core.Entity;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class Renderer {
    private static final Logger logger = LoggerFactory.getLogger(Renderer.class);
    
    public void render(GraphicsContext gc, double width, double height, World world, Player player, Camera camera) {
        // Apply camera transformations
        camera.applyTransform(gc);
        
        // Clear canvas with sky blue background
        gc.setFill(Color.SKYBLUE);
        gc.fillRect(-1000, -1000, 2000, 2000); // Large background area
        
        // Apply player perspective transform if needed (BEFORE rendering world content)
        if (camera.getMode() == Camera.CameraMode.PLAYER_PERSPECTIVE) {
            camera.applyPlayerPerspectiveTransform(gc, player.getAngle());
        }
        
        // Draw world grid
        drawGrid(gc, camera);
        
        // Draw world entities
        drawWorldEntities(gc, world, camera);
        
        // Draw player
        drawPlayer(gc, player, camera);
        
        // Restore camera transformations
        camera.restoreTransform(gc);
        
        // Draw UI overlay (not affected by camera)
        drawUI(gc, width, height, player, camera);
    }
    
    private void drawGrid(GraphicsContext gc, Camera camera) {
        gc.setStroke(Color.LIGHTGRAY);
        gc.setLineWidth(1);
        
        int tileSize = 32;
        double cameraX = camera.getX();
        double cameraY = camera.getY();
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        // Calculate grid bounds
        int startX = (int) ((cameraX - viewWidth / 2) / tileSize) * tileSize;
        int endX = (int) ((cameraX + viewWidth / 2) / tileSize) * tileSize;
        int startY = (int) ((cameraY - viewHeight / 2) / tileSize) * tileSize;
        int endY = (int) ((cameraY + viewHeight / 2) / tileSize) * tileSize;
        
        // Draw vertical lines
        for (int x = startX; x <= endX; x += tileSize) {
            gc.strokeLine(x, startY, x, endY);
        }
        
        // Draw horizontal lines
        for (int y = startY; y <= endY; y += tileSize) {
            gc.strokeLine(startX, y, endX, y);
        }
    }
    
    private void drawWorldEntities(GraphicsContext gc, World world, Camera camera) {
        // Get visible chunks based on camera position
        double cameraX = camera.getX();
        double cameraY = camera.getY();
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        int chunkSize = world.getConfig().chunkSize() * world.getConfig().tileSize();
        int startChunkX = (int) ((cameraX - viewWidth / 2) / chunkSize);
        int endChunkX = (int) ((cameraX + viewWidth / 2) / chunkSize);
        int startChunkY = (int) ((cameraY - viewHeight / 2) / chunkSize);
        int endChunkY = (int) ((cameraY + viewHeight / 2) / chunkSize);
        
        // Load and render visible chunks
        for (int chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
            for (int chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
                var chunk = world.loadChunk(chunkX, chunkY);
                drawChunkEntities(gc, chunk);
            }
        }
    }
    
    private void drawChunkEntities(GraphicsContext gc, com.game.core.Chunk chunk) {
        List<Entity> entities = chunk.getEntities();
        for (Entity entity : entities) {
            drawEntity(gc, entity);
        }
    }
    
    private void drawEntity(GraphicsContext gc, Entity entity) {
        switch (entity.type()) {
            case "tree" -> drawTree(gc, entity.x(), entity.y());
            case "rock" -> drawRock(gc, entity.x(), entity.y());
            case "grass" -> drawGrass(gc, entity.x(), entity.y());
            default -> logger.debug("Unknown entity type: {}", entity.type());
        }
    }
    
    private void drawTree(GraphicsContext gc, double x, double y) {
        // Draw trunk
        gc.setFill(Color.SADDLEBROWN);
        gc.fillRect(x - 4, y - 8, 8, 16);
        
        // Draw leaves
        gc.setFill(Color.FORESTGREEN);
        gc.fillOval(x - 12, y - 12, 24, 24);
    }
    
    private void drawRock(GraphicsContext gc, double x, double y) {
        gc.setFill(Color.GRAY);
        gc.fillOval(x - 8, y - 8, 16, 16);
    }
    
    private void drawGrass(GraphicsContext gc, double x, double y) {
        gc.setFill(Color.LAWNGREEN);
        gc.fillOval(x - 4, y - 4, 8, 8);
    }
    
    private void drawPlayer(GraphicsContext gc, Player player, Camera camera) {
        gc.setFill(Color.BLUE);
        gc.fillOval(player.getX() - player.getSize() / 2, player.getY() - player.getSize() / 2, 
                   player.getSize(), player.getSize());
        
        // Draw player direction indicator
        gc.setStroke(Color.WHITE);
        gc.setLineWidth(2);
        
        // In player perspective mode, player always faces upward (angle = 0)
        // In fixed angle mode, player shows actual movement direction
        double angle;
        if (camera.getMode() == Camera.CameraMode.PLAYER_PERSPECTIVE) {
            angle = 0.0; // Always face upward in player perspective mode
        } else {
            angle = player.getAngle(); // Show actual movement direction in fixed angle mode
        }
        

        
        double endX = player.getX() + Math.sin(angle) * player.getSize();
        double endY = player.getY() - Math.cos(angle) * player.getSize();
        gc.strokeLine(player.getX(), player.getY(), endX, endY);
    }
    
    private void drawUI(GraphicsContext gc, double width, double height, Player player, Camera camera) {
        gc.setFill(Color.BLACK);
        gc.setFont(javafx.scene.text.Font.font("Arial", 12));
        
        // Game info
        gc.fillText(String.format("Player: (%.1f, %.1f) Angle: %.1f°", 
                                 player.getX(), player.getY(), Math.toDegrees(player.getAngle())), 10, 20);
        gc.fillText(String.format("Camera: Zoom %.2f, Mode: %s", 
                                 camera.getZoom(), camera.getMode()), 10, 35);
        
        // Controls
        gc.fillText("WASD: Move, P: Toggle Camera, Mouse Wheel: Zoom", 10, 50);
        gc.fillText("E: Interact", 10, 65);
        
        // Debug info
        if (player.isInteracting()) {
            gc.setFill(Color.RED);
            gc.fillText("INTERACTING", 10, 80);
        }
    }
} 