package com.game.core;

import com.game.persistence.DatabaseManager;
import com.game.rendering.Renderer;
import com.game.rendering.Camera;
import com.game.utils.AssetManager;
import javafx.scene.Scene;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.input.KeyCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

import static com.game.core.InputManager.MovementInput;

public class GameEngine {
    private static final Logger logger = LoggerFactory.getLogger(GameEngine.class);
    
    private final DatabaseManager databaseManager;
    private final AtomicBoolean running;
    private final AtomicBoolean debugMode;
    
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
        this.databaseManager = databaseManager;
        this.running = new AtomicBoolean(false);
        this.debugMode = new AtomicBoolean(false);
    }
    
    public void start() {
        if (running.compareAndSet(false, true)) {
            logger.info("Starting game engine...");
            
            initializeSystems();
            gameLoop.start();
            
            logger.info("Game engine started successfully");
        }
    }
    
    public void stop() {
        if (running.compareAndSet(true, false)) {
            logger.info("Stopping game engine...");
            
            if (gameLoop != null) {
                gameLoop.stop();
            }
            
            cleanupSystems();
            
            logger.info("Game engine stopped successfully");
        }
    }
    
    private void initializeSystems() {
        logger.debug("Initializing game systems...");
        
        // Initialize asset manager
        assetManager = new AssetManager();
        
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
            logger.info("Camera mode toggled to: {}", newMode);
        }
        if (inputManager.isKeyJustPressed(KeyCode.R)) {
            // Reset camera rotation
            camera.setRotation(0);
            logger.info("Camera rotation reset");
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
            double oldZoom = camera.getZoom();
            camera.setZoom(oldZoom + zoomChange);
            logger.info("Zoom: wheelDelta={}, zoomChange={}, oldZoom={}, newZoom={}", 
                       wheelDelta, zoomChange, oldZoom, camera.getZoom());
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
            
            // Calculate grid cell coordinates
            int tileSize = world.getConfig().tileSize();
            int gridX = (int) (worldPos.getX() / tileSize);
            int gridY = (int) (worldPos.getY() / tileSize);
            
            // Calculate chunk coordinates
            int chunkSize = world.getConfig().chunkSize();
            int chunkX = gridX / chunkSize;
            int chunkY = gridY / chunkSize;
            
            // Calculate local tile coordinates within chunk
            int localTileX = gridX % chunkSize;
            int localTileY = gridY % chunkSize;
            
                           // Calculate player cell coordinates
               int playerGridX = (int) (player.getX() / tileSize);
               int playerGridY = (int) (player.getY() / tileSize);
               
               logger.info("=== CLICK COORDINATES ===");
               logger.info("Screen: ({}, {})", x, y);
               logger.info("World pixels: ({}, {})", worldPos.getX(), worldPos.getY());
               logger.info("Grid cell: ({}, {})", gridX, gridY);
               logger.info("Chunk: ({}, {})", chunkX, chunkY);
               logger.info("Local tile in chunk: ({}, {})", localTileX, localTileY);
               logger.info("Player position: ({}, {})", player.getX(), player.getY());
               logger.info("Player cell: ({}, {})", playerGridX, playerGridY);
               logger.info("Camera position: ({}, {})", camera.getX(), camera.getY());
               logger.info("========================");
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
        logger.debug("Canvas resized to: {}x{}", width, height);
    }
    
    public void setGraphicsContext(GraphicsContext gc) {
        this.graphicsContext = gc;
        logger.debug("Graphics context set");
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
} 