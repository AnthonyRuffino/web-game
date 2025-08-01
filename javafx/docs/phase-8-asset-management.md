# Phase 8: Asset Management System

## Overview

Phase 8 implements a comprehensive asset management system with SVG generation, filesystem persistence, and dynamic image replacement. This system creates default images for entities and backgrounds, persists them to disk, and allows real-time replacement.

## Objectives

- 📋 Create SVG generation system for entities and backgrounds
- 📋 Implement filesystem asset persistence outside repository
- 📋 Add asset loading with fallback to SVG generation
- 📋 Create dynamic image replacement system
- 📋 Implement asset caching and management
- 📋 Add background generation for biomes

## Current Status

### ✅ Completed (Phases 1-7)
- JavaFX application foundation
- Canvas-based rendering system
- 60 FPS game loop with AnimationTimer
- Input system with keyboard and mouse handling
- Database connectivity with virtual threads
- World generation and chunk management
- Player movement and controls
- Camera system with fixed-angle and player-perspective modes
- Entity rendering system

### 🔄 In Progress (Phase 8)
- SVG image generation system
- Filesystem asset management
- Dynamic image replacement
- Asset caching system

## Step-by-Step Implementation

### Step 1: Asset Directory Management

**File: `src/main/java/com/game/utils/AssetDirectoryManager.java`**
```java
package com.game.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

public class AssetDirectoryManager {
    private static final Logger logger = LoggerFactory.getLogger(AssetDirectoryManager.class);
    
    private final Path assetsDirectory;
    
    public AssetDirectoryManager() {
        // Create assets directory in user's home folder
        String userHome = System.getProperty("user.home");
        this.assetsDirectory = Paths.get(userHome, ".web-game", "assets");
        
        ensureDirectoryExists();
        logger.info("Asset directory initialized: {}", assetsDirectory);
    }
    
    private void ensureDirectoryExists() {
        File directory = assetsDirectory.toFile();
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                logger.info("Created assets directory: {}", assetsDirectory);
            } else {
                logger.error("Failed to create assets directory: {}", assetsDirectory);
            }
        }
    }
    
    public Path getAssetsDirectory() {
        return assetsDirectory;
    }
    
    public Path getEntityImagePath(String entityType, String imageName) {
        return assetsDirectory.resolve("entities").resolve(entityType).resolve(imageName + ".png");
    }
    
    public Path getBackgroundImagePath(String backgroundName) {
        return assetsDirectory.resolve("backgrounds").resolve(backgroundName + ".png");
    }
    
    public Path getEntityDirectory(String entityType) {
        Path entityDir = assetsDirectory.resolve("entities").resolve(entityType);
        entityDir.toFile().mkdirs();
        return entityDir;
    }
    
    public Path getBackgroundDirectory() {
        Path backgroundDir = assetsDirectory.resolve("backgrounds");
        backgroundDir.toFile().mkdirs();
        return backgroundDir;
    }
}
```

### Step 2: SVG Generation System

**File: `src/main/java/com/game/utils/SvgGenerator.java`**
```java
package com.game.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;

public class SvgGenerator {
    private static final Logger logger = LoggerFactory.getLogger(SvgGenerator.class);
    
    public static BufferedImage generateTreeImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        // Enable anti-aliasing
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw trunk
        g2d.setColor(new Color(139, 69, 19)); // Saddle brown
        g2d.fillRect(size / 2 - 4, size / 2 + 8, 8, 16);
        
        // Draw leaves
        g2d.setColor(new Color(34, 139, 34)); // Forest green
        g2d.fillOval(size / 2 - 12, size / 2 - 12, 24, 24);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generateRockImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw rock
        g2d.setColor(new Color(128, 128, 128)); // Gray
        g2d.fillOval(size / 2 - 8, size / 2 - 8, 16, 16);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generateGrassImage(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw grass
        g2d.setColor(new Color(124, 252, 0)); // Lawn green
        g2d.fillOval(size / 2 - 4, size / 2 - 4, 8, 8);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generatePlainsBackground(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Create gradient background
        GradientPaint gradient = new GradientPaint(
            0, 0, new Color(135, 206, 235), // Sky blue
            0, size, new Color(144, 238, 144) // Light green
        );
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, size, size);
        
        g2d.dispose();
        return image;
    }
    
    public static BufferedImage generateDesertBackground(int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Create desert gradient
        GradientPaint gradient = new GradientPaint(
            0, 0, new Color(255, 215, 0), // Gold
            0, size, new Color(210, 180, 140) // Tan
        );
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, size, size);
        
        g2d.dispose();
        return image;
    }
    
    public static byte[] imageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }
    
    public static BufferedImage bytesToImage(byte[] bytes) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        return ImageIO.read(bais);
    }
}
```

### Step 3: Asset Manager

