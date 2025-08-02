package com.game;

import com.game.core.GameEngine;
import com.game.persistence.DatabaseManager;
import com.game.ui.CanvasWindow;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;

public class GameApplication extends Application {
    private static final Logger logger = LoggerFactory.getLogger(GameApplication.class);
    
    private DatabaseManager databaseManager;
    private GameEngine gameEngine;
    private CanvasWindow canvasWindow;
    
    @Override
    public void init() throws Exception {
        logger.info("Initializing JavaFX Game Application...");
        
        // Initialize database manager
        databaseManager = new DatabaseManager();
        CompletableFuture.runAsync(() -> {
            try {
                databaseManager.initialize();
                logger.info("Database initialized successfully");
            } catch (Exception e) {
                logger.error("Failed to initialize database", e);
                Platform.exit();
            }
        });
        
        // Initialize game engine
        gameEngine = new GameEngine(databaseManager);
        
        logger.info("Application initialization completed");
    }
    
    @Override
    public void start(Stage primaryStage) throws Exception {
        logger.info("Starting JavaFX Game Application...");
        
        // Create canvas window
        canvasWindow = new CanvasWindow(gameEngine);
        Scene scene = new Scene(canvasWindow.getRoot(), 1200, 800);
        
        // Setup input handling
        gameEngine.setupInputHandling(scene);
        
        // Configure primary stage
        primaryStage.setTitle("Web Game - JavaFX");
        primaryStage.setScene(scene);
        primaryStage.setMinWidth(800);
        primaryStage.setMinHeight(600);
        
        // Handle window close
        primaryStage.setOnCloseRequest(event -> {
            logger.info("Application shutdown requested");
            shutdown();
        });
        
        // Show window
        primaryStage.show();
        
        // Start game engine
        gameEngine.start();
        
        logger.info("JavaFX Game Application started successfully");
    }
    
    @Override
    public void stop() throws Exception {
        logger.info("Stopping JavaFX Game Application...");
        shutdown();
        super.stop();
    }
    
    private void shutdown() {
        if (gameEngine != null) {
            gameEngine.stop();
        }
        if (databaseManager != null) {
            databaseManager.close();
        }
        logger.info("Application shutdown completed");
    }
    
    public static void main(String[] args) {
        launch(args);
    }
} 