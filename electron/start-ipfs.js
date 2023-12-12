const isDev = require('electron-is-dev');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const envPaths = require('env-paths').default('plebbit', { suffix: false });
const ps = require('node:process');
const proxyServer = require('./proxy-server');

// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows
const spawnAsync = (...args) =>
  new Promise((resolve, reject) => {
    const spawedProcess = spawn(...args);
    spawedProcess.on('exit', (exitCode, signal) => {
      if (exitCode === 0) resolve();
      else
        reject(
          Error(
            `spawnAsync process '${spawedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`
          )
        );
    });
    spawedProcess.stderr.on('data', (data) => console.error(data.toString()));
    spawedProcess.stdin.on('data', (data) => console.log(data.toString()));
    spawedProcess.stdout.on('data', (data) => console.log(data.toString()));
    spawedProcess.on('error', (data) => console.error(data.toString()));
  });

const startIpfs = async () => {
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
    ipfsPath = path.join(__dirname, '..', 'bin', binFolderName, ipfsFileName);
    ipfsDataPath = path.join(__dirname, '..', '.plebbit', 'ipfs');
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

  // dont use 8080 port because it's too common
  await spawnAsync(ipfsPath, ['config', '--json', 'Addresses.Gateway', "null"], {
    env,
    hideWindows: true,
  });

  // use different port with proxy for debugging during env
  let apiAddress = '/ip4/127.0.0.1/tcp/5001';
  if (isDev) {
    apiAddress = apiAddress.replace('5001', '5002');
    proxyServer.start({ proxyPort: 5001, targetPort: 5002 });
  }
  await spawnAsync(ipfsPath, ['config', 'Addresses.API', apiAddress], { env, hideWindows: true });

  await new Promise((resolve, reject) => {
    const ipfsProcess = spawn(
      ipfsPath,
      ['daemon', '--migrate', '--enable-pubsub-experiment', '--enable-namesys-pubsub'],
      { env, hideWindows: true }
    );
    console.log(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
    let lastError;
    ipfsProcess.stderr.on('data', (data) => {
      lastError = data.toString();
      console.error(data.toString());
    });
    ipfsProcess.stdin.on('data', (data) => console.log(data.toString()));
    ipfsProcess.stdout.on('data', (data) => console.log(data.toString()));
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
};

module.exports = startIpfs;