**File: `src/main/java/com/game/utils/AssetManager.java`**
```java
package com.game.utils;

import javafx.scene.image.Image;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AssetManager {
    private static final Logger logger = LoggerFactory.getLogger(AssetManager.class);
    
    private final AssetDirectoryManager directoryManager;
    private final Map<String, Image> imageCache;
    private final Map<String, byte[]> imageDataCache;
    
    public AssetManager() {
        this.directoryManager = new AssetDirectoryManager();
        this.imageCache = new ConcurrentHashMap<>();
        this.imageDataCache = new ConcurrentHashMap<>();
        
        logger.info("Asset manager initialized");
    }
    
    public Image getEntityImage(String entityType, String imageName) {
        String cacheKey = "entity:" + entityType + ":" + imageName;
        
        // Check cache first
        if (imageCache.containsKey(cacheKey)) {
            return imageCache.get(cacheKey);
        }
        
        // Try to load from filesystem
        Image image = loadFromFilesystem(entityType, imageName);
        if (image != null) {
            imageCache.put(cacheKey, image);
            return image;
        }
        
        // Generate and save
        image = generateAndSaveEntityImage(entityType, imageName);
        if (image != null) {
            imageCache.put(cacheKey, image);
        }
        
        return image;
    }
    
    public Image getBackgroundImage(String backgroundName) {
        String cacheKey = "background:" + backgroundName;
        
        // Check cache first
        if (imageCache.containsKey(cacheKey)) {
            return imageCache.get(cacheKey);
        }
        
        // Try to load from filesystem
        Image image = loadBackgroundFromFilesystem(backgroundName);
        if (image != null) {
            imageCache.put(cacheKey, image);
            return image;
        }
        
        // Generate and save
        image = generateAndSaveBackgroundImage(backgroundName);
        if (image != null) {
            imageCache.put(cacheKey, image);
        }
        
        return image;
    }
    
    private Image loadFromFilesystem(String entityType, String imageName) {
        try {
            Path imagePath = directoryManager.getEntityImagePath(entityType, imageName);
            File imageFile = imagePath.toFile();
            
            if (imageFile.exists()) {
                logger.debug("Loading entity image from filesystem: {}", imagePath);
                return new Image(new FileInputStream(imageFile));
            }
        } catch (Exception e) {
            logger.warn("Failed to load entity image from filesystem: {}", e.getMessage());
        }
        
        return null;
    }
    
    private Image loadBackgroundFromFilesystem(String backgroundName) {
        try {
            Path imagePath = directoryManager.getBackgroundImagePath(backgroundName);
            File imageFile = imagePath.toFile();
            
            if (imageFile.exists()) {
                logger.debug("Loading background image from filesystem: {}", imagePath);
                return new Image(new FileInputStream(imageFile));
            }
        } catch (Exception e) {
            logger.warn("Failed to load background image from filesystem: {}", e.getMessage());
        }
        
        return null;
    }
    
    private Image generateAndSaveEntityImage(String entityType, String imageName) {
        try {
            BufferedImage bufferedImage = null;
            
            switch (entityType) {
                case "tree" -> bufferedImage = SvgGenerator.generateTreeImage(32);
                case "rock" -> bufferedImage = SvgGenerator.generateRockImage(32);
                case "grass" -> bufferedImage = SvgGenerator.generateGrassImage(32);
                default -> {
                    logger.warn("Unknown entity type for image generation: {}", entityType);
                    return null;
                }
            }
            
            if (bufferedImage != null) {
                // Save to filesystem
                Path imagePath = directoryManager.getEntityImagePath(entityType, imageName);
                imagePath.getParent().toFile().mkdirs();
                
                byte[] imageData = SvgGenerator.imageToBytes(bufferedImage);
                try (FileOutputStream fos = new FileOutputStream(imagePath.toFile())) {
                    fos.write(imageData);
                }
                
                logger.info("Generated and saved entity image: {}", imagePath);
                
                // Convert to JavaFX Image
                return new Image(new ByteArrayInputStream(imageData));
            }
        } catch (Exception e) {
            logger.error("Failed to generate entity image: {}", e.getMessage());
        }
        
        return null;
    }
    
    private Image generateAndSaveBackgroundImage(String backgroundName) {
        try {
            BufferedImage bufferedImage = null;
            
            switch (backgroundName) {
                case "plains" -> bufferedImage = SvgGenerator.generatePlainsBackground(640);
                case "desert" -> bufferedImage = SvgGenerator.generateDesertBackground(640);
                default -> {
                    logger.warn("Unknown background type for image generation: {}", backgroundName);
                    return null;
                }
            }
            
            if (bufferedImage != null) {
                // Save to filesystem
                Path imagePath = directoryManager.getBackgroundImagePath(backgroundName);
                imagePath.getParent().toFile().mkdirs();
                
                byte[] imageData = SvgGenerator.imageToBytes(bufferedImage);
                try (FileOutputStream fos = new FileOutputStream(imagePath.toFile())) {
                    fos.write(imageData);
                }
                
                logger.info("Generated and saved background image: {}", imagePath);
                
                // Convert to JavaFX Image
                return new Image(new ByteArrayInputStream(imageData));
            }
        } catch (Exception e) {
            logger.error("Failed to generate background image: {}", e.getMessage());
        }
        
        return null;
    }
    
    public void replaceEntityImage(String entityType, String imageName, byte[] imageData) {
        try {
            // Save to filesystem
            Path imagePath = directoryManager.getEntityImagePath(entityType, imageName);
            imagePath.getParent().toFile().mkdirs();
            
            try (FileOutputStream fos = new FileOutputStream(imagePath.toFile())) {
                fos.write(imageData);
            }
            
            // Update cache
            String cacheKey = "entity:" + entityType + ":" + imageName;
            Image newImage = new Image(new ByteArrayInputStream(imageData));
            imageCache.put(cacheKey, newImage);
            imageDataCache.put(cacheKey, imageData);
            
            logger.info("Replaced entity image: {}", imagePath);
        } catch (Exception e) {
            logger.error("Failed to replace entity image: {}", e.getMessage());
        }
    }
    
    public void clearCache() {
        imageCache.clear();
        imageDataCache.clear();
        logger.info("Asset cache cleared");
    }
    
    public AssetDirectoryManager getDirectoryManager() {
        return directoryManager;
    }
}
```

