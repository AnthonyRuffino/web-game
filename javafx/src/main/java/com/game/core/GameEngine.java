package com.game.core;

import com.game.persistence.DatabaseManager;
import com.game.rendering.Renderer;
import com.game.rendering.Camera;
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
        
        // Initialize input system
        inputManager = new InputManager();
        
        // Initialize world
        world = new World(databaseManager);
        
        // Initialize player
        player = new Player(0, 0);
        
        // Initialize camera
        camera = new Camera(canvasWidth, canvasHeight);
        
        // Initialize renderer
        renderer = new Renderer();
        
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
        
        // Update input
        inputManager.update(deltaTime);
        
        // Update player
        player.update(deltaTime, inputManager, camera);
        
        // Update camera
        camera.update(deltaTime);
        camera.follow(player.getX(), player.getY());
        
        // Handle input
        handleInput();
        
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
            camera.setZoom(camera.getZoom() + wheelDelta * 0.1);
        }
    }
    
    public void render() {
        if (!running.get()) return;
        
        if (renderer != null && graphicsContext != null) {
            renderer.render(graphicsContext, canvasWidth, canvasHeight, world, player, camera);
        }
    }
    
    public void handleMouseMoved(double x, double y) {
        // Handle mouse movement
    }
    
    public void handleMousePressed(double x, double y) {
        // Handle mouse press
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
} 