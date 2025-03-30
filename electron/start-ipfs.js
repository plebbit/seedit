import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import envPathsImport from 'env-paths';
import { spawnAsync } from './spawn-async.js';
import proxyServer from './proxy-server.js';
import { app } from 'electron';
import tcpPortUsed from 'tcp-port-used';
import { spawn } from 'child_process';

// Define a simple process kill function since ps was being used but not imported
const ps = {
  kill: (pid) => {
    if (!pid) return;
    try {
      process.kill(pid);
    } catch (error) {
      console.error(`Failed to kill process ${pid}:`, error);
    }
  },
};

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);
const envPaths = envPathsImport('seedit');

// Use app.isPackaged to determine if running in development
const isDevelopment = !app.isPackaged;

const startIpfs = async () => {
  const ipfsFileName = process.platform == 'win32' ? 'ipfs.exe' : 'ipfs';
  let ipfsPath = path.join(process.resourcesPath, 'bin', ipfsFileName);
  let ipfsDataPath = path.join(envPaths.data, 'ipfs');

  // test launching the ipfs binary in dev mode
  // they must be downloaded first using `yarn electron:build`
  if (isDevelopment) {
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
  if (isDevelopment) {
    apiAddress = apiAddress.replace('50019', '50029');
    proxyServer.start({ proxyPort: 50019, targetPort: 50029 });
  }
  await spawnAsync(ipfsPath, ['config', 'Addresses.API', apiAddress], { env, hideWindows: true });

  const startIpfsDaemon = () =>
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
      process.on('exit', () => {
        try {
          ps.kill(ipfsProcess.pid);
        } catch (e) {
          console.log(e);
        }
        try {
          // sometimes ipfs doesnt exit unless we kill pid +1
          ps.kill(ipfsProcess.pid + 1);
        } catch (e) {
          console.log(e);
        }
      });
    });
  await startIpfsDaemon();
};

const DefaultExport = {};
export default DefaultExport;

const startIpfsAutoRestart = async () => {
  let pendingStart = false;
  const start = async () => {
    if (pendingStart) {
      return;
    }
    pendingStart = true;
    try {
      const started = await tcpPortUsed.check(isDevelopment ? 50029 : 50019, '127.0.0.1');
      if (!started) {
        await startIpfs();
      }
    } catch (e) {
      console.log('failed starting ipfs', e);
      try {
        // try to run exported onError callback, can be undefined
        DefaultExport.onError(e)?.catch?.(console.log);
      } catch (e) {}
    }
    pendingStart = false;
  };

  // retry starting ipfs every 1 second,
  // in case it was started by another client that shut down and shut down ipfs with it
  start();
  setInterval(() => {
    start();
  }, 1000);
};
startIpfsAutoRestart();
