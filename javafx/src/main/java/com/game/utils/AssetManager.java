package com.game.utils;

import javafx.scene.image.Image;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.game.graphics.svg.SvgGeneratorWebView;
import com.game.graphics.svg.EntityConfig;

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
                // Debug logging removed for performance
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
                // Debug logging removed for performance
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
                case "tree" -> {
                    EntityConfig.TreeConfig config = new EntityConfig.TreeConfig();
                    config.size = 32;
                    bufferedImage = SvgGeneratorWebView.generateTreeImage(config);
                }
                case "rock" -> {
                    EntityConfig.RockConfig config = new EntityConfig.RockConfig();
                    config.size = 32;
                    bufferedImage = SvgGeneratorWebView.generateRockImage(config);
                }
                case "grass" -> {
                    EntityConfig.GrassConfig config = new EntityConfig.GrassConfig();
                    config.size = 32;
                    bufferedImage = SvgGeneratorWebView.generateGrassImage(config);
                }
                default -> {
                    logger.warn("Unknown entity type for image generation: {}", entityType);
                    return null;
                }
            }
            
            if (bufferedImage != null) {
                // Save to filesystem
                Path imagePath = directoryManager.getEntityImagePath(entityType, imageName);
                imagePath.getParent().toFile().mkdirs();
                
                byte[] imageData = SvgGeneratorWebView.imageToBytes(bufferedImage);
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
                case "plains" -> bufferedImage = SvgGeneratorWebView.generatePlainsBackground(640);
                case "desert" -> bufferedImage = SvgGeneratorWebView.generateDesertBackground(640);
                default -> {
                    logger.warn("Unknown background type for image generation: {}", backgroundName);
                    return null;
                }
            }
            
            if (bufferedImage != null) {
                // Save to filesystem
                Path imagePath = directoryManager.getBackgroundImagePath(backgroundName);
                imagePath.getParent().toFile().mkdirs();
                
                byte[] imageData = SvgGeneratorWebView.imageToBytes(bufferedImage);
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