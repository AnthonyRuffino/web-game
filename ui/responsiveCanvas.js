// responsiveCanvas.js
// Responsive full-screen canvas system with aspect ratio management

const ResponsiveCanvas = {
  // Configuration
  config: {
    targetAspectRatio: 16/9, // 16:9 aspect ratio (can be changed to 4/3)
    minWidth: 800,
    minHeight: 600,
    maxWidth: 3840, // 4K support
    maxHeight: 2160,
    resizeDebounceMs: 100, // Debounce resize events
    enableFullscreen: true
  },

  // Canvas element reference
  canvas: null,
  ctx: null,

  // Current canvas dimensions
  currentWidth: 800,
  currentHeight: 600,

  // Viewport dimensions
  viewportWidth: 800,
  viewportHeight: 600,

  // Resize debounce timer
  resizeTimer: null,

  // Initialize responsive canvas system
  init() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
      console.error('[ResponsiveCanvas] Canvas element not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    
    // Set initial size
    this.updateCanvasSize();
    
    // Add event listeners
    this.setupEventListeners();
    
    console.log('[ResponsiveCanvas] Responsive canvas system initialized');
    console.log(`[ResponsiveCanvas] Target aspect ratio: ${this.config.targetAspectRatio}`);
    console.log(`[ResponsiveCanvas] Initial size: ${this.currentWidth}x${this.currentHeight}`);
  },

  // Setup event listeners for responsive behavior
  setupEventListeners() {
    // Window resize event
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Orientation change event (for mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
      }, 100);
    });

    // Fullscreen change event
    document.addEventListener('fullscreenchange', () => {
      this.handleResize();
    });

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    console.log('[ResponsiveCanvas] Event listeners configured');
  },

  // Handle resize events with debouncing
  handleResize() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = setTimeout(() => {
      this.updateCanvasSize();
    }, this.config.resizeDebounceMs);
  },

  // Update canvas size based on viewport
  updateCanvasSize() {
    // Get viewport dimensions
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    // Calculate target canvas size maintaining aspect ratio
    const targetSize = this.calculateTargetSize(this.viewportWidth, this.viewportHeight);
    
    // Apply size constraints
    const constrainedSize = this.applySizeConstraints(targetSize);
    
    // Update canvas dimensions
    this.currentWidth = constrainedSize.width;
    this.currentHeight = constrainedSize.height;
    
    // Set canvas size
    this.canvas.width = this.currentWidth;
    this.canvas.height = this.currentHeight;
    
    // Update canvas style for centering and black bars
    this.updateCanvasStyle();
    
    console.log(`[ResponsiveCanvas] Canvas resized to ${this.currentWidth}x${this.currentHeight}`);
    console.log(`[ResponsiveCanvas] Viewport: ${this.viewportWidth}x${this.viewportHeight}`);
  },

  // Calculate target canvas size maintaining aspect ratio
  calculateTargetSize(viewportWidth, viewportHeight) {
    const targetRatio = this.config.targetAspectRatio;
    const viewportRatio = viewportWidth / viewportHeight;
    
    let targetWidth, targetHeight;
    
    if (viewportRatio > targetRatio) {
      // Viewport is wider than target ratio - fit to height
      targetHeight = viewportHeight;
      targetWidth = viewportHeight * targetRatio;
    } else {
      // Viewport is taller than target ratio - fit to width
      targetWidth = viewportWidth;
      targetHeight = viewportWidth / targetRatio;
    }
    
    return { width: targetWidth, height: targetHeight };
  },

  // Apply size constraints (min/max dimensions)
  applySizeConstraints(size) {
    let { width, height } = size;
    
    // Apply minimum constraints
    width = Math.max(width, this.config.minWidth);
    height = Math.max(height, this.config.minHeight);
    
    // Apply maximum constraints
    width = Math.min(width, this.config.maxWidth);
    height = Math.min(height, this.config.maxHeight);
    
    // Recalculate to maintain aspect ratio after constraints
    const targetRatio = this.config.targetAspectRatio;
    if (width / height > targetRatio) {
      width = height * targetRatio;
    } else {
      height = width / targetRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  },

  // Update canvas style for centering and black bars
  updateCanvasStyle() {
    // Calculate centering offsets
    const offsetX = (this.viewportWidth - this.currentWidth) / 2;
    const offsetY = (this.viewportHeight - this.currentHeight) / 2;
    
    // Apply styles
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = `${this.currentWidth}px`;
    this.canvas.style.height = `${this.currentHeight}px`;
    this.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    this.canvas.style.zIndex = '1';
    
    // Set body background to black for bars
    document.body.style.backgroundColor = '#000000';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
  },

  // Get current canvas dimensions
  getDimensions() {
    return {
      width: this.currentWidth,
      height: this.currentHeight,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
      aspectRatio: this.currentWidth / this.currentHeight,
      targetAspectRatio: this.config.targetAspectRatio
    };
  },

  // Set target aspect ratio
  setAspectRatio(ratio) {
    if (ratio > 0) {
      this.config.targetAspectRatio = ratio;
      this.updateCanvasSize();
      console.log(`[ResponsiveCanvas] Aspect ratio changed to ${ratio}`);
    }
  },

  // Toggle between common aspect ratios
  toggleAspectRatio() {
    const ratios = [16/9, 4/3, 21/9]; // Common gaming ratios
    const currentIndex = ratios.findIndex(r => Math.abs(r - this.config.targetAspectRatio) < 0.01);
    const nextIndex = (currentIndex + 1) % ratios.length;
    this.setAspectRatio(ratios[nextIndex]);
  },

  // Get aspect ratio name
  getAspectRatioName() {
    const ratio = this.config.targetAspectRatio;
    if (Math.abs(ratio - 16/9) < 0.01) return '16:9';
    if (Math.abs(ratio - 4/3) < 0.01) return '4:3';
    if (Math.abs(ratio - 21/9) < 0.01) return '21:9';
    return `${ratio.toFixed(2)}:1`;
  },

  // Get system information
  getInfo() {
    return {
      ...this.getDimensions(),
      aspectRatioName: this.getAspectRatioName(),
      config: { ...this.config }
    };
  }
};

// Export for global access
window.ResponsiveCanvas = ResponsiveCanvas; 