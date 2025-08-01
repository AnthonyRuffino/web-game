package com.game.ui;

import com.game.core.GameEngine;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.MenuBar;
import javafx.scene.control.MenuItem;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CanvasWindow {
    private static final Logger logger = LoggerFactory.getLogger(CanvasWindow.class);
    
    private final BorderPane root;
    private final Canvas gameCanvas;
    private final GraphicsContext gc;
    private final GameEngine gameEngine;
    private final MenuBar menuBar;
    
    public CanvasWindow(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        
        // Create root layout
        root = new BorderPane();
        
        // Create menu bar
        menuBar = createMenuBar();
        root.setTop(menuBar);
        
        // Create canvas
        gameCanvas = new Canvas(1200, 800);
        gc = gameCanvas.getGraphicsContext2D();
        root.setCenter(gameCanvas);
        
        // Setup canvas event handling
        setupCanvasEvents();
        
        // Setup resize handling
        setupResizeHandling();
        
        logger.info("Canvas window initialized");
    }
    
    private MenuBar createMenuBar() {
        MenuBar menuBar = new MenuBar();
        
        // File menu
        javafx.scene.control.Menu fileMenu = new javafx.scene.control.Menu("File");
        
        MenuItem saveItem = new MenuItem("Save");
        saveItem.setOnAction(e -> gameEngine.saveGame());
        
        MenuItem loadItem = new MenuItem("Load");
        loadItem.setOnAction(e -> gameEngine.loadGame());
        
        MenuItem exitItem = new MenuItem("Exit");
        exitItem.setOnAction(e -> {
            javafx.stage.Stage stage = (javafx.stage.Stage) root.getScene().getWindow();
            stage.close();
        });
        
        fileMenu.getItems().addAll(saveItem, loadItem, exitItem);
        
        // Debug menu
        javafx.scene.control.Menu debugMenu = new javafx.scene.control.Menu("Debug");
        
        MenuItem toggleDebugItem = new MenuItem("Toggle Debug Info");
        toggleDebugItem.setOnAction(e -> gameEngine.toggleDebugInfo());
        
        MenuItem performanceItem = new MenuItem("Performance Info");
        performanceItem.setOnAction(e -> gameEngine.showPerformanceInfo());
        
        debugMenu.getItems().addAll(toggleDebugItem, performanceItem);
        
        menuBar.getMenus().addAll(fileMenu, debugMenu);
        
        return menuBar;
    }
    
    private void setupCanvasEvents() {
        // Mouse events
        gameCanvas.setOnMouseMoved(e -> gameEngine.handleMouseMoved(e.getX(), e.getY()));
        gameCanvas.setOnMousePressed(e -> gameEngine.handleMousePressed(e.getX(), e.getY()));
        gameCanvas.setOnMouseReleased(e -> gameEngine.handleMouseReleased(e.getX(), e.getY()));
        gameCanvas.setOnScroll(e -> gameEngine.handleMouseScroll(e.getDeltaY()));
        
        // Keyboard events are handled at scene level
    }
    
    private void setupResizeHandling() {
        // Handle canvas resize
        root.widthProperty().addListener((obs, oldWidth, newWidth) -> {
            gameCanvas.setWidth(newWidth.doubleValue());
            gameEngine.handleResize(newWidth.doubleValue(), gameCanvas.getHeight());
        });
        
        root.heightProperty().addListener((obs, oldHeight, newHeight) -> {
            gameCanvas.setHeight(newHeight.doubleValue());
            gameEngine.handleResize(gameCanvas.getWidth(), newHeight.doubleValue());
        });
    }
    
    public javafx.scene.Parent getRoot() {
        return root;
    }
    
    public Canvas getCanvas() {
        return gameCanvas;
    }
    
    public GraphicsContext getGraphicsContext() {
        return gc;
    }
} 