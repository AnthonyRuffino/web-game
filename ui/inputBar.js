// ui/inputBar.js
// Input bar system for text input and commands

(() => {
  // --- Input Bar Config ---
  const INPUT_BAR_CONFIG = {
    maxHistorySize: 20,
    storageKey: 'ui_command_history',
    style: {
      position: 'fixed',
      left: '50%',
      bottom: '40px',
      transform: 'translateX(-50%)',
      width: '50vw',
      maxWidth: '700px',
      minWidth: '200px',
      padding: '12px 16px',
      fontSize: '1.2rem',
      border: '2px solid #888',
      borderRadius: '8px',
      background: 'rgba(30,30,30,0.98)',
      color: '#fff',
      outline: 'none',
      zIndex: 1000,
      display: 'none',
      boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
      letterSpacing: '0.02em',
      fontFamily: 'inherit'
    },
    minHistorySize: 1,
    maxHistoryLimit: 100
  };
  // --- End Input Bar Config ---
  // Input Bar System
  window.WebGame.UI.inputBar = {
    // Configuration
    config: {
      maxHistorySize: INPUT_BAR_CONFIG.maxHistorySize,
      storageKey: INPUT_BAR_CONFIG.storageKey
    },

    // State
    inputValue: '',
    inputElement: null,
    lastFocus: null,
    commandHistory: [],
    historyIndex: -1,

    // Initialize input bar
    init() {
      this.loadCommandHistory();
      this.createInputBar();
      this.setupGlobalListeners();
      console.log('[UI] Input bar initialized');
      console.log(`[UI] Command history size: ${this.config.maxHistorySize}`);
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
      Object.entries(INPUT_BAR_CONFIG.style).forEach(([k, v]) => { input.style[k] = v; });
      document.body.appendChild(input);
      this.inputElement = input;
    },

    // Show the input bar and focus
    openInputBar() {
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
      if (size >= INPUT_BAR_CONFIG.minHistorySize && size <= INPUT_BAR_CONFIG.maxHistoryLimit) {
        this.config.maxHistorySize = size;
        // Trim history if it's now larger than the new limit
        while (this.commandHistory.length > this.config.maxHistorySize) {
          this.commandHistory.shift();
        }
        this.saveCommandHistory();
        console.log(`[UI] Command history size set to ${size}`);
      } else {
        console.error(`[UI] Invalid history size. Must be between ${INPUT_BAR_CONFIG.minHistorySize} and ${INPUT_BAR_CONFIG.maxHistoryLimit}.`);
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

    // Set up global key listeners for input bar
    setupGlobalListeners() {
      window.addEventListener('keydown', (e) => {
        // If input bar is open, handle input events and block only special keys
        if (this.inputElement.style.display === 'block') {
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
        if (window.UI.inventory && window.UI.inventory.inventoryOpen) {
          if (e.code === 'Escape') {
            window.UI.inventory.toggleInventory();
            e.preventDefault();
            return;
          }
          // Do not block any other keys
        }
        
        // Handle inventory toggle (B key) - toggle when input bar is not open
        if (e.code === 'KeyB' && this.inputElement.style.display !== 'block') {
          if (window.UI.inventory) {
            window.UI.inventory.toggleInventory();
          }
          e.preventDefault();
          return;
        }
        
        // If input bar is not open, open it on Enter (but not if focused on an input/textarea)
        if (e.code === 'Enter' && this.inputElement.style.display !== 'block') {
          const tag = document.activeElement.tagName.toLowerCase();
          if (tag !== 'input' && tag !== 'textarea') {
            this.openInputBar();
            e.preventDefault();
          }
        }
      });
    }
  };

  // Also register with old system for backward compatibility during migration
  window.UI.inputBar = window.WebGame.UI.inputBar;
  
})();
