// ui.js
// UI system initialization and coordination

// Create the main UI object
const UI = {
    // Initialize all UI submodules
    init() {
      console.log('[UI] Starting UI initialization...');
      
      // Initialize submodules in dependency order
      if (window.UI.inputBar && window.UI.inputBar.init) {
        console.log('[UI] Initializing input bar...');
        window.UI.inputBar.init();
      } else {
        console.warn('[UI] Input bar module not found');
      }
      
      if (window.UI.inventory && window.UI.inventory.init) {
        console.log('[UI] Initializing inventory...');
        window.UI.inventory.init();
      } else {
        console.warn('[UI] Inventory module not found');
      }
      
      if (window.UI.actionBars && window.UI.actionBars.init) {
        console.log('[UI] Initializing action bars...');
        window.UI.actionBars.init();
      } else {
        console.warn('[UI] Action bars module not found');
      }
      
      console.log('[UI] All UI submodules initialized');
    },
  
    // Convenience methods for accessing submodules
    get inputBar() {
      return window.UI.inputBar;
    },
  
    get inventory() {
      return window.UI.inventory;
    },
  
    get actionBars() {
      return window.UI.actionBars;
    }
  };
  
  // Make UI globally available
  window.UI = Object.assign(window.UI || {}, UI); 