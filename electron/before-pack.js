// download the ipfs binaries before building the electron clients

import fs from 'fs-extra';
import ProgressBar from 'progress';
import https from 'https';
import extractZip from 'extract-zip';
import * as tar from 'tar';
import path from 'path';
import { fileURLToPath } from 'url';
const ipfsClientsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin');
const ipfsClientWindowsPath = path.join(ipfsClientsPath, 'win');
const ipfsClientMacPath = path.join(ipfsClientsPath, 'mac');
const ipfsClientLinuxPath = path.join(ipfsClientsPath, 'linux');
// Kubo's GitHub releases, not dist.ipfs.tech, which times out from CI runners
const kuboReleaseBaseUrl = 'https://github.com/ipfs/kubo/releases/download';

const ipfsClientVersion = '0.39.0';

// Resolve the target arch: an explicit arch (forge's target, or the host in dev) wins, then the env override, then the host
const resolveBuildArch = (arch) => {
  if (arch === 'arm64' || arch === 'x64') return arch;
  const envArch = process.env.SEEDIT_BUILD_ARCH;
  if (envArch === 'arm64' || envArch === 'x64') return envArch;
  // fallback to host arch
  if (process.arch === 'arm64') return 'arm64';
  return 'x64';
};

const toKuboArch = (arch) => (arch === 'arm64' ? 'arm64' : 'amd64');

const getKuboUrl = (platform, buildArch) => {
  const arch = toKuboArch(buildArch);
  if (platform === 'win32') return `${kuboReleaseBaseUrl}/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_windows-${arch}.zip`;
  if (platform === 'darwin') return `${kuboReleaseBaseUrl}/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_darwin-${arch}.tar.gz`;
  if (platform === 'linux') return `${kuboReleaseBaseUrl}/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_linux-${arch}.tar.gz`;
  // default to linux
  return `${kuboReleaseBaseUrl}/v${ipfsClientVersion}/kubo_v${ipfsClientVersion}_linux-${arch}.tar.gz`;
};

const downloadWithProgress = (url) =>
  new Promise((resolve, reject) => {
    const split = url.split('/');
    const fileName = split[split.length - 1];
    const chunks = [];
    const req = https.request(url);
    req.on('error', (err) => {
      console.error(`Error making request for ${url}:`, err);
      reject(err);
    });
    req.on('response', (res) => {
      res.on('error', (err) => {
        console.error(`Error in response for ${url}:`, err);
        reject(err);
      });
      // handle redirects
      if (res.statusCode == 301 || res.statusCode === 302) {
        // drain the redirect body so its socket is released
        res.resume();
        resolve(downloadWithProgress(res.headers.location));
        return;
      }

      if (!res.statusCode || res.statusCode >= 400) {
        reject(new Error(`Download request for ${url} failed with status ${res.statusCode ?? 'unknown'}`));
        return;
      }

      const len = parseInt(res.headers['content-length'], 10);
      console.log();
      const bar = new ProgressBar(`  ${fileName} [:bar] :rate/bps :percent :etas`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len,
        stream: process.stdout,
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

// add retry wrapper around downloadWithProgress to handle transient network errors
const downloadWithRetry = async (url, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await downloadWithProgress(url);
    } catch (err) {
      console.warn(`Download attempt ${attempt} for ${url} failed:`, err);
      if (attempt === retries) throw err;
      // wait before retrying
      await new Promise((res) => setTimeout(res, attempt * 1000));
    }
  }
};

const extractArchive = async (archivePath, destinationPath) => {
  if (archivePath.endsWith('.zip')) {
    await extractZip(archivePath, { dir: destinationPath });
    return;
  }

  if (archivePath.endsWith('.tar.gz') || archivePath.endsWith('.tgz')) {
    await tar.x({ file: archivePath, cwd: destinationPath });
    return;
  }

  throw new Error(`Unsupported archive format: ${archivePath}`);
};

// official kubo downloads need to be extracted
const downloadAndExtract = async (url, destinationPath) => {
  let binName = 'ipfs';
  if (destinationPath.endsWith('win')) {
    binName += '.exe';
  }
  const binPath = path.join(destinationPath, binName);
  // bin/<platform>/ipfs is shared by dev and every packaging target, so only reuse it when it came from this exact url
  const sourceMarkerPath = path.join(destinationPath, '.kubo-source');
  const cachedSource = fs.pathExistsSync(sourceMarkerPath) ? fs.readFileSync(sourceMarkerPath, 'utf8').trim() : undefined;
  if (fs.pathExistsSync(binPath) && cachedSource === url) {
    return;
  }
  console.log(`Downloading IPFS client from ${url} to ${destinationPath}`);
  const split = url.split('/');
  const fileName = split[split.length - 1];
  const archivePath = path.join(destinationPath, fileName);
  const extractedPath = path.join(destinationPath, 'kubo');
  const file = await downloadWithRetry(url);
  fs.ensureDirSync(destinationPath);
  await fs.writeFile(archivePath, file);
  console.log(`Downloaded archive to ${archivePath}`);
  console.log(`Extracting ${archivePath} to ${destinationPath}`);
  fs.removeSync(extractedPath);
  try {
    await extractArchive(archivePath, destinationPath);
    console.log('Decompression complete');
  } catch (err) {
    console.error('Error during decompression:', err);
    throw err;
  }
  const extractedBinPath = path.join(extractedPath, binName);
  console.log(`Moving binary from ${extractedBinPath} to ${binPath}`);
  fs.moveSync(extractedBinPath, binPath, { overwrite: true });
  fs.writeFileSync(sourceMarkerPath, `${url}\n`);
  console.log('Binary moved');
  console.log('Cleaning up temporary files');
  fs.removeSync(archivePath);
  fs.removeSync(extractedPath);
  console.log('Cleanup complete');
};

// forge's generateAssets hook passes its target platform/arch; dev passes the host
export const downloadIpfsClients = async ({ platform = process.platform, arch } = {}) => {
  const buildArch = resolveBuildArch(arch);
  console.log(`Starting IPFS client download for platform: ${platform}, targetArch: ${buildArch}`);
  const url = getKuboUrl(platform, buildArch);
  if (platform === 'win32') {
    await downloadAndExtract(url, ipfsClientWindowsPath);
  } else if (platform === 'darwin') {
    await downloadAndExtract(url, ipfsClientMacPath);
  } else if (platform === 'linux') {
    await downloadAndExtract(url, ipfsClientLinuxPath);
  } else {
    console.warn(`Unknown platform: ${platform}, defaulting to linux path`);
    await downloadAndExtract(url, ipfsClientLinuxPath);
  }
};

export default async (_context) => {
  await downloadIpfsClients();
};
