# Loading Images for Assets

## Problem Statement

The filesystem image loading system has several critical issues that prevent uploaded images from being properly saved, loaded, and displayed. These issues include timing problems, inconsistent key naming, double file extensions, and improper image processing.

## Current Issues

1. **Timing Issues**: Images searched before filesystem is available in Electron
2. **Double Extensions**: `.png` suffix added twice when saving uploaded images
3. **Inconsistent Keys**: Different key formats for saving vs loading
4. **Improper Loading**: Images loaded without proper configs (wrong size, rotation)
5. **Missing Integration**: Filesystem images not properly integrated with config system

## Solution: Robust Filesystem Image Loading

### Core Principles

1. **Wait for Filesystem**: Ensure Electron filesystem is available before loading
2. **Consistent Keys**: Use same key format for saving and loading
3. **Proper Processing**: Resize and process images before saving
4. **Config Integration**: Load images with proper entity configs
5. **Fallback System**: Graceful degradation when filesystem unavailable

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Upload    │───▶│  Image Process  │───▶│  Filesystem     │
│  (Electron)     │    │  (Resize/Config)│    │  (Save)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Asset Cache    │    ┌─────────────────┐    │  Config Store   │
│  (Memory)       │    │  Key Standard   │    │  (localStorage) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed Requirements

### 1. Filesystem Timing Issues

#### 1.1 Wait for Electron Filesystem
```javascript
// In AssetManager constructor
async initAssetDir() {
    try {
        if (typeof window !== 'undefined' && window.electronAPI) {
            // Wait for Electron filesystem to be available
            await this.waitForFilesystem();
            console.log('[AssetManager] Filesystem available');
            this.assetDir = await window.electronAPI.getAssetDirectory();
        } else {
            console.log('[AssetManager] Running in browser environment');
            this.assetDir = null;
        }
    } catch (error) {
        console.warn('[AssetManager] Could not initialize filesystem access:', error);
        this.assetDir = null;
    }
}

async waitForFilesystem() {
    const maxAttempts = 50; // 5 seconds max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        if (window.electronAPI && window.electronAPI.getAssetDirectory) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    throw new Error('Filesystem not available after timeout');
}
```

#### 1.2 Delayed Image Loading
```javascript
// In initializeImages()
async initializeImages() {
    console.log('[AssetManager] Initializing all required images...');
    
    // Wait for filesystem if in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
        await this.waitForFilesystem();
    }
    
    // Now load images
    const requiredImages = [...];
    const promises = requiredImages.map(image => 
        this.ensureImageLoaded(image.type, image.name, image.config, image.entityClass)
    );
    
    await Promise.all(promises);
}
```

### 2. Consistent Key Naming

#### 2.1 Standard Key Format
```javascript
// Standard format for all image keys
const keyFormat = {
    entity: 'image:entity:{entityName}',
    background: 'image:background:{backgroundName}',
    custom: 'image:{type}:{name}'
};

// Examples:
// image:entity:tree
// image:entity:grass
// image:entity:rock
// image:background:plains
// image:background:desert
```

#### 2.2 Key Generation Methods
```javascript
// In AssetManager
generateCacheKey(type, name) {
    return `image:${type}:${name}`;
}

generateEntityKey(entityName) {
    return this.generateCacheKey('entity', entityName);
}

generateBackgroundKey(backgroundName) {
    return this.generateCacheKey('background', backgroundName);
}
```

#### 2.3 Consistent Usage
```javascript
// Use same key format everywhere
const treeKey = this.generateEntityKey('tree');
const plainsKey = this.generateBackgroundKey('plains');

// Save with consistent key
await this.saveToFilesystem(treeKey, imageData);

// Load with same key
const cachedImage = this.getCachedImage(treeKey);
```

### 3. File Extension Handling

