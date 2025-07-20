export class InputManager {
    constructor() {
        this.keys = new Map();
        this.bindings = new Map();
        this.mouseWheelDelta = 0;
        this.isInitialized = false;
        
        // Bind methods to preserve context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    init() {
        if (this.isInitialized) return;
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('wheel', this.handleWheel, { passive: false });
        
        this.isInitialized = true;
        console.log('[InputManager] Input system initialized');
    }

    destroy() {
        if (!this.isInitialized) return;
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('wheel', this.handleWheel);
        
        this.isInitialized = false;
        console.log('[InputManager] Input system destroyed');
    }

    handleKeyDown(event) {
        const key = event.key;
        this.keys.set(key, true);
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
        
        // Trigger bound actions
        this.triggerAction(key);
    }

    handleKeyUp(event) {
        const key = event.key;
        this.keys.set(key, false);
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
    }

    handleWheel(event) {
        event.preventDefault();
        this.mouseWheelDelta = event.deltaY;
    }

    isKeyPressed(key) {
        return this.keys.get(key) || false;
    }

    isAnyKeyPressed() {
        return this.keys.size > 0 && Array.from(this.keys.values()).some(pressed => pressed);
    }

    bindAction(key, action) {
        this.bindings.set(key, action);
    }

    unbindAction(key) {
        this.bindings.delete(key);
    }

    triggerAction(key) {
        const action = this.bindings.get(key);
        if (action && typeof action === 'function') {
            action();
        }
    }

    // Get mouse wheel delta and reset it
    getMouseWheelDelta() {
        const delta = this.mouseWheelDelta;
        this.mouseWheelDelta = 0;
        return delta;
    }

    // Check if a key is used for game input
    isGameKey(key) {
        const gameKeys = [
            'w', 'a', 's', 'd',
            'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
            'space', 'enter', 'escape',
            'shift', 'ctrl', 'alt'
        ];
        return gameKeys.includes(key.toLowerCase());
    }

    // Get all currently pressed keys
    getPressedKeys() {
        return Array.from(this.keys.entries())
            .filter(([key, pressed]) => pressed)
            .map(([key]) => key);
    }

    // Clear all key states (useful for pause/resume)
    clearKeyStates() {
        this.keys.clear();
    }

    // Get input state for debugging
    getInputState() {
        return {
            pressedKeys: this.getPressedKeys(),
            totalKeys: this.keys.size,
            bindings: Array.from(this.bindings.keys()),
            mouseWheelDelta: this.mouseWheelDelta
        };
    }
} 