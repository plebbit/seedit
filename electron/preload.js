const { contextBridge } = require('electron');

// dev uses http://localhost, prod uses file://...index.html
const isDev = window.location.protocol === 'http:';

const defaultPlebbitOptions = {
  plebbitRpcClientsOptions: ['ws://localhost:9138'],
};

contextBridge.exposeInMainWorld('defaultPlebbitOptions', defaultPlebbitOptions);
contextBridge.exposeInMainWorld('defaultMediaIpfsGatewayUrl', 'http://localhost:6473');

// uncomment for logs
// localStorage.debug = 'plebbit-js:*,plebbit-react-hooks:*,seedit:*'
