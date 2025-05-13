import { contextBridge, ipcRenderer } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

// dev uses http://localhost, prod uses file://...index.html
const isDev = window.location.protocol === 'http:';

const defaultPlebbitOptions = {
  plebbitRpcClientsOptions: ['ws://localhost:9138'],
};

contextBridge.exposeInMainWorld('isElectron', true);
contextBridge.exposeInMainWorld('defaultPlebbitOptions', defaultPlebbitOptions);
contextBridge.exposeInMainWorld('defaultMediaIpfsGatewayUrl', 'http://localhost:6473');

// receive plebbit rpc auth key from main
ipcRenderer.on('plebbit-rpc-auth-key', (event, plebbitRpcAuthKey) => contextBridge.exposeInMainWorld('plebbitRpcAuthKey', plebbitRpcAuthKey));
ipcRenderer.send('get-plebbit-rpc-auth-key');

// notifications IPC
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => {
    const validChannels = ['get-notification-permission-status', 'get-platform', 'test-notification-permission'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  },
  sendNotification: (notification) => {
    ipcRenderer.send('show-notification', notification);
  },
});

contextBridge.exposeInMainWorld('electronApi', {
  isElectron: true,
  getNotificationStatus: () => ipcRenderer.invoke('get-notification-permission-status'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  testNotification: () => ipcRenderer.invoke('test-notification-permission'),
  showNotification: (notification) => ipcRenderer.send('show-notification', notification),
});
