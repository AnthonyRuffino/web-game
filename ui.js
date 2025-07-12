// ui.js
// Basic UI system: chat/command input bar

const UI = {
  // Configuration
  config: {
    maxHistorySize: 20, // Configurable history size
    storageKey: 'ui_command_history',
    inventoryGridSize: 5, // Default 5x5 inventory
    inventorySlotSize: 60, // Size of each inventory slot in pixels
    inventorySpacing: 4, // Spacing between slots
    inventoryMargin: 20, // Margin from screen edges
    inventoryBackground: 'rgba(20,20,20,0.95)',
    inventoryBorder: '#666',
    slotBackground: 'rgba(40,40,40,0.9)',
    slotHoverBackground: 'rgba(60,60,60,0.9)',
    slotSelectedBackground: 'rgba(80,80,80,0.9)',
    inventoryOpacity: 0.95, // Configurable inventory opacity
    itemIconOpacity: 0.9, // Configurable item icon opacity (for future)
    // Action bar configuration
    actionBarSlots: 10, // Number of action bar slots (1-0 keys)
    actionBarSlotSize: 60, // Size of each action bar slot in pixels
    actionBarSpacing: 4, // Spacing between action bar slots
    actionBarMargin: 20, // Margin from screen edges
    actionBarBackground: 'rgba(20,20,20,0.95)',
    actionBarBorder: '#666',
    actionBarSlotBackground: 'rgba(40,40,40,0.9)',
    actionBarSlotHoverBackground: 'rgba(60,60,60,0.9)',
    actionBarSlotActiveBackground: 'rgba(80,80,80,0.9)',
    actionBarOpacity: 0.95, // Configurable action bar opacity
    actionBarHeight: 80 // Height of action bar (inventory will be shifted up by this amount)
  },

  // State
  inputBarOpen: false,
  inputValue: '',
  inputElement: null,
  lastFocus: null,
  commandHistory: [],
  historyIndex: -1,
  inventoryOpen: false,
  inventoryCanvas: null,
  inventoryCtx: null,
  hoveredSlot: null,
  selectedSlot: null,
  inventoryScale: 1.0,
  // Action bar state
  actionBarCanvas: null,
  actionBarCtx: null,
  hoveredActionSlot: null,
  activeActionSlot: null,
  actionBarScale: 1.0,

  // Initialize UI system
  init() {
    this.loadCommandHistory();
    this.createInputBar();
    this.createInventory();
    this.createActionBar();
    this.setupGlobalListeners();
    console.log('[UI] UI system initialized');
    console.log(`[UI] Command history size: ${this.config.maxHistorySize}`);
    console.log(`[UI] Inventory grid size: ${this.config.inventoryGridSize}x${this.config.inventoryGridSize}`);
    console.log(`[UI] Action bar slots: ${this.config.actionBarSlots}`);
  },

  // Create the input bar DOM element
  createInputBar() {
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'ui-input-bar';
    input.placeholder = 'Type /command or say something...';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.style.position = 'fixed';
    input.style.left = '50%';
    input.style.bottom = '40px';
    input.style.transform = 'translateX(-50%)';
    input.style.width = '50vw';
    input.style.maxWidth = '700px';
    input.style.minWidth = '200px';
    input.style.padding = '12px 16px';
    input.style.fontSize = '1.2rem';
    input.style.border = '2px solid #888';
    input.style.borderRadius = '8px';
    input.style.background = 'rgba(30,30,30,0.98)';
    input.style.color = '#fff';
    input.style.outline = 'none';
    input.style.zIndex = '1000';
    input.style.display = 'none';
    input.style.boxShadow = '0 2px 16px rgba(0,0,0,0.4)';
    input.style.letterSpacing = '0.02em';
    input.style.fontFamily = 'inherit';
    document.body.appendChild(input);
    this.inputElement = input;
  },

  // Show the input bar and focus
  openInputBar() {
    if (this.inputBarOpen) return;
    this.inputBarOpen = true;
    this.inputValue = '';
    this.inputElement.value = '';
    this.inputElement.style.display = 'block';
    this.inputElement.focus();
    // Reset history index when opening the bar
    this.historyIndex = -1;
    // Optionally blur the game canvas
    if (document.activeElement && document.activeElement !== this.inputElement) {
      this.lastFocus = document.activeElement;
      document.activeElement.blur();
    }
  },

  // Hide the input bar and return focus
  closeInputBar() {
    if (!this.inputBarOpen) return;
    this.inputBarOpen = false;
    this.inputElement.style.display = 'none';
    this.inputElement.value = '';
    this.inputValue = '';
    if (this.lastFocus) {
      this.lastFocus.focus();
      this.lastFocus = null;
    }
  },

  // Handle input submission
  submitInputBar() {
    const value = this.inputElement.value.trim();
    if (value.length === 0) {
      this.closeInputBar();
      return;
    }
    
    // Add to command history
    this.addToHistory(value);
    
    if (value.startsWith('/')) {
      // Interpret as command (strip leading /)
      if (window.cmd) {
        window.cmd(value.slice(1));
      } else {
        console.log('[UI] Command system not available');
      }
    } else {
      // Placeholder for "say" action
      console.log(`[UI] (Say): ${value}`);
      // In the future: show as speech bubble, trigger NPC/entity interactions, etc.
    }
    this.closeInputBar();
  },

  // Add command to history
  addToHistory(command) {
    // Don't add empty commands
    if (command.length === 0) {
      return;
    }
    
    // Check if this command is identical to the last command in history
    if (this.commandHistory.length > 0 && this.commandHistory[this.commandHistory.length - 1] === command) {
      // Don't add duplicate - just reset history index
      this.historyIndex = -1;
      return;
    }
    
    // Add the new command to history
    this.commandHistory.push(command);
    
    // Keep only the last N commands (configurable)
    if (this.commandHistory.length > this.config.maxHistorySize) {
      this.commandHistory.shift();
    }
    
    // Reset history index
    this.historyIndex = -1;
    
    // Save to localStorage immediately
    this.saveCommandHistory();
  },

  // Load command history from localStorage
  loadCommandHistory() {
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved) {
        this.commandHistory = JSON.parse(saved);
        console.log(`[UI] Loaded ${this.commandHistory.length} commands from history`);
      }
    } catch (error) {
      console.warn('[UI] Failed to load command history:', error);
      this.commandHistory = [];
    }
  },

  // Save command history to localStorage
  saveCommandHistory() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.commandHistory));
    } catch (error) {
      console.warn('[UI] Failed to save command history:', error);
    }
  },

  // Set maximum history size
  setMaxHistorySize(size) {
    if (size > 0 && size <= 100) {
      this.config.maxHistorySize = size;
      // Trim history if it's now larger than the new limit
      while (this.commandHistory.length > this.config.maxHistorySize) {
        this.commandHistory.shift();
      }
      this.saveCommandHistory();
      console.log(`[UI] Command history size set to ${size}`);
    } else {
      console.error('[UI] Invalid history size. Must be between 1 and 100.');
    }
  },

  // Clear command history
  clearCommandHistory() {
    this.commandHistory = [];
    this.historyIndex = -1;
    this.saveCommandHistory();
    console.log('[UI] Command history cleared');
  },

  // Navigate up in history
  navigateHistoryUp() {
    if (this.commandHistory.length === 0) return;
    
    if (this.historyIndex === -1) {
      // First time pressing up - save current input and go to most recent command
      this.inputValue = this.inputElement.value;
      this.historyIndex = this.commandHistory.length - 1;
    } else if (this.historyIndex > 0) {
      // Go to previous command
      this.historyIndex--;
    }
    // If historyIndex is 0, stay at the oldest command
    
    this.inputElement.value = this.commandHistory[this.historyIndex];
    this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
  },

  // Navigate down in history
  navigateHistoryDown() {
    if (this.commandHistory.length === 0) return;
    
    if (this.historyIndex === -1) return;
    
    this.historyIndex++;
    
    if (this.historyIndex >= this.commandHistory.length) {
      // Reached the end - restore original input
      this.inputElement.value = this.inputValue;
      this.historyIndex = -1;
    } else {
      this.inputElement.value = this.commandHistory[this.historyIndex];
    }
    
    this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
  },

  // Create inventory canvas and elements
  createInventory() {
    // Create inventory canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'ui-inventory';
    canvas.style.position = 'fixed';
    canvas.style.bottom = `${this.config.inventoryMargin + this.config.actionBarHeight}px`;
    canvas.style.right = `${this.config.inventoryMargin}px`;
    canvas.style.zIndex = '999';
    canvas.style.display = 'none';
    canvas.style.border = `2px solid ${this.config.inventoryBorder}`;
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
    document.body.appendChild(canvas);
    
    this.inventoryCanvas = canvas;
    this.inventoryCtx = canvas.getContext('2d');
    
    // Set canvas size based on grid
    this.updateInventorySize();
    
    // Add mouse event listeners with proper scaling
    canvas.addEventListener('mousemove', (e) => this.handleInventoryMouseMove(e));
    canvas.addEventListener('click', (e) => this.handleInventoryClick(e));
    canvas.addEventListener('mouseleave', () => this.handleInventoryMouseLeave());
    
    // Add window resize listener to update inventory size
    window.addEventListener('resize', () => {
      if (this.inventoryOpen) {
        this.updateInventorySize();
        this.renderInventory();
      }
    });
  },

  // Update inventory canvas size
  updateInventorySize() {
    // Calculate base size
    const baseSize = this.config.inventoryGridSize * this.config.inventorySlotSize + 
                    (this.config.inventoryGridSize - 1) * this.config.inventorySpacing + 40; // 40px padding
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate scale factor based on viewport size
    // Use the smaller dimension to ensure inventory fits
    const maxInventorySize = Math.min(viewportWidth * 0.4, viewportHeight * 0.4); // Max 40% of viewport
    const minInventorySize = 200; // Minimum size
    const targetSize = Math.max(minInventorySize, Math.min(maxInventorySize, baseSize));
    
    // Calculate scale factor
    const scaleFactor = targetSize / baseSize;
    
    // Apply scale to canvas
    this.inventoryCanvas.width = baseSize;
    this.inventoryCanvas.height = baseSize;
    this.inventoryCanvas.style.transform = `scale(${scaleFactor})`;
    this.inventoryCanvas.style.transformOrigin = 'bottom right';
    
    // Store scale factor for mouse calculations
    this.inventoryScale = scaleFactor;
    
    console.log(`[UI] Inventory scaled to ${(scaleFactor * 100).toFixed(1)}% (${targetSize.toFixed(0)}px)`);
  },

  // Create action bar
  createActionBar() {
    // Create action bar canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'ui-action-bar';
    canvas.style.position = 'fixed';
    canvas.style.bottom = `${this.config.actionBarMargin}px`;
    canvas.style.left = '50%';
    canvas.style.transform = 'translateX(-50%)';
    canvas.style.zIndex = '998';
    canvas.style.border = `2px solid ${this.config.actionBarBorder}`;
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
    document.body.appendChild(canvas);
    
    this.actionBarCanvas = canvas;
    this.actionBarCtx = canvas.getContext('2d');
    
    // Set canvas size based on slots
    this.updateActionBarSize();
    
    // Add mouse event listeners with proper scaling
    canvas.addEventListener('mousemove', (e) => this.handleActionBarMouseMove(e));
    canvas.addEventListener('click', (e) => this.handleActionBarClick(e));
    canvas.addEventListener('mouseleave', () => this.handleActionBarMouseLeave());
    
    // Add window resize listener to update action bar size
    window.addEventListener('resize', () => {
      this.updateActionBarSize();
      this.renderActionBar();
    });
    
    // Initial render
    this.renderActionBar();
  },

  // Update action bar canvas size
  updateActionBarSize() {
    // Calculate base size
    const baseWidth = this.config.actionBarSlots * this.config.actionBarSlotSize + 
                     (this.config.actionBarSlots - 1) * this.config.actionBarSpacing + 40; // 40px padding
    const baseHeight = this.config.actionBarSlotSize + 20; // 20px padding
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    
    // Calculate scale factor based on viewport size
    // Use viewport width to ensure action bar fits
    const maxActionBarWidth = viewportWidth * 0.8; // Max 80% of viewport width
    const minActionBarWidth = 400; // Minimum width
    const targetWidth = Math.max(minActionBarWidth, Math.min(maxActionBarWidth, baseWidth));
    
    // Calculate scale factor
    const scaleFactor = targetWidth / baseWidth;
    
    // Apply scale to canvas
    this.actionBarCanvas.width = baseWidth;
    this.actionBarCanvas.height = baseHeight;
    this.actionBarCanvas.style.transform = `translateX(-50%) scale(${scaleFactor})`;
    this.actionBarCanvas.style.transformOrigin = 'center bottom';
    
    // Store scale factor for mouse calculations
    this.actionBarScale = scaleFactor;
    
    console.log(`[UI] Action bar scaled to ${(scaleFactor * 100).toFixed(1)}% (${targetWidth.toFixed(0)}px wide)`);
  },

  // Toggle inventory open/closed
  toggleInventory() {
    this.inventoryOpen = !this.inventoryOpen;
    this.inventoryCanvas.style.display = this.inventoryOpen ? 'block' : 'none';
    
    if (this.inventoryOpen) {
      this.updateInventorySize(); // Update size when opening
      this.renderInventory();
    }
    
    console.log(`[UI] Inventory ${this.inventoryOpen ? 'opened' : 'closed'}`);
  },

  // Render inventory grid
  renderInventory() {
    if (!this.inventoryCtx) return;
    
    const ctx = this.inventoryCtx;
    const canvas = this.inventoryCanvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with configurable opacity
    const bgColor = this.config.inventoryBackground.replace(/[\d.]+\)$/, `${this.config.inventoryOpacity})`);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Inventory', canvas.width / 2, 25);
    
    // Draw grid
    const startX = 20;
    const startY = 40;
    
    for (let row = 0; row < this.config.inventoryGridSize; row++) {
      for (let col = 0; col < this.config.inventoryGridSize; col++) {
        const x = startX + col * (this.config.inventorySlotSize + this.config.inventorySpacing);
        const y = startY + row * (this.config.inventorySlotSize + this.config.inventorySpacing);
        
        // Determine slot background color with opacity
        let bgColor = this.config.slotBackground;
        if (this.hoveredSlot && this.hoveredSlot.row === row && this.hoveredSlot.col === col) {
          bgColor = this.config.slotHoverBackground;
        }
        if (this.selectedSlot && this.selectedSlot.row === row && this.selectedSlot.col === col) {
          bgColor = this.config.slotSelectedBackground;
        }
        
        // Apply opacity to slot background
        bgColor = bgColor.replace(/[\d.]+\)$/, `${this.config.inventoryOpacity})`);
        
        // Draw slot
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, this.config.inventorySlotSize, this.config.inventorySlotSize);
        
        // Draw slot border
        ctx.strokeStyle = this.config.inventoryBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.config.inventorySlotSize, this.config.inventorySlotSize);
        
        // Draw slot number (for debugging) with opacity
        ctx.fillStyle = `rgba(136, 136, 136, ${this.config.inventoryOpacity})`;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${row * this.config.inventoryGridSize + col + 1}`, x + this.config.inventorySlotSize / 2, y + this.config.inventorySlotSize / 2 + 4);
      }
    }
  },

  // Handle inventory mouse movement
  handleInventoryMouseMove(e) {
    const rect = this.inventoryCanvas.getBoundingClientRect();
    // Account for scaling in mouse coordinates
    const x = (e.clientX - rect.left) / this.inventoryScale;
    const y = (e.clientY - rect.top) / this.inventoryScale;
    
    const startX = 20;
    const startY = 40;
    
    // Find which slot is being hovered
    for (let row = 0; row < this.config.inventoryGridSize; row++) {
      for (let col = 0; col < this.config.inventoryGridSize; col++) {
        const slotX = startX + col * (this.config.inventorySlotSize + this.config.inventorySpacing);
        const slotY = startY + row * (this.config.inventorySlotSize + this.config.inventorySpacing);
        
        if (x >= slotX && x < slotX + this.config.inventorySlotSize &&
            y >= slotY && y < slotY + this.config.inventorySlotSize) {
          this.hoveredSlot = { row, col };
          this.renderInventory();
          return;
        }
      }
    }
    
    // No slot hovered
    this.hoveredSlot = null;
    this.renderInventory();
  },

  // Handle inventory click
  handleInventoryClick(e) {
    if (!this.hoveredSlot) return;
    
    this.selectedSlot = { ...this.hoveredSlot };
    this.renderInventory();
    
    // Prevent the click from reaching the game world
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`[UI] Selected inventory slot: ${this.selectedSlot.row * this.config.inventoryGridSize + this.selectedSlot.col + 1} (row ${this.selectedSlot.row}, col ${this.selectedSlot.col})`);
  },

  // Render action bar
  renderActionBar() {
    if (!this.actionBarCtx) return;
    
    const ctx = this.actionBarCtx;
    const canvas = this.actionBarCanvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with configurable opacity
    const bgColor = this.config.actionBarBackground.replace(/[\d.]+\)$/, `${this.config.actionBarOpacity})`);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw slots
    const startX = 20;
    const startY = 10;
    
    for (let i = 0; i < this.config.actionBarSlots; i++) {
      const x = startX + i * (this.config.actionBarSlotSize + this.config.actionBarSpacing);
      const y = startY;
      
      // Determine slot background color with opacity
      let bgColor = this.config.actionBarSlotBackground;
      if (this.hoveredActionSlot === i) {
        bgColor = this.config.actionBarSlotHoverBackground;
      }
      if (this.activeActionSlot === i) {
        bgColor = this.config.actionBarSlotActiveBackground;
      }
      
      // Apply opacity to slot background
      bgColor = bgColor.replace(/[\d.]+\)$/, `${this.config.actionBarOpacity})`);
      
      // Draw slot
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, this.config.actionBarSlotSize, this.config.actionBarSlotSize);
      
      // Draw slot border
      ctx.strokeStyle = this.config.actionBarBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, this.config.actionBarSlotSize, this.config.actionBarSlotSize);
      
      // Draw slot number (1-0 keys)
      const slotNumber = i === 9 ? '0' : (i + 1).toString();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.config.actionBarOpacity})`;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(slotNumber, x + this.config.actionBarSlotSize / 2, y + this.config.actionBarSlotSize / 2 + 5);
      
      // Draw placeholder text for future items
      ctx.fillStyle = `rgba(136, 136, 136, ${this.config.actionBarOpacity * 0.7})`;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty', x + this.config.actionBarSlotSize / 2, y + this.config.actionBarSlotSize / 2 + 20);
    }
  },

  // Handle inventory mouse leave
  handleInventoryMouseLeave() {
    this.hoveredSlot = null;
    this.renderInventory();
  },

  // Handle action bar mouse movement
  handleActionBarMouseMove(e) {
    const rect = this.actionBarCanvas.getBoundingClientRect();
    // Account for scaling in mouse coordinates
    const x = (e.clientX - rect.left) / this.actionBarScale;
    const y = (e.clientY - rect.top) / this.actionBarScale;
    
    const startX = 20;
    const startY = 10;
    
    // Find which slot is being hovered
    for (let i = 0; i < this.config.actionBarSlots; i++) {
      const slotX = startX + i * (this.config.actionBarSlotSize + this.config.actionBarSpacing);
      const slotY = startY;
      
      if (x >= slotX && x < slotX + this.config.actionBarSlotSize &&
          y >= slotY && y < slotY + this.config.actionBarSlotSize) {
        this.hoveredActionSlot = i;
        this.renderActionBar();
        return;
      }
    }
    
    // No slot hovered
    this.hoveredActionSlot = null;
    this.renderActionBar();
  },

  // Handle action bar click
  handleActionBarClick(e) {
    if (this.hoveredActionSlot === null) return;
    
    this.activeActionSlot = this.hoveredActionSlot;
    this.renderActionBar();
    
    // Prevent the click from reaching the game world
    e.preventDefault();
    e.stopPropagation();
    
    const slotNumber = this.activeActionSlot === 9 ? '0' : (this.activeActionSlot + 1).toString();
    console.log(`[UI] Activated action bar slot: ${slotNumber} (index ${this.activeActionSlot})`);
    
    // In the future: trigger item/spell action here
  },

  // Handle action bar mouse leave
  handleActionBarMouseLeave() {
    this.hoveredActionSlot = null;
    this.renderActionBar();
  },

  // Set inventory grid size
  setInventoryGridSize(size) {
    if (size >= 3 && size <= 10) {
      this.config.inventoryGridSize = size;
      this.updateInventorySize();
      if (this.inventoryOpen) {
        this.renderInventory();
      }
      console.log(`[UI] Inventory grid size set to ${size}x${size}`);
    } else {
      console.error('[UI] Invalid inventory grid size. Must be between 3 and 10.');
    }
  },

  // Set inventory opacity
  setInventoryOpacity(opacity) {
    if (opacity >= 0.1 && opacity <= 1.0) {
      this.config.inventoryOpacity = opacity;
      if (this.inventoryOpen) {
        this.renderInventory();
      }
      console.log(`[UI] Inventory opacity set to ${opacity}`);
    } else {
      console.error('[UI] Invalid inventory opacity. Must be between 0.1 and 1.0.');
    }
  },

  // Set item icon opacity (for future use)
  setItemIconOpacity(opacity) {
    if (opacity >= 0.1 && opacity <= 1.0) {
      this.config.itemIconOpacity = opacity;
      if (this.inventoryOpen) {
        this.renderInventory();
      }
      console.log(`[UI] Item icon opacity set to ${opacity}`);
    } else {
      console.error('[UI] Invalid item icon opacity. Must be between 0.1 and 1.0.');
    }
  },

  // Set action bar slot count
  setActionBarSlots(slots) {
    if (slots >= 5 && slots <= 20) {
      this.config.actionBarSlots = slots;
      this.updateActionBarSize();
      this.renderActionBar();
      console.log(`[UI] Action bar slots set to ${slots}`);
    } else {
      console.error('[UI] Invalid action bar slot count. Must be between 5 and 20.');
    }
  },

  // Set action bar opacity
  setActionBarOpacity(opacity) {
    if (opacity >= 0.1 && opacity <= 1.0) {
      this.config.actionBarOpacity = opacity;
      this.renderActionBar();
      console.log(`[UI] Action bar opacity set to ${opacity}`);
    } else {
      console.error('[UI] Invalid action bar opacity. Must be between 0.1 and 1.0.');
    }
  },

  // Set up global key listeners
  setupGlobalListeners() {
    window.addEventListener('keydown', (e) => {
      // If input bar is open, handle input events and block only special keys
      if (this.inputBarOpen) {
        if (e.code === 'Escape') {
          this.closeInputBar();
          e.preventDefault();
          return;
        } else if (e.code === 'Enter') {
          this.submitInputBar();
          e.preventDefault();
          return;
        } else if (e.code === 'ArrowUp') {
          this.navigateHistoryUp();
          e.preventDefault();
          return;
        } else if (e.code === 'ArrowDown') {
          this.navigateHistoryDown();
          e.preventDefault();
          return;
        }
        // All other keys: let the input element handle them (do not preventDefault)
        return;
      }
      
      // If inventory is open, only handle Escape to close it, let all other keys through
      if (this.inventoryOpen) {
        if (e.code === 'Escape') {
          this.toggleInventory();
          e.preventDefault();
          return;
        }
        // Do not block any other keys
      }
      
      // Handle action bar number keys (1-0) when input bar is not open
      if (!this.inputBarOpen) {
        const keyToSlot = {
          'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3, 'Digit5': 4,
          'Digit6': 5, 'Digit7': 6, 'Digit8': 7, 'Digit9': 8, 'Digit0': 9
        };
        
        if (keyToSlot[e.code] !== undefined) {
          this.activeActionSlot = keyToSlot[e.code];
          this.renderActionBar();
          
          const slotNumber = this.activeActionSlot === 9 ? '0' : (this.activeActionSlot + 1).toString();
          console.log(`[UI] Activated action bar slot: ${slotNumber} (index ${this.activeActionSlot})`);
          
          // In the future: trigger item/spell action here
          e.preventDefault();
          return;
        }
      }
      
      // Handle inventory toggle (B key) - toggle when input bar is not open
      if (e.code === 'KeyB' && !this.inputBarOpen) {
        this.toggleInventory();
        e.preventDefault();
        return;
      }
      
      // If input bar is not open, open it on Enter (but not if focused on an input/textarea)
      if (e.code === 'Enter' && !this.inputBarOpen) {
        const tag = document.activeElement.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          this.openInputBar();
          e.preventDefault();
        }
      }
    });
  }
};

// Export for global access
window.UI = UI; 