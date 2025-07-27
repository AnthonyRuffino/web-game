// electron/src/modules/game/menus/EntitySkinConfigurationMenu.js
// Entity-specific skin configuration menu

export class EntitySkinConfigurationMenu {
    constructor(entityName, menuManager) {
        this.entityName = entityName;
        this.menuManager = menuManager;
        this.menuId = `entity-skin-configuration-${entityName}`;
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
        const config = this.createMenuConfig(onCloseParent);
        this.menuId = this.menuManager.createMenu(config);
        this.menu = this.menuManager.getMenu(this.menuId);
        
        // Set up the menu functionality after it's created
        this.setupMenuFunctionality();
        
        this.menuManager.showMenu(this.menuId);
        console.log(`[EntitySkinConfigurationMenu] Created and showed menu: ${this.menuId}`);
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

        // Load current image
        this.loadCurrentImage(currentImagePreview);

        // Set up upload button
        uploadButton.onclick = () => fileInput.click();

        // Set up file input
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                this.handleFileUpload(file, newImagePreview, newImageContainer);
            }
        };

        // Set up reset button
        resetButton.onclick = () => this.resetToDefault();

        // Set up apply button
        applyButton.onclick = () => this.applyNewImage();
    }

    // Load the current image for the entity
    loadCurrentImage(container) {
        const assetManager = this.menuManager.assetManager;
        if (!assetManager) {
            container.innerHTML = '<span style="color: #aaa;">Asset manager not available</span>';
            return;
        }

        const key = `image:entity:${this.entityName}`;
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

    // Handle file upload
    handleFileUpload(file, previewContainer, container) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Clear the preview container
                previewContainer.innerHTML = '';
                
                // Create and add the preview image
                const previewImg = document.createElement('img');
                previewImg.src = event.target.result;
                previewImg.style.width = '100%';
                previewImg.style.height = '100%';
                previewImg.style.objectFit = 'contain';
                previewImg.style.borderRadius = '6px';
                previewContainer.appendChild(previewImg);
                
                // Store the data URL for later use
                this.pendingImageDataUrl = event.target.result;
                
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

        const key = `image:entity:${this.entityName}`;
        
        // Remove from cache
        assetManager.imageCache.delete(key);
        
        // Remove from localStorage if it exists
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
        }

        // Reload the current image
        const currentImagePreview = this.menu.element.querySelector('#current-image-preview');
        this.loadCurrentImage(currentImagePreview);

        // Hide the new image container
        const newImageContainer = this.menu.element.querySelector('#new-image-container');
        newImageContainer.style.display = 'none';

        alert(`${this.entityName} image reset to default`);
    }

    // Apply the new image
    applyNewImage() {
        if (!this.pendingImageDataUrl) {
            alert('No new image selected');
            return;
        }

        const assetManager = this.menuManager.assetManager;
        if (!assetManager) {
            alert('Asset manager not available');
            return;
        }

        const key = `image:entity:${this.entityName}`;
        
        // Create image object and add to cache
        const img = new Image();
        img.onload = () => {
            // Add to asset manager cache
            assetManager.imageCache.set(key, {
                image: img,
                size: img.width,
                fixedScreenAngle: 0,
                drawOffsetX: 0,
                drawOffsetY: 0
            });

            // Save to localStorage
            try {
                localStorage.setItem(key, this.pendingImageDataUrl);
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
            }

            // Reload the current image
            const currentImagePreview = this.menu.element.querySelector('#current-image-preview');
            this.loadCurrentImage(currentImagePreview);

            // Hide the new image container
            const newImageContainer = this.menu.element.querySelector('#new-image-container');
            newImageContainer.style.display = 'none';

            // Clear the pending image
            this.pendingImageDataUrl = null;

            alert(`${this.entityName} image updated successfully`);
        };
        img.src = this.pendingImageDataUrl;
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