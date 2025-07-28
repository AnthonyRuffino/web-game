export class InputManager {
    static inputBlocked = false;
    static setInputBlocked(blocked) {
        InputManager.inputBlocked = blocked;
    }
    constructor() {
        this.keys = new Map();
        this.bindings = new Map();
        this.mouseWheelDelta = 0;
        this.isInitialized = false;
        
        // Camera mode support
        this.cameraMode = 'fixed-angle'; // 'fixed-angle' or 'player-perspective'
        
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

    // Set camera mode
    setCameraMode(mode) {
        if (mode === 'fixed-angle' || mode === 'player-perspective') {
            this.cameraMode = mode;
            console.log(`[InputManager] Camera mode set to: ${mode}`);
        }
    }

    // Toggle camera mode
    toggleCameraMode() {
        this.cameraMode = this.cameraMode === 'fixed-angle' ? 'player-perspective' : 'fixed-angle';
        console.log(`[InputManager] Camera mode toggled to: ${this.cameraMode}`);
        return this.cameraMode;
    }

    // Get movement input based on camera mode
    getMovementInput() {
        const input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            strafeLeft: false,
            strafeRight: false,
            cameraLeft: false,
            cameraRight: false
        };

        if (this.cameraMode === 'fixed-angle') {
            // Fixed-angle mode: WASD moves in fixed directions, arrow keys rotate camera
            input.forward = this.isKeyPressed('w') || this.isKeyPressed('W');
            input.backward = this.isKeyPressed('s') || this.isKeyPressed('S');
            input.left = this.isKeyPressed('a') || this.isKeyPressed('A');
            input.right = this.isKeyPressed('d') || this.isKeyPressed('D');
            input.strafeLeft = this.isKeyPressed('q') || this.isKeyPressed('Q');
            input.strafeRight = this.isKeyPressed('e') || this.isKeyPressed('E');
            
            // Arrow keys rotate camera
            input.cameraLeft = this.isKeyPressed('ArrowLeft');
            input.cameraRight = this.isKeyPressed('ArrowRight');
        } else {
            // Player-perspective mode: A/D rotates player, W/S moves forward/backward
            input.forward = this.isKeyPressed('w') || this.isKeyPressed('W');
            input.backward = this.isKeyPressed('s') || this.isKeyPressed('S');
            input.left = this.isKeyPressed('a') || this.isKeyPressed('A');
            input.right = this.isKeyPressed('d') || this.isKeyPressed('D');
            input.strafeLeft = this.isKeyPressed('q') || this.isKeyPressed('Q');
            input.strafeRight = this.isKeyPressed('e') || this.isKeyPressed('E');
        }

        return input;
    }

    handleKeyDown(event) {
        if (InputManager.inputBlocked) return;
        const key = event.key;
        this.keys.set(key, true);
        
        // Handle Ctrl + ` combination for debug info toggle
        if (key === '`' && event.ctrlKey) {
            event.preventDefault();
            // Trigger the toggle action
            this.triggerAction('`');
            return;
        }
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
        
        // Trigger bound actions
        this.triggerAction(key);
    }

    handleKeyUp(event) {
        if (InputManager.inputBlocked) return;
        const key = event.key;
        this.keys.set(key, false);
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
    }

    handleWheel(event) {
        // Check if the mouse is over a UI element that should handle scrolling
        const target = event.target;
        const isOverUI = this.isOverUIElement(target);
        
        if (isOverUI) {
            // Let the UI element handle the scroll event
            console.log('[InputManager] Wheel event over UI element, allowing scroll:', target.tagName, target.id || target.className);
            return;
        }
        
        // Only process zoom when over the game canvas or other game elements
        console.log('[InputManager] Wheel event over game area, processing zoom');
        event.preventDefault();
        this.mouseWheelDelta = event.deltaY;
    }

    // Check if the target element is a UI element that should handle scrolling
    isOverUIElement(target) {
        if (!target) return false;
        
        // Check if the target or any of its parents is a UI element
        let element = target;
        while (element) {
            // Check for menu containers
            if (element.classList && element.classList.contains('menu-container')) {
                return true;
            }
            
            // Check for menu bar and input bar
            if (element.id === 'menu-bar' || element.id === 'electron-input-bar') {
                return true;
            }
            
            // Check for specific UI elements that should handle scrolling
            if (element.tagName === 'TEXTAREA' || 
                element.tagName === 'INPUT' || 
                element.tagName === 'SELECT' ||
                element.scrollHeight > element.clientHeight) {
                return true;
            }
            
            // Check for elements with overflow scroll
            const style = window.getComputedStyle(element);
            if (style.overflow === 'scroll' || style.overflow === 'auto') {
                return true;
            }
            
            // Check for any element that's not the game canvas
            if (element.id === 'gameCanvas') {
                return false; // This is the game canvas, allow zoom
            }
            
            element = element.parentElement;
        }
        
        return false;
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
            'w', 'a', 's', 'd', 'q', 'e',
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
            mouseWheelDelta: this.mouseWheelDelta,
            cameraMode: this.cameraMode,
            movementInput: this.getMovementInput()
        };
    }
} 