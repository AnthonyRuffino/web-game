package com.game.ui;

import com.game.core.GameEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WebViewBridge {
    private static final Logger logger = LoggerFactory.getLogger(WebViewBridge.class);
    
    private final GameEngine gameEngine;
    
    public WebViewBridge(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    // JavaScript-callable methods
    public void saveGame() {
        logger.info("Save game requested from JavaScript");
        gameEngine.saveGame();
    }
    
    public void loadGame() {
        logger.info("Load game requested from JavaScript");
        gameEngine.loadGame();
    }
    
    public void toggleDebugInfo() {
        logger.info("Toggle debug info requested from JavaScript");
        gameEngine.toggleDebugInfo();
    }
    
    public void showPerformanceInfo() {
        logger.info("Show performance info requested from JavaScript");
        gameEngine.showPerformanceInfo();
    }
    
    public String getGameState() {
        return gameEngine.getGameStateJson();
    }
    
    public void setGameState(String stateJson) {
        gameEngine.setGameStateFromJson(stateJson);
    }
    
    // Convert to JavaScript object
    public String toJavaScriptObject() {
        return """
            {
                saveGame: function() { 
                    window.javaBridge.saveGame(); 
                },
                loadGame: function() { 
                    window.javaBridge.loadGame(); 
                },
                toggleDebugInfo: function() { 
                    window.javaBridge.toggleDebugInfo(); 
                },
                showPerformanceInfo: function() { 
                    window.javaBridge.showPerformanceInfo(); 
                },
                getGameState: function() { 
                    return window.javaBridge.getGameState(); 
                },
                setGameState: function(state) { 
                    window.javaBridge.setGameState(state); 
                }
            }
            """;
    }
} 