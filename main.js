const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    }
  });

  // Load URL or file based on environment
  if (isDev) {
    // Development: load from Vite dev server
    win.loadURL('http://localhost:5173');
    // Open DevTools in development (uncomment to debug)
    // win.webContents.openDevTools();
  } else {
    // Production: load from dist folder
    const distPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading production app from:', distPath);
    win.loadFile(distPath);
    // Uncomment to debug production issues:
    win.webContents.openDevTools();
  }

  // Log any errors
  win.webContents.on('crashed', () => {
    console.error('App crashed');
    app.quit();
  });

  win.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('Preload error:', error);
  });

  win.webContents.on('unresponsive', () => {
    console.error('App unresponsive');
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
