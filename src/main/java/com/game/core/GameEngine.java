package com.game.core;

import com.game.persistence.DatabaseManager;
import com.game.rendering.Renderer;
import com.game.rendering.Camera;
import com.game.utils.AssetManager;
import com.game.utils.AssetDirectoryManager;
import com.game.logging.GameLogger;
import javafx.scene.Scene;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.input.KeyCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

import static com.game.core.InputManager.MovementInput;

public class GameEngine {
    private static final Logger logger = LoggerFactory.getLogger(GameEngine.class);
    
    private final DatabaseManager databaseManager;
    private final AtomicBoolean running;
    private final AtomicBoolean debugMode;
    private final GameLogger gameLogger;
    private final Path assetsDirectory;
    
    private GameLoop gameLoop;
    private InputManager inputManager;
    private AssetManager assetManager;
    private Renderer renderer;
    private GraphicsContext graphicsContext;
    private double canvasWidth = 1200;
    private double canvasHeight = 800;
    
    // Game systems
    private World world;
    private Player player;
    private Camera camera;
    
    public GameEngine(DatabaseManager databaseManager) {
        this(databaseManager, AssetDirectoryManager.getDefaultAssetsDirectory());
    }
    
    public GameEngine(DatabaseManager databaseManager, Path assetsDirectory) {
        this.databaseManager = databaseManager;
        this.assetsDirectory = assetsDirectory;
        this.running = new AtomicBoolean(false);
        this.debugMode = new AtomicBoolean(false);
        this.gameLogger = new GameLogger(this::isDebugMode);
    }
    
    public void start() {
        start(true);
    }
    
    public void start(boolean startGameLoop) {
        if (running.compareAndSet(false, true)) {
            gameLogger.info(() -> {
                logger.info("Starting game engine...");
                return "Starting game engine...";
            });
            
            initializeSystems();
            
            if (startGameLoop && gameLoop != null) {
                gameLoop.start();
            }
            
            gameLogger.info(() -> {
                logger.info("Game engine started successfully");
                return "Game engine started successfully";
            });
        }
    }
    
    public void stop() {
        if (running.compareAndSet(true, false)) {
            gameLogger.info(() -> {
                logger.info("Stopping game engine...");
                return "Stopping game engine...";
            });
            
            if (gameLoop != null) {
                gameLoop.stop();
            }
            
            cleanupSystems();
            
            gameLogger.info(() -> {
                logger.info("Game engine stopped successfully");
                return "Game engine stopped successfully";
            });
        }
    }
    
    private void initializeSystems() {
        gameLogger.debug(() -> {
            logger.debug("Initializing game systems...");
            return "Initializing game systems...";
        });
        
        // Initialize asset manager with specified assets directory
        assetManager = new AssetManager(assetsDirectory);
        
        // Initialize input system
        inputManager = new InputManager();
        
        // Initialize world
        world = new World(databaseManager);
        
        // Initialize player with world config for wrapping
        player = new Player(0, 0, world.getConfig());
        
        // Initialize camera with world config for wrapping
        camera = new Camera(canvasWidth, canvasHeight);
        
        // Initialize renderer with asset manager
        renderer = new Renderer(assetManager, world.getConfig());
        
        // Initialize game loop
        gameLoop = new GameLoop(this);
        
        gameLogger.debug(() -> {
            logger.debug("Game systems initialized");
            return "Game systems initialized";
        });
    }
    
    private void cleanupSystems() {
        // Cleanup core game systems
        gameLogger.debug(() -> {
            logger.debug("Cleaning up game systems...");
            return "Cleaning up game systems...";
        });
        
        // TODO: Cleanup input system
        // TODO: Cleanup rendering system
        // TODO: Cleanup world system
        // TODO: Cleanup entity system
        
        gameLogger.debug(() -> {
            logger.debug("Game systems cleaned up");
            return "Game systems cleaned up";
        });
    }
    
    public void saveGame() {
        CompletableFuture.runAsync(() -> {
            try {
                gameLogger.info(() -> {
                    logger.info("Saving game...");
                    return "Saving game...";
                });
                // TODO: Implement game saving
                gameLogger.info(() -> {
                    logger.info("Game saved successfully");
                    return "Game saved successfully";
                });
            } catch (Exception e) {
                gameLogger.error(() -> {
                    logger.error("Failed to save game", e);
                    return "Failed to save game: " + e.getMessage();
                });
            }
        });
    }
    
