package com.game.rendering;

import com.game.core.World;
import com.game.core.Player;
import com.game.core.Entity;
import com.game.core.WorldConfig;
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
    private final WorldConfig worldConfig;
    private final double worldSize;
    private final int chunkSize;
    private final int tileSize;
    private boolean gridVisible = true; // Grid visibility toggle
    
    public Renderer(AssetManager assetManager, WorldConfig worldConfig) {
        this.assetManager = assetManager;
        this.worldConfig = worldConfig;
        this.worldSize = worldConfig.worldSize();
        this.chunkSize = worldConfig.chunkSize() * worldConfig.tileSize();
        this.tileSize = worldConfig.tileSize();
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
        
        // Draw world grid with proper coordinate calculations (if visible)
        if (gridVisible) {
            drawGrid(gc, camera);
        }
        
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
        
        // Use precomputed world boundaries
        double worldStart = 0;
        double worldEnd = this.worldSize;
        
        // Calculate visible area in world coordinates
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        // Calculate diagonal length to ensure background covers entire rotated viewport
        double diagonalLength = Math.sqrt(viewWidth * viewWidth + viewHeight * viewHeight);
        double extendedSize = diagonalLength / 2;
        
        double startX = camera.getX() - extendedSize;
        double startY = camera.getY() - extendedSize;
        double endX = camera.getX() + extendedSize;
        double endY = camera.getY() + extendedSize;
        
        // Fill entire visible area with black first (for world boundaries)
        gc.setFill(Color.BLACK);
        gc.fillRect(startX, startY, endX - startX, endY - startY);
        
        // Calculate the intersection of visible area with world bounds
        double renderStartX = Math.max(startX, worldStart);
        double renderStartY = Math.max(startY, worldStart);
        double renderEndX = Math.min(endX, worldEnd);
        double renderEndY = Math.min(endY, worldEnd);
        
        // Only draw background tiles if we're within world bounds
        if (renderStartX < renderEndX && renderStartY < renderEndY) {
            if (backgroundImage != null) {
                // Use chunk dimensions instead of image file dimensions
                double chunkWidth = this.chunkSize;
                double chunkHeight = this.chunkSize;
                
                // Draw background tiles using chunk dimensions (not image file dimensions)
                for (double x = renderStartX - (renderStartX % chunkWidth); x < renderEndX; x += chunkWidth) {
                    for (double y = renderStartY - (renderStartY % chunkHeight); y < renderEndY; y += chunkHeight) {
                        // Only draw if the chunk is within world bounds
                        if (x < worldEnd && y < worldEnd) {
                            // Draw the image scaled to chunk size
                            gc.drawImage(backgroundImage, x, y, chunkWidth, chunkHeight);
                        }
                    }
                }
            } else {
                // Fallback to gradient background (only within world bounds)
                gc.setFill(Color.SKYBLUE);
                gc.fillRect(renderStartX, renderStartY, renderEndX - renderStartX, renderEndY - renderStartY);
            }
        }
    }
    
    private void drawGrid(GraphicsContext gc, Camera camera) {
        // Use stored tile size for grid spacing
        double gridSize = this.tileSize;
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        // Use precomputed world boundaries
        double worldStart = 0;
        double worldEnd = this.worldSize;
        
        // Calculate diagonal length to ensure grid covers entire rotated viewport
        double diagonalLength = Math.sqrt(viewWidth * viewWidth + viewHeight * viewHeight);
        double extendedSize = diagonalLength / 2;
        
        // Calculate extended grid boundaries
        double startX = camera.getX() - extendedSize;
        double startY = camera.getY() - extendedSize;
        double endX = camera.getX() + extendedSize;
        double endY = camera.getY() + extendedSize;
        
        // Calculate the intersection of visible area with world bounds
        double renderStartX = Math.max(startX, worldStart);
        double renderStartY = Math.max(startY, worldStart);
        double renderEndX = Math.min(endX, worldEnd);
        double renderEndY = Math.min(endY, worldEnd);
        
        // Only draw grid if we're within world bounds
        if (renderStartX < renderEndX && renderStartY < renderEndY) {
            // Align to grid
            double gridStartX = Math.floor(renderStartX / gridSize) * gridSize;
            double gridStartY = Math.floor(renderStartY / gridSize) * gridSize;
            
            gc.setStroke(Color.LIGHTGRAY);
            gc.setLineWidth(1);
            
            // Draw vertical lines (only within world bounds)
            for (double x = gridStartX; x <= renderEndX; x += gridSize) {
                gc.strokeLine(x, renderStartY, x, renderEndY);
            }
            
            // Draw horizontal lines (only within world bounds)
            for (double y = gridStartY; y <= renderEndY; y += gridSize) {
                gc.strokeLine(renderStartX, y, renderEndX, y);
            }
        }
    }
    
    private void drawWorldEntities(GraphicsContext gc, World world, Camera camera) {
        // Get visible chunks based on camera position
        double cameraX = camera.getX();
        double cameraY = camera.getY();
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        // Use precomputed world boundaries
        double worldStart = 0;
        double worldEnd = this.worldSize;
        
        // Calculate diagonal length to ensure entities cover entire rotated viewport
        double diagonalLength = Math.sqrt(viewWidth * viewWidth + viewHeight * viewHeight);
        double extendedSize = diagonalLength / 2;
        
        // Calculate the intersection of visible area with world bounds
        double renderStartX = Math.max(cameraX - extendedSize, worldStart);
        double renderStartY = Math.max(cameraY - extendedSize, worldStart);
        double renderEndX = Math.min(cameraX + extendedSize, worldEnd);
        double renderEndY = Math.min(cameraY + extendedSize, worldEnd);
        
        // Only load chunks if we're within world bounds
        if (renderStartX < renderEndX && renderStartY < renderEndY) {
            int chunkSize = world.getConfig().chunkSize() * world.getConfig().tileSize();
            int startChunkX = (int) (renderStartX / chunkSize);
            int endChunkX = (int) (renderEndX / chunkSize);
            int startChunkY = (int) (renderStartY / chunkSize);
            int endChunkY = (int) (renderEndY / chunkSize);
            
            // Load and render visible chunks (only within world bounds)
            for (int chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
                for (int chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
                    // Ensure chunk coordinates are within world bounds
                    if (chunkX >= 0 && chunkX < 64 && chunkY >= 0 && chunkY < 64) {
                        var chunk = world.loadChunk(chunkX, chunkY);
                        drawChunkEntities(gc, chunk);
                    }
                }
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
        
        // Scale player size by camera zoom
        double scaledSize = player.getSize() * camera.getZoom();
        
        gc.setFill(Color.BLUE);
        gc.fillOval(screenX - scaledSize / 2, screenY - scaledSize / 2, 
                   scaledSize, scaledSize);
        
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
        
        double endX = screenX + Math.sin(angle) * scaledSize;
        double endY = screenY - Math.cos(angle) * scaledSize;
        gc.strokeLine(screenX, screenY, endX, endY);
    }
    
    public void updateMousePosition(double x, double y) {
        gridHighlight.updateMousePosition(x, y);
    }
    
    public void toggleGrid() {
        gridVisible = !gridVisible;
        logger.info("Grid visibility toggled: {}", gridVisible);
    }
    
    public boolean isGridVisible() {
        return gridVisible;
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
        gc.fillText("E: Interact, G: Toggle Grid", 10, 65);
        
        // Grid status
        gc.fillText(String.format("Grid: %s", gridVisible ? "ON" : "OFF"), 10, 80);
        
        // Debug info
        if (player.isInteracting()) {
            gc.setFill(Color.RED);
            gc.fillText("INTERACTING", 10, 95);
        }
    }
} 