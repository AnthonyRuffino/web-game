# Phase 1 Migration: Foundation & WebView Bridge

## Overview

Phase 1 establishes the foundational JavaFX application structure with WebView integration to load the existing HTML/JS UI, SQLite database connectivity, and shared asset loading. This phase creates a working bridge between the Electron and JavaFX versions.

## Objectives

- ✅ Create basic JavaFX application structure
- ✅ Integrate WebView to load existing HTML/JS UI
- ✅ Establish SQLite database connectivity
- ✅ Implement shared asset loading
- ✅ Create basic build system with Gradle
- ✅ Set up development environment

## Prerequisites

### Required Software
- Java 21+ with GraalVM
- Gradle 8.0+
- SQLite 3.x
- Git (for version control)

### Required Knowledge
- Basic JavaFX concepts
- SQLite database operations
- Gradle build system
- Java module system

## Step-by-Step Implementation

### Step 1: Project Structure Setup

#### 1.1 Create Directory Structure
```bash
# Navigate to javafx directory
cd javafx

# Create source directories
mkdir -p src/main/java/com/game/{core,rendering,persistence,ui,utils}
mkdir -p src/main/resources/{assets,database,ui}
mkdir -p src/test/java/com/game
mkdir -p build/native
```

#### 1.2 Create Build Configuration

**File: `build.gradle`**
```gradle
plugins {
    id 'java'
    id 'application'
    id 'org.graalvm.buildtools.native' version '0.9.28'
    id 'org.openjfx.javafxplugin' version '0.1.0'
}

group = 'com.game'
version = '1.0.0'
sourceCompatibility = '21'

repositories {
    mavenCentral()
    maven { url 'https://repo.graalvm.org/native' }
}

dependencies {
    // JavaFX
    implementation 'org.openjfx:javafx-controls:21'
    implementation 'org.openjfx:javafx-web:21'
    implementation 'org.openjfx:javafx-fxml:21'
    
    // Database
    implementation 'org.xerial:sqlite-jdbc:3.44.1.0'
    implementation 'org.flywaydb:flyway-core:10.0.1'
    
    // Logging
    implementation 'org.slf4j:slf4j-api:2.0.9'
    implementation 'ch.qos.logback:logback-classic:1.4.14'
    
    // JSON processing
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.3'
    
    // Testing
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.1'
    testImplementation 'org.mockito:mockito-core:5.7.0'
}

javafx {
    version = '21'
    modules = ['javafx.controls', 'javafx.web', 'javafx.fxml']
}

application {
    mainClass = 'com.game.GameApplication'
}

test {
    useJUnitPlatform()
}

// GraalVM Native Image Configuration
graalvmNative {
    binaries {
        main {
            imageName = 'web-game'
            mainClass = 'com.game.GameApplication'
            buildArgs.add('--enable-http')
            buildArgs.add('--enable-https')
            buildArgs.add('--enable-all-security-services')
            buildArgs.add('--initialize-at-build-time=org.sqlite')
            buildArgs.add('--initialize-at-build-time=org.flywaydb')
        }
    }
}

// Development profile
if (project.hasProperty('profile') && project.profile == 'dev') {
    run {
        jvmArgs = [
            '-Dorg.slf4j.simpleLogger.defaultLogLevel=debug',
            '-Dcom.sun.management.jmxremote',
            '-Djava.vm.options=-Xmx2g -XX:+UseG1GC'
        ]
    }
}
```

**File: `gradle.properties`**
```properties
# Gradle properties
org.gradle.jvmargs=-Xmx4g -XX:+UseG1GC
org.gradle.parallel=true
org.gradle.caching=true

# Java properties
java.version=21
javafx.version=21

# GraalVM properties
graalvm.version=21.0.2
native.image.buildArgs=--no-fallback --enable-http --enable-https
```

### Step 2: Java Module Configuration

