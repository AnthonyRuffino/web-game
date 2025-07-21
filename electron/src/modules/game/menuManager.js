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
        closeBtn.onclick = () => this.hide();
        
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
                const childMenuId = window.game.menuManager.createMenu(buttonConfig.onClickMenu);
                window.game.menuManager.showMenu(childMenuId);
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
                    // Update user modifications with new size
                    this.updateUserModifications();
                    // Update internal scaling
                    this.updateInternalScaling();
                }
            }
        });
        
        this.resizeObserver.observe(this.element);
    }
    
    updateUserModifications() {
        const rect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate relative position and size
        this.userModifications.position.x = rect.left / viewportWidth;
        this.userModifications.position.y = rect.top / viewportHeight;
        this.userModifications.size.width = rect.width / viewportWidth;
        this.userModifications.size.height = rect.height / viewportHeight;
        this.userModifications.hasBeenModified = true;
        
        console.log(`[MenuManager] Updated user modifications for menu: ${this.id}`, this.userModifications);
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
}

export class MenuManager {
    constructor() {
        this.menus = new Map();
        this.nextZIndex = 1000;
        this.setupEscapeKeyHandler();
        this.setupWindowResizeHandler();
        
        console.log('[MenuManager] Menu system initialized');
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
            this.handleWindowResize();
        });
    }
    
    handleWindowResize() {
        this.menus.forEach(menu => {
            if (menu.visible) {
                this.updateMenuPosition(menu);
            }
        });
    }
    
    updateMenuPosition(menu) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportScale = Math.min(viewportWidth, viewportHeight) / 1000;
        
        // Use user modifications if available, otherwise use original config
        let left, top, width, height;
        
        if (menu.userModifications.hasBeenModified) {
            // Use preserved user modifications
            left = menu.userModifications.position.x * viewportWidth;
            top = menu.userModifications.position.y * viewportHeight;
            width = menu.userModifications.size.width * viewportWidth;
            height = menu.userModifications.size.height * viewportHeight;
        } else {
            // Use original config values
            left = (menu.config.viewportX || 0.1) * viewportWidth;
            top = (menu.config.viewportY || 0.1) * viewportHeight;
            width = (menu.config.viewportWidth || 0.8) * viewportWidth;
            height = (menu.config.viewportHeight || 0.8) * viewportHeight;
        }
        
        // Update position and size
        menu.element.style.left = `${left}px`;
        menu.element.style.top = `${top}px`;
        menu.element.style.width = `${width}px`;
        menu.element.style.height = `${height}px`;
        
        // Update styling based on new viewport scale
        this.updateMenuStyling(menu, viewportScale);
        
        // Update internal scaling based on new menu size
        menu.updateInternalScaling();
    }
    
    updateMenuPosition(menu) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportScale = Math.min(viewportWidth, viewportHeight) / 1000;
        
        // Use user modifications if available, otherwise use original config
        let left, top, width, height;
        
        if (menu.userModifications.hasBeenModified) {
            // Use preserved user modifications
            left = menu.userModifications.position.x * viewportWidth;
            top = menu.userModifications.position.y * viewportHeight;
            width = menu.userModifications.size.width * viewportWidth;
            height = menu.userModifications.size.height * viewportHeight;
        } else {
            // Use original config values
            left = (menu.config.viewportX || 0.1) * viewportWidth;
            top = (menu.config.viewportY || 0.1) * viewportHeight;
            width = (menu.config.viewportWidth || 0.8) * viewportWidth;
            height = (menu.config.viewportHeight || 0.8) * viewportHeight;
        }
        
        // Update position and size
        menu.element.style.left = `${left}px`;
        menu.element.style.top = `${top}px`;
        menu.element.style.width = `${width}px`;
        menu.element.style.height = `${height}px`;
        
        // Update styling based on new viewport scale
        this.updateMenuStyling(menu, viewportScale);
        
        // Update internal scaling based on new menu size
        menu.updateInternalScaling();
    }
    
    updateMenuStyling(menu, viewportScale) {
        // Update border width
        const borderWidth = Math.max(1, viewportScale * 2);
        menu.element.style.borderWidth = `${borderWidth}px`;
        
        // Update border radius
        const borderRadius = Math.max(4, viewportScale * 8);
        menu.element.style.borderRadius = `${borderRadius}px`;
        
        // Update box shadow
        const boxShadowBlur = Math.max(2, viewportScale * 4);
        const boxShadowSpread = Math.max(1, viewportScale * 2);
        menu.element.style.boxShadow = `0 ${boxShadowBlur}px ${boxShadowSpread}px rgba(0, 0, 0, 0.5)`;
        
        // Update header styling
        const header = menu.element.querySelector('.menu-header');
        if (header) {
            const headerPadding = Math.max(8, viewportScale * 12);
            const headerBorderWidth = Math.max(1, viewportScale * 1);
            
            header.style.padding = `${headerPadding}px`;
            header.style.borderBottomWidth = `${headerBorderWidth}px`;
            
            // Update title font size
            const title = header.querySelector('span');
            if (title) {
                const titleFontSize = Math.max(14, viewportScale * 14);
                title.style.fontSize = `${titleFontSize}px`;
            }
            
            // Update close button
            const closeBtn = header.querySelector('button');
            if (closeBtn) {
                const closeBtnSize = Math.max(20, viewportScale * 20);
                const closeBtnFontSize = Math.max(18, viewportScale * 18);
                const closeBtnBorderRadius = Math.max(3, viewportScale * 3);
                
                closeBtn.style.width = `${closeBtnSize}px`;
                closeBtn.style.height = `${closeBtnSize}px`;
                closeBtn.style.fontSize = `${closeBtnFontSize}px`;
                closeBtn.style.borderRadius = `${closeBtnBorderRadius}px`;
            }
        }
        
        // Update content area padding
        const contentArea = menu.element.querySelector('.tab-content');
        if (contentArea) {
            const contentPadding = Math.max(12, viewportScale * 12);
            contentArea.style.padding = `${contentPadding}px`;
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
        this.menus.set(menu.id, menu);
        console.log(`[MenuManager] Created menu: ${menu.id}`);
        return menu.id;
    }
    
    showMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (menu) {
            menu.show();
            console.log(`[MenuManager] Showed menu: ${menuId}`);
        } else {
            console.warn(`[MenuManager] Menu not found: ${menuId}`);
        }
    }
    
    hideMenu(menuId) {
        const menu = this.menus.get(menuId);
        if (menu) {
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
        // Check if menu is already on top
        const topMenu = this.getTopMenu();
        if (topMenu && topMenu.id === menu.id) {
            return;
        }
        
        // Find the highest z-index currently in use
        let maxZIndex = 1000;
        this.menus.forEach(m => {
            if (m.visible && m.zIndex > maxZIndex) {
                maxZIndex = m.zIndex;
            }
        });
        
        // Set this menu's z-index higher than the current maximum
        menu.zIndex = maxZIndex + 1;
        menu.element.style.zIndex = menu.zIndex;
        
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
    
    // List all menus
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
    
    // Close all menus
    closeAllMenus() {
        this.menus.forEach(menu => {
            this.hideMenu(menu.id);
        });
        console.log('[MenuManager] Closed all menus');
    }
    
    // Debug methods
    getMenu(menuId) {
        return this.menus.get(menuId);
    }
    
    // Cleanup on destroy
    destroy() {
        this.closeAllMenus();
        console.log('[MenuManager] Menu system destroyed');
    }
} 