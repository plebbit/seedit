import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupFileUploaderPlugin } from './plugins/file-uploader';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Prevent file drops on the window
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      e.preventDefault();
    }
  });

  // Prevent default file drop behavior
  mainWindow.webContents.on('drop', (e) => {
    e.preventDefault();
  });

  mainWindow.webContents.on('dragover', (e) => {
    e.preventDefault();
  });

  // Setup the FileUploader plugin
  setupFileUploaderPlugin(mainWindow);

  // Load your app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
