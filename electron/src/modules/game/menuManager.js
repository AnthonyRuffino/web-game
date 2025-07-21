// Menu Manager for dynamic menu system
// Supports viewport-relative positioning and scaling

export class MenuManager {
    constructor() {
        this.menus = new Map(); // Active menus
        this.menuCounter = 0; // For generating unique IDs
        this.activeMenu = null; // Currently focused menu
        
        // Bind methods
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Initialize event listeners
        this.initEventListeners();
        
        console.log('[MenuManager] Menu system initialized');
    }

    // Initialize event listeners for window resize and keyboard
    initEventListeners() {
        window.addEventListener('resize', this.handleWindowResize);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    // Handle window resize - update all menu positions and sizes
    handleWindowResize() {
        this.menus.forEach(menu => {
            this.updateMenuPosition(menu);
        });
    }

    // Handle keyboard events (Escape to close menus)
    handleKeyDown(event) {
        if (event.key === 'Escape' && this.activeMenu) {
            this.hideMenu(this.activeMenu.id);
        }
    }

    // Create a new menu from configuration
    createMenu(config) {
        const menuId = config.id || `menu-${++this.menuCounter}`;
        
        // Create menu element
        const menuElement = this.createMenuElement(config);
        
        // Store menu data
        const menu = {
            id: menuId,
            element: menuElement,
            config: config,
            isVisible: false
        };
        
        this.menus.set(menuId, menu);
        
        console.log(`[MenuManager] Created menu: ${menuId}`);
        return menuId;
    }

    // Create the DOM element for a menu
    createMenuElement(config) {
        const menuDiv = document.createElement('div');
        menuDiv.className = 'game-menu';
        menuDiv.id = `menu-${config.id || 'default'}`;
        
        // Set initial position and size
        this.updateMenuPosition({ config, element: menuDiv });
        
        // Create menu content
        this.createMenuContent(menuDiv, config);
        
        // Add event listeners
        this.addMenuEventListeners(menuDiv, config);
        
        // Add to document
        document.body.appendChild(menuDiv);
        
        return menuDiv;
    }

    // Update menu position and size based on viewport
    updateMenuPosition(menu) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const left = menu.config.viewportX * viewportWidth;
        const top = menu.config.viewportY * viewportHeight;
        const width = menu.config.viewportWidth * viewportWidth;
        const height = menu.config.viewportHeight * viewportHeight;
        
        // Apply position and size
        menu.element.style.position = 'absolute';
        menu.element.style.left = `${left}px`;
        menu.element.style.top = `${top}px`;
        menu.element.style.width = `${width}px`;
        menu.element.style.height = `${height}px`;
        
        // Update font sizes based on menu size
        this.updateMenuFontSizes(menu, width, height);
    }

    // Update font sizes and styling based on menu dimensions
    updateMenuFontSizes(menu, width, height) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportScale = Math.min(viewportWidth, viewportHeight) / 1000; // Base scale factor
        
        const menuSize = Math.min(width, height);
        const baseFontSize = Math.max(8, menuSize * 0.04);
        const headerFontSize = Math.max(12, menuSize * 0.05);
        const buttonFontSize = Math.max(10, menuSize * 0.035);
        
        // Calculate viewport-relative styling values
        const padding = Math.max(8, viewportScale * 16);
        const margin = Math.max(4, viewportScale * 8);
        const borderWidth = Math.max(1, viewportScale * 2);
        const borderRadius = Math.max(4, viewportScale * 8);
        const buttonPadding = Math.max(6, viewportScale * 12);
        const buttonMargin = Math.max(2, viewportScale * 4);
        const buttonBorderRadius = Math.max(3, viewportScale * 6);
        const closeButtonSize = Math.max(16, viewportScale * 32);
        const closeButtonPadding = Math.max(2, viewportScale * 4);
        const closeButtonFontSize = Math.max(14, viewportScale * 20);
        const headerPadding = Math.max(8, viewportScale * 16);
        const headerMargin = Math.max(6, viewportScale * 12);
        const headerBorderWidth = Math.max(1, viewportScale * 1);
        
