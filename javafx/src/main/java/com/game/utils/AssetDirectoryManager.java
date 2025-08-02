package com.game.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

public class AssetDirectoryManager {
    private static final Logger logger = LoggerFactory.getLogger(AssetDirectoryManager.class);
    
    private final Path assetsDirectory;
    
    public AssetDirectoryManager(Path assetsDirectory) {
        this.assetsDirectory = assetsDirectory;
        ensureDirectoryExists();
        logger.info("Asset directory initialized: {}", assetsDirectory);
    }
    
    public static Path getDefaultAssetsDirectory() {
        // Create assets directory in user's home folder
        String userHome = System.getProperty("user.home");
        return Paths.get(userHome, ".web-game", "assets");
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