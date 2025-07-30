// Simple test script to verify Electron setup
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createTestWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload.js')
    },
    title: 'Electron Test - Web Game'
  });

  mainWindow.loadFile(path.join(__dirname, '../../src', 'index.html'));
  
  // Open DevTools for testing
  mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createTestWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createTestWindow();
  }
});

console.log('Electron test app starting...'); 