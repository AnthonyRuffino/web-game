// background.js
// Background texture rendering system

const Background = {
  // Background texture configuration
  config: {
    dotSize: 2,
    dotSpacing: 20,
    dotColor: '#333333',
    dotAlpha: 0.3
  },

  // Initialize background system
  init() {
    console.log('[Background] Background system initialized');
  },

  // Render background texture across the entire visible world area
  render(ctx, cameraX, cameraY, cameraWidth, cameraHeight, zoom) {
    ctx.save();
    
    // Set background texture properties
    ctx.fillStyle = this.config.dotColor;
    ctx.globalAlpha = this.config.dotAlpha;
    
    // Calculate the area we need to render based on camera view
    const startX = Math.floor(cameraX - cameraWidth / 2);
    const endX = Math.ceil(cameraX + cameraWidth / 2);
    const startY = Math.floor(cameraY - cameraHeight / 2);
    const endY = Math.ceil(cameraY + cameraHeight / 2);
    
    // Calculate dot spacing (fixed in world coordinates, not affected by zoom)
    const spacing = this.config.dotSpacing;
    const dotSize = this.config.dotSize;
    
    // Draw dots in a grid pattern at fixed world coordinates
    // Start from the nearest grid position to ensure consistent pattern
    const gridStartX = Math.floor(startX / spacing) * spacing;
    const gridStartY = Math.floor(startY / spacing) * spacing;
    
    for (let x = gridStartX; x <= endX; x += spacing) {
      for (let y = gridStartY; y <= endY; y += spacing) {
        // Draw a small dot at world position
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  },

  // Alternative: Render a more complex pattern (optional)
  renderPattern(ctx, cameraX, cameraY, cameraWidth, cameraHeight, zoom) {
    ctx.save();
    
    // Create a subtle grid pattern
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1 * zoom;
    ctx.globalAlpha = 0.1;
    
    const gridSize = 50 * zoom;
    const startX = Math.floor(cameraX - cameraWidth / 2);
    const endX = Math.ceil(cameraX + cameraWidth / 2);
    const startY = Math.floor(cameraY - cameraHeight / 2);
    const endY = Math.ceil(cameraY + cameraHeight / 2);
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    ctx.restore();
  },

  // Update background configuration
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[Background] Configuration updated:', this.config);
  },

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }
};

// Expose to global scope
window.Background = Background; 