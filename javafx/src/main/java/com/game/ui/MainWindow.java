package com.game.ui;

import com.game.core.GameEngine;
import javafx.scene.Node;
import javafx.scene.control.MenuBar;
import javafx.scene.control.MenuItem;
import javafx.scene.layout.BorderPane;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;

public class MainWindow {
    private static final Logger logger = LoggerFactory.getLogger(MainWindow.class);
    
    private final BorderPane root;
    private final WebView webView;
    private final GameEngine gameEngine;
    private final MenuBar menuBar;
    
    public MainWindow(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        
        // Create root layout
        root = new BorderPane();
        
        // Create menu bar
        menuBar = createMenuBar();
        root.setTop(menuBar);
        
        // Create WebView
        webView = new WebView();
        webView.setContextMenuEnabled(false);
        root.setCenter(webView);
        
        // Load existing HTML/JS UI
        loadWebViewContent();
        
        // Setup WebView bridge
        setupWebViewBridge();
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
            Stage stage = (Stage) root.getScene().getWindow();
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
    
    private void loadWebViewContent() {
        try {
            // Load the existing HTML file from the Electron version
            URL htmlUrl = getClass().getResource("/ui/index.html");
            if (htmlUrl != null) {
                webView.getEngine().load(htmlUrl.toExternalForm());
                logger.info("Loaded WebView content from: {}", htmlUrl);
            } else {
                // Fallback to loading from file system
                String htmlPath = "../src/index.html";
                webView.getEngine().load("file://" + System.getProperty("user.dir") + "/" + htmlPath);
                logger.info("Loaded WebView content from file system: {}", htmlPath);
            }
        } catch (Exception e) {
            logger.error("Failed to load WebView content", e);
            // Load a simple fallback page
            webView.getEngine().loadContent(
                "<html><body><h1>JavaFX Game</h1><p>Loading game content...</p></body></html>"
            );
        }
    }
    
    private void setupWebViewBridge() {
        // Create bridge object for JavaScript communication
        WebViewBridge bridge = new WebViewBridge(gameEngine);
        webView.getEngine().getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == javafx.concurrent.Worker.State.SUCCEEDED) {
                // Inject bridge object when page loads
                webView.getEngine().executeScript(
                    "window.javaBridge = " + bridge.toJavaScriptObject()
                );
                logger.info("WebView bridge established");
            }
        });
    }
    
    public javafx.scene.Parent getRoot() {
        return root;
    }
    
    public WebView getWebView() {
        return webView;
    }
} 