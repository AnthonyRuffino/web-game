// electron/src/modules/game/menus/SkinsMenu.js
// Dedicated Skins Menu for entity and background customization
import { EntitySkinConfigurationMenu } from './EntitySkinConfigurationMenu.js';
import { GrassEntity } from '../entities/grass.js';
import { TreeEntity } from '../entities/tree.js';
import { RockEntity } from '../entities/rock.js';

export class SkinsMenu {
    constructor(menuId, menuManager, onParentClose) {
        this.menuManager = menuManager;
        this.menuId = menuId;
        
        // Listen for skin updates
        this.setupSkinUpdateListener();
        this.config = this.createMenuConfig(onParentClose);
    }

    // Setup listener for skin updates
    setupSkinUpdateListener() {
        document.addEventListener('skinUpdated', (event) => {
            console.log('[SkinsMenu] Skin update detected:', event.detail);
            // Refresh the menu if it's currently visible
            this.refreshMenu();
        });
    }

    // Override the getImageGridButtons method to use the menuManager's assetManager
    getImageGridButtons(entityTypes, type = 'entity') {
        return entityTypes.map(entityType => {
            const name = entityType.type;
            const entityConfigMenu = new EntitySkinConfigurationMenu(entityType, this.menuManager);
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                getImageDataUrl: () => this.getImageDataUrlForButton(entityType, type),
                onClick: () => this.handleImageClick(type, name, entityConfigMenu),
                tooltip: `Select ${name}`
            };
        });
    }

    getImageDataUrlForButton(entityType, type = 'entity') {
        const name = entityType.type;
        const assetManager = this.menuManager.assetManager;
        if(assetManager) {
            const key = type === 'entity' ? entityType.getImageCacheKey() : `image:background:${name}`;
            const cached = assetManager.imageCache.get(key);
            let imageDataUrl = null;
            if (cached && cached.image) {
                // Draw to canvas and get data URL
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(cached.image, 0, 0, 64, 64);
                imageDataUrl = canvas.toDataURL();
            }
            return imageDataUrl;
        }
        return null;
    }


    // Create the skins menu configuration
    createMenuConfig(onCloseParent) {
        const menuManager = this.menuManager;
        return {
            id: this.menuId,
            title: 'Skins & Customization',
            viewportX: 0.15,
            viewportY: 0.12,
            viewportWidth: 0.7,
            viewportHeight: 0.7,
            isBlocking: false,
            tabs: [
                {
                    name: 'Entities',
                    content: '<h3>Entity Skins</h3><p>Upload and customize entity images...</p>',
                    gridButtons: [
                        {
                            label: 'Entity Skins',
                            rows: 2,
                            cols: 3,
                            cellSize: 80,
                            gap: 10,
                            buttons: this.getImageGridButtons([TreeEntity  , GrassEntity, RockEntity])
                        }
                    ]
                },
                {
                    name: 'Backgrounds',
                    content: '<h3>Biome Backgrounds</h3><p>Customize biome backgrounds...</p>',
                    gridButtons: [
                        {
                            label: 'Background Skins',
                            rows: 1,
                            cols: 2,
                            cellSize: 120,
                            gap: 15,
                            buttons: this.getImageGridButtons([{ type:'plains', name:'Plains'}, {type: 'desert', name:'Desert'}], 'background')
                        }
                    ]
                }
            ],
            onClose: () => {
                menuManager.hideMenu(this.menuId);
                console.log('SkinsMenu onCloseParent', onCloseParent);
                if (onCloseParent) onCloseParent();
            },
            onCloseParent: onCloseParent
        };
    }



    // Handle image button clicks
    handleImageClick(type, name, entityConfigMenu) {
        console.log(`[SkinsMenu] Clicked ${type}: ${name}`);
        if (type === 'entity') {
            // Import and create entity skin configuration menu
            entityConfigMenu.createAndShow(() => {
                console.log(`[SkinsMenu] Entity skin configuration menu closed for ${name}`);
            });
        } else {
            // For backgrounds, show placeholder for now
            this.showImageOptions(type, name);
        }
    }

    // Show image options (placeholder for future functionality)
    showImageOptions(type, name) {
        console.log(`[SkinsMenu] Showing options for ${type}: ${name}`);
        // TODO: Show upload, reset, or other options for backgrounds
        alert(`Image options for ${name} (${type}) - Coming soon!`);
    }

    // Refresh the skins menu to update images
    refreshMenu() {
        console.log(`[SkinsMenu] Refreshing menu: ${this.menuId}`);

        const oldMenu = this.menuManager.getMenu(this.config.id);
        const oldMenuVisible = oldMenu.visible;
        const oldMenuZIndex = oldMenu.zIndex;
        
        // Recreate the menu with override
        this.menuManager.createMenu(this.config, true);
        
        if(oldMenuVisible) {
            const newMenu = this.menuManager.getMenu(this.config.id);
            newMenu.zIndex = oldMenuZIndex;
            // Show the new menu if the old one was visible
            this.menuManager.showMenu(this.menuId, false);
        }
        
        console.log(`[SkinsMenu] Menu refreshed successfully`);
    }


} 