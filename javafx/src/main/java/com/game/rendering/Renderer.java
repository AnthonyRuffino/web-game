package com.game.rendering;

import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Renderer {
    private static final Logger logger = LoggerFactory.getLogger(Renderer.class);
    
    public void render(GraphicsContext gc, double width, double height) {
        // Clear canvas with sky blue background
        gc.setFill(Color.SKYBLUE);
        gc.fillRect(0, 0, width, height);
        
        // Draw a simple grid to represent the world
        drawGrid(gc, width, height);
        
        // Draw some basic entities
        drawEntities(gc, width, height);
        
        // Draw UI overlay
        drawUI(gc, width, height);
    }
    
    private void drawGrid(GraphicsContext gc, double width, double height) {
        gc.setStroke(Color.LIGHTGRAY);
        gc.setLineWidth(1.0);
        
        int tileSize = 32;
        
        // Draw vertical lines
        for (int x = 0; x <= width; x += tileSize) {
            gc.strokeLine(x, 0, x, height);
        }
        
        // Draw horizontal lines
        for (int y = 0; y <= height; y += tileSize) {
            gc.strokeLine(0, y, width, y);
        }
    }
    
    private void drawEntities(GraphicsContext gc, double width, double height) {
        // Draw some sample entities
        drawTree(gc, 100, 100);
        drawTree(gc, 300, 200);
        drawRock(gc, 200, 150);
        drawRock(gc, 400, 300);
        drawGrass(gc, 150, 250);
        drawGrass(gc, 350, 100);
        
        // Draw player (simple blue circle)
        gc.setFill(Color.BLUE);
        gc.fillOval(width / 2 - 10, height / 2 - 10, 20, 20);
    }
    
    private void drawTree(GraphicsContext gc, double x, double y) {
        // Tree trunk
        gc.setFill(Color.BROWN);
        gc.fillRect(x + 12, y + 20, 8, 12);
        
        // Tree leaves
        gc.setFill(Color.DARKGREEN);
        gc.fillOval(x, y, 32, 32);
    }
    
    private void drawRock(GraphicsContext gc, double x, double y) {
        gc.setFill(Color.GRAY);
        gc.fillOval(x, y, 24, 24);
    }
    
    private void drawGrass(GraphicsContext gc, double x, double y) {
        gc.setFill(Color.GREEN);
        gc.fillOval(x, y, 16, 16);
    }
    
    private void drawUI(GraphicsContext gc, double width, double height) {
        // Draw debug info
        gc.setFill(Color.BLACK);
        gc.setFont(javafx.scene.text.Font.font("Arial", 12));
        
        String debugText = "JavaFX Game - Canvas Rendering";
        gc.fillText(debugText, 10, 20);
        
        String fpsText = "FPS: 60";
        gc.fillText(fpsText, 10, 40);
        
        String positionText = "Position: (0, 0)";
        gc.fillText(positionText, 10, 60);
    }
} 