import './log.js';
import { app, BrowserWindow, Menu, MenuItem, Tray, screen as electronScreen, shell, dialog, nativeTheme, ipcMain, Notification, systemPreferences } from 'electron';
import isDev from 'electron-is-dev';
import fs from 'fs';
import path from 'path';
import EnvPaths from 'env-paths';
import startIpfs from './start-ipfs.js';
import './start-plebbit-rpc.js';
import { URL, fileURLToPath } from 'node:url';
import contextMenu from 'electron-context-menu';
import FormData from 'form-data';
import fetch from 'node-fetch';
// Load package.json at runtime to avoid JSON import assertion errors
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync(path.join(dirname, '../package.json'), 'utf-8'));

let startIpfsError;
startIpfs.onError = (error) => {
  const alreadyShownIpfsError = !!startIpfsError;
  startIpfsError = error;
  if (!alreadyShownIpfsError && error.message) {
    dialog.showErrorBox('IPFS warning', error.message);
  }
};

// send plebbit rpc auth key to renderer
const plebbitDataPath = !isDev ? EnvPaths('plebbit', { suffix: false }).data : path.join(dirname, '..', '.plebbit');
const plebbitRpcAuthKey = fs.readFileSync(path.join(plebbitDataPath, 'auth-key'), 'utf8');
ipcMain.on('get-plebbit-rpc-auth-key', (event) => event.reply('plebbit-rpc-auth-key', plebbitRpcAuthKey));

// use common user agent instead of electron so img, video, audio, iframe elements don't get blocked
let fakeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
if (process.platform === 'darwin') fakeUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
if (process.platform === 'linux') fakeUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
const realUserAgent = `seedit/${packageJson.version}`;

// Handle IPC call to show notification
ipcMain.on('show-notification', (event, notificationData) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: notificationData.title,
      body: notificationData.body,
    });
    if (notificationData.url) {
      notification.on('click', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          shell.openExternal(notificationData.url).catch((err) => console.error('Failed to open URL:', err));
        }
      });
    }
    notification.show();
  } else {
    console.warn('Electron Notifications not supported on this system.');
  }
});

// Handle request for notification permission status
ipcMain.handle('get-notification-permission-status', async () => {
  try {
    if (!Notification.isSupported()) {
      console.log('[Electron Main] Notification API not supported.');
      return 'not-supported';
    }
    if (process.platform === 'darwin') {
      if (typeof systemPreferences.getNotificationSettings === 'function') {
        const settings = systemPreferences.getNotificationSettings();
        const auth = settings.authorizationStatus;
        if (auth === 'denied') return 'denied';
        if (auth === 'authorized') return 'granted';
        return 'not-determined';
      }
      if (typeof systemPreferences.getNotificationPermissionStatus === 'function') {
        return systemPreferences.getNotificationPermissionStatus();
      }
      return 'granted';
    }
    return 'granted';
  } catch (error) {
    console.error('[Electron Main] Error getting notification permission status:', error);
    return 'unknown';
  }
});

// Handle request to test notification permission
ipcMain.handle('test-notification-permission', async () => {
  if (!Notification.isSupported()) {
    return { success: false, reason: 'not-supported' };
  }
  try {
    let status = 'unknown';
    if (process.platform === 'darwin') {
      if (typeof systemPreferences.getNotificationPermissionStatus === 'function') {
        status = systemPreferences.getNotificationPermissionStatus();
      } else {
        status = Notification.isSupported() ? 'granted' : 'not-supported';
      }
    } else {
      status = Notification.isSupported() ? 'granted' : 'not-supported';
    }
    if (status === 'denied') return { success: false, reason: 'denied' };
    if (status === 'not-supported') return { success: false, reason: 'not-supported' };
    const testNotification = new Notification({
      title: 'Seedit Test',
      body: 'Testing if notifications are allowed.',
    });
    testNotification.show();
    return { success: true };
  } catch (error) {
    console.error('[Electron Main Test] Error sending test notification:', error);
    return { success: false, reason: 'error' };
  }
});

// add right click menu
contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => [
    { label: 'Back', visible: parameters.mediaType === 'none', enabled: browserWindow?.webContents?.canGoBack(), click: () => browserWindow?.webContents?.goBack() },
    {
      label: 'Forward',
      visible: parameters.mediaType === 'none',
      enabled: browserWindow?.webContents?.canGoForward(),
      click: () => browserWindow?.webContents?.goForward(),
    },
    { label: 'Reload', visible: parameters.mediaType === 'none', click: () => browserWindow?.webContents?.reload() },
  ],
  showLookUpSelection: false,
  showCopyImage: true,
  showCopyImageAddress: true,
  showSaveImageAs: true,
  showSaveLinkAs: true,
  showInspectElement: true,
  showServices: false,
  showSearchWithGoogle: false,
});

