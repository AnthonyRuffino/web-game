// Menu Manager for dynamic menu system
// Follows patterns from ui/menuManager.js with viewport-relative scaling

import { Menu } from './menus/Menu.js';

export class MenuManager {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.menus = new Map();
        this.nextZIndex = 1000;
        
        // Event system for menu dependencies
        this.eventBus = new EventTarget();
        this.menuEventListeners = new Map(); // menuId -> [listeners]
        
        // Menu persistence
        this.menuStorageKey = 'electronMenuConfigurations';
        this.savedConfigurations = this.loadMenuConfigurations();
        
        this.setupEscapeKeyHandler();
        this.setupWindowResizeHandler();
        console.log('[MenuManager] Menu system initialized');
        console.log('[MenuManager] Loaded saved configurations:', this.savedConfigurations);
    }

    // Save menu configurations to localStorage
    saveMenuConfigurations() {
        try {
            const menuConfigs = {};
            
            // Collect configurations from all menus
            for (const [menuId, menu] of this.menus) {
                if (menu.userModifications.hasBeenModified) {
                    // Validate that we have valid dimensions (not zero)
                    const size = menu.userModifications.size;
                    const position = menu.userModifications.position;
                    
                    if (size.width > 0 && size.height > 0) {
                        menuConfigs[menuId] = {
                            position: { ...position },
                            size: { ...size },
                            hasBeenModified: true
                        };
                    } else {
                        console.warn(`[MenuManager] Skipping save for menu ${menuId} - invalid dimensions: ${size.width}x${size.height}`);
                    }
                }
            }
            
            // Update in-memory saved configurations
            this.savedConfigurations = menuConfigs;
            
            localStorage.setItem(this.menuStorageKey, JSON.stringify(menuConfigs));
            console.log('[MenuManager] Menu configurations saved to localStorage');
            return true;
        } catch (error) {
            console.error('[MenuManager] Failed to save menu configurations:', error);
            return false;
        }
    }

    // Load menu configurations from localStorage
    loadMenuConfigurations() {
        try {
            const savedConfigs = localStorage.getItem(this.menuStorageKey);
            if (!savedConfigs) {
                console.log('[MenuManager] No saved menu configurations found');
                return {};
            }
            
            const menuConfigs = JSON.parse(savedConfigs);
            console.log('[MenuManager] Loaded menu configurations from localStorage:', menuConfigs);
            return menuConfigs;
        } catch (error) {
            console.error('[MenuManager] Failed to load menu configurations:', error);
            return {};
        }
    }

    // Apply saved configurations to existing menus
    applySavedConfigurations() {
        const savedConfigs = this.loadMenuConfigurations();
        
        for (const [menuId, savedConfig] of Object.entries(savedConfigs)) {
            const menu = this.menus.get(menuId);
            if (menu && savedConfig.hasBeenModified) {
                menu.userModifications = {
                    position: { ...savedConfig.position },
                    size: { ...savedConfig.size },
                    hasBeenModified: true
                };
                console.log(`[MenuManager] Applied saved configuration to menu: ${menuId}`);
            }
        }
    }

    createMenu(config, override = false) {
        if (!config.id) {
            throw new Error('Menu config must include an id property');
        }
        
        // Check if menu already exists
        if (this.menus.has(config.id) && !override) {
            throw new Error(`Menu with id '${config.id}' already exists`);
        }

        // If override is true and menu exists, destroy the old one
        if (this.menus.has(config.id) && override) {
            console.log(`[MenuManager] Overriding existing menu: ${config.id}`);
            const existingMenu = this.menus.get(config.id);
            existingMenu.destroy();
            this.menus.delete(config.id);
        }
        const menu = new Menu(config);
        
        // Apply saved configuration if it exists (using pre-loaded configs)
        const savedConfig = this.savedConfigurations[config.id];
        if (savedConfig && savedConfig.hasBeenModified) {
            menu.userModifications = {
                position: { ...savedConfig.position },
                size: { ...savedConfig.size },
                hasBeenModified: true
            };
            console.log(`[MenuManager] Applied saved configuration to new menu: ${config.id}`, savedConfig);
        }
        
        this.menus.set(menu.id, menu);
        
        // Setup event listeners for this menu if it has closeListeners
        if (config.closeListeners && (Array.isArray(config.closeListeners) ? config.closeListeners.length > 0 : Object.keys(config.closeListeners).length > 0)) {
            this.setupMenuCloseListeners(menu.id, config.closeListeners);
        }
        
        console.log(`[MenuManager] Created menu: ${menu.id}`);
        return menu.id;
    }

    showMenu(menuId, bringMenuToFront = true) {
        let menu = this.menus.get(menuId);
        if (menu) {
            if (bringMenuToFront) {
                // Bump z-index for this menu
                this.bringMenuToFront(menu);
            }
            menu.show();
            console.log(`[MenuManager] Showed menu: ${menuId}`);
            return true;
        } else {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
            return false;   
        }
    }

    hideMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (menu) {
            // Emit menuClosed event before hiding
            this.emitMenuEvent('menuClosed', {
                menuId: menuId,
                timestamp: Date.now()
            });
            
            menu.hide();
            console.log(`[MenuManager] Hid menu: ${menuId}`);
        } else {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
        }
    }

    removeMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (menu) {
            menu.destroy();
            this.menus.delete(menuId);
            console.log(`[MenuManager] Removed menu: ${menuId}`);
        } else {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
        }
    }

    bringMenuToFront(menu) {
        // Find the highest z-index currently in use
        let maxZIndex = 1000;
        this.menus.forEach(m => {
            if (m.visible && m.zIndex > maxZIndex) {
                maxZIndex = m.zIndex;
            }
        });
        // Set this menu's z-index higher than the current maximum
        menu.zIndex = maxZIndex + 2;
        menu.element.style.zIndex = menu.zIndex;
        // If blocking, set overlay z-index just below menu
        if (menu.isBlocking && menu.overlay) {
            menu.overlay.style.zIndex = menu.zIndex - 1;
        }
        console.log(`[MenuManager] Brought menu ${menu.id} to front with z-index: ${menu.zIndex}`);
    }

    getTopMenu() {
        let topMenu = null;
        let highestZIndex = 0;
        this.menus.forEach(menu => {
            if (menu.visible && menu.zIndex > highestZIndex) {
                highestZIndex = menu.zIndex;
                topMenu = menu;
            }
        });
        return topMenu;
    }

    setupEscapeKeyHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const topMenu = this.getTopMenu();
                if (topMenu) {
                    topMenu.hide();
                    console.log(`[MenuManager] Closed top menu: ${topMenu.id}`);
                }
            }
        });
    }

    setupWindowResizeHandler() {
        window.addEventListener('resize', () => {
            this.menus.forEach(menu => {
                if (menu.visible && typeof menu.updateViewportPositionAndSize === 'function') {
                    menu.updateViewportPositionAndSize();
                }
            });
        });
    }

    // --- Skeleton menu configs ---

    createMacroMenuConfig(id, onCloseParent) {
        return {
            id: id,
            title: 'Macro Menu',
            viewportX: 0.2,
            viewportY: 0.18,
            viewportWidth: 0.6,
            viewportHeight: 0.6,
            isBlocking: true,
            content: '<h3>Macro Grid</h3><p>Click a cell to log action.</p>',
            gridButtons: [
                {
                    label: 'Macros',
                    rows: 4,
                    cols: 4,
                    cellSize: 80,
                    gap: 10,
                    buttons: this.getMacroGridButtons()
                }
            ],
            onClose: () => {
                console.log('onCloseParent', onCloseParent);
                this.hideMenu('macro');
            },
            onCloseParent: onCloseParent
        };
    }

    createCharacterMenuConfig(id, onCloseParent) {
        return {
            id: id,
            title: 'Character',
            viewportX: 0.22,
            viewportY: 0.15,
            viewportWidth: 0.56,
            viewportHeight: 0.65,
            isBlocking: true,
            tabs: [
                {
                    name: 'Info',
                    content: '<h3>Character Info</h3><p>Placeholder info tab.</p>',
                    buttons: [
                        { text: 'Log Info', onClick: () => console.log('Character Info button clicked') }
                    ]
                },
                {
                    name: 'Stats',
                    content: '<h3>Stats</h3><p>Placeholder stats tab.</p>',
                    buttons: [
                        { text: 'Log Stats', onClick: () => console.log('Character Stats button clicked') }
                    ]
                },
                {
                    name: 'Inventory',
                    content: '<h3>Inventory</h3><p>Placeholder inventory tab.</p>',
                    buttons: [
                        { text: 'Log Inventory', onClick: () => console.log('Character Inventory button clicked') }
                    ]
                }
            ],
            onClose: () => {
                console.log('onCloseParent', onCloseParent);
                this.hideMenu('character');
            },
            onCloseParent: onCloseParent
        };
    }

    // --- Helpers for grid buttons ---


    getMacroGridButtons() {
        // 16 cells, some with icons, some empty
        const buttons = [];
        for (let i = 0; i < 16; i++) {
            buttons.push({
                name: `Macro ${i + 1}`,
                imageDataUrl: null, // Could use assetManager for icons
                onClick: () => console.log(`[MacroMenu] Clicked macro cell ${i + 1}`),
                tooltip: `Macro slot ${i + 1}`
            });
        }
        return buttons;
    }

    // Debug methods
    listMenus() {
        const menuList = Array.from(this.menus.values()).map(menu => ({
            id: menu.id,
            title: menu.title,
            visible: menu.visible,
            zIndex: menu.zIndex
        }));
        console.log('[MenuManager] Active menus:', menuList);
        return menuList;
    }

    getMenu(menuId) {
        return this.menus.get(menuId);
    }

    destroy() {
        this.menus.forEach(menu => menu.destroy());
        this.menus.clear();
        
        // Clean up event listeners
        this.cleanupAllMenuListeners();
        
        console.log('[MenuManager] Menu system destroyed');
    }

    // --- Event System Methods ---
    
    emitMenuEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...data,
                timestamp: Date.now(),
                source: 'menu-system'
            }
        });
        
        this.eventBus.dispatchEvent(event);
        console.log(`[MenuManager] Emitted event: ${eventName}`, data);
    }
    
    setupMenuCloseListeners(menuId, closeListeners) {
        // closeListeners can be either an array of menu IDs or an object with menu IDs as keys and callbacks as values
        if (Array.isArray(closeListeners)) {
            // Simple array of menu IDs - just log when they close
            closeListeners.forEach(targetMenuId => {
                const listener = (event) => {
                    const closedMenuId = event.detail.menuId;
                    console.log(`[MenuManager][DEBUG] Listener for ${menuId}: received menuClosed event for ${closedMenuId} (target: ${targetMenuId})`);
                    if (closedMenuId === targetMenuId) {
                        console.log(`[MenuManager][DEBUG] Menu ${menuId} received close event from ${targetMenuId}`);
                    }
                };
                
                this.eventBus.addEventListener('menuClosed', listener);
                
                // Track listener for cleanup
                if (!this.menuEventListeners.has(menuId)) {
                    this.menuEventListeners.set(menuId, []);
                }
                this.menuEventListeners.get(menuId).push({
                    eventName: 'menuClosed',
                    listener: listener,
                    targetMenuId: targetMenuId
                });
                console.log(`[MenuManager][DEBUG] Registered array closeListener for ${menuId} on ${targetMenuId}`);
            });
        } else if (typeof closeListeners === 'object') {
            // Object with menu IDs as keys and callbacks as values
            Object.entries(closeListeners).forEach(([targetMenuId, callback]) => {
                const listener = (event) => {
                    const closedMenuId = event.detail.menuId;
                    console.log(`[MenuManager][DEBUG] Listener for ${menuId}: received menuClosed event for ${closedMenuId} (target: ${targetMenuId})`);
                    if (closedMenuId === targetMenuId) {
                        console.log(`[MenuManager][DEBUG] About to call closeListener callback for ${menuId} due to ${closedMenuId}`);
                        try {
                            callback();
                            console.log(`[MenuManager][DEBUG] closeListener callback for ${menuId} executed successfully.`);
                        } catch (error) {
                            console.error(`[MenuManager][DEBUG] Error in closeListener callback for ${menuId}:`, error);
                        }
                    }
                };
                
                this.eventBus.addEventListener('menuClosed', listener);
                
                // Track listener for cleanup
                if (!this.menuEventListeners.has(menuId)) {
                    this.menuEventListeners.set(menuId, []);
                }
                this.menuEventListeners.get(menuId).push({
                    eventName: 'menuClosed',
                    listener: listener,
                    targetMenuId: targetMenuId,
                    callback: callback
                });
                console.log(`[MenuManager][DEBUG] Registered object closeListener for ${menuId} on ${targetMenuId}`);
            });
        }
        
        console.log(`[MenuManager] Setup close listeners for menu ${menuId}`);
    }
    
    cleanupMenuListeners(menuId) {
        const listeners = this.menuEventListeners.get(menuId) || [];
        listeners.forEach(({ eventName, listener }) => {
            this.eventBus.removeEventListener(eventName, listener);
        });
        this.menuEventListeners.delete(menuId);
        console.log(`[MenuManager] Cleaned up listeners for menu: ${menuId}`);
    }
    
    cleanupAllMenuListeners() {
        this.menuEventListeners.forEach((listeners, menuId) => {
            this.cleanupMenuListeners(menuId);
        });
    }

    // --- Menu Persistence Utility Methods ---
    
    // Clear all saved menu configurations
    clearMenuConfigurations() {
        try {
            localStorage.removeItem(this.menuStorageKey);
            this.savedConfigurations = {};
            console.log('[MenuManager] Cleared all saved menu configurations');
            return true;
        } catch (error) {
            console.error('[MenuManager] Failed to clear menu configurations:', error);
            return false;
        }
    }

    // Get information about saved menu configurations
    getMenuConfigurationInfo() {
        try {
            const menuCount = Object.keys(this.savedConfigurations).length;
            const menuIds = Object.keys(this.savedConfigurations);
            
            return {
                totalMenus: menuCount,
                menuIds: menuIds,
                storageKey: this.menuStorageKey,
                hasData: menuCount > 0
            };
        } catch (error) {
            console.error('[MenuManager] Failed to get menu configuration info:', error);
            return { totalMenus: 0, menuIds: [], storageKey: this.menuStorageKey, hasData: false };
        }
    }

    // Reset a specific menu to its default configuration
    resetMenuConfiguration(menuId) {
        try {
            if (this.savedConfigurations[menuId]) {
                delete this.savedConfigurations[menuId];
                localStorage.setItem(this.menuStorageKey, JSON.stringify(this.savedConfigurations));
                
                // Also reset the menu in memory if it exists
                const menu = this.menus.get(menuId);
                if (menu) {
                    menu.userModifications = {
                        position: { x: null, y: null },
                        size: { width: null, height: null },
                        hasBeenModified: false
                    };
                }
                
                console.log(`[MenuManager] Reset configuration for menu: ${menuId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[MenuManager] Failed to reset configuration for menu ${menuId}:`, error);
            return false;
        }
    }
} 