**File: `src/main/java/module-info.java`**
```java
module com.game {
    requires javafx.controls;
    requires javafx.web;
    requires javafx.fxml;
    requires java.sql;
    requires org.slf4j;
    requires com.fasterxml.jackson.databind;
    requires org.flywaydb.core;
    
    exports com.game;
    exports com.game.core;
    exports com.game.rendering;
    exports com.game.persistence;
    exports com.game.ui;
    exports com.game.utils;
    
    opens com.game to javafx.fxml;
    opens com.game.ui to javafx.fxml;
}
```

### Step 3: Main Application Class

**File: `src/main/java/com/game/GameApplication.java`**
```java
package com.game;

import com.game.core.GameEngine;
import com.game.persistence.DatabaseManager;
import com.game.ui.MainWindow;
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
    private MainWindow mainWindow;
    
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
        
        // Create main window
        mainWindow = new MainWindow(gameEngine);
        Scene scene = new Scene(mainWindow.getRoot(), 1200, 800);
        
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
```

### Step 4: Database Manager

**File: `src/main/java/com/game/persistence/DatabaseManager.java`**
```java
package com.game.persistence;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DatabaseManager implements AutoCloseable {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseManager.class);
    
    private final String dbUrl;
    private final ExecutorService executor;
    private Connection connection;
    
    public DatabaseManager() {
        // Use shared database with Electron version
        this.dbUrl = "jdbc:sqlite:../game.db";
        this.executor = Executors.newVirtualThreadPerTaskExecutor();
    }
    
    public void initialize() throws SQLException {
        logger.info("Initializing database connection to: {}", dbUrl);
        
        try {
            connection = DriverManager.getConnection(dbUrl);
            connection.setAutoCommit(false);
            
            // Verify database schema
            verifySchema();
            
            logger.info("Database connection established successfully");
        } catch (SQLException e) {
            logger.error("Failed to initialize database", e);
            throw e;
        }
    }
    
    private void verifySchema() throws SQLException {
        // Check if required tables exist
        String[] requiredTables = {
            "worlds", "characters", "entity_types", 
            "cell_changes", "cell_entities", "inventory"
        };
        
        for (String table : requiredTables) {
            try (var stmt = connection.createStatement()) {
                stmt.execute("SELECT 1 FROM " + table + " LIMIT 1");
                logger.debug("Table {} exists", table);
            } catch (SQLException e) {
                logger.warn("Table {} does not exist or is not accessible", table);
            }
        }
    }
    
    public CompletableFuture<Connection> getConnectionAsync() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (connection == null || connection.isClosed()) {
                    connection = DriverManager.getConnection(dbUrl);
                    connection.setAutoCommit(false);
                }
                return connection;
            } catch (SQLException e) {
                logger.error("Failed to get database connection", e);
                throw new RuntimeException(e);
            }
        }, executor);
    }
    
    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(dbUrl);
            connection.setAutoCommit(false);
        }
        return connection;
    }
    
    @Override
    public void close() {
        logger.info("Closing database connection...");
        
        if (connection != null) {
            try {
                connection.close();
                logger.info("Database connection closed");
            } catch (SQLException e) {
                logger.error("Error closing database connection", e);
            }
        }
        
        if (executor != null) {
            executor.close();
            logger.info("Database executor closed");
        }
    }
}
```

### Step 5: Main Window with WebView

**File: `src/main/java/com/game/ui/MainWindow.java`**
```java
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
    
    public Node getRoot() {
        return root;
    }
    
    public WebView getWebView() {
        return webView;
    }
}
```

### Step 6: WebView Bridge

**File: `src/main/java/com/game/ui/WebViewBridge.java`**
```java
package com.game.ui;

import com.game.core.GameEngine;
import netscape.javascript.JSObject;
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
```

### Step 7: Game Engine Foundation

