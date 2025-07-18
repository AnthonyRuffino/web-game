// ui/inventory.js
// Inventory system for managing player items

(() => {
  // Inventory system
  window.WebGame.UI.inventory = {
    // Configuration
    config: {
      inventoryGridSize: 5,
      inventorySlotSize: 60,
      inventorySpacing: 4,
      inventoryMargin: 20,
      inventoryBackground: 'rgba(20,20,20,0.95)',
      inventoryBorder: '#666',
      slotBackground: 'rgba(40,40,40,0.9)',
      slotHoverBackground: 'rgba(60,60,60,0.9)',
      slotSelectedBackground: 'rgba(80,80,80,0.9)',
      inventoryOpacity: 0.95,
      itemIconOpacity: 0.9,
      actionBarHeight: 80,
      minInventorySize: 200,
      maxInventoryViewport: 0.4,
      titleFont: 'bold 18px sans-serif',
      titleColor: '#fff',
      titleY: 25,
      gridStartX: 20,
      gridStartY: 40,
      slotNumberFont: '12px sans-serif',
      slotNumberColor: 'rgba(136, 136, 136, 0.95)',
      slotNumberYOffset: 4,
      borderRadius: 8,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      zIndex: 999
    },

    // State
    inventoryOpen: false,
    inventoryCanvas: null,
    inventoryCtx: null,
    hoveredSlot: null,
    selectedSlot: null,
    inventoryScale: 1.0,

    // Initialize inventory
    init() {
      this.createInventory();
      console.log('[UI] Inventory initialized');
      console.log(`[UI] Inventory grid size: ${this.config.inventoryGridSize}x${this.config.inventoryGridSize}`);
    },

    // Create inventory canvas and elements
    createInventory() {
      // Create inventory canvas
      const canvas = document.createElement('canvas');
      canvas.id = 'ui-inventory';
      canvas.style.position = 'fixed';
      canvas.style.bottom = `${this.config.inventoryMargin + this.config.actionBarHeight}px`;
      canvas.style.right = `${this.config.inventoryMargin}px`;
      // Note: Inventory is positioned to avoid overlapping with the dual action bars
      canvas.style.zIndex = this.config.zIndex;
      canvas.style.display = 'none';
      canvas.style.border = `2px solid ${this.config.inventoryBorder}`;
      canvas.style.borderRadius = `${this.config.borderRadius}px`;
      canvas.style.boxShadow = this.config.boxShadow;
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
      const maxInventorySize = Math.min(viewportWidth * this.config.maxInventoryViewport, viewportHeight * this.config.maxInventoryViewport);
      const minInventorySize = this.config.minInventorySize;
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
    },

    // Toggle inventory open/closed
    toggleInventory() {
      this.inventoryOpen = !this.inventoryOpen;
      this.inventoryCanvas.style.display = this.inventoryOpen ? 'block' : 'none';
      
      if (this.inventoryOpen) {
        this.updateInventorySize(); // Update size when opening
        this.renderInventory();
      }
      
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
      ctx.fillStyle = this.config.titleColor;
      ctx.font = this.config.titleFont;
      ctx.textAlign = 'center';
      ctx.fillText('Inventory', canvas.width / 2, this.config.titleY);
      
      // Draw grid
      const startX = this.config.gridStartX;
      const startY = this.config.gridStartY;
      
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
          ctx.fillStyle = this.config.slotNumberColor.replace('0.95', `${this.config.inventoryOpacity}`);
          ctx.font = this.config.slotNumberFont;
          ctx.textAlign = 'center';
          ctx.fillText(`${row * this.config.inventoryGridSize + col + 1}`, x + this.config.inventorySlotSize / 2, y + this.config.inventorySlotSize / 2 + this.config.slotNumberYOffset);
        }
      }
    },

    // Handle inventory mouse movement
    handleInventoryMouseMove(e) {
      const rect = this.inventoryCanvas.getBoundingClientRect();
      // Account for scaling in mouse coordinates
      const x = (e.clientX - rect.left) / this.inventoryScale;
      const y = (e.clientY - rect.top) / this.inventoryScale;
      
      const startX = this.config.gridStartX;
      const startY = this.config.gridStartY;
      
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
    }
  };

  // Also register with old system for backward compatibility during migration
  window.UI.inventory = window.WebGame.UI.inventory;
  
})();

function initInventoryUI() {
  if (window.UI && window.UI.inventory && window.UI.inventory.init) {
    window.UI.inventory.init();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initInventoryUI);
} else {
  initInventoryUI();
}