#### 3.1 No Double Extensions
```javascript
// In saveToFilesystem()
async saveToFilesystem(imageName, dataURL) {
    try {
        if (!this.assetDir) {
            console.warn('[AssetManager] No asset directory available');
            return false;
        }

        // Remove any existing extension from imageName
        const baseName = imageName.replace(/\.(png|jpg|jpeg|gif)$/i, '');
        
        // Add .png extension only once
        const fileName = `${baseName}.png`;
        const filePath = `${this.assetDir}/${fileName}`;
        
        console.log(`[AssetManager] Saving image to: ${filePath}`);
        
        // Convert data URL to buffer and save
        const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        await window.electronAPI.saveFile(filePath, buffer);
        console.log(`[AssetManager] Successfully saved: ${fileName}`);
        
        return true;
    } catch (error) {
        console.error('[AssetManager] Error saving to filesystem:', error);
        return false;
    }
}
```

#### 3.2 Consistent Loading
```javascript
// In loadFromFilesystem()
async loadFromFilesystem(imageName) {
    try {
        if (!this.assetDir) {
            console.log('[AssetManager] No asset directory available');
            return null;
        }

        // Remove any existing extension and add .png
        const baseName = imageName.replace(/\.(png|jpg|jpeg|gif)$/i, '');
        const fileName = `${baseName}.png`;
        const filePath = `${this.assetDir}/${fileName}`;
        
        console.log(`[AssetManager] Loading image from: ${filePath}`);
        
        const fileData = await window.electronAPI.readFile(filePath);
        if (!fileData) {
            console.log(`[AssetManager] File not found: ${fileName}`);
            return null;
        }
        
        // Convert buffer to data URL
        const base64Data = Buffer.from(fileData).toString('base64');
        const dataURL = `data:image/png;base64,${base64Data}`;
        
        console.log(`[AssetManager] Successfully loaded: ${fileName}`);
        return dataURL;
    } catch (error) {
        console.error('[AssetManager] Error loading from filesystem:', error);
        return null;
    }
}
```

### 4. Image Processing and Config Integration

#### 4.1 Pre-Save Processing
```javascript
// Process image before saving to filesystem
async processImageForSave(imageFile, entityType, config) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Create canvas for processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Get target size from config
            const targetSize = config.size || 32;
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            // Draw and resize image
            ctx.drawImage(img, 0, 0, targetSize, targetSize);
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(imageFile);
    });
}
```

#### 4.2 Config-Aware Loading
```javascript
// Load image with proper config
async loadImageWithConfig(cacheKey, config) {
    // Try filesystem first
    const filesystemData = await this.loadFromFilesystem(cacheKey);
    if (filesystemData) {
        // Create image with config
        const img = new Image();
        img.onload = () => {
            const cacheObj = {
                image: img,
                size: config.size || img.width,
                fixedScreenAngle: config.fixedScreenAngle,
                drawOffsetX: config.drawOffsetX || 0,
                drawOffsetY: config.drawOffsetY || 0
            };
            
            this.imageCache.set(cacheKey, cacheObj);
            console.log(`[AssetManager] Loaded filesystem image with config: ${cacheKey}`);
        };
        img.src = filesystemData;
        return;
    }
    
    // Fallback to localStorage or generation
    await this.ensureImageLoaded(cacheKey, config);
}
```

### 5. Upload Integration

#### 5.1 Upload with Processing
```javascript
// In skins menu upload handler
async handleImageUpload(entityType, file) {
    try {
        // Get entity config for processing
        const entityConfig = this.assetManager.getEntityConfig(`entity:${entityType}`);
        if (!entityConfig) {
            throw new Error(`No config found for entity: ${entityType}`);
        }
        
        // Process image to correct size
        const processedDataURL = await this.processImageForSave(file, entityType, entityConfig);
        
        // Generate cache key
        const cacheKey = this.assetManager.generateEntityKey(entityType);
        
        // Save to filesystem
        const saved = await this.assetManager.saveToFilesystem(cacheKey, processedDataURL);
        if (!saved) {
            throw new Error('Failed to save image to filesystem');
        }
        
        // Update cache with processed image
        await this.assetManager.loadImageWithConfig(cacheKey, entityConfig);
        
        console.log(`[Skins] Successfully uploaded and processed ${entityType} image`);
        return true;
    } catch (error) {
        console.error(`[Skins] Upload failed:`, error);
        return false;
    }
}
```