**File: `src/main/java/com/game/core/GameEngine.java`**
```java
package com.game.core;

import com.game.persistence.DatabaseManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

public class GameEngine {
    private static final Logger logger = LoggerFactory.getLogger(GameEngine.class);
    
    private final DatabaseManager databaseManager;
    private final AtomicBoolean running;
    private final AtomicBoolean debugMode;
    
    public GameEngine(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
        this.running = new AtomicBoolean(false);
        this.debugMode = new AtomicBoolean(false);
    }
    
    public void start() {
        if (running.compareAndSet(false, true)) {
            logger.info("Starting game engine...");
            
            // Initialize game systems
            initializeSystems();
            
            logger.info("Game engine started successfully");
        }
    }
    
    public void stop() {
        if (running.compareAndSet(true, false)) {
            logger.info("Stopping game engine...");
            
            // Cleanup game systems
            cleanupSystems();
            
            logger.info("Game engine stopped successfully");
        }
    }
    
    private void initializeSystems() {
        // Initialize core game systems
        logger.debug("Initializing game systems...");
        
        // TODO: Initialize input system
        // TODO: Initialize rendering system
        // TODO: Initialize world system
        // TODO: Initialize entity system
        
        logger.debug("Game systems initialized");
    }
    
    private void cleanupSystems() {
        // Cleanup core game systems
        logger.debug("Cleaning up game systems...");
        
        // TODO: Cleanup input system
        // TODO: Cleanup rendering system
        // TODO: Cleanup world system
        // TODO: Cleanup entity system
        
        logger.debug("Game systems cleaned up");
    }
    
    public void saveGame() {
        CompletableFuture.runAsync(() -> {
            try {
                logger.info("Saving game...");
                // TODO: Implement game saving
                logger.info("Game saved successfully");
            } catch (Exception e) {
                logger.error("Failed to save game", e);
            }
        });
    }
    
    public void loadGame() {
        CompletableFuture.runAsync(() -> {
            try {
                logger.info("Loading game...");
                // TODO: Implement game loading
                logger.info("Game loaded successfully");
            } catch (Exception e) {
                logger.error("Failed to load game", e);
            }
        });
    }
    
    public void toggleDebugInfo() {
        boolean newDebugMode = debugMode.getAndSet(!debugMode.get());
        logger.info("Debug mode toggled: {}", !newDebugMode);
    }
    
    public void showPerformanceInfo() {
        logger.info("Performance info requested");
        // TODO: Implement performance monitoring
    }
    
    public String getGameStateJson() {
        // TODO: Implement game state serialization
        return "{\"status\":\"running\",\"debugMode\":" + debugMode.get() + "}";
    }
    
    public void setGameStateFromJson(String stateJson) {
        // TODO: Implement game state deserialization
        logger.info("Setting game state from JSON: {}", stateJson);
    }
    
    public boolean isRunning() {
        return running.get();
    }
    
    public boolean isDebugMode() {
        return debugMode.get();
    }
}
```

### Step 8: Asset Manager

**File: `src/main/java/com/game/utils/AssetManager.java`**
```java
package com.game.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;

public class AssetManager {
    private static final Logger logger = LoggerFactory.getLogger(AssetManager.class);
    
    private final ConcurrentHashMap<String, Object> assetCache;
    
    public AssetManager() {
        this.assetCache = new ConcurrentHashMap<>();
    }
    
    public CompletableFuture<InputStream> loadResourceAsync(String resourcePath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                URL resourceUrl = getClass().getResource(resourcePath);
                if (resourceUrl != null) {
                    return resourceUrl.openStream();
                } else {
                    throw new IOException("Resource not found: " + resourcePath);
                }
            } catch (IOException e) {
                logger.error("Failed to load resource: {}", resourcePath, e);
                throw new RuntimeException(e);
            }
        });
    }
    
    public CompletableFuture<byte[]> loadResourceBytesAsync(String resourcePath) {
        return loadResourceAsync(resourcePath).thenApply(inputStream -> {
            try (inputStream) {
                return inputStream.readAllBytes();
            } catch (IOException e) {
                logger.error("Failed to read resource bytes: {}", resourcePath, e);
                throw new RuntimeException(e);
            }
        });
    }
    
    public void cacheAsset(String key, Object asset) {
        assetCache.put(key, asset);
        logger.debug("Cached asset: {}", key);
    }
    
    @SuppressWarnings("unchecked")
    public <T> T getCachedAsset(String key, Class<T> type) {
        Object asset = assetCache.get(key);
        if (asset != null && type.isInstance(asset)) {
            return (T) asset;
        }
        return null;
    }
    
    public void clearCache() {
        assetCache.clear();
        logger.debug("Asset cache cleared");
    }
    
    public int getCacheSize() {
        return assetCache.size();
    }
}
```

