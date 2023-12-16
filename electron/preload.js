const { contextBridge } = require('electron');

// dev uses http://localhost, prod uses file://...index.html
const isDev = window.location.protocol === 'http:';

const defaultPlebbitOptions = {
  plebbitRpcClientsOptions: ['ws://localhost:9138'],
};

contextBridge.exposeInMainWorld('defaultPlebbitOptions', defaultPlebbitOptions);

// expose a flag to indicate that we are running in electron
contextBridge.exposeInMainWorld('electron', { isElectron: true });

// uncomment for logs
// localStorage.debug = 'plebbit-js:*,plebbit-react-hooks:*,seedit:*'