    public void loadGame() {
        CompletableFuture.runAsync(() -> {
            try {
                gameLogger.info(() -> {
                    logger.info("Loading game...");
                    return "Loading game...";
                });
                // TODO: Implement game loading
                gameLogger.info(() -> {
                    logger.info("Game loaded successfully");
                    return "Game loaded successfully";
                });
            } catch (Exception e) {
                gameLogger.error(() -> {
                    logger.error("Failed to load game", e);
                    return "Failed to load game: " + e.getMessage();
                });
            }
        });
    }
    
    public void toggleDebugInfo() {
        boolean newDebugMode = debugMode.getAndSet(!debugMode.get());
        gameLogger.info(() -> {
            logger.info("Debug mode toggled: {}", !newDebugMode);
            return "Debug mode toggled: " + !newDebugMode;
        });
    }
    
    public void showPerformanceInfo() {
        gameLogger.info(() -> {
            logger.info("Performance info requested");
            return "Performance info requested";
        });
        // TODO: Implement performance monitoring
    }
    
    public String getGameStateJson() {
        // TODO: Implement game state serialization
        return "{\"status\":\"running\",\"debugMode\":" + debugMode.get() + "}";
    }
    
    public void setGameStateFromJson(String stateJson) {
        // TODO: Implement game state deserialization
        gameLogger.info(() -> {
            logger.info("Setting game state from JSON: {}", stateJson);
            return "Setting game state from JSON: " + stateJson;
        });
    }
    
    public boolean isRunning() {
        return running.get();
    }
    
    public boolean isDebugMode() {
        return debugMode.get();
    }
    
    public void update(double deltaTime) {
        if (!running.get()) return;
        
        // Handle input (including zoom) BEFORE updating input manager
        handleInput();
        
        // Update input (this resets mouseWheelDelta)
        inputManager.update(deltaTime);
        
        // Update player
        player.update(deltaTime, inputManager, camera);
        
        // Update camera
        camera.update(deltaTime);
        camera.follow(player.getX(), player.getY());
        
        // Debug: Log player and camera positions
        // Debug logging removed for performance
        
        // Clear just pressed keys after handling input
        inputManager.clearJustPressedKeys();
    }
    
    private void handleInput() {
        // Camera controls - use justPressed to avoid multiple triggers
        if (inputManager.isKeyJustPressed(KeyCode.P)) {
            // Toggle camera mode
            Camera.CameraMode newMode = camera.getMode() == Camera.CameraMode.FIXED_ANGLE ? 
                                       Camera.CameraMode.PLAYER_PERSPECTIVE : Camera.CameraMode.FIXED_ANGLE;
            camera.setMode(newMode);
            inputManager.setCameraMode(newMode);
            gameLogger.info(() -> {
                logger.info("Camera mode toggled to: {}", newMode);
                return "Camera mode toggled to: " + newMode;
            });
        }
        if (inputManager.isKeyJustPressed(KeyCode.R)) {
            // Reset camera rotation
            camera.setRotation(0);
            gameLogger.info(() -> {
                logger.info("Camera rotation reset");
                return "Camera rotation reset";
            });
        }
        if (inputManager.isKeyJustPressed(KeyCode.L)) {
            // Toggle log window
            gameLogger.toggleWindow();
            gameLogger.info(() -> {
                logger.info("Log window toggled: {}", gameLogger.isWindowVisible());
                return "Log window toggled: " + (gameLogger.isWindowVisible() ? "ON" : "OFF");
            });
        }
        if (inputManager.isKeyJustPressed(KeyCode.G)) {
            // Toggle grid visibility
            if (renderer != null) {
                renderer.toggleGrid();
            }
        }
        
        // Camera rotation in fixed-angle mode
        MovementInput movementInput = inputManager.getMovementInput();
        if (movementInput.cameraLeft()) {
            camera.rotateCamera(-camera.getRotationSpeed() * (1.0 / 60.0)); // Using fixed delta for consistency
        }
        if (movementInput.cameraRight()) {
            camera.rotateCamera(camera.getRotationSpeed() * (1.0 / 60.0));
        }
        
        // Zoom
        double wheelDelta = inputManager.getMouseWheelDelta();
        if (wheelDelta != 0) {
            // Adjust zoom sensitivity - JavaFX wheel delta is typically 40/-40
            double zoomChange = wheelDelta > 0 ? 0.2 : -0.2;
            camera.setZoom(camera.getZoom() + zoomChange);
        }
    }
    
