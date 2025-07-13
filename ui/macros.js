// ui/macros.js
// Macro management system

// Ensure UI object exists
// Macro Management System
window.UI.macroManager = {
  // Storage keys
  storageKey: 'ui_macros',
  
  // Macro data
  macros: {}, // { macroName: { name, command, created } }
  macroIcons: {}, // { macroName: dataURL }
  
  // Initialize macro system
  init() {
    this.loadMacros();
    console.log('[UI] Macro system initialized');
    console.log(`[UI] Loaded ${Object.keys(this.macros).length} macros`);
  },
  
  // Load macros from localStorage
  loadMacros() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.macros = data.macros || {};
        this.macroIcons = data.macroIcons || {};
        console.log(`[UI] Loaded ${Object.keys(this.macros).length} macros from storage`);
      }
    } catch (error) {
      console.warn('[UI] Failed to load macros:', error);
      this.macros = {};
      this.macroIcons = {};
    }
  },
  
  // Save macros to localStorage
  saveMacros() {
    try {
      const data = {
        macros: this.macros,
        macroIcons: this.macroIcons
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[UI] Failed to save macros:', error);
    }
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
    canvas.width = 48;
    canvas.height = 48;
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
  
  // Assign a macro to an action bar slot
  assignMacro(barSlot, macroName) {
    if (!this.macros[macroName]) {
      console.error(`[UI] Macro '${macroName}' does not exist`);
      return false;
    }
    
    // Parse bar-slot format (e.g., "mainBar-0", "secondaryBar-3")
    const parts = barSlot.split('-');
    if (parts.length !== 2) {
      console.error('[UI] Invalid bar-slot format. Use "barName-slotIndex" (e.g., "mainBar-0", "secondaryBar-3")');
      return false;
    }
    
    const barName = parts[0];
    const slotIndex = parseInt(parts[1], 10);
    
    if (isNaN(slotIndex) || slotIndex < 0) {
      console.error('[UI] Invalid slot index. Must be a non-negative number.');
      return false;
    }
    
    // Get the action bar
    const bar = window.UI.actionBarManager.getActionBar(barName);
    if (!bar) {
      console.error(`[UI] Action bar '${barName}' does not exist`);
      return false;
    }
    
    if (slotIndex >= bar.slots) {
      console.error(`[UI] Slot index ${slotIndex} is out of range for bar '${barName}' (0-${bar.slots - 1})`);
      return false;
    }
    
    // Assign the macro
    bar.assignMacro(slotIndex, macroName);
    
    console.log(`[UI] Assigned macro '${macroName}' to ${barName} slot ${slotIndex}`);
    return true;
  },
  
  // Remove a macro from an action bar slot
  removeMacro(barSlot) {
    // Parse bar-slot format
    const parts = barSlot.split('-');
    if (parts.length !== 2) {
      console.error('[UI] Invalid bar-slot format. Use "barName-slotIndex"');
      return false;
    }
    
    const barName = parts[0];
    const slotIndex = parseInt(parts[1], 10);
    
    if (isNaN(slotIndex) || slotIndex < 0) {
      console.error('[UI] Invalid slot index');
      return false;
    }
    
    // Get the action bar
    const bar = window.UI.actionBarManager.getActionBar(barName);
    if (!bar) {
      console.error(`[UI] Action bar '${barName}' does not exist`);
      return false;
    }
    
    // Remove the macro
    bar.removeMacro(slotIndex);
    
    console.log(`[UI] Removed macro from ${barName} slot ${slotIndex}`);
    return true;
  },
  
  // Delete a macro entirely
  deleteMacro(macroName) {
    if (!this.macros[macroName]) {
      console.error(`[UI] Macro '${macroName}' does not exist`);
      return false;
    }
    
    // Remove from all action bars
    const bars = window.UI.actionBarManager.listActionBars();
    for (const barName of bars) {
      const bar = window.UI.actionBarManager.getActionBar(barName);
      if (bar) {
        for (let i = 0; i < bar.slots; i++) {
          if (bar.macroBindings[i] === macroName) {
            bar.removeMacro(i);
          }
        }
      }
    }
    
    // Remove from storage
    delete this.macros[macroName];
    delete this.macroIcons[macroName];
    this.saveMacros();
    
    console.log(`[UI] Deleted macro '${macroName}'`);
    return true;
  },
  
  // List all macros
  listMacros() {
    return Object.keys(this.macros);
  },
  
  // Get macro info
  getMacro(name) {
    return this.macros[name];
  },
  
  // Clear all macros
  clearAllMacros() {
    // Remove from all action bars
    const bars = window.UI.actionBarManager.listActionBars();
    for (const barName of bars) {
      const bar = window.UI.actionBarManager.getActionBar(barName);
      if (bar) {
        for (let i = 0; i < bar.slots; i++) {
          bar.removeMacro(i);
        }
      }
    }
    
    // Clear storage
    this.macros = {};
    this.macroIcons = {};
    this.saveMacros();
    
    console.log('[UI] Cleared all macros');
  },

  // Ensure macro manager is always available
  ensureMacroManager() {
    if (!window.UI.macroManager) {
      console.error('[UI] Macro manager not found - this should not happen');
      return false;
    }
    
    // If not initialized, initialize it
    if (!window.UI.macroManager.macros) {
      window.UI.macroManager.init();
    }
    
    return true;
  }
};

// Manual initialization function for debugging
window.UI.initMacroManager = function() {
  if (window.UI.macroManager) {
    window.UI.macroManager.init();
    console.log('[UI] Macro manager manually initialized');
  } else {
    console.error('[UI] Macro manager not found');
  }
};

// Initialize immediately when script loads
if (window.UI.macroManager) {
  window.UI.macroManager.init();
  console.log('[UI] Macro manager initialized immediately');
}

// Also initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  if (window.UI.macroManager) {
    // Re-initialize to ensure it's ready
    window.UI.macroManager.init();
    console.log('[UI] Macro manager initialized on DOM ready');
  } else {
    console.error('[UI] Macro manager not found during DOM ready');
  }
});

// Fallback: try to initialize after a short delay
setTimeout(() => {
  if (window.UI.macroManager && !window.UI.macroManager.macros) {
    window.UI.macroManager.init();
    console.log('[UI] Macro manager initialized via fallback');
  }
}, 500); 