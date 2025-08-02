package com.game.rendering;

import com.game.core.World;
import com.game.core.Player;
import com.game.core.Entity;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.image.Image;
import javafx.scene.paint.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.game.utils.AssetManager;

import java.util.List;

public class Renderer {
    private static final Logger logger = LoggerFactory.getLogger(Renderer.class);
    
    private final AssetManager assetManager;
    private final GridHighlightSystem gridHighlight;
    
    public Renderer(AssetManager assetManager) {
        this.assetManager = assetManager;
        this.gridHighlight = new GridHighlightSystem();
    }
    
    public void render(GraphicsContext gc, double width, double height, World world, Player player, Camera camera) {
        // Apply camera transformations
        camera.applyTransform(gc);
        
        // Apply player perspective transform if needed (before background drawing)
        if (camera.getMode() == Camera.CameraMode.PLAYER_PERSPECTIVE) {
            camera.applyPlayerPerspectiveTransform(gc, player.getAngle());
        }
        
        // Draw proper tiled background after rotation is applied
        drawTiledBackground(gc, camera, "plains");
        
        // Draw world grid with proper coordinate calculations
        drawGrid(gc, camera);
        
        // Draw world entities with proper positioning
        drawWorldEntities(gc, world, camera);
        
        // Draw grid highlight in world coordinates (before camera transform is restored)
        gridHighlight.drawGridHighlight(gc, camera, player.getAngle());
        
        // Restore camera transformations
        camera.restoreTransform(gc);
        
        // Draw player in screen coordinates (after camera transform is restored)
        drawPlayer(gc, player, camera);
        
        // Draw UI overlay
        drawUI(gc, width, height, player, camera);
    }
    
    private void drawTiledBackground(GraphicsContext gc, Camera camera, String biomeName) {
        // Get background image from asset manager
        Image backgroundImage = assetManager.getBackgroundImage(biomeName);
        
        if (backgroundImage != null) {
            double imageWidth = backgroundImage.getWidth();
            double imageHeight = backgroundImage.getHeight();
            
            // Calculate visible area in world coordinates
            double viewWidth = camera.getWidth() / camera.getZoom();
            double viewHeight = camera.getHeight() / camera.getZoom();
            
            double startX = camera.getX() - viewWidth / 2;
            double startY = camera.getY() - viewHeight / 2;
            double endX = camera.getX() + viewWidth / 2;
            double endY = camera.getY() + viewHeight / 2;
            
            // Draw background tiles with proper positioning
            for (double x = startX - (startX % imageWidth); x < endX; x += imageWidth) {
                for (double y = startY - (startY % imageHeight); y < endY; y += imageHeight) {
                    gc.drawImage(backgroundImage, x, y);
                }
            }
        } else {
            // Fallback to gradient background
            gc.setFill(Color.SKYBLUE);
            gc.fillRect(-1000, -1000, 2000, 2000);
        }
    }
    
    private void drawGrid(GraphicsContext gc, Camera camera) {
        // Calculate grid size and spacing
        double gridSize = 32.0;
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        // Calculate grid boundaries
        double startX = camera.getX() - viewWidth / 2;
        double startY = camera.getY() - viewHeight / 2;
        double endX = camera.getX() + viewWidth / 2;
        double endY = camera.getY() + viewHeight / 2;
        
        // Align to grid
        double gridStartX = Math.floor(startX / gridSize) * gridSize;
        double gridStartY = Math.floor(startY / gridSize) * gridSize;
        
        gc.setStroke(Color.LIGHTGRAY);
        gc.setLineWidth(1);
        
        // Draw vertical lines
        for (double x = gridStartX; x <= endX; x += gridSize) {
            gc.strokeLine(x, startY, x, endY);
        }
        
        // Draw horizontal lines
        for (double y = gridStartY; y <= endY; y += gridSize) {
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
        Image entityImage = assetManager.getEntityImage(entity.type(), entity.type());
        
        if (entityImage != null) {
            // Draw image instead of simple shapes
            double size = entity.size();
            gc.drawImage(entityImage, entity.x() - size / 2, entity.y() - size / 2, size, size);
        } else {
            // Fallback to simple shapes
            switch (entity.type()) {
                case "tree" -> drawTree(gc, entity.x(), entity.y());
                case "rock" -> drawRock(gc, entity.x(), entity.y());
                case "grass" -> drawGrass(gc, entity.x(), entity.y());
                default -> logger.debug("Unknown entity type: {}", entity.type());
            }
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
        // Draw player in screen coordinates (after camera transform is restored)
        // The player should always be at the center of the screen
        double screenX = camera.getWidth() / 2;
        double screenY = camera.getHeight() / 2;
        
        // Debug: Log player drawing coordinates
        // Debug logging removed for performance
        
        gc.setFill(Color.BLUE);
        gc.fillOval(screenX - player.getSize() / 2, screenY - player.getSize() / 2, 
                   player.getSize(), player.getSize());
        
        // Draw player direction indicator
        gc.setStroke(Color.WHITE);
        gc.setLineWidth(2);
        
        // In player perspective mode, player always faces upward (angle = 0)
        // In fixed angle mode, player shows movement direction relative to camera rotation
        double angle;
        if (camera.getMode() == Camera.CameraMode.PLAYER_PERSPECTIVE) {
            angle = 0.0; // Always face upward in player perspective mode
        } else {
            // In fixed-angle mode, show direction relative to camera rotation
            angle = player.getAngle() - camera.getRotation();
        }
        
        double endX = screenX + Math.sin(angle) * player.getSize();
        double endY = screenY - Math.cos(angle) * player.getSize();
        gc.strokeLine(screenX, screenY, endX, endY);
    }
    
    public void updateMousePosition(double x, double y) {
        gridHighlight.updateMousePosition(x, y);
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