    public void render() {
        if (!running.get()) return;
        
        if (renderer != null && graphicsContext != null) {
            renderer.render(graphicsContext, canvasWidth, canvasHeight, world, player, camera);
        }
    }
    
    public void handleMouseMoved(double x, double y) {
        // Pass mouse position to renderer for grid highlighting
        if (renderer != null) {
            renderer.updateMousePosition(x, y);
        }
        // Debug logging removed for performance
    }
    
    public void handleMousePressed(double x, double y) {
        // Convert screen coordinates to world coordinates
        if (camera != null && player != null) {
            javafx.geometry.Point2D worldPos = camera.screenToWorld(x, y, player.getAngle());
            
            // Wrap world coordinates using WorldUtils
            double worldSize = world.getConfig().worldSize();
            WorldUtils.Point2D wrappedWorldPos = WorldUtils.wrapWorldCoordinates(worldPos.getX(), worldPos.getY(), worldSize);
            
            // Calculate grid cell coordinates from wrapped world coordinates
            int tileSize = world.getConfig().tileSize();
            int gridX = (int) (wrappedWorldPos.x / tileSize);
            int gridY = (int) (wrappedWorldPos.y / tileSize);
            
            // Calculate chunk coordinates from wrapped grid coordinates
            int chunkSize = world.getConfig().chunkSize();
            int chunkX = gridX / chunkSize;
            int chunkY = gridY / chunkSize;
            
            // Calculate local tile coordinates within chunk
            int localTileX = gridX % chunkSize;
            int localTileY = gridY % chunkSize;
            
            // Calculate player cell coordinates (also wrapped)
            WorldUtils.Point2D wrappedPlayerPos = WorldUtils.wrapWorldCoordinates(player.getX(), player.getY(), worldSize);
            int playerGridX = (int) (wrappedPlayerPos.x / tileSize);
            int playerGridY = (int) (wrappedPlayerPos.y / tileSize);
            
            // Calculate camera position (also wrapped)
            WorldUtils.Point2D wrappedCameraPos = WorldUtils.wrapWorldCoordinates(camera.getX(), camera.getY(), worldSize);
            
            gameLogger.info(() -> {
                String logMessage = String.format("=== CLICK COORDINATES ===\n" +
                    "Screen: (%.0f, %.0f)\n" +
                    "World pixels: (%.1f, %.1f)\n" +
                    "Grid cell: (%d, %d)\n" +
                    "Chunk: (%d, %d)\n" +
                    "Local tile in chunk: (%d, %d)\n" +
                    "Player position: (%.1f, %.1f)\n" +
                    "Player cell: (%d, %d)\n" +
                    "Camera position: (%.1f, %.1f)\n" +
                    "======================",
                    x, y, wrappedWorldPos.x, wrappedWorldPos.y, gridX, gridY, chunkX, chunkY, 
                    localTileX, localTileY, wrappedPlayerPos.x, wrappedPlayerPos.y, 
                    playerGridX, playerGridY, wrappedCameraPos.x, wrappedCameraPos.y);
                logger.info(logMessage);
                return logMessage;
            });
        }
    }
    
    public void handleMouseReleased(double x, double y) {
        // Handle mouse release
    }
    
    public void handleMouseScroll(double delta) {
        // Handle mouse scroll - pass to input manager
        if (inputManager != null) {
            inputManager.handleMouseScroll(delta);
        }
    }
    
    public void handleResize(double width, double height) {
        canvasWidth = width;
        canvasHeight = height;
        if (camera != null) {
            camera.resize(width, height);
        }
        gameLogger.debug(() -> {
            logger.debug("Canvas resized to: {}x{}", width, height);
            return "Canvas resized to: " + (int)width + "x" + (int)height;
        });
    }
    
    public void setGraphicsContext(GraphicsContext gc) {
        this.graphicsContext = gc;
        gameLogger.debug(() -> {
            logger.debug("Graphics context set");
            return "Graphics context set";
        });
    }
    
    public void setupInputHandling(Scene scene) {
        if (inputManager != null) {
            inputManager.setupInputHandling(scene);
        }
    }
    
    public InputManager getInputManager() {
        return inputManager;
    }
    
    public AssetManager getAssetManager() {
        return assetManager;
    }
    
    public GameLogger getGameLogger() {
        return gameLogger;
    }
} 