### Step 4: Update Renderer to Use Asset Manager

**File: `src/main/java/com/game/rendering/Renderer.java`**
```java
// Add to existing Renderer class:

private final AssetManager assetManager;

public Renderer(AssetManager assetManager) {
    this.assetManager = assetManager;
}

private void drawEntity(GraphicsContext gc, Entity entity) {
    Image entityImage = assetManager.getEntityImage(entity.type(), entity.type());
    
    if (entityImage != null) {
        // Draw image instead of simple shapes
        double size = entity.size();
        gc.drawImage(entityImage, entity.x() - size / 2, entity.y() - size / 2, size, size);
    } else {
        // Fallback to simple shapes
        switch (entity.type()) {
            case "tree" -> drawTree(gc, entity.x(), entity.y());
            case "rock" -> drawRock(gc, entity.x(), entity.y());
            case "grass" -> drawGrass(gc, entity.x(), entity.y());
            default -> logger.debug("Unknown entity type: {}", entity.type());
        }
    }
}

private void drawBackground(GraphicsContext gc, String biomeName) {
    Image backgroundImage = assetManager.getBackgroundImage(biomeName);
    
    if (backgroundImage != null) {
        // Draw tiled background
        double imageWidth = backgroundImage.getWidth();
        double imageHeight = backgroundImage.getHeight();
        
        // Calculate how many tiles we need
        double cameraX = camera.getX();
        double cameraY = camera.getY();
        double viewWidth = camera.getWidth() / camera.getZoom();
        double viewHeight = camera.getHeight() / camera.getZoom();
        
        double startX = cameraX - viewWidth / 2;
        double startY = cameraY - viewHeight / 2;
        double endX = cameraX + viewWidth / 2;
        double endY = cameraY + viewHeight / 2;
        
        // Draw background tiles
        for (double x = startX - (startX % imageWidth); x < endX; x += imageWidth) {
            for (double y = startY - (startY % imageHeight); y < endY; y += imageHeight) {
                gc.drawImage(backgroundImage, x, y);
            }
        }
    } else {
        // Fallback to solid color
        gc.setFill(Color.SKYBLUE);
        gc.fillRect(-1000, -1000, 2000, 2000);
    }
}
```

### Step 5: Update Game Engine

**File: `src/main/java/com/game/core/GameEngine.java`**
```java
// Add to existing GameEngine class:

private AssetManager assetManager;

private void initializeSystems() {
    logger.debug("Initializing game systems...");
    
    // Initialize asset manager
    assetManager = new AssetManager();
    
    // Initialize input system
    inputManager = new InputManager();
    
    // Initialize world
    world = new World(databaseManager);
    
    // Initialize player
    player = new Player(0, 0);
    
    // Initialize camera
    camera = new Camera(canvasWidth, canvasHeight);
    
    // Initialize renderer with asset manager
    renderer = new Renderer(assetManager);
    
    // Initialize game loop
    gameLoop = new GameLoop(this);
    
    logger.debug("Game systems initialized");
}

public AssetManager getAssetManager() {
    return assetManager;
}
```

## Testing Phase 8

### Build and Test
```bash
cd javafx
./gradlew clean build
./gradlew run
```

### Verification Checklist

- ✅ **Asset Directory**: Created in user's home folder
- ✅ **SVG Generation**: Default images generated for trees, rocks, grass
- ✅ **Background Generation**: Plains and desert backgrounds created
- ✅ **Filesystem Persistence**: Images saved to disk
- ✅ **Asset Loading**: Images loaded from disk with fallback
- ✅ **Image Caching**: Efficient caching system working
- ✅ **Dynamic Replacement**: Images can be replaced at runtime

## Asset Directory Structure

```
~/.web-game/assets/
├── entities/
│   ├── tree/
│   │   └── tree.png
│   ├── rock/
│   │   └── rock.png
│   └── grass/
│       └── grass.png
└── backgrounds/
    ├── plains.png
    └── desert.png
```

## Next Steps

**Ready for Phase 9**: Menu System Implementation
- Dynamic menu building system
- Menu manager with overlaying menus
- Menu bar at bottom of screen
- Entity skin configuration menus 