let mainWindow;
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : '#ffffff',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev,
      preload: path.join(dirname, 'preload.js'),
    },
  });

  mainWindow.webContents.userAgent = fakeUserAgent;
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders({ urls: ['*://*/*'] }, (details, callback) => {
    const isIframe = !!details.frame?.parent;
    if (details.resourceType !== 'xhr' || isIframe) return callback({ requestHeaders: details.requestHeaders });
    details.requestHeaders['User-Agent'] = realUserAgent;
    ['sec-ch-ua', 'sec-ch-ua-platform', 'sec-ch-ua-mobile', 'Sec-Fetch-Dest', 'Sec-Fetch-Mode', 'Sec-Fetch-Site', 'Origin'].forEach((h) => {
      details.requestHeaders[h] = undefined;
    });
    callback({ requestHeaders: details.requestHeaders });
  });
  mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
    const isIframe = !!details.frame?.parent;
    if (details.resourceType !== 'xhr' || isIframe) return callback({ responseHeaders: details.responseHeaders });
    ['access-control-allow-origin', 'access-control-allow-headers', 'access-control-allow-methods', 'access-control-expose-headers'].forEach(
      (h) => delete details.responseHeaders[h],
    );
    ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'Access-Control-Expose-Headers'].forEach((h) => {
      details.responseHeaders[h] = ['*'];
    });
    callback({ responseHeaders: details.responseHeaders });
  });

  const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(dirname, '../build/index.html')}`;
  mainWindow.loadURL(startURL);
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.clearHistory();
    mainWindow.show();
    if (isDev) mainWindow.openDevTools();
    if (startIpfsError) dialog.showErrorBox('IPFS warning', startIpfsError.message);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    mainWindow.loadURL(url);
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      e.preventDefault();
      try {
        const validatedUrl = new URL(url);
        let serializedUrl = '';
        if (validatedUrl.toString() === 'http://localhost:50019/webui/') serializedUrl = validatedUrl.toString();
        else if (validatedUrl.protocol === 'https:') serializedUrl = validatedUrl.toString();
        else throw new Error(`can't open url '${url}', it's not https and not the allowed http exception`);
        shell.openExternal(serializedUrl);
      } catch (err) {
        console.warn(err);
      }
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const validatedUrl = new URL(url);
      let serializedUrl = '';
      if (validatedUrl.toString() === 'http://localhost:50019/webui/') serializedUrl = validatedUrl.toString();
      else if (validatedUrl.protocol === 'https:') serializedUrl = validatedUrl.toString();
      else throw new Error(`can't open url '${url}', it's not https and not the allowed http exception`);
      shell.openExternal(serializedUrl);
    } catch (err) {
      console.warn(err);
    }
    return { action: 'deny' };
  });
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => callback(false));
  mainWindow.webContents.on('will-attach-webview', (e) => e.preventDefault());

  if (process.platform !== 'darwin') {
    const trayIconPath = path.join(dirname, '..', isDev ? 'public' : 'build', 'electron-tray-icon.png');
    const tray = new Tray(trayIconPath);
    tray.setToolTip('seedit');
    const trayMenu = Menu.buildFromTemplate([
      { label: 'Open seedit', click: () => mainWindow.show() },
      {
        label: 'Quit seedit',
        click: () => {
          mainWindow.destroy();
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(trayMenu);
    tray.on('right-click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
    if (!isDev) {
      let isQuiting = false;
      app.on('before-quit', () => {
        isQuiting = true;
      });
      mainWindow.on('close', (event) => {
        if (!isQuiting) {
          event.preventDefault();
          mainWindow.hide();
          event.returnValue = false;
        }
      });
    }
  }

  const appMenuBack = new MenuItem({ label: '←', enabled: mainWindow.webContents.canGoBack(), click: () => mainWindow.webContents.goBack() });
  const appMenuForward = new MenuItem({ label: '→', enabled: mainWindow.webContents.canGoForward(), click: () => mainWindow.webContents.goForward() });
  const appMenuReload = new MenuItem({ label: '⟳', role: 'reload', click: () => mainWindow.webContents.reload() });
  if (process.platform === 'darwin') {
    const appMenu = Menu.getApplicationMenu();
    appMenu.insert(1, appMenuBack);
    appMenu.insert(2, appMenuForward);
    appMenu.insert(3, appMenuReload);
    Menu.setApplicationMenu(appMenu);
  } else {
    const originalAppMenuWithoutHelp = Menu.getApplicationMenu()?.items.filter((item) => item.role !== 'help');
    Menu.setApplicationMenu(Menu.buildFromTemplate([appMenuBack, appMenuForward, appMenuReload, ...originalAppMenuWithoutHelp]));
  }
};

app.whenReady().then(() => {
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// FileUploader plugin handlers
ipcMain.handle('plugin:file-uploader:pickAndUploadMedia', async (event) => {
  try {
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Images & Videos', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'] }],
    });
    if (result.canceled || result.filePaths.length === 0) throw new Error('File selection cancelled');
    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', fs.createReadStream(filePath));
    const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
    return { url: await response.text(), fileName };
  } catch (error) {
    console.error('FileUploader error:', error);
    throw error;
  }
});

ipcMain.handle('plugin:file-uploader:uploadMedia', async (event, fileData) => {
  try {
    console.log('uploadMedia handler called with data:', typeof fileData);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    if (fileData.fileData && fileData.fileName) {
      const buffer = Buffer.from(fileData.fileData, 'base64');
      formData.append('fileToUpload', buffer, fileData.fileName);
    } else {
      throw new Error('Invalid file data');
    }
    const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
    return { url: await response.text(), fileName: fileData.fileName || 'uploaded-file' };
  } catch (error) {
    console.error('FileUploader uploadMedia error:', error);
    throw error;
  }
});

ipcMain.handle('plugin:file-uploader:pickMedia', async (event) => {
  try {
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Images & Videos', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'] }],
    });
    if (result.canceled || result.filePaths.length === 0) throw new Error('File selection cancelled');
    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    const ext = path.extname(fileName).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.mp4') mimeType = 'video/mp4';
    else if (ext === '.webm') mimeType = 'video/webm';
    return { data: base64Data, fileName, mimeType };
  } catch (error) {
    console.error('FileUploader pickMedia error:', error);
    throw error;
  }
});
