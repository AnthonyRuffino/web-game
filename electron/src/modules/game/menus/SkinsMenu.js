// electron/src/modules/game/menus/SkinsMenu.js
// Dedicated Skins Menu for entity and background customization

export class SkinsMenu {
    constructor(menuId, menuManager) {
        this.menuManager = menuManager;
        this.menuId = menuId;
    }

    // Override the getImageGridButtons method to use the menuManager's assetManager
    getImageGridButtons(names, type = 'entity') {
        // Use assetManager from menuManager if available, else just placeholder
        const assetManager = this.menuManager.assetManager;
        return names.map(name => {
            let imageDataUrl = null;
            if (assetManager) {
                const key = type === 'entity' ? `image:entity:${name}` : `image:background:${name}`;
                const cached = assetManager.imageCache.get(key);
                if (cached && cached.image) {
                    // Draw to canvas and get data URL
                    const canvas = document.createElement('canvas');
                    canvas.width = 64;
                    canvas.height = 64;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(cached.image, 0, 0, 64, 64);
                    imageDataUrl = canvas.toDataURL();
                }
            }
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                imageDataUrl,
                onClick: () => this.handleImageClick(type, name),
                tooltip: `Select ${name}`
            };
        });
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
                            buttons: this.getImageGridButtons(['tree', 'grass', 'rock'])
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
                            buttons: this.getImageGridButtons(['plains', 'desert'], 'background')
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
    handleImageClick(type, name) {
        console.log(`[SkinsMenu] Clicked ${type}: ${name}`);
        
        if (type === 'entity') {
            // Import and create entity skin configuration menu
            import('./EntitySkinConfigurationMenu.js').then(module => {
                const { EntitySkinConfigurationMenu } = module;
                const entityConfigMenu = new EntitySkinConfigurationMenu(name, this.menuManager);
                entityConfigMenu.createAndShow(() => {
                    console.log(`[SkinsMenu] Entity skin configuration menu closed for ${name}`);
                });
            }).catch(error => {
                console.error('[SkinsMenu] Failed to load EntitySkinConfigurationMenu:', error);
                alert(`Failed to open skin configuration for ${name}`);
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


} 