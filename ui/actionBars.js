// ui/actionBars.js
if (!window.UI) window.UI = {};

// Action Bars and Macro System
window.UI.actionBars = {
  // Configuration
  config: {
    actionBarSlots: 10, // Number of action bar slots (1-0 keys)
    actionBarSlotSize: 60, // Size of each action bar slot in pixels
    actionBarSpacing: 4, // Spacing between action bar slots
    actionBarMargin: 20, // Margin from screen edges
    actionBarBackground: 'rgba(20,20,20,0.95)',
    actionBarBorder: '#666',
    actionBarSlotBackground: 'rgba(40,40,40,0.6)', // Lower opacity for empty cells
    actionBarSlotHoverBackground: 'rgba(60,60,60,0.9)',
    actionBarSlotActiveBackground: 'rgba(80,80,80,0.9)',
    actionBarOpacity: 0.95, // Configurable action bar opacity
    actionBarHeight: 80, // Height of action bar (inventory will be shifted up by this amount)
    actionBarGap: 8, // Gap between the two action bars
    // Macro system configuration
    macroStorageKey: 'ui_macros',
    macroIconSize: 48 // Size of macro icons in pixels
  },

  // State
  actionBarCanvas: null,
  actionBarCtx: null,
  hoveredActionSlot: null,
  activeActionSlot: null,
  actionBarScale: 1.0,
  // Secondary action bar state
  actionBar2Canvas: null,
  actionBar2Ctx: null,
  hoveredActionSlot2: null,
  activeActionSlot2: null,
  actionBar2Scale: 1.0,
  // Macro system state
  macros: {}, // Store macro data
  macroIcons: {}, // Store macro icon data URLs
  actionBarBindings: { // Store which macros are bound to which slots
    bar1: {}, // Primary action bar bindings
    bar2: {} // Secondary action bar bindings
  },

  // Initialize action bars
  init() {
    this.loadMacros();
    this.createActionBar();
    this.createActionBar2();
    this.setupGlobalListeners();
    console.log('[UI] Action bars initialized');
    console.log(`[UI] Action bar slots: ${this.config.actionBarSlots}`);
    console.log(`[UI] Dual action bar system ready`);
    console.log(`[UI] Macro system loaded: ${Object.keys(this.macros).length} macros`);
  },

  // Load macros from localStorage
  loadMacros() {
    try {
      const saved = localStorage.getItem(this.config.macroStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.macros = data.macros || {};
        this.macroIcons = data.macroIcons || {};
        this.actionBarBindings = data.actionBarBindings || { bar1: {}, bar2: {} };
        console.log(`[UI] Loaded ${Object.keys(this.macros).length} macros from storage`);
      }
    } catch (error) {
      console.warn('[UI] Failed to load macros:', error);
      this.macros = {};
      this.macroIcons = {};
      this.actionBarBindings = { bar1: {}, bar2: {} };
    }
  },

  // Save macros to localStorage
  saveMacros() {
    try {
      const data = {
        macros: this.macros,
        macroIcons: this.macroIcons,
        actionBarBindings: this.actionBarBindings
      };
      localStorage.setItem(this.config.macroStorageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[UI] Failed to save macros:', error);
    }
  },

  // Create action bar
  createActionBar() {
    // Create action bar canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'ui-action-bar';
    canvas.style.position = 'fixed';
    canvas.style.bottom = `${this.config.actionBarMargin}px`;
    canvas.style.left = `${this.config.actionBarMargin}px`;
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
    this.actionBarCanvas.style.transform = `scale(${scaleFactor})`;
    this.actionBarCanvas.style.transformOrigin = 'bottom left';
    
    // Store scale factor for mouse calculations
    this.actionBarScale = scaleFactor;

  },

  // Create second action bar
  createActionBar2() {
    // Create second action bar canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'ui-action-bar-2';
    canvas.style.position = 'fixed';
    canvas.style.bottom = `${this.config.actionBarMargin}px`;
    canvas.style.left = `${this.config.actionBarMargin + this.config.actionBarSlotSize * this.config.actionBarSlots + this.config.actionBarSpacing * (this.config.actionBarSlots - 1) + 40 + this.config.actionBarGap}px`;
    canvas.style.zIndex = '998';
    canvas.style.border = `2px solid ${this.config.actionBarBorder}`;
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
    document.body.appendChild(canvas);
    
    this.actionBar2Canvas = canvas;
    this.actionBar2Ctx = canvas.getContext('2d');
    
    // Set canvas size based on slots
    this.updateActionBar2Size();
    
    // Add mouse event listeners with proper scaling
    canvas.addEventListener('mousemove', (e) => this.handleActionBar2MouseMove(e));
    canvas.addEventListener('click', (e) => this.handleActionBar2Click(e));
    canvas.addEventListener('mouseleave', () => this.handleActionBar2MouseLeave());
    
    // Add window resize listener to update action bar size
    window.addEventListener('resize', () => {
      this.updateActionBar2Size();
      this.renderActionBar2();
    });
    
    // Initial render
    this.renderActionBar2();
  },

  // Update second action bar canvas size
  updateActionBar2Size() {
    // Calculate base size (same as first action bar)
    const baseWidth = this.config.actionBarSlots * this.config.actionBarSlotSize + 
                     (this.config.actionBarSlots - 1) * this.config.actionBarSpacing + 40; // 40px padding
    const baseHeight = this.config.actionBarSlotSize + 20; // 20px padding
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    
    // Calculate scale factor based on viewport size
    // Use viewport width to ensure action bar fits
    const maxActionBarWidth = viewportWidth * 0.4; // Max 40% of viewport width (smaller for dual bars)
    const minActionBarWidth = 400; // Minimum width
    const targetWidth = Math.max(minActionBarWidth, Math.min(maxActionBarWidth, baseWidth));
    
    // Calculate scale factor
    const scaleFactor = targetWidth / baseWidth;
    
    // Apply scale to canvas
    this.actionBar2Canvas.width = baseWidth;
    this.actionBar2Canvas.height = baseHeight;
    this.actionBar2Canvas.style.transform = `scale(${scaleFactor})`;
    this.actionBar2Canvas.style.transformOrigin = 'bottom left';
    
    // Store scale factor for mouse calculations
    this.actionBar2Scale = scaleFactor;
    
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
      
      // Check if there's a macro bound to this slot
      const macroName = this.getMacroForSlot(1, i);
      
      if (macroName && this.macroIcons[macroName]) {
        // Draw macro icon
        const img = new Image();
        img.onload = () => {
          const iconSize = this.config.macroIconSize * 0.8; // Slightly smaller than slot
          const iconX = x + (this.config.actionBarSlotSize - iconSize) / 2;
          const iconY = y + (this.config.actionBarSlotSize - iconSize) / 2;
          ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
        };
        img.src = this.macroIcons[macroName];
      }
      
      // Draw slot number (1-0 keys) - always on top
      const slotNumber = i === 9 ? '0' : (i + 1).toString();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.config.actionBarOpacity})`;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(slotNumber, x + this.config.actionBarSlotSize / 2, y + this.config.actionBarSlotSize / 2 + 5);
      
      // Draw placeholder text only if no macro
      if (!macroName) {
        ctx.fillStyle = `rgba(136, 136, 136, ${this.config.actionBarOpacity * 0.4})`;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Empty', x + this.config.actionBarSlotSize / 2, y + this.config.actionBarSlotSize / 2 + 20);
      }
    }
  },

  // Render second action bar
  renderActionBar2() {
    if (!this.actionBar2Ctx) return;
    
    const ctx = this.actionBar2Ctx;
    const canvas = this.actionBar2Canvas;
    
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
      if (this.hoveredActionSlot2 === i) {
        bgColor = this.config.actionBarSlotHoverBackground;
      }
      if (this.activeActionSlot2 === i) {
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
      
      // Check if there's a macro bound to this slot
      const macroName = this.getMacroForSlot(2, i);
      
      if (macroName && this.macroIcons[macroName]) {
        // Draw macro icon
        const img = new Image();
        img.onload = () => {
          const iconSize = this.config.macroIconSize * 0.8; // Slightly smaller than slot
          const iconX = x + (this.config.actionBarSlotSize - iconSize) / 2;
          const iconY = y + (this.config.actionBarSlotSize - iconSize) / 2;
          ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
        };
        img.src = this.macroIcons[macroName];
      }
      
      // Draw slot number (Shift+1-0 keys) - always on top
      const slotNumber = i === 9 ? '0' : (i + 1).toString();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.config.actionBarOpacity})`;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(slotNumber, x + this.config.actionBarSlotSize / 2, y + this.config.actionBarSlotSize / 2 + 5);
      
      // Draw placeholder text only if no macro
      if (!macroName) {
        ctx.fillStyle = `rgba(136, 136, 136, ${this.config.actionBarOpacity * 0.4})`;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Empty', x + this.config.actionBarSlotSize / 2, y + this.config.actionBarSlotSize / 2 + 20);
      }
    }
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
    
    // Execute macro if bound to this slot
    const macroName = this.getMacroForSlot(1, this.activeActionSlot);
    if (macroName) {
      this.executeMacro(macroName);
    }
    
    // Clear active state after a short delay (temporary highlighting)
    setTimeout(() => {
      this.activeActionSlot = null;
      this.renderActionBar();
    }, 150);
  },

  // Handle action bar mouse leave
  handleActionBarMouseLeave() {
    this.hoveredActionSlot = null;
    this.renderActionBar();
  },

  // Handle second action bar mouse movement
  handleActionBar2MouseMove(e) {
    const rect = this.actionBar2Canvas.getBoundingClientRect();
    // Account for scaling in mouse coordinates
    const x = (e.clientX - rect.left) / this.actionBar2Scale;
    const y = (e.clientY - rect.top) / this.actionBar2Scale;
    
    const startX = 20;
    const startY = 10;
    
    // Find which slot is being hovered
    for (let i = 0; i < this.config.actionBarSlots; i++) {
      const slotX = startX + i * (this.config.actionBarSlotSize + this.config.actionBarSpacing);
      const slotY = startY;
      
      if (x >= slotX && x < slotX + this.config.actionBarSlotSize &&
          y >= slotY && y < slotY + this.config.actionBarSlotSize) {
        this.hoveredActionSlot2 = i;
        this.renderActionBar2();
        return;
      }
    }
    
    // No slot hovered
    this.hoveredActionSlot2 = null;
    this.renderActionBar2();
  },

  // Handle second action bar click
  handleActionBar2Click(e) {
    if (this.hoveredActionSlot2 === null) return;
    
    this.activeActionSlot2 = this.hoveredActionSlot2;
    this.renderActionBar2();
    
    // Prevent the click from reaching the game world
    e.preventDefault();
    e.stopPropagation();
    
    const slotNumber = this.activeActionSlot2 === 9 ? '0' : (this.activeActionSlot2 + 1).toString();
    console.log(`[UI] Activated action bar 2 slot: Shift+${slotNumber} (index ${this.activeActionSlot2})`);
    
    // Execute macro if bound to this slot
    const macroName = this.getMacroForSlot(2, this.activeActionSlot2);
    if (macroName) {
      this.executeMacro(macroName);
    }
    
    // Clear active state after a short delay (temporary highlighting)
    setTimeout(() => {
      this.activeActionSlot2 = null;
      this.renderActionBar2();
    }, 150);
  },

  // Handle second action bar mouse leave
  handleActionBar2MouseLeave() {
    this.hoveredActionSlot2 = null;
    this.renderActionBar2();
  },

  // Create a new macro
  createMacro(name, command) {
    if (this.macros[name]) {
      console.error(`[UI] Macro '${name}' already exists`);
      return false;
    }

    // Create macro data
    this.macros[name] = {
      name: name,
      command: command,
      created: Date.now()
    };

    // Generate dynamic icon
    this.generateMacroIcon(name);

    // Save to localStorage
    this.saveMacros();

    console.log(`[UI] Created macro '${name}' with command '${command}'`);
    return true;
  },

  // Generate a dynamic icon for a macro
  generateMacroIcon(macroName) {
    // Create a temporary canvas for icon generation
    const canvas = document.createElement('canvas');
    canvas.width = this.config.macroIconSize;
    canvas.height = this.config.macroIconSize;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate random colors
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    const shapeColor = colors[Math.floor(Math.random() * colors.length)];

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw random shapes
    const shapeCount = Math.floor(Math.random() * 3) + 2; // 2-4 shapes
    for (let i = 0; i < shapeCount; i++) {
      ctx.fillStyle = shapeColor;
      const shapeType = Math.floor(Math.random() * 3); // 0=circle, 1=rect, 2=triangle
      
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 10;

      switch (shapeType) {
        case 0: // Circle
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 1: // Rectangle
          ctx.fillRect(x - size/2, y - size/2, size, size);
          break;
        case 2: // Triangle
          ctx.beginPath();
          ctx.moveTo(x, y - size/2);
          ctx.lineTo(x - size/2, y + size/2);
          ctx.lineTo(x + size/2, y + size/2);
          ctx.closePath();
          ctx.fill();
          break;
      }
    }

    // Convert to data URL
    this.macroIcons[macroName] = canvas.toDataURL('image/png');
  },

  // Place a macro in an action bar slot
  placeMacro(barSlot, macroName) {
    if (!this.macros[macroName]) {
      console.error(`[UI] Macro '${macroName}' does not exist`);
      return false;
    }

    // Parse bar-slot format (e.g., "1-0" for bar 1 slot 0, "2-5" for bar 2 slot 5)
    const parts = barSlot.split('-');
    if (parts.length !== 2) {
      console.error('[UI] Invalid bar-slot format. Use "bar-slot" (e.g., "1-0", "2-5")');
      return false;
    }

    const bar = parseInt(parts[0]);
    const slot = parseInt(parts[1]);

    if (bar !== 1 && bar !== 2) {
      console.error('[UI] Invalid bar number. Must be 1 or 2');
      return false;
    }

    if (slot < 0 || slot >= this.config.actionBarSlots) {
      console.error(`[UI] Invalid slot number. Must be 0-${this.config.actionBarSlots - 1}`);
      return false;
    }

    const barKey = bar === 1 ? 'bar1' : 'bar2';
    this.actionBarBindings[barKey][slot] = macroName;

    // Save to localStorage
    this.saveMacros();

    console.log(`[UI] Placed macro '${macroName}' in action bar ${bar} slot ${slot}`);
    return true;
  },

  // Execute a macro
  executeMacro(macroName) {
    if (!this.macros[macroName]) {
      console.error(`[UI] Macro '${macroName}' does not exist`);
      return false;
    }

    const command = this.macros[macroName].command;
    console.log(`[UI] Executing macro '${macroName}': ${command}`);
    
    if (window.cmd) {
      window.cmd(command);
    } else {
      console.error('[UI] Command system not available');
    }
  },

  // Get macro bound to a specific slot
  getMacroForSlot(bar, slot) {
    const barKey = bar === 1 ? 'bar1' : 'bar2';
    return this.actionBarBindings[barKey][slot] || null;
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

  // Set up global key listeners for action bars
  setupGlobalListeners() {
    window.addEventListener('keydown', (e) => {
      // Handle action bar number keys (1-0) when input bar is not open
      if (!window.UI.inputBar || !window.UI.inputBar.inputBarOpen) {
        const keyToSlot = {
          'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3, 'Digit5': 4,
          'Digit6': 5, 'Digit7': 6, 'Digit8': 7, 'Digit9': 8, 'Digit0': 9
        };
        
        if (keyToSlot[e.code] !== undefined) {
          // Check if Shift is held for second action bar
          if (e.shiftKey) {
            this.activeActionSlot2 = keyToSlot[e.code];
            this.renderActionBar2();
            
            const slotNumber = this.activeActionSlot2 === 9 ? '0' : (this.activeActionSlot2 + 1).toString();
            console.log(`[UI] Activated action bar 2 slot: Shift+${slotNumber} (index ${this.activeActionSlot2})`);
            
            // Execute macro if bound to this slot
            const macroName = this.getMacroForSlot(2, this.activeActionSlot2);
            if (macroName) {
              this.executeMacro(macroName);
            }
            
            // Clear active state after a short delay (temporary highlighting)
            setTimeout(() => {
              this.activeActionSlot2 = null;
              this.renderActionBar2();
            }, 150);
          } else {
            this.activeActionSlot = keyToSlot[e.code];
            this.renderActionBar();
            
            const slotNumber = this.activeActionSlot === 9 ? '0' : (this.activeActionSlot + 1).toString();
            console.log(`[UI] Activated action bar slot: ${slotNumber} (index ${this.activeActionSlot})`);
            
            // Execute macro if bound to this slot
            const macroName = this.getMacroForSlot(1, this.activeActionSlot);
            if (macroName) {
              this.executeMacro(macroName);
            }
            
            // Clear active state after a short delay (temporary highlighting)
            setTimeout(() => {
              this.activeActionSlot = null;
              this.renderActionBar();
            }, 150);
          }
          
          e.preventDefault();
          return;
        }
      }
    });
  }
};
