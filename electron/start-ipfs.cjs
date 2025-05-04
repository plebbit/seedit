const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const ps = require('node:process');
const tcpPortUsed = require('tcp-port-used');
const proxyServer = require('./proxy-server.cjs');

// Instead of using electron-is-dev, use app.isPackaged 
// (we already made this change in main.js)
const isDev = process.env.ELECTRON_IS_DEV === '1';

// Use __dirname directly instead of fileURLToPath(import.meta.url)
const dirname = __dirname;

// Flag to ensure proxy is started only once
let proxyStarted = false;

// Function to start the proxy if in dev mode and not already started
function startDevProxyOnce() {
  if (isDev && !proxyStarted) {
    const proxyPort = 50019;
    const targetPort = 50029; // Actual IPFS API port in dev
    try {
      console.log(`Attempting to start development proxy server on port ${proxyPort}...`);
      proxyServer.start({ proxyPort, targetPort });
      proxyStarted = true; // Set flag only after successful start
      console.log(`Development proxy server started successfully on port ${proxyPort}, forwarding to ${targetPort}.`);
    } catch (e) {
      // Log the error but don't necessarily stop everything, 
      // as the proxy is mainly for debugging.
      console.error(`Failed to start development proxy server on port ${proxyPort}:`, e);
      // Consider if proxyStarted should be set to true even on failure to prevent retries
      // proxyStarted = true; 
    }
  }
}

// Make the main logic async to handle dynamic import
async function initializeIpfs() {
  // Dynamically import env-paths
  const EnvPaths = (await import('env-paths')).default;
  const envPaths = EnvPaths('plebbit', { suffix: false });

  const ipfsFileName = process.platform == 'win32' ? 'ipfs.exe' : 'ipfs';
  let ipfsPath = path.join(process.resourcesPath, 'bin', ipfsFileName);
  let ipfsDataPath = path.join(envPaths.data, 'ipfs');

  // test launching the ipfs binary in dev mode
  // they must be downloaded first using `yarn electron:build`
  if (isDev) {
    let binFolderName = 'win';
    if (process.platform === 'linux') {
      binFolderName = 'linux';
    }
    if (process.platform === 'darwin') {
      binFolderName = 'mac';
    }
    ipfsPath = path.join(dirname, '..', 'bin', binFolderName, ipfsFileName);
    ipfsDataPath = path.join(dirname, '..', '.plebbit', 'ipfs');
  }

  if (!fs.existsSync(ipfsPath)) {
    throw Error(`ipfs binary '${ipfsPath}' doesn't exist`);
  }

  console.log({ ipfsPath, ipfsDataPath });

  fs.ensureDirSync(ipfsDataPath);
  const env = { IPFS_PATH: ipfsDataPath };
  // init ipfs client on first launch
  try {
    await spawnAsync(ipfsPath, ['init'], { env, hideWindows: true });
  } catch (e) {}

  // make sure repo is migrated
  try {
    await spawnAsync(ipfsPath, ['repo', 'migrate'], { env, hideWindows: true });
  } catch (e) {}

  // dont use 8080 port because it's too common
  await spawnAsync(ipfsPath, ['config', '--json', 'Addresses.Gateway', '"/ip4/127.0.0.1/tcp/6473"'], {
    env,
    hideWindows: true,
  });

  // use different port with proxy for debugging during env
  let apiAddress = '/ip4/127.0.0.1/tcp/50019';
  if (isDev) {
    apiAddress = apiAddress.replace('50019', '50029');
    // Do NOT start proxy server here
    // proxyServer.start({ proxyPort: 50039, targetPort: 50029 }); 
  }
  await spawnAsync(ipfsPath, ['config', 'Addresses.API', apiAddress], { env, hideWindows: true });

  await startIpfsDaemon(ipfsPath, env);

  // Attempt to start proxy AFTER daemon reports ready (or at least after start attempt)
  // This increases chances the target port 50029 is actually listening.
  startDevProxyOnce(); 
}

// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows
const spawnAsync = (...args) =>
  new Promise((resolve, reject) => {
    const spawedProcess = spawn(...args);
    spawedProcess.on('exit', (exitCode, signal) => {
      if (exitCode === 0) resolve();
      else reject(Error(`spawnAsync process '${spawedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`));
    });
    spawedProcess.stderr.on('data', (data) => console.error(data.toString()));
    spawedProcess.stdin.on('data', (data) => console.log(data.toString()));
    spawedProcess.stdout.on('data', (data) => console.log(data.toString()));
    spawedProcess.on('error', (data) => console.error(data.toString()));
  });

const startIpfsDaemon = (ipfsPath, env) =>
  new Promise((resolve, reject) => {
    const ipfsProcess = spawn(ipfsPath, ['daemon', '--migrate', '--enable-pubsub-experiment', '--enable-namesys-pubsub'], { env, hideWindows: true });
    console.log(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
    let lastError;
    ipfsProcess.stderr.on('data', (data) => {
      lastError = data.toString();
      console.error(data.toString());
    });
    ipfsProcess.stdin.on('data', (data) => console.log(data.toString()));
    ipfsProcess.stdout.on('data', (data) => {
      data = data.toString();
      console.log(data);
      if (data.includes('Daemon is ready')) {
        resolve();
      }
    });
    ipfsProcess.on('error', (data) => console.error(data.toString()));
    ipfsProcess.on('exit', () => {
      console.error(`ipfs process with pid ${ipfsProcess.pid} exited`);
      reject(Error(lastError));
    });
    // Restore the exit handler to cleanly kill the daemon on Electron exit
    process.on('exit', () => {
      try {
        console.log(`Attempting to kill IPFS daemon (pid: ${ipfsProcess.pid}) on Electron exit...`);
        ps.kill(ipfsProcess.pid);
        console.log(`Successfully sent kill signal to IPFS daemon (pid: ${ipfsProcess.pid}).`);
      } catch (e) {
        // Ignore ESRCH errors (process already gone)
        if (e.code !== 'ESRCH') {
            console.warn(`Warn: Failed to kill IPFS daemon (pid: ${ipfsProcess.pid}) on exit:`, e.message);
        }
      }
    });
  });

// Export object for error handling
const DefaultExport = {};

// Auto-restart logic now calls the async initializeIpfs
const startIpfsAutoRestart = async () => {
  let pendingStart = false;
  const start = async () => {
    if (pendingStart) {
      return;
    }
    pendingStart = true;
    try {
      const apiPort = isDev ? 50029 : 50019;
      const started = await tcpPortUsed.check(apiPort, '127.0.0.1');
      if (!started) {
        console.log(`IPFS API port ${apiPort} not detected. Initializing IPFS...`);
        await initializeIpfs(); // Initialize IPFS daemon (will also try to start proxy via startDevProxyOnce)
      } else {
         console.log(`IPFS API port ${apiPort} already in use. Assuming IPFS is running.`);
         // Ensure proxy is started even if IPFS was already running from a previous session
         startDevProxyOnce();
      }
    } catch (e) {
      console.log('failed starting ipfs', e);
      try {
        // try to run exported onError callback, can be undefined
        DefaultExport.onError(e)?.catch?.((console.log));
      } catch (e) {}
    }
    pendingStart = false;
  };

  // Try starting the proxy once immediately at the beginning,
  // in case IPFS is already running and the check above runs later.
  startDevProxyOnce();

  // Start check/initialization loop
  start();
  setInterval(start, 5000); // Check every 5 seconds
};
startIpfsAutoRestart();

module.exports = DefaultExport;