### Step 9: Copy Existing Assets

#### 9.1 Copy HTML/CSS/JS Files
```bash
# Copy existing UI files
cp ../src/index.html src/main/resources/ui/
cp ../src/styles/main.css src/main/resources/ui/
cp -r ../src/modules src/main/resources/ui/
```

#### 9.2 Copy Game Assets
```bash
# Copy existing game assets
cp -r ../assets src/main/resources/
```

### Step 10: Create Basic Tests

**File: `src/test/java/com/game/DatabaseManagerTest.java`**
```java
package com.game;

import com.game.persistence.DatabaseManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseManagerTest {
    
    private DatabaseManager databaseManager;
    
    @BeforeEach
    void setUp() {
        databaseManager = new DatabaseManager();
    }
    
    @AfterEach
    void tearDown() throws Exception {
        if (databaseManager != null) {
            databaseManager.close();
        }
    }
    
    @Test
    void testDatabaseInitialization() throws SQLException {
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        Connection connection = databaseManager.getConnection();
        assertNotNull(connection);
        assertFalse(connection.isClosed());
    }
    
    @Test
    void testAsyncConnection() {
        assertDoesNotThrow(() -> databaseManager.initialize());
        
        databaseManager.getConnectionAsync()
            .thenAccept(connection -> {
                assertNotNull(connection);
                assertDoesNotThrow(() -> assertFalse(connection.isClosed()));
            })
            .join();
    }
}
```

## Testing Phase 1

### 10.1 Build and Run
```bash
# Navigate to javafx directory
cd javafx

# Build the project
./gradlew build

# Run in development mode
./gradlew run -Pprofile=dev
```

### 10.2 Verification Checklist

- ✅ **Application Starts**: JavaFX application launches without errors
- ✅ **WebView Loads**: Existing HTML/JS UI loads in WebView
- ✅ **Database Connection**: SQLite database connects successfully
- ✅ **Menu Bar**: Menu bar appears with File and Debug menus
- ✅ **Logging**: Application logs appear in console
- ✅ **Window Management**: Window can be resized and closed properly

### 10.3 Common Issues and Solutions

#### Issue: WebView doesn't load HTML content
**Solution**: Check file paths and ensure HTML files are copied to resources directory

#### Issue: Database connection fails
**Solution**: Verify SQLite database file exists and has proper permissions

#### Issue: GraalVM native compilation fails
**Solution**: Ensure GraalVM is properly installed and JAVA_HOME is set correctly

#### Issue: JavaFX modules not found
**Solution**: Check JavaFX version compatibility and module configuration

## Next Steps

After completing Phase 1, you should have:

1. **Working JavaFX Application**: Basic application that launches and displays
2. **WebView Integration**: Existing HTML/JS UI loads and displays
3. **Database Connectivity**: SQLite database connection established
4. **Build System**: Gradle build system with native image support
5. **Development Environment**: Proper development setup with logging

**Ready for Phase 2**: Core Systems Migration
- Game loop implementation
- Input system with JavaFX events
- Camera and rendering pipeline
- World generation and chunk management

## Commit Checkpoint

After completing Phase 1, commit your changes:

```bash
git add javafx/
git commit -m "Phase 1: JavaFX Foundation with WebView Integration

- Basic JavaFX application structure
- WebView integration for existing HTML/JS UI
- SQLite database connectivity with virtual threads
- Gradle build system with native image support
- Asset manager for resource loading
- Basic test framework setup

Ready for Phase 2: Core Systems Migration"
``` 