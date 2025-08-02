package com.game.core;

import com.game.logging.GameLogger;
import com.game.persistence.DatabaseManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GameEngineTest {
    
    @Mock
    private DatabaseManager databaseManager;
    
    private GameEngine gameEngine;
    private GameLogger testLogger;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Create a test logger that always enables debug mode
        testLogger = new GameLogger(() -> true);
        
        // Create game engine with mocked database manager
        gameEngine = new GameEngine(databaseManager);
    }
    
    @AfterEach
    void tearDown() {
        if (gameEngine != null && gameEngine.isRunning()) {
            gameEngine.stop();
        }
    }
    
    @Test
    void testGameEngineStartStopWithLogging() {
        // Arrange - Get the game logger from the engine
        GameLogger engineLogger = gameEngine.getGameLogger();
        
        // Act - Start the engine without game loop for testing
        gameEngine.start(false);
        
        // Assert - Verify engine is running
        assertTrue(gameEngine.isRunning());
        
        // Verify logging behavior through GameLogger
        var logs = engineLogger.getLogs();
        assertTrue(logs.stream().anyMatch(log -> 
            log.message.contains("Starting game engine") && 
            log.level == GameLogger.LogLevel.INFO
        ));
        assertTrue(logs.stream().anyMatch(log -> 
            log.message.contains("Game engine started successfully") && 
            log.level == GameLogger.LogLevel.INFO
        ));
        
        // Act - Stop the engine
        gameEngine.stop();
        
        // Assert - Verify engine is stopped
        assertFalse(gameEngine.isRunning());
        
        // Verify stop logging
        logs = engineLogger.getLogs();
        assertTrue(logs.stream().anyMatch(log -> 
            log.message.contains("Stopping game engine") && 
            log.level == GameLogger.LogLevel.INFO
        ));
        assertTrue(logs.stream().anyMatch(log -> 
            log.message.contains("Game engine stopped successfully") && 
            log.level == GameLogger.LogLevel.INFO
        ));
    }
} 