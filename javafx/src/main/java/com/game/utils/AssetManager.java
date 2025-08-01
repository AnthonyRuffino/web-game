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