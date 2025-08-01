// inputBar.js - Responsive input bar for Electron game
export class InputBar {
    constructor() {
        this.inputElement = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.lastFocus = null;
        this.inputValue = '';
        this.isOpen = false;
        
        // Responsive configuration
        this.config = {
            maxHistorySize: 20,
            storageKey: 'electron_command_history',
            minHistorySize: 1,
            maxHistoryLimit: 100
        };
    }

    init() {
        this.loadCommandHistory();
        this.createInputBar();
        this.setupGlobalListeners();
        console.log('[InputBar] Initialized');
    }

    createInputBar() {
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'electron-input-bar';
        input.placeholder = 'Type /command or say something...';
        input.autocomplete = 'off';
        input.spellcheck = false;
        
        document.body.appendChild(input);
        this.inputElement = input;
    }

    openInputBar() {
        this.inputElement.value = '';
        this.inputElement.style.display = 'block';
        this.inputElement.focus();
        this.historyIndex = -1;
        this.isOpen = true;
        
        // Store last focus for restoration
        if (document.activeElement && document.activeElement !== this.inputElement) {
            this.lastFocus = document.activeElement;
            document.activeElement.blur();
        }
    }

    closeInputBar() {
        this.inputElement.style.display = 'none';
        this.inputElement.value = '';
        this.inputValue = '';
        this.isOpen = false;
        
        // Restore focus
        if (this.lastFocus) {
            this.lastFocus.focus();
            this.lastFocus = null;
        }
    }

    submitInputBar() {
        const value = this.inputElement.value.trim();
        if (value.length === 0) {
            this.closeInputBar();
            return;
        }
        
        // Add to command history
        this.addToHistory(value);
        
        if (value.startsWith('/')) {
            // Handle command (strip leading /)
            this.handleCommand(value.slice(1));
        } else {
            // Handle chat/say action
            console.log(`[InputBar] (Say): ${value}`);
            // Future: show as speech bubble, trigger NPC interactions, etc.
        }
        
        this.closeInputBar();
    }

    handleCommand(command) {
        // Route to the global cmd function if it exists
        if (window.cmd) {
            const parts = command.split(' ');
            const cmdName = parts[0];
            const args = parts.slice(1);
            
            // Call the global cmd function with the command name and arguments
            window.cmd(cmdName, ...args);
        } else {
            console.log(`[InputBar] Command system not available: ${command}`);
        }
    }

    addToHistory(command) {
        if (command.length === 0) return;
        
        // Don't add duplicates
        if (this.commandHistory.length > 0 && 
            this.commandHistory[this.commandHistory.length - 1] === command) {
            this.historyIndex = -1;
            return;
        }
        
        this.commandHistory.push(command);
        
        // Keep history size within limits
        if (this.commandHistory.length > this.config.maxHistorySize) {
            this.commandHistory.shift();
        }
        
        this.historyIndex = -1;
        this.saveCommandHistory();
    }

    loadCommandHistory() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                this.commandHistory = JSON.parse(saved);
                console.log(`[InputBar] Loaded ${this.commandHistory.length} commands from history`);
            }
        } catch (error) {
            console.warn('[InputBar] Failed to load command history:', error);
            this.commandHistory = [];
        }
    }

    saveCommandHistory() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.commandHistory));
        } catch (error) {
            console.warn('[InputBar] Failed to save command history:', error);
        }
    }

    clearCommandHistory() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.saveCommandHistory();
        console.log('[InputBar] Command history cleared');
    }

    navigateHistoryUp() {
        if (this.commandHistory.length === 0) return;
        
        if (this.historyIndex === -1) {
            this.inputValue = this.inputElement.value;
            this.historyIndex = this.commandHistory.length - 1;
        } else if (this.historyIndex > 0) {
            this.historyIndex--;
        }
        
        this.inputElement.value = this.commandHistory[this.historyIndex];
        this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
    }

    navigateHistoryDown() {
        if (this.commandHistory.length === 0) return;
        
        if (this.historyIndex === -1) return;
        
        this.historyIndex++;
        
        if (this.historyIndex >= this.commandHistory.length) {
            this.inputElement.value = this.inputValue;
            this.historyIndex = -1;
        } else {
            this.inputElement.value = this.commandHistory[this.historyIndex];
        }
        
        this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
    }

    setupGlobalListeners() {
        window.addEventListener('keydown', (e) => {
            // Handle input bar events when open
            if (this.isOpen) {
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
                // Let other keys pass through to input
                return;
            }
            
            // Open input bar on Enter when not open and not focused on input/textarea
            if (e.code === 'Enter' && !this.isOpen) {
                const tag = document.activeElement.tagName.toLowerCase();
                if (tag !== 'input' && tag !== 'textarea') {
                    this.openInputBar();
                    e.preventDefault();
                }
            }
        });
    }

    // Public methods for external control
    open() {
        this.openInputBar();
    }

    close() {
        this.closeInputBar();
    }

    isInputBarOpen() {
        return this.isOpen;
    }
} 