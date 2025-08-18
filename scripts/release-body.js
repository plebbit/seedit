import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const conventionalChangelog = path.join(dirname, '..', 'node_modules', '.bin', 'conventional-changelog');
const version = JSON.parse(readFileSync(path.join(dirname, '..', 'package.json'), 'utf8')).version;

// changelog (use last non-empty)
let releaseChangelog =
  execSync(`${conventionalChangelog} --preset angular --release-count 1`).toString() ||
  execSync(`${conventionalChangelog} --preset angular --release-count 2`).toString();
releaseChangelog = releaseChangelog.trim().replace(/\n\n+/g, '\n\n');

// discover artifacts
const distDir = path.join(dirname, '..', 'dist');
let files = [];
try { files = readdirSync(distDir); } catch {}

const linkTo = (file) => `https://github.com/plebbit/seedit/releases/download/v${version}/${file}`;
const has = (s, sub) => s.toLowerCase().includes(sub);
const isArm = (s) => has(s, 'arm64') || has(s, 'aarch64');
const isX64 = (s) => (has(s, 'x64') || has(s, 'x86_64')) || !isArm(s);

// buckets
const androidApk = files.find(f => f.endsWith('.apk'));
const htmlZip = files.find(f => f.includes('seedit-html') && f.endsWith('.zip'));

const linux = files.filter(f => f.endsWith('.AppImage'));
const mac = files.filter(f => f.endsWith('.dmg'));
const win = files.filter(f => f.toLowerCase().endsWith('.exe'));

const linuxArm = linux.find(isArm);
const linuxX64 = linux.find(isX64);
const macArm = mac.find(isArm);
const macX64 = mac.find(isX64);

const winSetupArm = win.find(f => has(f, 'setup') && isArm(f));
const winSetupX64 = win.find(f => has(f, 'setup') && isX64(f));
const winPortableArm = win.find(f => has(f, 'portable') && isArm(f));
const winPortableX64 = win.find(f => has(f, 'portable') && isX64(f));

// small section builder without push()
const section = (title, lines) => {
  const body = lines.filter(Boolean).join('\n');
  return body ? `### ${title}\n${body}` : '';
};

const macSection = section('macOS', [
  macArm && `- Apple Silicon (arm64): [Download DMG](${linkTo(macArm)})`,
  macX64 && `- Intel (x64): [Download DMG](${linkTo(macX64)})`,
]);

const winSection = section('Windows', [
  winSetupArm && `- Installer (arm64): [Download EXE](${linkTo(winSetupArm)})`,
  winSetupX64 && `- Installer (x64): [Download EXE](${linkTo(winSetupX64)})`,
  winPortableArm && `- Portable (arm64): [Download EXE](${linkTo(winPortableArm)})`,
  winPortableX64 && `- Portable (x64): [Download EXE](${linkTo(winPortableX64)})`,
]);

const linuxSection = section('Linux', [
  linuxArm && `- AppImage (arm64): [Download](${linkTo(linuxArm)})`,
  linuxX64 && `- AppImage (x64): [Download](${linkTo(linuxX64)})`,
]);

const androidSection = section('Android', [
  androidApk && `- APK: [Download](${linkTo(androidApk)})`,
]);

const htmlSection = section('Static HTML build', [
  htmlZip && `- seedit-html (zip): [Download](${linkTo(htmlZip)})`,
]);

const downloads = [macSection, winSection, linuxSection, androidSection, htmlSection]
  .filter(Boolean).join('\n\n');

const releaseBody = `This version improves desktop performance and adds native builds.

- Web app: https://seedit.app
- Decentralized web app: https://seedit.eth (only works on [Brave Browser](https://brave.com/) or via [IPFS Companion](https://docs.ipfs.tech/install/ipfs-companion/#prerequisites))

## Downloads

${downloads}

## Changes

${releaseChangelog}`;

console.log(releaseBody);