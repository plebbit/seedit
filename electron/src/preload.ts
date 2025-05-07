import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => {
    // whitelist channels
    const validChannels = [
      'plugin:file-uploader:pickAndUploadMedia',
      'plugin:file-uploader:uploadMedia',
      'plugin:file-uploader:pickMedia',
      'get-notification-permission-status', // actual channel
      'get-platform',
      'test-notification-permission', // correct test channel in main
      'show-notification',
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  },
  // Direct send for notifications
  sendNotification: (notificationData: { title: string; body: string }) => {
    ipcRenderer.send('show-notification', notificationData);
  },
});

// Expose a dedicated "electronApi" for your UI code
contextBridge.exposeInMainWorld('electronApi', {
  isElectron: true,
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  getNotificationStatus: () => ipcRenderer.invoke('get-notification-permission-status'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  testNotification: () => ipcRenderer.invoke('test-notification'), // Note: show-notification uses the other API
  showNotification: (notificationData: { title: string; body: string }) => {
    ipcRenderer.send('show-notification', notificationData);
  },
});
