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
    inventoryBackground: 'rgba(20,20,20,0.95)',
    inventoryBorder: '#666',
    slotBackground: 'rgba(40,40,40,0.9)',
    slotHoverBackground: 'rgba(60,60,60,0.9)',
    slotSelectedBackground: 'rgba(80,80,80,0.9)'
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

  // Initialize UI system
  init() {
    this.loadCommandHistory();
    this.createInputBar();
    this.createInventory();
    this.setupGlobalListeners();
    console.log('[UI] UI system initialized');
    console.log(`[UI] Command history size: ${this.config.maxHistorySize}`);
    console.log(`[UI] Inventory grid size: ${this.config.inventoryGridSize}x${this.config.inventoryGridSize}`);
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
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
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
    
    // Add mouse event listeners
    canvas.addEventListener('mousemove', (e) => this.handleInventoryMouseMove(e));
    canvas.addEventListener('click', (e) => this.handleInventoryClick(e));
    canvas.addEventListener('mouseleave', () => this.handleInventoryMouseLeave());
  },

  // Update inventory canvas size
  updateInventorySize() {
    const totalSize = this.config.inventoryGridSize * this.config.inventorySlotSize + 
                     (this.config.inventoryGridSize - 1) * this.config.inventorySpacing + 40; // 40px padding
    
    this.inventoryCanvas.width = totalSize;
    this.inventoryCanvas.height = totalSize;
  },

  // Toggle inventory open/closed
  toggleInventory() {
    this.inventoryOpen = !this.inventoryOpen;
    this.inventoryCanvas.style.display = this.inventoryOpen ? 'block' : 'none';
    
    if (this.inventoryOpen) {
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
    
    // Draw background
    ctx.fillStyle = this.config.inventoryBackground;
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
        
        // Determine slot background color
        let bgColor = this.config.slotBackground;
        if (this.hoveredSlot && this.hoveredSlot.row === row && this.hoveredSlot.col === col) {
          bgColor = this.config.slotHoverBackground;
        }
        if (this.selectedSlot && this.selectedSlot.row === row && this.selectedSlot.col === col) {
          bgColor = this.config.slotSelectedBackground;
        }
        
        // Draw slot
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, this.config.inventorySlotSize, this.config.inventorySlotSize);
        
        // Draw slot border
        ctx.strokeStyle = this.config.inventoryBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.config.inventorySlotSize, this.config.inventorySlotSize);
        
        // Draw slot number (for debugging)
        ctx.fillStyle = '#888';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${row * this.config.inventoryGridSize + col + 1}`, x + this.config.inventorySlotSize / 2, y + this.config.inventorySlotSize / 2 + 4);
      }
    }
  },

  // Handle inventory mouse movement
  handleInventoryMouseMove(e) {
    const rect = this.inventoryCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
    
    console.log(`[UI] Selected inventory slot: ${this.selectedSlot.row * this.config.inventoryGridSize + this.selectedSlot.col + 1} (row ${this.selectedSlot.row}, col ${this.selectedSlot.col})`);
  },

  // Handle inventory mouse leave
  handleInventoryMouseLeave() {
    this.hoveredSlot = null;
    this.renderInventory();
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

  // Set up global key listeners
  setupGlobalListeners() {
    window.addEventListener('keydown', (e) => {
      // If input bar is open, handle input events
      if (this.inputBarOpen) {
        if (e.code === 'Escape') {
          this.closeInputBar();
          e.preventDefault();
        } else if (e.code === 'Enter') {
          this.submitInputBar();
          e.preventDefault();
        } else if (e.code === 'ArrowUp') {
          this.navigateHistoryUp();
          e.preventDefault();
        } else if (e.code === 'ArrowDown') {
          this.navigateHistoryDown();
          e.preventDefault();
        }
        // All other keys are handled by the input element
        return;
      }
      
      // If inventory is open, handle inventory-specific keys
      if (this.inventoryOpen) {
        if (e.code === 'Escape') {
          this.toggleInventory();
          e.preventDefault();
        }
        // Block all other keys when inventory is open
        e.preventDefault();
        return;
      }
      
      // Handle inventory toggle (B key) - only when neither input bar nor inventory is open
      if (e.code === 'KeyB' && !this.inputBarOpen && !this.inventoryOpen) {
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