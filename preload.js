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
  
  // Database API
  dbCreateWorld: (worldConfig) => ipcRenderer.invoke('db-create-world', worldConfig),
  dbGetWorlds: () => ipcRenderer.invoke('db-get-worlds'),
  dbGetWorld: (worldId) => ipcRenderer.invoke('db-get-world', worldId),
  dbGetCharacters: (worldId) => ipcRenderer.invoke('db-get-characters', worldId),
  dbGetCharacter: (characterId) => ipcRenderer.invoke('db-get-character', characterId),
  dbSaveCharacterPosition: (characterId, x, y) => ipcRenderer.invoke('db-save-character-position', characterId, x, y),
  dbGetCellState: (worldId, chunkX, chunkY, cellX, cellY) => ipcRenderer.invoke('db-get-cell-state', worldId, chunkX, chunkY, cellX, cellY),
  dbGetChunkCellStates: (worldId, chunkX, chunkY) => ipcRenderer.invoke('db-get-chunk-cell-states', worldId, chunkX, chunkY),
  dbGetInventoryContents: (characterId) => ipcRenderer.invoke('db-get-inventory-contents', characterId),
      dbGetItemInSlot: (characterId, slotIndex) => ipcRenderer.invoke('db-get-item-in-slot', characterId, slotIndex),
    dbAddItemToInventory: (characterId, slotIndex, entityTypeId, quantity, metadata) => ipcRenderer.invoke('db-add-item-to-inventory', characterId, slotIndex, entityTypeId, quantity, metadata),
    dbRemoveItemFromInventory: (characterId, slotIndex, quantity) => ipcRenderer.invoke('db-remove-item-from-inventory', characterId, slotIndex, quantity),
  
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