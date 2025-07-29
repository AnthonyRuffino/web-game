const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Window events
  onWindowResized: (callback) => {
    ipcRenderer.on('window-resized', callback);
  },
  
  // Image filesystem operations
  saveImage: (filename, imageDataURL) => ipcRenderer.invoke('save-image', filename, imageDataURL),
  loadImage: (filename) => ipcRenderer.invoke('load-image', filename),
  removeImage: (filename) => ipcRenderer.invoke('remove-image', filename),
  
  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose console for debugging
contextBridge.exposeInMainWorld('electronConsole', {
  log: (...args) => console.log('[Renderer]', ...args),
  error: (...args) => console.error('[Renderer]', ...args),
  warn: (...args) => console.warn('[Renderer]', ...args),
  info: (...args) => console.info('[Renderer]', ...args)
}); 