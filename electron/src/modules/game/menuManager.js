// Menu Manager for dynamic menu system
// Follows patterns from ui/menuManager.js with viewport-relative scaling

class Menu {
    constructor(config) {
        if (!config.id) {
            throw new Error('Menu config must include an id property');
        }
        this.id = config.id;
        this.title = config.title || 'Menu';
        this.visible = false;
        this.zIndex = 1000;
        this.element = null;
        this.config = config;
        this.destroyOnClose = config.destroyOnClose || false;
        this.isBlocking = config.isBlocking || false;
        this.overlay = null;
        this.tabs = [];
        this.closeListeners = [];
        this.onCloseParent = config.onCloseParent;
        
        // Track user modifications for viewport resize preservation
        this.userModifications = {
            position: { x: null, y: null },
            size: { width: null, height: null },
            hasBeenModified: false
        };
        
        this.createMenuElement();
    }
    
    createMenuElement() {
        // Create the menu container with viewport-relative positioning
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'menu-container';
        
        // Calculate viewport-relative position and size
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportScale = Math.min(viewportWidth, viewportHeight) / 1000;
        
        const left = (this.config.viewportX || 0.1) * viewportWidth;
        const top = (this.config.viewportY || 0.1) * viewportHeight;
        const width = (this.config.viewportWidth || 0.8) * viewportWidth;
        const height = (this.config.viewportHeight || 0.8) * viewportHeight;
        
        // Calculate viewport-relative styling
        const borderWidth = Math.max(1, viewportScale * 2);
        const borderRadius = Math.max(4, viewportScale * 8);
        const boxShadowBlur = Math.max(2, viewportScale * 4);
        const boxShadowSpread = Math.max(1, viewportScale * 2);
        const minWidth = Math.max(300, viewportScale * 300);
        const minHeight = Math.max(200, viewportScale * 200);
        
        this.element.style.cssText = `
            position: fixed;
            top: ${top}px;
            left: ${left}px;
            width: ${width}px;
            height: ${height}px;
            min-width: ${minWidth}px;
            min-height: ${minHeight}px;
            background: #2a2a2a;
            border: ${borderWidth}px solid #444;
            border-radius: ${borderRadius}px;
            box-shadow: 0 ${boxShadowBlur}px ${boxShadowSpread}px rgba(0, 0, 0, 0.5);
            z-index: ${this.zIndex};
            display: none;
            font-family: 'Courier New', monospace;
            color: #fff;
            resize: both;
            overflow: hidden;
        `;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'menu-header';
        
        const headerPadding = Math.max(8, viewportScale * 12);
        const headerBorderWidth = Math.max(1, viewportScale * 1);
        
        header.style.cssText = `
            background: #333;
            padding: ${headerPadding}px;
            border-bottom: ${headerBorderWidth}px solid #555;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            user-select: none;
        `;
        
        const title = document.createElement('span');
        title.textContent = this.title;
        const titleFontSize = Math.max(14, viewportScale * 14);
        title.style.cssText = `
            font-weight: bold;
            font-size: ${titleFontSize}px;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        const closeBtnSize = Math.max(20, viewportScale * 20);
        const closeBtnFontSize = Math.max(18, viewportScale * 18);
        const closeBtnBorderRadius = Math.max(3, viewportScale * 3);
        
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #fff;
            font-size: ${closeBtnFontSize}px;
            cursor: pointer;
            padding: 0;
            width: ${closeBtnSize}px;
            height: ${closeBtnSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: ${closeBtnBorderRadius}px;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#555';
        closeBtn.onmouseout = () => closeBtn.style.background = 'none';
        closeBtn.onclick = () => {
            if (window.game && window.game.menuManager) {
                window.game.menuManager.hideMenu(this.id);
            } else {
                this.hide();
            }
        };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Create main content container
        const mainContent = document.createElement('div');
        const headerHeight = Math.max(50, viewportScale * 50);
        mainContent.style.cssText = `
            display: flex;
            flex-direction: column;
            height: calc(100% - ${headerHeight}px);
        `;
        
        // Always create a tab system - single tab if no tabs configured
        this.createTabSystem(mainContent);
        
        // Assemble the menu
        this.element.appendChild(header);
        this.element.appendChild(mainContent);
        
        // Add to document
        document.body.appendChild(this.element);
        
        // Make draggable
        this.makeDraggable();
    }
    
    createTabSystem(mainContent) {
        // Determine if we have explicit tabs or need to create a single tab
        const hasExplicitTabs = this.config.tabs && Array.isArray(this.config.tabs) && this.config.tabs.length > 0;
        
        // Create tab container (hidden if single tab)
        const tabContainer = document.createElement('div');
        const viewportScale = Math.min(window.innerWidth, window.innerHeight) / 1000;
        const tabBorderWidth = Math.max(2, viewportScale * 2);
        
        tabContainer.style.cssText = `
            display: ${hasExplicitTabs ? 'flex' : 'none'};
            border-bottom: ${tabBorderWidth}px solid #444;
            background: #333;
        `;
        
        // Create content area
        const contentArea = document.createElement('div');
        const contentPadding = Math.max(12, viewportScale * 12);
        contentArea.style.cssText = `
            flex: 1;
            overflow: auto;
            padding: ${contentPadding}px;
        `;
        
        // Create tabs array - either from config or single default tab
        this.tabs = hasExplicitTabs ? this.config.tabs : [{
            name: 'Content',
            content: this.config.content,
            buttons: this.config.buttons,
            radioGroups: this.config.radioGroups,
            gridButtons: this.config.gridButtons
        }];
        
        // Create tab buttons (only if multiple tabs)
        if (hasExplicitTabs) {
            this.tabs.forEach((tab, index) => {
                const tabBtn = document.createElement('button');
                tabBtn.textContent = tab.name;
                const tabPadding = Math.max(12, viewportScale * 12);
                const tabMargin = Math.max(4, viewportScale * 4);
                const tabBorderRadius = Math.max(6, viewportScale * 6);
                const tabFontSize = Math.max(13, viewportScale * 13);
                
                tabBtn.style.cssText = `
                    background: ${index === 0 ? '#4ECDC4' : 'transparent'};
                    color: ${index === 0 ? '#222' : '#fff'};
                    border: none;
                    padding: ${tabPadding}px ${tabPadding * 1.5}px;
                    cursor: pointer;
                    border-radius: ${tabBorderRadius}px ${tabBorderRadius}px 0 0;
                    font-weight: ${index === 0 ? 'bold' : 'normal'};
                    margin-right: ${tabMargin}px;
                    font-family: 'Courier New', monospace;
                    font-size: ${tabFontSize}px;
                `;
                
                tabBtn.onclick = () => this.switchTab(index, tabContainer, contentArea);
                tabContainer.appendChild(tabBtn);
            });
        }
        
        // Add tab container and content area to main content
        mainContent.appendChild(tabContainer);
        mainContent.appendChild(contentArea);
        
        // Load initial tab content
        this.loadTabContent(0, contentArea);
    }
    
    switchTab(tabIndex, tabContainer, contentArea) {
        // Update tab button styles
        const tabButtons = tabContainer.querySelectorAll('button');
        tabButtons.forEach((btn, index) => {
            btn.style.background = index === tabIndex ? '#4ECDC4' : 'transparent';
            btn.style.color = index === tabIndex ? '#222' : '#fff';
            btn.style.fontWeight = index === tabIndex ? 'bold' : 'normal';
        });
        
        // Load tab content
        this.loadTabContent(tabIndex, contentArea);
    }
    
    loadTabContent(tabIndex, contentArea) {
        const tab = this.tabs[tabIndex];
        if (!tab) return;
        
        // Clear content area
        contentArea.innerHTML = '';
        
        // Add tab content
        if (tab.content) {
            if (typeof tab.content === 'string') {
                contentArea.innerHTML = tab.content;
            } else if (tab.content instanceof HTMLElement) {
                contentArea.appendChild(tab.content);
            }
        }
        
        // Add radio groups
        if (tab.radioGroups && Array.isArray(tab.radioGroups)) {
            tab.radioGroups.forEach(radioGroup => {
                const radioContainer = this.createRadioGroup(radioGroup);
                contentArea.appendChild(radioContainer);
            });
        }
        
        // Add grid buttons
        if (tab.gridButtons && Array.isArray(tab.gridButtons)) {
            tab.gridButtons.forEach(gridConfig => {
                const gridContainer = this.createGridButtons(gridConfig);
                contentArea.appendChild(gridContainer);
            });
        }
        
        // Add tab buttons
        if (tab.buttons && Array.isArray(tab.buttons)) {
            const buttonContainer = document.createElement('div');
            const viewportScale = Math.min(window.innerWidth, window.innerHeight) / 1000;
            const buttonGap = Math.max(8, viewportScale * 8);
            const buttonMargin = Math.max(12, viewportScale * 12);
            
            buttonContainer.style.cssText = `
                display: flex;
                gap: ${buttonGap}px;
                margin-top: ${buttonMargin}px;
                flex-wrap: wrap;
            `;
            
            tab.buttons.forEach(buttonConfig => {
                const button = this.createButton(buttonConfig);
                buttonContainer.appendChild(button);
            });
            
            contentArea.appendChild(buttonContainer);
        }
    }
    
    createButton(buttonConfig) {
        const button = document.createElement('button');
        button.className = 'menu-button';
        const viewportScale = Math.min(window.innerWidth, window.innerHeight) / 1000;
        
        // Add icon if present
        const buttonText = buttonConfig.icon ? `${buttonConfig.icon} ${buttonConfig.text || 'Button'}` : (buttonConfig.text || 'Button');
        button.textContent = buttonText;
        
        const buttonPadding = Math.max(6, viewportScale * 6);
        const buttonBorderRadius = Math.max(4, viewportScale * 4);
        const buttonFontSize = Math.max(12, viewportScale * 12);
        
        button.style.cssText = `
            background: #444;
            border: 1px solid #666;
            color: #fff;
            padding: ${buttonPadding}px ${buttonPadding * 2}px;
            border-radius: ${buttonBorderRadius}px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: ${buttonFontSize}px;
        `;
        
        button.onmouseover = () => button.style.background = '#555';
        button.onmouseout = () => button.style.background = '#444';
        button.onclick = (e) => {
            // Handle onClickMenu if provided
            if (buttonConfig.onClickMenu) {
                if (buttonConfig.onClickMenu.id && window.game.menuManager.showMenu(buttonConfig.onClickMenu.id)) {
                    console.log(`[Console] Showed onClickMenu: ${buttonConfig.onClickMenu.id}`);
                } else {
                    const newOnClickMenuId = window.game.menuManager.createMenu(buttonConfig.onClickMenu);
                    window.game.menuManager.showMenu(newOnClickMenuId);
                    console.log(`[Console] Created onClickMenu: ${newOnClickMenuId}`);
                }
            }
            
            // Handle regular onClick if provided
            if (buttonConfig.onClick) {
                buttonConfig.onClick(e);
            } else {
                console.log('Button clicked:', buttonConfig.text);
            }
        };
        
        return button;
    }
    
    createRadioGroup(radioGroup) {
        const container = document.createElement('div');
        container.className = 'radio-group';
        const viewportScale = Math.min(window.innerWidth, window.innerHeight) / 1000;
        const containerPadding = Math.max(12, viewportScale * 12);
        const containerMargin = Math.max(12, viewportScale * 12);
        const containerBorderRadius = Math.max(6, viewportScale * 6);
        const containerBorderWidth = Math.max(1, viewportScale * 1);
        
        container.style.cssText = `
            margin: ${containerMargin}px 0;
            padding: ${containerPadding}px;
            background: #333;
            border-radius: ${containerBorderRadius}px;
            border: ${containerBorderWidth}px solid #555;
        `;
        
        // Group label
        if (radioGroup.label) {
            const label = document.createElement('div');
            label.className = 'radio-group-label';
            label.textContent = radioGroup.label;
            const labelFontSize = Math.max(14, viewportScale * 14);
            const labelMargin = Math.max(8, viewportScale * 8);
            
            label.style.cssText = `
                font-weight: bold;
                margin-bottom: ${labelMargin}px;
                color: #fff;
                font-size: ${labelFontSize}px;
            `;
            container.appendChild(label);
        }
        
        // Radio options
        if (radioGroup.options && Array.isArray(radioGroup.options)) {
            radioGroup.options.forEach((option, index) => {
                const optionContainer = document.createElement('div');
                optionContainer.className = 'radio-option';
                const optionMargin = Math.max(6, viewportScale * 6);
                
                optionContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    margin: ${optionMargin}px 0;
                    cursor: pointer;
                `;
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = radioGroup.name || 'radio-group';
                radio.value = option.value || option.text || index.toString();
                radio.checked = option.checked || (index === 0 && !radioGroup.options.some(opt => opt.checked));
                const radioMargin = Math.max(8, viewportScale * 8);
                
                radio.style.cssText = `
                    margin-right: ${radioMargin}px;
                    cursor: pointer;
                `;
                
                const optionLabel = document.createElement('label');
                optionLabel.textContent = option.text || option.value || `Option ${index + 1}`;
                const labelFontSize = Math.max(13, viewportScale * 13);
                
                optionLabel.style.cssText = `
                    cursor: pointer;
                    color: #fff;
                    font-size: ${labelFontSize}px;
                `;
                
                // Handle radio change
                radio.onchange = () => {
                    if (radio.checked && radioGroup.onChange) {
                        radioGroup.onChange(option.value || option.text || index.toString(), option);
                    }
                };
                
                // Make label clickable
                optionLabel.onclick = () => radio.click();
                
                optionContainer.appendChild(radio);
                optionContainer.appendChild(optionLabel);
                container.appendChild(optionContainer);
            });
        }
        
        return container;
    }
    
    createGridButtons(gridConfig) {
        const container = document.createElement('div');
        container.className = 'grid-container';
        const viewportScale = Math.min(window.innerWidth, window.innerHeight) / 1000;
        const containerMargin = Math.max(12, viewportScale * 12);
        
        container.style.cssText = `
            margin: ${containerMargin}px 0;
        `;
        
        // Grid label
        if (gridConfig.label) {
            const label = document.createElement('div');
            label.className = 'grid-label';
            label.textContent = gridConfig.label;
            const labelFontSize = Math.max(14, viewportScale * 14);
            const labelMargin = Math.max(12, viewportScale * 12);
            
            label.style.cssText = `
                font-weight: bold;
                margin-bottom: ${labelMargin}px;
                color: #fff;
                font-size: ${labelFontSize}px;
            `;
            container.appendChild(label);
        }
        
        // Create grid
        const grid = document.createElement('div');
        const rows = gridConfig.rows || 4;
        const cols = gridConfig.cols || 4;
        const cellSize = gridConfig.cellSize || 80;
        const gap = gridConfig.gap || 16;
        
        grid.style.cssText = `
            display: grid;
            grid-template-rows: repeat(${rows}, ${cellSize}px);
            grid-template-columns: repeat(${cols}, ${cellSize}px);
            gap: ${gap}px;
            justify-content: start;
        `;
        
        // Create grid cells
        const buttons = gridConfig.buttons || [];
        const totalCells = rows * cols;
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            const cellBorderRadius = Math.max(8, viewportScale * 8);
            const cellPadding = Math.max(8, viewportScale * 8);
            const cellBorderWidth = Math.max(1, viewportScale * 1);
            
            cell.style.cssText = `
                background: #333;
                border-radius: ${cellBorderRadius}px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
                transition: background 0.2s;
                padding: ${cellPadding}px;
                box-sizing: border-box;
                border: ${cellBorderWidth}px solid #555;
            `;
            
            const button = buttons[i];
            
            if (button) {
                // Filled cell with button data
                if (button.imageDataUrl) {
                    const img = document.createElement('img');
                    img.src = button.imageDataUrl;
                    img.alt = button.name || 'Button';
                    const imgSize = cellSize * 0.5;
                    const imgBorderRadius = Math.max(6, viewportScale * 6);
                    const imgMargin = Math.max(6, viewportScale * 6);
                    
                    img.style.cssText = `
                        width: ${imgSize}px;
                        height: ${imgSize}px;
                        margin-bottom: ${imgMargin}px;
                        border-radius: ${imgBorderRadius}px;
                        object-fit: cover;
                    `;
                    cell.appendChild(img);
                }
                
                const name = document.createElement('div');
                name.className = 'cell-name';
                name.textContent = button.name || `Button ${i + 1}`;
                const nameFontSize = Math.max(12, viewportScale * 12);
                
                name.style.cssText = `
                    font-size: ${nameFontSize}px;
                    text-align: center;
                    word-break: break-all;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                `;
                cell.appendChild(name);
                
                // Hover effects
                cell.onmouseenter = () => {
                    cell.style.background = '#444';
                    if (button.tooltip) {
                        cell.title = button.tooltip;
                    }
                };
                cell.onmouseleave = () => {
                    cell.style.background = '#333';
                };
                
                // Click handler
                cell.onclick = (e) => {
                    // Handle onClickMenu if provided
                    if (button.onClickMenu) {
                        const childMenuId = window.game.menuManager.createMenu(button.onClickMenu);
                        window.game.menuManager.showMenu(childMenuId);
                    }
                    
                    // Handle regular onClick if provided
                    if (button.onClick) {
                        button.onClick(e);
                    } else {
                        console.log(`Grid button ${i} clicked`);
                    }
                };
                
            } else {
                // Empty cell with plus sign
                const plus = document.createElement('div');
                plus.textContent = '+';
                const plusFontSize = Math.max(32, viewportScale * 32);
                
                plus.style.cssText = `
                    font-size: ${plusFontSize}px;
                    color: #aaa;
                    user-select: none;
                `;
                cell.appendChild(plus);
                
                // Hover effects for empty cell
                cell.onmouseenter = () => {
                    cell.style.background = '#444';
                    if (gridConfig.emptyTooltip) {
                        cell.title = gridConfig.emptyTooltip;
                    }
                };
                cell.onmouseleave = () => {
                    cell.style.background = '#333';
                };
                
                // Click handler for empty cell
                cell.onclick = gridConfig.onEmptyClick || (() => console.log(`Empty grid cell ${i} clicked`));
            }
            
            grid.appendChild(cell);
        }
        
        container.appendChild(grid);
        return container;
    }
    
    makeDraggable() {
        const header = this.element.querySelector('.menu-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(this.element.style.left) || 50;
            startTop = parseInt(this.element.style.top) || 50;
            
            // Bring menu to front when starting to drag
            this.bringToFront();
            
            document.onmousemove = (e) => {
                if (!isDragging) return;
                
                const newLeft = startLeft + (e.clientX - startX);
                const newTop = startTop + (e.clientY - startY);
                
                this.element.style.left = `${newLeft}px`;
                this.element.style.top = `${newTop}px`;
                
                // Update user modifications
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                this.userModifications.position.x = newLeft / viewportWidth;
                this.userModifications.position.y = newTop / viewportHeight;
                this.userModifications.size.width = (parseInt(this.element.style.width) || this.element.offsetWidth) / viewportWidth;
                this.userModifications.size.height = (parseInt(this.element.style.height) || this.element.offsetHeight) / viewportHeight;
                this.userModifications.hasBeenModified = true;
            };
            
            document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
                
                // Update user modifications with new position
                this.updateUserModifications();
            };
        };
        
        // Add click-to-front functionality for the entire menu
        this.element.onmousedown = (e) => {
            // Don't interfere with dragging
            if (e.target.closest('.menu-header')) return;
            
            // Bring menu to front when clicked
            this.bringToFront();
        };
        
        // Add resize observer to track size changes
        this.setupResizeObserver();
    }
    
    setupResizeObserver() {
        // Create resize observer to track menu size changes
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === this.element) {
                    // Only update user modifications if menu is visible
                    if (this.visible && this.element.style.display !== 'none') {
                        const rect = this.element.getBoundingClientRect();
                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        
                        // Validate that we have valid dimensions (not zero)
                        if (rect.width > 0 && rect.height > 0) {
                            this.userModifications.size.width = rect.width / viewportWidth;
                            this.userModifications.size.height = rect.height / viewportHeight;
                            this.userModifications.position.x = rect.left / viewportWidth;
                            this.userModifications.position.y = rect.top / viewportHeight;
                            this.userModifications.hasBeenModified = true;
                            
                            console.log(`[MenuManager] Updated user modifications for menu: ${this.id}`, this.userModifications);
                            
                            // Save to localStorage immediately
                            if (window.game && window.game.menuManager) {
                                window.game.menuManager.saveMenuConfigurations();
                            }
                        }
                    }
                }
            }
        });
        
        this.resizeObserver.observe(this.element);
    }
    
    updateUserModifications() {
        // Only update if menu is visible and has valid dimensions
        if (!this.visible || this.element.style.display === 'none') {
            return;
        }
        
        const rect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Validate that we have valid dimensions (not zero)
        if (rect.width > 0 && rect.height > 0) {
            // Calculate relative position and size
            this.userModifications.position.x = rect.left / viewportWidth;
            this.userModifications.position.y = rect.top / viewportHeight;
            this.userModifications.size.width = rect.width / viewportWidth;
            this.userModifications.size.height = rect.height / viewportHeight;
            this.userModifications.hasBeenModified = true;
            
            console.log(`[MenuManager] Updated user modifications for menu: ${this.id}`, this.userModifications);
            
            // Save to localStorage immediately
            if (window.game && window.game.menuManager) {
                window.game.menuManager.saveMenuConfigurations();
            }
        } else {
            console.warn(`[MenuManager] Skipping user modifications for menu ${this.id} - invalid dimensions: ${rect.width}x${rect.height}`);
        }
    }
    
    updateInternalScaling() {
        const rect = this.element.getBoundingClientRect();
        const menuWidth = rect.width;
        const menuHeight = rect.height;
        const menuScale = Math.min(menuWidth, menuHeight) / 1000; // Base scale factor
        
        // Update all internal elements to scale with menu size
        this.updateElementScaling(menuScale);
    }
    
    updateElementScaling(menuScale) {
        // Update header styling
        const header = this.element.querySelector('.menu-header');
        if (header) {
            const headerPadding = Math.max(8, menuScale * 12);
            const headerBorderWidth = Math.max(1, menuScale * 1);
            
            header.style.padding = `${headerPadding}px`;
            header.style.borderBottomWidth = `${headerBorderWidth}px`;
            
            // Update title font size
            const title = header.querySelector('span');
            if (title) {
                const titleFontSize = Math.max(14, menuScale * 14);
                title.style.fontSize = `${titleFontSize}px`;
            }
            
            // Update close button
            const closeBtn = header.querySelector('button');
            if (closeBtn) {
                const closeBtnSize = Math.max(20, menuScale * 20);
                const closeBtnFontSize = Math.max(18, menuScale * 18);
                const closeBtnBorderRadius = Math.max(3, menuScale * 3);
                
                closeBtn.style.width = `${closeBtnSize}px`;
                closeBtn.style.height = `${closeBtnSize}px`;
                closeBtn.style.fontSize = `${closeBtnFontSize}px`;
                closeBtn.style.borderRadius = `${closeBtnBorderRadius}px`;
            }
        }
        
        // Update content area padding
        const contentArea = this.element.querySelector('.tab-content');
        if (contentArea) {
            const contentPadding = Math.max(12, menuScale * 12);
            contentArea.style.padding = `${contentPadding}px`;
        }
        
        // Update tab buttons
        const tabButtons = this.element.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            const tabPadding = Math.max(12, menuScale * 12);
            const tabMargin = Math.max(4, menuScale * 4);
            const tabBorderRadius = Math.max(6, menuScale * 6);
            const tabFontSize = Math.max(13, menuScale * 13);
            
            button.style.padding = `${tabPadding}px ${tabPadding * 1.5}px`;
            button.style.marginRight = `${tabMargin}px`;
            button.style.borderRadius = `${tabBorderRadius}px ${tabBorderRadius}px 0 0`;
            button.style.fontSize = `${tabFontSize}px`;
        });
        
        // Update menu buttons
        const menuButtons = this.element.querySelectorAll('.menu-button');
        menuButtons.forEach(button => {
            const buttonPadding = Math.max(6, menuScale * 6);
            const buttonBorderRadius = Math.max(4, menuScale * 4);
            const buttonFontSize = Math.max(12, menuScale * 12);
            
            button.style.padding = `${buttonPadding}px ${buttonPadding * 2}px`;
            button.style.borderRadius = `${buttonBorderRadius}px`;
            button.style.fontSize = `${buttonFontSize}px`;
        });
        
        // Update radio groups
        const radioGroups = this.element.querySelectorAll('.radio-group');
        radioGroups.forEach(group => {
            const groupPadding = Math.max(12, menuScale * 12);
            const groupMargin = Math.max(12, menuScale * 12);
            const groupBorderRadius = Math.max(6, menuScale * 6);
            const groupBorderWidth = Math.max(1, menuScale * 1);
            
            group.style.padding = `${groupPadding}px`;
            group.style.margin = `${groupMargin}px 0`;
            group.style.borderRadius = `${groupBorderRadius}px`;
            group.style.borderWidth = `${groupBorderWidth}px`;
            
            // Update radio group labels
            const labels = group.querySelectorAll('.radio-group-label');
            labels.forEach(label => {
                const labelFontSize = Math.max(14, menuScale * 14);
                const labelMargin = Math.max(8, menuScale * 8);
                
                label.style.fontSize = `${labelFontSize}px`;
                label.style.marginBottom = `${labelMargin}px`;
            });
            
            // Update radio options
            const options = group.querySelectorAll('.radio-option');
            options.forEach(option => {
                const optionMargin = Math.max(6, menuScale * 6);
                option.style.margin = `${optionMargin}px 0`;
                
                const optionLabel = option.querySelector('label');
                if (optionLabel) {
                    const optionFontSize = Math.max(13, menuScale * 13);
                    optionLabel.style.fontSize = `${optionFontSize}px`;
                }
            });
        });
        
        // Update grid buttons
        const gridContainers = this.element.querySelectorAll('.grid-container');
        gridContainers.forEach(container => {
            const containerMargin = Math.max(12, menuScale * 12);
            container.style.margin = `${containerMargin}px 0`;
            
            // Update grid labels
            const gridLabels = container.querySelectorAll('.grid-label');
            gridLabels.forEach(label => {
                const labelFontSize = Math.max(14, menuScale * 14);
                const labelMargin = Math.max(12, menuScale * 12);
                
                label.style.fontSize = `${labelFontSize}px`;
                label.style.marginBottom = `${labelMargin}px`;
            });
            
            // Update grid cells
            const gridCells = container.querySelectorAll('.grid-cell');
            gridCells.forEach(cell => {
                const cellBorderRadius = Math.max(8, menuScale * 8);
                const cellPadding = Math.max(8, menuScale * 8);
                const cellBorderWidth = Math.max(1, menuScale * 1);
                
                cell.style.borderRadius = `${cellBorderRadius}px`;
                cell.style.padding = `${cellPadding}px`;
                cell.style.borderWidth = `${cellBorderWidth}px`;
                
                // Update cell images
                const images = cell.querySelectorAll('img');
                images.forEach(img => {
                    const imgBorderRadius = Math.max(6, menuScale * 6);
                    const imgMargin = Math.max(6, menuScale * 6);
                    
                    img.style.borderRadius = `${imgBorderRadius}px`;
                    img.style.marginBottom = `${imgMargin}px`;
                });
                
                // Update cell names
                const names = cell.querySelectorAll('.cell-name');
                names.forEach(name => {
                    const nameFontSize = Math.max(12, menuScale * 12);
                    name.style.fontSize = `${nameFontSize}px`;
                });
            });
        });
    }
    
    show() {
        this.visible = true;
        this.element.style.display = 'block';
        
        // Apply saved user modifications if they exist
        if (this.userModifications.hasBeenModified) {
            this.updateViewportPositionAndSize();
            console.log(`[MenuManager] Applied saved position/size to menu: ${this.id}`, this.userModifications);
        }
        
        // Create blocking overlay if needed
        if (this.isBlocking) {
            this.createBlockingOverlay();
        }
        
        this.bringToFront();
    }
    
    hide() {
        this.visible = false;
        this.element.style.display = 'none';
        
        // Remove blocking overlay if present
        this.removeBlockingOverlay();
        
        if (this.destroyOnClose) {
            this.destroy();
            if (window.game.menuManager) {
                window.game.menuManager.removeMenu(this.id);
                console.log(`[MenuManager] Auto-destroyed menu: ${this.id}`);
            }
        }
        this.onCloseParent ? this.onCloseParent() : null;
    }
    
    bringToFront() {
        // This will be managed by MenuManager
        if (window.game.menuManager) {
            window.game.menuManager.bringMenuToFront(this);
        }
    }
    
    // Method to check if menu is currently on top
    isOnTop() {
        if (!window.game.menuManager) return false;
        const topMenu = window.game.menuManager.getTopMenu();
        return topMenu && topMenu.id === this.id;
    }
    
    destroy() {
        // Remove blocking overlay
        this.removeBlockingOverlay();
        
        // Clean up event listeners for this menu
        if (window.game && window.game.menuManager) {
            window.game.menuManager.cleanupMenuListeners(this.id);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
    
    createBlockingOverlay() {
        // Remove any existing overlay
        this.removeBlockingOverlay();
        
        // Find the highest z-index among OTHER menus (excluding this one)
        let maxZIndex = 1000;
        if (window.game.menuManager) {
            window.game.menuManager.menus.forEach(menu => {
                if (menu.visible && menu.id !== this.id && menu.zIndex > maxZIndex) {
                    maxZIndex = menu.zIndex;
                }
            });
        }
        
        // Create new overlay with z-index higher than other menus but lower than this menu
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: ${Math.max(maxZIndex, this.zIndex - 1)};
            pointer-events: auto;
            cursor: default;
        `;
        
        // Add overlay to document
        document.body.appendChild(this.overlay);
        
        console.log(`[MenuManager] Created blocking overlay for menu: ${this.id} with z-index: ${this.overlay.style.zIndex}`);
    }
    
    removeBlockingOverlay() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
            this.overlay = null;
            console.log(`[MenuManager] Removed blocking overlay for menu: ${this.id}`);
        }
    }

    updateViewportPositionAndSize() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportScale = Math.min(viewportWidth, viewportHeight) / 1000;
        let left, top, width, height;
        if (this.userModifications.hasBeenModified) {
            // Use preserved user modifications
            left = this.userModifications.position.x * viewportWidth;
            top = this.userModifications.position.y * viewportHeight;
            width = this.userModifications.size.width * viewportWidth;
            height = this.userModifications.size.height * viewportHeight;
        } else {
            // Use original config values
            left = (this.config.viewportX || 0.1) * viewportWidth;
            top = (this.config.viewportY || 0.1) * viewportHeight;
            width = (this.config.viewportWidth || 0.8) * viewportWidth;
            height = (this.config.viewportHeight || 0.8) * viewportHeight;
        }
        const borderWidth = Math.max(1, viewportScale * 2);
        const borderRadius = Math.max(4, viewportScale * 8);
        const boxShadowBlur = Math.max(2, viewportScale * 4);
        const boxShadowSpread = Math.max(1, viewportScale * 2);
        const minWidth = Math.max(300, viewportScale * 300);
        const minHeight = Math.max(200, viewportScale * 200);
        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
        this.element.style.minWidth = `${minWidth}px`;
        this.element.style.minHeight = `${minHeight}px`;
        this.element.style.borderWidth = `${borderWidth}px`;
        this.element.style.borderRadius = `${borderRadius}px`;
        this.element.style.boxShadow = `0 ${boxShadowBlur}px ${boxShadowSpread}px rgba(0, 0, 0, 0.5)`;
    }
}

export class MenuManager {
    constructor() {
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

    createMenu(config) {
        if (!config.id) {
            throw new Error('Menu config must include an id property');
        }
        if (this.menus.has(config.id)) {
            throw new Error(`Menu with id '${config.id}' already exists`);
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

    showMenu(menuId) {
        let menu = this.menus.get(menuId);
        if (menu) {
            // Bump z-index for this menu
            this.bringMenuToFront(menu);
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
    createSkinsMenuConfig(id, onCloseParent) {
        return {
            id: id,
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
                this.hideMenu('skins');
                console.log('onCloseParent', onCloseParent);
            },
            onCloseParent: onCloseParent
        };
    }

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
    getImageGridButtons(names, type = 'entity') {
        // Use assetManager if available, else just placeholder
        const assetManager = window.game && window.game.assetManager;
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
                onClick: () => console.log(`[SkinsMenu] Clicked ${type}: ${name}`),
                tooltip: `Select ${name}`
            };
        });
    }

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