        // Apply font sizes to menu elements
        menu.element.style.fontSize = `${baseFontSize}px`;
        menu.element.style.padding = `${padding}px`;
        menu.element.style.borderRadius = `${borderRadius}px`;
        menu.element.style.borderWidth = `${borderWidth}px`;
        
        // Update specific elements if they exist
        const header = menu.element.querySelector('.menu-header');
        if (header) {
            header.style.fontSize = `${headerFontSize}px`;
            header.style.paddingBottom = `${headerPadding}px`;
            header.style.marginBottom = `${headerMargin}px`;
            header.style.borderBottomWidth = `${headerBorderWidth}px`;
        }
        
        const buttons = menu.element.querySelectorAll('.menu-button');
        buttons.forEach(button => {
            button.style.fontSize = `${buttonFontSize}px`;
            button.style.padding = `${buttonPadding}px`;
            button.style.margin = `${buttonMargin}px`;
            button.style.borderRadius = `${buttonBorderRadius}px`;
        });
        
        // Update close button
        const closeButton = menu.element.querySelector('.menu-close-button');
        if (closeButton) {
            closeButton.style.fontSize = `${closeButtonFontSize}px`;
            closeButton.style.padding = `${closeButtonPadding}px`;
            closeButton.style.width = `${closeButtonSize}px`;
            closeButton.style.height = `${closeButtonSize}px`;
            closeButton.style.top = `${padding}px`;
            closeButton.style.right = `${padding}px`;
        }
    }

    // Create menu content based on configuration
    createMenuContent(menuElement, config) {
        // Create header
        if (config.title) {
            const header = document.createElement('div');
            header.className = 'menu-header';
            header.textContent = config.title;
            menuElement.appendChild(header);
        }

        // Create content area
        const content = document.createElement('div');
        content.className = 'menu-content';
        
        if (config.content) {
            content.innerHTML = config.content;
        }
        
        menuElement.appendChild(content);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'menu-close-button';
        closeButton.textContent = '×';
        closeButton.onclick = () => this.hideMenu(config.id);
        menuElement.appendChild(closeButton);

        // Apply basic styles
        this.applyMenuStyles(menuElement);
    }

    // Apply basic styles to menu element
    applyMenuStyles(menuElement) {
        // Get viewport-relative styling values
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportScale = Math.min(viewportWidth, viewportHeight) / 1000;
        
        const padding = Math.max(8, viewportScale * 16);
        const borderWidth = Math.max(1, viewportScale * 2);
        const borderRadius = Math.max(4, viewportScale * 8);
        const boxShadowBlur = Math.max(2, viewportScale * 4);
        const boxShadowSpread = Math.max(1, viewportScale * 2);
        
        Object.assign(menuElement.style, {
            backgroundColor: '#2c3e50',
            color: '#ecf0f1',
            border: `${borderWidth}px solid #34495e`,
            borderRadius: `${borderRadius}px`,
            padding: `${padding}px`,
            boxShadow: `0 ${boxShadowBlur}px ${boxShadowSpread}px rgba(0, 0, 0, 0.3)`,
            zIndex: '1000',
            display: 'none', // Hidden by default
            overflow: 'auto',
            fontFamily: 'Arial, sans-serif'
        });

        // Style header
        const header = menuElement.querySelector('.menu-header');
        if (header) {
            const headerMargin = Math.max(6, viewportScale * 12);
            const headerPadding = Math.max(8, viewportScale * 16);
            const headerBorderWidth = Math.max(1, viewportScale * 1);
            
            Object.assign(header.style, {
                fontWeight: 'bold',
                marginBottom: `${headerMargin}px`,
                paddingBottom: `${headerPadding}px`,
                borderBottom: `${headerBorderWidth}px solid #34495e`
            });
        }

        // Style close button
        const closeButton = menuElement.querySelector('.menu-close-button');
        if (closeButton) {
            const closeButtonSize = Math.max(16, viewportScale * 32);
            const closeButtonPadding = Math.max(2, viewportScale * 4);
            const closeButtonFontSize = Math.max(14, viewportScale * 20);
            const closeButtonBorderRadius = Math.max(2, viewportScale * 4);
            
            Object.assign(closeButton.style, {
                position: 'absolute',
                top: `${padding}px`,
                right: `${padding}px`,
                background: 'none',
                border: 'none',
                color: '#ecf0f1',
                fontSize: `${closeButtonFontSize}px`,
                cursor: 'pointer',
                padding: `${closeButtonPadding}px`,
                borderRadius: `${closeButtonBorderRadius}px`,
                width: `${closeButtonSize}px`,
                height: `${closeButtonSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            });
            
            closeButton.addEventListener('mouseenter', () => {
                closeButton.style.backgroundColor = '#e74c3c';
            });
            
            closeButton.addEventListener('mouseleave', () => {
                closeButton.style.backgroundColor = 'transparent';
            });
        }
    }

    // Add event listeners to menu
    addMenuEventListeners(menuElement, config) {
        // Make menu draggable
        this.makeDraggable(menuElement);
        
        // Focus management
        menuElement.addEventListener('click', () => {
            this.setActiveMenu(config.id);
        });
    }

    // Make menu draggable
    makeDraggable(menuElement) {
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        const header = menuElement.querySelector('.menu-header');
        const dragHandle = header || menuElement;

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffsetX = e.clientX - menuElement.offsetLeft;
            dragOffsetY = e.clientY - menuElement.offsetTop;
            dragHandle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                menuElement.style.left = `${e.clientX - dragOffsetX}px`;
                menuElement.style.top = `${e.clientY - dragOffsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'grab';
            }
        });
    }

    // Show a menu by ID
    showMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (!menu) {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
            return false;
        }

        menu.element.style.display = 'block';
        menu.isVisible = true;
        this.setActiveMenu(menuId);
        
        console.log(`[MenuManager] Showed menu: ${menuId}`);
        return true;
    }

    // Hide a menu by ID
    hideMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (!menu) {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
            return false;
        }

        menu.element.style.display = 'none';
        menu.isVisible = false;
        
        if (this.activeMenu && this.activeMenu.id === menuId) {
            this.activeMenu = null;
        }
        
        console.log(`[MenuManager] Hid menu: ${menuId}`);
        return true;
    }

    // Set active menu
    setActiveMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (menu) {
            this.activeMenu = menu;
            // Bring to front
            menu.element.style.zIndex = '1001';
        }
    }

    // List all menus
    listMenus() {
        const menuList = Array.from(this.menus.values()).map(menu => ({
            id: menu.id,
            title: menu.config.title || 'Untitled',
            visible: menu.isVisible
        }));
        
        console.log('[MenuManager] Active menus:', menuList);
        return menuList;
    }

    // Close all menus
    closeAllMenus() {
        this.menus.forEach(menu => {
            this.hideMenu(menu.id);
        });
        console.log('[MenuManager] Closed all menus');
    }

    // Destroy a menu completely
    destroyMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (!menu) {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
            return false;
        }

        // Remove from DOM
        if (menu.element.parentNode) {
            menu.element.parentNode.removeChild(menu.element);
        }

        // Remove from tracking
        this.menus.delete(menuId);
        
        if (this.activeMenu && this.activeMenu.id === menuId) {
            this.activeMenu = null;
        }
        
        console.log(`[MenuManager] Destroyed menu: ${menuId}`);
        return true;
    }

    // Cleanup on destroy
    destroy() {
        this.closeAllMenus();
        window.removeEventListener('resize', this.handleWindowResize);
        document.removeEventListener('keydown', this.handleKeyDown);
        console.log('[MenuManager] Menu system destroyed');
    }
} 