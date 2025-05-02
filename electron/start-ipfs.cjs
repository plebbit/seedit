const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const ps = require('node:process');
const tcpPortUsed = require('tcp-port-used');
const proxyServer = require('./proxy-server.cjs');

// Use app.isPackaged defined in main.js via process.env
const isDev = process.env.ELECTRON_IS_DEV === '1';

// CommonJS equivalent of __dirname
const dirname = __dirname;

let proxyStarted = false;

// Start a debugging proxy for the IPFS API only in development mode.
// This allows connecting dev tools (like the IPFS Web UI) to the standard
// port 50019 while the actual daemon runs on 50029.
function startDevProxyOnce() {
  if (isDev && !proxyStarted) {
    const proxyPort = 50019; 
    const targetPort = 50029;
    try {
      console.log(`Attempting to start development proxy server on port ${proxyPort}...`);
      proxyServer.start({ proxyPort, targetPort });
      proxyStarted = true;
      console.log(`Development proxy server started successfully on port ${proxyPort}, forwarding to ${targetPort}.`);
    } catch (e) {
      console.error(`Failed to start development proxy server on port ${proxyPort}:`, e);
    }
  }
}

// Handles IPFS setup: finding binary, initializing repo, configuring ports, and starting daemon.
async function initializeIpfs() {
  const EnvPaths = (await import('env-paths')).default;
  const envPaths = EnvPaths('plebbit', { suffix: false });

  const ipfsFileName = process.platform == 'win32' ? 'ipfs.exe' : 'ipfs';
  let ipfsPath = path.join(process.resourcesPath, 'bin', ipfsFileName); // Packaged app path
  let ipfsDataPath = path.join(envPaths.data, 'ipfs'); // Standard data path

  // Override paths for development mode
  if (isDev) {
    let binFolderName = 'win';
    if (process.platform === 'linux') binFolderName = 'linux';
    if (process.platform === 'darwin') binFolderName = 'mac';
    ipfsPath = path.join(dirname, '..', 'bin', binFolderName, ipfsFileName);
    ipfsDataPath = path.join(dirname, '..', '.plebbit', 'ipfs');
  }

  if (!fs.existsSync(ipfsPath)) {
    throw Error(`ipfs binary '${ipfsPath}' doesn't exist. Run 'yarn electron:build' or 'yarn electron:before:download-ipfs' first?`);
  }

  console.log({ ipfsPath, ipfsDataPath });

  fs.ensureDirSync(ipfsDataPath);
  const env = { IPFS_PATH: ipfsDataPath };

  // Attempt to initialize the IPFS repo; ignore errors if already initialized.
  try { await spawnAsync(ipfsPath, ['init'], { env, hideWindows: true }); } catch (e) {}

  // Ensure the repo is migrated to the latest version.
  try { await spawnAsync(ipfsPath, ['repo', 'migrate'], { env, hideWindows: true }); } catch (e) {}

  // Configure IPFS Gateway port (avoiding common port 8080).
  await spawnAsync(ipfsPath, ['config', '--json', 'Addresses.Gateway', '"/ip4/127.0.0.1/tcp/6473"'], { env, hideWindows: true });

  // Configure IPFS API port. Use a different port in dev (50029) vs prod (50019).
  let apiAddress = '/ip4/127.0.0.1/tcp/50019';
  if (isDev) {
    apiAddress = apiAddress.replace('50019', '50029');
  }
  await spawnAsync(ipfsPath, ['config', 'Addresses.API', apiAddress], { env, hideWindows: true });

  await startIpfsDaemon(ipfsPath, env);

  // Attempt to start the dev proxy *after* trying to start the daemon (increases chance target port is ready).
  startDevProxyOnce();
}

// Wrapper around child_process.spawn for better logging and Promise interface.
const spawnAsync = (...args) =>
  new Promise((resolve, reject) => {
    const spawnedProcess = spawn(...args);
    spawnedProcess.on('exit', (exitCode, signal) => {
      if (exitCode === 0) resolve();
      else reject(Error(`spawnAsync process '${spawnedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`));
    });
    spawnedProcess.stderr.on('data', (data) => console.error(data.toString()));
    spawnedProcess.stdin.on('data', (data) => console.log(data.toString()));
    spawnedProcess.stdout.on('data', (data) => console.log(data.toString()));
    spawnedProcess.on('error', (data) => console.error(data.toString()));
  });

// Starts the IPFS daemon process and resolves when it's ready.
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

    // Ensure IPFS daemon is killed when the Electron app exits.
    process.on('exit', () => {
      try {
        console.log(`Attempting to kill IPFS daemon (pid: ${ipfsProcess.pid}) on Electron exit...`);
        ps.kill(ipfsProcess.pid);
        console.log(`Successfully sent kill signal to IPFS daemon (pid: ${ipfsProcess.pid}).`);
      } catch (e) {
        // Ignore error if process doesn't exist (ESRCH).
        if (e.code !== 'ESRCH') {
            console.warn(`Warn: Failed to kill IPFS daemon (pid: ${ipfsProcess.pid}) on exit:`, e.message);
        }
      }
    });
  });

// Export object for other modules to attach an onError handler.
const DefaultExport = {};

// Checks periodically if IPFS daemon is running (by checking its API port) 
// and starts it via initializeIpfs if not.
const startIpfsAutoRestart = async () => {
  let pendingStart = false;
  const start = async () => {
    if (pendingStart) return;
    pendingStart = true;
    try {
      const apiPort = isDev ? 50029 : 50019; // Check the *actual* daemon port
      const started = await tcpPortUsed.check(apiPort, '127.0.0.1');
      if (!started) {
        console.log(`IPFS API port ${apiPort} not detected. Initializing IPFS...`);
        await initializeIpfs(); 
      } else {
         console.log(`IPFS API port ${apiPort} already in use. Assuming IPFS is running.`);
         // Ensure dev proxy is started if IPFS was already running.
         startDevProxyOnce();
      }
    } catch (e) {
      console.log('failed starting ipfs', e);
      DefaultExport.onError?.(e);
    }
    pendingStart = false;
  };

  // Try starting dev proxy immediately in case IPFS is already running.
  startDevProxyOnce();

  start(); // Initial check
  setInterval(start, 5000); // Periodic check
};
startIpfsAutoRestart();

module.exports = DefaultExport;
