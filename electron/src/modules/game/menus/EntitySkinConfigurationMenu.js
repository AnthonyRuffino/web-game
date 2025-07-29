// electron/src/modules/game/menus/EntitySkinConfigurationMenu.js
// Entity-specific skin configuration menu
import { GrassEntity } from '../entities/grass.js';
import { TreeEntity } from '../entities/tree.js';
import { RockEntity } from '../entities/rock.js';

export class EntitySkinConfigurationMenu {
    constructor(entityType, menuManager) {
        this.entityType = entityType;
        this.entityName = entityType.type;
        this.menuManager = menuManager;
        this.menuId = `entity-skin-configuration-${this.entityName}`;
    }

    // Create the entity skin configuration menu
    createMenuConfig(onCloseParent) {
        const menuManager = this.menuManager;
        const entityName = this.entityName;
        
        return {
            id: this.menuId,
            title: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} Skin Configuration`,
            viewportX: 0.25,
            viewportY: 0.2,
            viewportWidth: 0.5,
            viewportHeight: 0.6,
            isBlocking: false,
            content: `
                <h3>${entityName.charAt(0).toUpperCase() + entityName.slice(1)} Skin Configuration</h3>
                <p>Upload a new image to replace the current ${entityName} skin.</p>
                
                <div id="current-config-container" style="margin: 20px 0; padding: 15px; background: #333; border-radius: 8px;">
                    <h4>Entity Configuration (JSON)</h4>
                    <p style="color: #aaa; font-size: 12px; margin-bottom: 10px;">
                        Edit the configuration below and click "Save Config" to apply changes.
                    </p>
                    <textarea id="config-json-editor" style="
                        width: 100%;
                        height: 120px;
                        background: #222;
                        color: #fff;
                        border: 1px solid #555;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 12px;
                        padding: 8px;
                        resize: vertical;
                    " placeholder="Loading configuration..."></textarea>
                    <div style="margin-top: 10px;">
                        <button id="save-config-button" style="
                            background: #4ECDC4; 
                            color: #222; 
                            border: none; 
                            border-radius: 5px; 
                            padding: 8px 16px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin-right: 10px;
                        ">Save Config</button>
                        <button id="reset-config-button" style="
                            background: #FF6B6B; 
                            color: #fff; 
                            border: none; 
                            border-radius: 5px; 
                            padding: 8px 16px; 
                            font-weight: bold; 
                            cursor: pointer;
                        ">Reset Config</button>
                    </div>
                </div>
                
                <div id="current-image-container" style="margin: 20px 0;">
                    <h4>Current Image</h4>
                    <div id="current-image-preview" style="
                        width: 128px; 
                        height: 128px; 
                        border: 2px solid #444; 
                        border-radius: 8px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        background: #333;
                        margin: 10px 0;
                    ">
                        <span style="color: #aaa;">Loading...</span>
                    </div>
                </div>
                
                <div id="upload-section" style="margin: 20px 0;">
                    <h4>Upload New Image</h4>
                    <p style="color: #aaa; font-size: 12px; margin-bottom: 10px;">
                        Images will be automatically resized to ${entityName} size and use current positioning settings.
                    </p>
                    <input type="file" id="image-upload-input" accept="image/*" style="display: none;">
                    <button id="upload-button" style="
                        background: #4ECDC4; 
                        color: #222; 
                        border: none; 
                        border-radius: 5px; 
                        padding: 10px 20px; 
                        font-weight: bold; 
                        cursor: pointer;
                        margin-right: 10px;
                    ">Choose Image File</button>
                    <button id="reset-button" style="
                        background: #FF6B6B; 
                        color: #fff; 
                        border: none; 
                        border-radius: 5px; 
                        padding: 10px 20px; 
                        font-weight: bold; 
                        cursor: pointer;
                    ">Reset to Default</button>
                </div>
                
                <div id="new-image-container" style="margin: 20px 0; display: none;">
                    <h4>New Image Preview</h4>
                    <div id="new-image-preview" style="
                        width: 128px; 
                        height: 128px; 
                        border: 2px solid #4ECDC4; 
                        border-radius: 8px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        background: #333;
                        margin: 10px 0;
                    ">
                    </div>
                    <button id="apply-button" style="
                        background: #4ECDC4; 
                        color: #222; 
                        border: none; 
                        border-radius: 5px; 
                        padding: 10px 20px; 
                        font-weight: bold; 
                        cursor: pointer;
                        margin-top: 10px;
                    ">Apply New Image</button>
                </div>
            `,
            onClose: () => {
                menuManager.hideMenu(this.menuId);
                if (onCloseParent) onCloseParent();
            },
            onCloseParent: onCloseParent
        };
    }

    // Create and show the entity skin configuration menu
    createAndShow(onCloseParent) {
        if (this.menuManager.showMenu(this.menuId)) {
            console.log(`[EntitySkinConfigurationMenu] showed existing menu: ${this.menuId}`);
        } else {
            const config = this.createMenuConfig(onCloseParent);
            this.menuId = this.menuManager.createMenu(config);
            this.menu = this.menuManager.getMenu(this.menuId);
            
            // Set up the menu functionality after it's created
            this.setupMenuFunctionality();
            
            this.menuManager.showMenu(this.menuId);
            console.log(`[EntitySkinConfigurationMenu] Created and showed menu: ${this.menuId}`);
        }
        
        return this.menuId;
    }

    // Set up the menu functionality
    setupMenuFunctionality() {
        const menuElement = this.menu.element;
        if (!menuElement) return;

        // Get references to elements
        const currentImagePreview = menuElement.querySelector('#current-image-preview');
        const uploadButton = menuElement.querySelector('#upload-button');
        const resetButton = menuElement.querySelector('#reset-button');
        const applyButton = menuElement.querySelector('#apply-button');
        const newImageContainer = menuElement.querySelector('#new-image-container');
        const newImagePreview = menuElement.querySelector('#new-image-preview');
        const fileInput = menuElement.querySelector('#image-upload-input');
        const configEditor = menuElement.querySelector('#config-json-editor');
        const saveConfigButton = menuElement.querySelector('#save-config-button');
        const resetConfigButton = menuElement.querySelector('#reset-config-button');

        // Load current image
        this.loadCurrentImage(currentImagePreview);

        // Load and display current config
        this.loadCurrentConfig();

        // Set up upload button
        uploadButton.onclick = () => fileInput.click();

        // Set up file input
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                this.handleFileUpload(file, newImagePreview, newImageContainer);
                // Clear the input value so the same file can be selected again
                event.target.value = '';
            }
        };
        
        // Also clear on click to ensure onchange fires even for same file
        fileInput.onclick = (event) => {
            event.target.value = '';
        };

        // Set up reset button
        resetButton.onclick = () => this.resetToDefault();

        // Set up apply button
        applyButton.onclick = () => this.applyNewImage();

        // Set up config save button
        saveConfigButton.onclick = () => this.saveConfig();

        // Set up config reset button
        resetConfigButton.onclick = () => this.resetConfig();
    }

    // Load the current image for the entity
    loadCurrentImage(container) {
        const assetManager = this.menuManager.assetManager;
        if (!assetManager) {
            container.innerHTML = '<span style="color: #aaa;">Asset manager not available</span>';
            return;
        }

        const key = this.entityType.getImageCacheKey();
        const cached = assetManager.imageCache.get(key);
        
        if (cached && cached.image) {
            const img = document.createElement('img');
            img.src = cached.image.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '6px';
            container.innerHTML = '';
            container.appendChild(img);
        } else {
            container.innerHTML = '<span style="color: #aaa;">No custom image set</span>';
        }
    }

    // Get the current entity type config
    getEntityTypeConfig() {
        const assetManager = this.menuManager.assetManager;
        if (!assetManager) return null;
        
        return assetManager.getEntityTypeConfig(this.entityName) || null;
    }

    // Load and display current config values
    loadCurrentConfig() {
        const menuElement = this.menu.element;
        if (!menuElement) return;

        const config = this.getEntityTypeConfig();
        if (!config) {
            console.warn(`[EntitySkinConfigurationMenu] No config found for entity: ${this.entityName}`);
            return;
        }

        // Update JSON editor with formatted config
        const configEditor = menuElement.querySelector('#config-json-editor');
        if (configEditor) {
            configEditor.value = JSON.stringify(config, null, 2);
        }
    }

    // Save the edited config
    saveConfig() {
        const menuElement = this.menu.element;
        if (!menuElement) return;

        const configEditor = menuElement.querySelector('#config-json-editor');
        if (!configEditor) return;

        try {
            // Parse the JSON from the editor
            const newConfig = JSON.parse(configEditor.value);
            
            // Validate the config has required fields
            if (typeof newConfig.size !== 'number') {
                alert('Config must include a "size" field (number)');
                return;
            }

            const assetManager = this.menuManager.assetManager;
            if (!assetManager) {
                alert('Asset manager not available');
                return;
            }

            // Update the in-memory config
            assetManager.saveEntityTypeConfig(this.entityName, newConfig);

            // Save to localStorage
            try {
                const savedConfigs = localStorage.getItem('entityTypeConfigs');
                const configs = savedConfigs ? JSON.parse(savedConfigs) : {};
                configs[configKey] = newConfig;
                localStorage.setItem('entityTypeConfigs', JSON.stringify(configs));
                console.log(`[EntitySkinConfigurationMenu] Saved config for ${this.entityName}:`, newConfig);
            } catch (e) {
                console.warn('Failed to save config to localStorage:', e);
            }

        } catch (e) {
            alert(`Invalid JSON: ${e.message}`);
        }
    }

    // Reset the config to default
    resetConfig() {
        const assetManager = this.menuManager.assetManager;
        if (!assetManager) {
            alert('Asset manager not available');
            return;
        }

        // Get the default config from the entity class
        let defaultConfig = null;
        switch (this.entityName) {
            case 'tree':
                defaultConfig = { ...TreeEntity.defaultConfig };
                break;
            case 'grass':
                defaultConfig = { ...GrassEntity.defaultConfig };
                break;
            case 'rock':
                defaultConfig = { ...RockEntity.defaultConfig };
                break;
        }

        if (!defaultConfig) {
            // Fallback default config
            defaultConfig = {
                size: 32,
                fixedScreenAngle: null,
                drawOffsetX: 0,
                drawOffsetY: 0
            };
        }

        // Update the in-memory config
        assetManager.saveEntityTypeConfig(this.entityName, defaultConfig);

        // Save to localStorage
        try {
            const savedConfigs = localStorage.getItem('entityTypeConfigs');
            const configs = savedConfigs ? JSON.parse(savedConfigs) : {};
            configs[configKey] = defaultConfig;
            localStorage.setItem('entityTypeConfigs', JSON.stringify(configs));
            console.log(`[EntitySkinConfigurationMenu] Reset config for ${this.entityName}:`, defaultConfig);
        } catch (e) {
            console.warn('Failed to save reset config to localStorage:', e);
        }

        // Reload the config display
        this.loadCurrentConfig();
    }

    // Handle file upload
    handleFileUpload(file, previewContainer, container) {
        console.log(`[EntitySkinConfigurationMenu] handleFileUpload`);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const config = this.getEntityTypeConfig();
                console.log(`[EntitySkinConfigurationMenu] Image loaded: ${img.width}x${img.height}`, config.imageHeight);
                // Get the current entity type config for proper sizing
                const targetHeight = config ? (config.imageHeight || config.size || 20) : 20;
                const widthToHeightRatio = img.width/img.height;
                const targetWidth = targetHeight*widthToHeightRatio;
                
                // Create canvas to resize the image to the target size
                const canvas = document.createElement('canvas');
                canvas.width = targetHeight;
                canvas.height = targetWidth;
                const ctx = canvas.getContext('2d');
                
                // Draw the uploaded image resized to the target size
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                
                // Get the resized data URL
                const resizedDataUrl = canvas.toDataURL('image/png');
                
                // Clear the preview container
                previewContainer.innerHTML = '';
                
                // Create and add the preview image (show at 128px for preview)
                const previewImg = document.createElement('img');
                previewImg.src = resizedDataUrl;
                previewImg.style.width = '100%';
                previewImg.style.height = '100%';
                previewImg.style.objectFit = 'contain';
                previewImg.style.borderRadius = '6px';
                previewContainer.appendChild(previewImg);
                
                // Store the resized data URL for later use
                this.pendingImageDataUrl = resizedDataUrl;
                
                // Show the new image container
                container.style.display = 'block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Reset to default image
    resetToDefault() {
        const assetManager = this.menuManager.assetManager;
        if (!assetManager) {
            alert('Asset manager not available');
            return;
        }

        const key = this.entityType.getImageCacheKey();
        
        // Remove from asset manager cache
        assetManager.imageCache.delete(key);
        
        // Remove from localStorage
        localStorage.removeItem(key);
        
        // Reload the current image
        const currentImagePreview = this.menu.element.querySelector('#current-image-preview');
        this.loadCurrentImage(currentImagePreview);
        
        // Hide the new image container
        const newImageContainer = this.menu.element.querySelector('#new-image-container');
        newImageContainer.style.display = 'none';

        // Emit a custom event for skin updates - delay 100ms to wait for the image to be generated on-the-fly
        setTimeout(() => {
            const skinUpdateEvent = new CustomEvent('skinUpdated', {
                detail: { entityName: this.entityName, type: 'entity' }
            });
            document.dispatchEvent(skinUpdateEvent);
        }, 100);
    }

    // Apply the new image
    async applyNewImage() {
        if (!this.pendingImageDataUrl) {
            alert('No image to apply. Please upload an image first.');
            return;
        }

        try {
            // Use AssetManager's utility method to update the image
            const success = await this.menuManager.assetManager.updateImage(
                'entity',
                this.entityType,
                this.pendingImageDataUrl
            );

            if (success) {
                // Clear the pending image
                this.pendingImageDataUrl = null;

                // Refresh the skins menu to show updated images
                if (this.menuManager.getMenu('skins')) {
                    const skinsMenu = this.menuManager.getMenu('skins');
                    if (skinsMenu && skinsMenu.refreshMenu) {
                        skinsMenu.refreshMenu();
                    }
                }

                // Emit a custom event for skin updates - delay 100ms to wait for the image to be generated on-the-fly
                setTimeout(() => {
                    const skinUpdateEvent = new CustomEvent('skinUpdated', {
                        detail: { entityName: this.entityName, type: 'entity' }
                    });
                    document.dispatchEvent(skinUpdateEvent);
                }, 100);
            } else {
                alert(`Failed to update ${this.entityName} image. Please try again.`);
            }
        } catch (error) {
            console.error(`[EntitySkinConfigurationMenu] Error applying new image:`, error);
            alert(`Error updating ${this.entityName} image: ${error.message}`);
        }
    }

    // Show the menu (if it exists)
    show(onCloseParent) {
        if (this.menuManager.getMenu(this.menuId)) {
            this.menuManager.showMenu(this.menuId);
            console.log(`[EntitySkinConfigurationMenu] Showed existing menu: ${this.menuId}`);
            return true;
        } else {
            return this.createAndShow(onCloseParent);
        }
    }

    // Hide the menu
    hide() {
        if (this.menuManager.getMenu(this.menuId)) {
            this.menuManager.hideMenu(this.menuId);
            console.log(`[EntitySkinConfigurationMenu] Hid menu: ${this.menuId}`);
            return true;
        }
        return false;
    }

    // Toggle the menu
    toggle(onCloseParent) {
        const menu = this.menuManager.getMenu(this.menuId);
        if (menu && menu.visible) {
            return this.hide();
        } else {
            return this.show(onCloseParent);
        }
    }

    // Get the current menu instance
    getMenu() {
        return this.menuManager.getMenu(this.menuId);
    }

    // Check if the menu is visible
    isVisible() {
        const menu = this.menuManager.getMenu(this.menuId);
        return menu && menu.visible;
    }

    // Destroy the menu
    destroy() {
        if (this.menuManager.getMenu(this.menuId)) {
            this.menuManager.removeMenu(this.menuId);
            this.menu = null;
            console.log(`[EntitySkinConfigurationMenu] Destroyed menu: ${this.menuId}`);
        }
    }
} 