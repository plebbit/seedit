// download the ipfs binaries before building the electron clients

import fs from 'fs-extra';
import ProgressBar from 'progress';
import https from 'https';
import decompress from 'decompress';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import dns from 'dns';

// Force IPv4 resolution to avoid IPv6 timeouts on GitHub macOS runners
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const ipfsClientsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin');
const ipfsClientWindowsPath = path.join(ipfsClientsPath, 'win');
const ipfsClientMacPath = path.join(ipfsClientsPath, 'mac');
const ipfsClientLinuxPath = path.join(ipfsClientsPath, 'linux');

// plebbit kubu download links https://github.com/plebbit/kubo/releases
// const ipfsClientVersion = '0.20.0'
// const ipfsClientWindowsUrl = `https://github.com/plebbit/kubo/releases/download/v${ipfsClientVersion}/ipfs-windows-amd64`
// const ipfsClientMacUrl = `https://github.com/plebbit/kubo/releases/download/v${ipfsClientVersion}/ipfs-darwin-amd64`
// const ipfsClientLinuxUrl = `https://github.com/plebbit/kubo/releases/download/v${ipfsClientVersion}/ipfs-linux-amd64`

// official kubo download links https://docs.ipfs.tech/install/command-line/#install-official-binary-distributions
const ipfsClientVersion = '0.32.1';
const ipfsClientWindowsUrl = `https://dist.ipfs.io/kubo/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_windows-amd64.zip`;
const ipfsClientMacUrl = `https://dist.ipfs.io/kubo/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_darwin-amd64.tar.gz`;
const ipfsClientLinuxUrl = `https://dist.ipfs.io/kubo/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_linux-amd64.tar.gz`;

const downloadWithProgress = (url) =>
  new Promise((resolve, reject) => {
    const split = url.split('/');
    const fileName = split[split.length - 1];
    const chunks = [];
    const req = https.request(url);
    req.on('error', reject);
    req.on('response', (res) => {
      res.on('error', reject);
      // handle redirects
      if (res.statusCode == 301 || res.statusCode === 302) {
        resolve(downloadWithProgress(res.headers.location));
        return;
      }

      const len = parseInt(res.headers['content-length'], 10);
      console.log();
      const bar = new ProgressBar(`  ${fileName} [:bar] :rate/bps :percent :etas`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len,
      });
      res.on('data', (chunk) => {
        chunks.push(chunk);
        bar.tick(chunk.length);
      });
      res.on('end', () => {
        console.log('\n');
        resolve(Buffer.concat(chunks));
      });
    });
    req.end();
  });

// Retry wrapper for downloads to handle transient network errors
const downloadWithRetry = async (url, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await downloadWithProgress(url);
    } catch (err) {
      console.warn(`Download failed (attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) {
        throw err;
      }
    }
  }
};

// plebbit kubo downloads dont need to be extracted
const download = async (url, destinationPath) => {
  let binName = 'ipfs';
  if (destinationPath.endsWith('win')) {
    binName += '.exe';
  }
  const binPath = path.join(destinationPath, binName);
  // already downloaded, don't download again
  if (fs.pathExistsSync(binPath)) {
    return;
  }
  const split = url.split('/');
  const fileName = split[split.length - 1];
  const dowloadPath = path.join(destinationPath, fileName);
  const file = await downloadWithRetry(url);
  fs.ensureDirSync(destinationPath);
  await fs.writeFile(binPath, file);
};

// official kubo downloads need to be extracted
const downloadAndExtract = async (url, destinationPath) => {
  let binName = 'ipfs';
  if (destinationPath.endsWith('win')) {
    binName += '.exe';
  }
  const binPath = path.join(destinationPath, binName);
  if (fs.pathExistsSync(binPath)) {
    return;
  }
  const split = url.split('/');
  const fileName = split[split.length - 1];
  const dowloadPath = path.join(destinationPath, fileName);
  const file = await downloadWithRetry(url);
  fs.ensureDirSync(destinationPath);
  await fs.writeFile(dowloadPath, file);
  await decompress(dowloadPath, destinationPath);
  const extractedPath = path.join(destinationPath, 'kubo');
  const extractedBinPath = path.join(extractedPath, binName);
  fs.moveSync(extractedBinPath, binPath);
  fs.removeSync(extractedPath);
  fs.removeSync(dowloadPath);
};

export const downloadIpfsClients = async () => {
  const platform = os.platform();

  if (platform === 'win32') {
    console.log('Downloading Kubo for Windows...');
    await downloadAndExtract(ipfsClientWindowsUrl, ipfsClientWindowsPath);
  } else if (platform === 'darwin') {
    console.log('Downloading Kubo for macOS...');
    await downloadAndExtract(ipfsClientMacUrl, ipfsClientMacPath);
  } else if (platform === 'linux') {
    console.log('Downloading Kubo for Linux...');
    await downloadAndExtract(ipfsClientLinuxUrl, ipfsClientLinuxPath);
  } else {
    console.warn(`Unsupported platform: ${platform}. No Kubo binary downloaded.`);
  }
};

export default async (context) => {
  await downloadIpfsClients();
};
