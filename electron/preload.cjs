const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded.');

contextBridge.exposeInMainWorld('electronApi', {
  isElectron: true,
  getNotificationStatus: () => ipcRenderer.invoke('get-notification-permission-status'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  testNotification: () => ipcRenderer.invoke('test-notification-permission')
}); 