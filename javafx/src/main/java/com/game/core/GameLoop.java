package com.game.core;

import javafx.animation.AnimationTimer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GameLoop extends AnimationTimer {
    private static final Logger logger = LoggerFactory.getLogger(GameLoop.class);
    
    private final GameEngine gameEngine;
    private long lastUpdateTime;
    private int frameCount;
    private long lastFpsUpdate;
    private double currentFps;
    
    public GameLoop(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    @Override
    public void handle(long now) {
        if (lastUpdateTime == 0) {
            lastUpdateTime = now;
            return;
        }
        
        // Calculate delta time in seconds
        double deltaTime = (now - lastUpdateTime) / 1_000_000_000.0;
        lastUpdateTime = now;
        
        // Update FPS counter
        updateFps(now);
        
        // Update game systems
        gameEngine.update(deltaTime);
        
        // Render frame
        gameEngine.render();
    }
    
    private void updateFps(long now) {
        frameCount++;
        
        if (now - lastFpsUpdate >= 1_000_000_000) { // 1 second
            currentFps = frameCount;
            frameCount = 0;
            lastFpsUpdate = now;
            
            if (gameEngine.isDebugMode()) {
                logger.debug("FPS: {}", currentFps);
            }
        }
    }
    
    public double getCurrentFps() {
        return currentFps;
    }
} 