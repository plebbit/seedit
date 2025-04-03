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

// uncomment for logs
// localStorage.debug = 'plebbit-js:*,plebbit-react-hooks:*,seedit:*'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => {
    const validChannels = [
      'plugin:file-uploader:pickAndUploadMedia',
      'plugin:file-uploader:uploadMedia',
      'plugin:file-uploader:pickMedia'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  }
});