#### 5.2 Preview and Validation
```javascript
// Preview uploaded image before saving
async previewUploadedImage(file, entityType) {
    const entityConfig = this.assetManager.getEntityConfig(`entity:${entityType}`);
    if (!entityConfig) {
        throw new Error(`No config found for entity: ${entityType}`);
    }
    
    const processedDataURL = await this.processImageForSave(file, entityType, entityConfig);
    
    // Show preview in menu
    this.showImagePreview(processedDataURL, entityConfig);
    
    return processedDataURL;
}
```

### 6. Error Handling and Fallbacks

#### 6.1 Graceful Degradation
```javascript
// In ensureImageLoaded()
async ensureImageLoaded(type, imageName, config = {}, entityClass = null) {
    const cacheKey = this.generateCacheKey(type, imageName);
    
    // Check memory cache first
    if (this.imageCache.has(cacheKey)) {
        return this.imageCache.get(cacheKey);
    }
    
    try {
        // Try filesystem (if available)
        if (this.assetDir) {
            const filesystemData = await this.loadFromFilesystem(cacheKey);
            if (filesystemData) {
                await this.loadImageWithConfig(cacheKey, config);
                return this.imageCache.get(cacheKey);
            }
        }
    } catch (error) {
        console.warn(`[AssetManager] Filesystem load failed for ${cacheKey}:`, error);
    }
    
    // Fallback to localStorage
    try {
        const localStorageData = localStorage.getItem(cacheKey);
        if (localStorageData) {
            await this.loadImageWithConfig(cacheKey, config);
            return this.imageCache.get(cacheKey);
        }
    } catch (error) {
        console.warn(`[AssetManager] localStorage load failed for ${cacheKey}:`, error);
    }
    
    // Final fallback: generate image
    return await this.generateImage(type, imageName, config, entityClass);
}
```

#### 6.2 Validation and Logging
```javascript
// Validate uploaded files
validateImageFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PNG, JPEG, or GIF image.');
    }
    
    if (file.size > maxSize) {
        throw new Error('File too large. Please upload an image smaller than 5MB.');
    }
    
    return true;
}
```

### 7. Implementation Phases

#### Phase 1: Filesystem Timing
1. Fix timing issues with Electron filesystem
2. Add proper waiting mechanisms
3. Test filesystem availability

#### Phase 2: Key Standardization
1. Implement consistent key generation
2. Update all save/load operations
3. Test key consistency

#### Phase 3: File Extension Handling
1. Fix double extension issues
2. Implement proper file naming
3. Test file save/load cycle

#### Phase 4: Image Processing
1. Add pre-save image processing
2. Implement config-aware loading
3. Test image quality and sizing

#### Phase 5: Upload Integration
1. Integrate with skins menu
2. Add preview functionality
3. Test full upload workflow

### 8. Success Criteria

#### 8.1 Functional Requirements
- ✅ Filesystem images load correctly on startup
- ✅ Uploaded images save with proper names
- ✅ Images load with correct size and config
- ✅ No double file extensions
- ✅ Consistent key naming throughout

#### 8.2 Technical Requirements
- ✅ Proper timing with Electron filesystem
- ✅ Image processing before save
- ✅ Config integration with loading
- ✅ Graceful fallback system

#### 8.3 User Experience
- ✅ Fast image loading
- ✅ Proper image sizing
- ✅ Reliable upload process
- ✅ Clear error messages

### 9. Benefits

#### 9.1 Reliability
- **Consistent Loading**: Images load reliably on startup
- **Proper Sizing**: Images display at correct size
- **Config Respect**: Images respect entity configs

#### 9.2 User Experience
- **Fast Uploads**: Quick and reliable image uploads
- **Proper Preview**: See how images will look before saving
- **No Errors**: Clean upload process without technical issues

#### 9.3 Maintainability
- **Consistent Code**: Standardized key and file handling
- **Clear Errors**: Better error messages and debugging
- **Robust System**: Handles edge cases gracefully

## Conclusion

Fixing the filesystem image loading issues will provide a solid foundation for the skins system and user customization. The key is to ensure proper timing, consistent naming, and config-aware processing so that uploaded images work seamlessly with the game's rendering system.

This work should be done after the rendering refactor and menu system are in place, as it builds upon those foundations and provides the final piece needed for a complete skins system. 