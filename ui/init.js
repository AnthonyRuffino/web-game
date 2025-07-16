// ui/init.js
// UI system initialization and dynamic module loading

// Create the main UI object
const UI = {
  // Track loaded modules
  loadedModules: new Set(),
  
  // Module loading queue with dependencies
  moduleQueue: [
    { name: 'console', file: 'ui/console.js', dependencies: [] },
    { name: 'input', file: 'ui/input.js', dependencies: [] },
    { name: 'responsiveCanvas', file: 'ui/responsiveCanvas.js', dependencies: [] },
    { name: 'jsonPopup', file: 'ui/jsonPopup.js', dependencies: [] },
    { name: 'actionBars', file: 'ui/actionBars.js', dependencies: ['jsonPopup'] },
    { name: 'macros', file: 'ui/macros.js', dependencies: ['actionBars'] },
    { name: 'inventory', file: 'ui/inventory.js', dependencies: [] },
    { name: 'inputBar', file: 'ui/inputBar.js', dependencies: [] },
    { name: 'skins', file: 'ui/skins.js', dependencies: [] },
    { name: 'menuBar', file: 'ui/menuBar.js', dependencies: ['actionBars'] },
    { name: 'minimap', file: 'ui/minimap.js', dependencies: [] }
  ],
  
  // Load a single module
  async loadModule(moduleInfo) {
    if (this.loadedModules.has(moduleInfo.name)) {
      console.log(`[UI] Module ${moduleInfo.name} already loaded`);
      return;
    }
    
    // Check dependencies
    for (const dep of moduleInfo.dependencies) {
      if (!this.loadedModules.has(dep)) {
        console.warn(`[UI] Module ${moduleInfo.name} depends on ${dep}, but it's not loaded yet`);
        return false;
      }
    }
    
    try {
      console.log(`[UI] Loading module: ${moduleInfo.name} from ${moduleInfo.file}`);
      
      // Create script element
      const script = document.createElement('script');
      script.src = moduleInfo.file;
      script.async = false; // Load synchronously to maintain order
      
      // Wait for script to load
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${moduleInfo.file}`));
        document.head.appendChild(script);
      });
      
      this.loadedModules.add(moduleInfo.name);
      console.log(`[UI] Successfully loaded module: ${moduleInfo.name}`);
      return true;
      
    } catch (error) {
      console.error(`[UI] Failed to load module ${moduleInfo.name}:`, error);
      return false;
    }
  },
  
  // Load all modules in dependency order
  async loadAllModules() {
    console.log('[UI] Starting dynamic module loading...');
    
    let loadedThisRound = true;
    const maxRounds = this.moduleQueue.length * 2; // Prevent infinite loops
    let rounds = 0;
    
    while (loadedThisRound && rounds < maxRounds && this.loadedModules.size < this.moduleQueue.length) {
      loadedThisRound = false;
      rounds++;
      
      for (const moduleInfo of this.moduleQueue) {
        if (!this.loadedModules.has(moduleInfo.name)) {
          const success = await this.loadModule(moduleInfo);
          if (success) {
            loadedThisRound = true;
          }
        }
      }
    }
    
    if (this.loadedModules.size < this.moduleQueue.length) {
      console.error('[UI] Some modules failed to load:', 
        this.moduleQueue.filter(m => !this.loadedModules.has(m.name)).map(m => m.name));
    } else {
      console.log('[UI] All modules loaded successfully');
    }
  },
  
  // Initialize all UI submodules
  async init() {
    console.log('[UI] Starting UI initialization...');
    
    // Load all modules first
    await this.loadAllModules();
    
    // Initialize submodules in dependency order
    if (window.UI.input && window.UI.input.init) {
      console.log('[UI] Initializing input system...');
      window.UI.input.init();
    } else {
      console.warn('[UI] Input system not found');
    }
    
    if (window.UI.responsiveCanvas && window.UI.responsiveCanvas.init) {
      console.log('[UI] Initializing responsive canvas...');
      window.UI.responsiveCanvas.init();
    } else {
      console.warn('[UI] Responsive canvas not found');
    }
    
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
    
    if (window.UI.actionBarManager) {
      console.log('[UI] Action bar manager ready');
      // Action bars are created automatically via DOMContentLoaded event
    } else {
      console.warn('[UI] Action bar manager not found');
    }

    if (window.UI.skinsManager && window.UI.skinsManager.init) {
      console.log('[UI] Initializing skins manager...');
      window.UI.skinsManager.init();
    } else {
      console.warn('[UI] Skins manager not found');
    }

    // Initialize menu bar
    if (window.UI.menuBar && window.UI.menuBar.init) {
      window.UI.menuBar.init();
    }

    // Initialize minimap
    if (window.UI.minimapManager) {
      console.log('[UI] Minimap manager ready');
      // Minimaps are created automatically via DOMContentLoaded event
    } else {
      console.warn('[UI] Minimap manager not found');
    }

    // Preload all action bar icons after all modules are loaded and initialized
    if (window.UI.actionBarManager && typeof window.UI.actionBarManager.preloadAllIcons === 'function') {
      window.UI.actionBarManager.preloadAllIcons();
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

  get actionBarManager() {
    return window.UI.actionBarManager;
  },
  
  get macroManager() {
    return window.UI.macroManager;
  },
  
  get skinsManager() {
    return window.UI.skinsManager;
  },
  
  get minimapManager() {
    return window.UI.minimapManager;
  },
  
  get console() {
    return window.UI.console;
  },
  
  get jsonPopup() {
    return window.JsonPopup;
  }
};

// Create the global UI object
if (!window.UI) {
  window.UI = {};
}

// Merge our UI object with the global one
Object.assign(window.UI, UI);