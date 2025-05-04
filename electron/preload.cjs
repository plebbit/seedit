const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded.');

// Expose core IPC methods under 'electron'
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => {
    const validChannels = [
      'get-notification-permission-status',
      'get-platform',
      'test-notification-permission',
      'show-notification'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  },
  sendNotification: (notification) => {
    ipcRenderer.send('show-notification', notification);
  }
});

// Expose higher-level API under 'electronApi'
contextBridge.exposeInMainWorld('electronApi', {
  isElectron: true,
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  getNotificationStatus: () => ipcRenderer.invoke('get-notification-permission-status'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  testNotification: () => ipcRenderer.invoke('test-notification-permission'),
  showNotification: (notification) => ipcRenderer.send('show-notification', notification)
}); 