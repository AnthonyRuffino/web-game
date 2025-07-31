const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { DatabaseService } = require('./databaseService.js');

// Keep a global reference of the window object
let mainWindow;
let databaseService;

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Web Game - Electron',
    icon: path.join(__dirname, 'assets', 'images', 'icon.png'), // Optional: add icon later
    show: false // Don't show until ready
  });

  // Initialize database service
  databaseService = new DatabaseService();
  await databaseService.initialize();
  await databaseService.initializeEntityTypes();
  
  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window resize
  mainWindow.on('resize', () => {
    // Notify renderer process of window resize
    mainWindow.webContents.send('window-resized');
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for main process communication
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// Handle app quit
ipcMain.handle('quit-app', () => {
  app.quit();
});

// Handle window minimize/maximize/restore
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
}); 

// Database handlers
ipcMain.handle('db-create-world', async (event, worldConfig) => {
  try {
    return await databaseService.createWorld(worldConfig);
  } catch (error) {
    console.error('[Main] Failed to create world:', error);
    throw error;
  }
});

ipcMain.handle('db-get-worlds', async () => {
  try {
    return await databaseService.getWorlds();
  } catch (error) {
    console.error('[Main] Failed to get worlds:', error);
    throw error;
  }
});

ipcMain.handle('db-get-world', async (event, worldId) => {
  try {
    return await databaseService.getWorld(worldId);
  } catch (error) {
    console.error('[Main] Failed to get world:', error);
    throw error;
  }
});

ipcMain.handle('db-get-characters', async (event, worldId) => {
  try {
    return await databaseService.getCharacters(worldId);
  } catch (error) {
    console.error('[Main] Failed to get characters:', error);
    throw error;
  }
});

ipcMain.handle('db-get-character', async (event, characterId) => {
  try {
    return await databaseService.getCharacter(characterId);
  } catch (error) {
    console.error('[Main] Failed to get character:', error);
    throw error;
  }
});

ipcMain.handle('db-get-cell-state', async (event, worldId, chunkX, chunkY, cellX, cellY) => {
  try {
    return await databaseService.getCellState(worldId, chunkX, chunkY, cellX, cellY);
  } catch (error) {
    console.error('[Main] Failed to get cell state:', error);
    throw error;
  }
});

ipcMain.handle('db-get-chunk-cell-states', async (event, worldId, chunkX, chunkY) => {
  try {
    return await databaseService.getChunkCellStates(worldId, chunkX, chunkY);
  } catch (error) {
    console.error('[Main] Failed to get chunk cell states:', error);
    throw error;
  }
});

ipcMain.handle('db-get-inventory-contents', async (event, characterId) => {
  try {
    return await databaseService.getInventoryContents(characterId);
  } catch (error) {
    console.error('[Main] Failed to get inventory contents:', error);
    throw error;
  }
});

ipcMain.handle('db-get-item-in-slot', async (event, characterId, slotIndex) => {
  try {
    return await databaseService.getItemInSlot(characterId, slotIndex);
  } catch (error) {
    console.error('[Main] Failed to get item in slot:', error);
    throw error;
  }
});

// Image filesystem handlers
ipcMain.handle('save-image', async (event, filename, imageDataURL) => {
  try {
    // Create assets directory in user data if it doesn't exist
    const assetsDir = path.join(app.getPath('userData'), 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Convert data URL to buffer
    const base64Data = imageDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save file with .png extension
    const filePath = path.join(assetsDir, `${filename}.png`);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`[Main] Saved image to filesystem: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[Main] Error saving image ${filename}:`, error);
    return false;
  }
});

ipcMain.handle('load-image', async (event, filename) => {
  try {
    // Look for image in assets directory
    const assetsDir = path.join(app.getPath('userData'), 'assets');
    const filePath = path.join(assetsDir, `${filename}.png`);
    
    if (fs.existsSync(filePath)) {
      // Read file and convert to data URL
      const buffer = fs.readFileSync(filePath);
      const base64Data = buffer.toString('base64');
      const dataURL = `data:image/png;base64,${base64Data}`;
      
      console.log(`[Main] Loaded image from filesystem: ${filePath}`);
      return dataURL;
    } else {
      console.log(`[Main] Image file not found: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`[Main] Error loading image ${filename}:`, error);
    return null;
  }
});

ipcMain.handle('remove-image', async (event, filename) => {
  try {
    // Remove image from assets directory
    const assetsDir = path.join(app.getPath('userData'), 'assets');
    const filePath = path.join(assetsDir, `${filename}.png`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Main] Removed image from filesystem: ${filePath}`);
      return true;
    } else {
      console.log(`[Main] Image file not found for removal: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`[Main] Error removing image ${filename}:`, error);
    return false;
  }
}); 