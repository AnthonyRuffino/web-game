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
    private final javafx.scene.layout.VBox logWindowContainer;
    
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
        
        // Create log window container as overlay
        logWindowContainer = new javafx.scene.layout.VBox();
        logWindowContainer.setAlignment(javafx.geometry.Pos.TOP_RIGHT);
        logWindowContainer.setPadding(new javafx.geometry.Insets(10));
        logWindowContainer.setMouseTransparent(true); // Let mouse events pass through to canvas by default
        
        // Add log window to container
        if (gameEngine.getGameLogger() != null) {
            logWindowContainer.getChildren().add(gameEngine.getGameLogger().getLogWindow());
            
            // Set up mouse transparency based on log window visibility
            gameEngine.getGameLogger().getLogWindow().visibleProperty().addListener((obs, oldVal, newVal) -> {
                logWindowContainer.setMouseTransparent(!newVal);
            });
        }
        
        // Create a StackPane to overlay the log window on top of the canvas
        javafx.scene.layout.StackPane stackPane = new javafx.scene.layout.StackPane();
        stackPane.getChildren().addAll(gameCanvas, logWindowContainer);
        
        // Set the stack pane as the center of the root
        root.setCenter(stackPane);
        
        // Make canvas focusable and request focus
        gameCanvas.setFocusTraversable(true);
        gameCanvas.requestFocus();
        
        // Setup canvas event handling
        setupCanvasEvents();
        
        // Setup resize handling
        setupResizeHandling();
        
        // Connect graphics context to game engine
        gameEngine.setGraphicsContext(gc);
        
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
        // Mouse events with log window awareness
        gameCanvas.setOnMouseMoved(e -> {
            if (!isMouseOverLogWindow(e.getX(), e.getY())) {
                gameEngine.handleMouseMoved(e.getX(), e.getY());
            }
        });
        
        gameCanvas.setOnMousePressed(e -> {
            if (!isMouseOverLogWindow(e.getX(), e.getY())) {
                gameEngine.handleMousePressed(e.getX(), e.getY());
            }
        });
        
        gameCanvas.setOnMouseReleased(e -> {
            if (!isMouseOverLogWindow(e.getX(), e.getY())) {
                gameEngine.handleMouseReleased(e.getX(), e.getY());
            }
        });
        
        gameCanvas.setOnScroll(e -> {
            if (!isMouseOverLogWindow(e.getX(), e.getY())) {
                gameEngine.handleMouseScroll(e.getDeltaY());
            }
        });
        
        // Keyboard events (backup to scene level)
        gameCanvas.setOnKeyPressed(e -> {
            if (gameEngine.getInputManager() != null) {
                gameEngine.getInputManager().handleKeyPressed(e);
            }
        });
        gameCanvas.setOnKeyReleased(e -> {
            if (gameEngine.getInputManager() != null) {
                gameEngine.getInputManager().handleKeyReleased(e);
            }
        });
    }
    
    private boolean isMouseOverLogWindow(double mouseX, double mouseY) {
        if (gameEngine.getGameLogger() == null || !gameEngine.getGameLogger().isWindowVisible()) {
            return false;
        }
        
        // Get the log window bounds relative to the canvas
        javafx.scene.Node logWindow = gameEngine.getGameLogger().getLogWindow();
        if (logWindow == null) {
            return false;
        }
        
        // Convert mouse coordinates to scene coordinates
        javafx.geometry.Point2D scenePoint = gameCanvas.localToScene(mouseX, mouseY);
        
        // Convert scene coordinates to log window local coordinates
        javafx.geometry.Point2D logWindowPoint = logWindow.sceneToLocal(scenePoint);
        
        // Check if the point is within the log window bounds
        return logWindow.contains(logWindowPoint);
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