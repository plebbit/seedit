// hook that runs after electron-build

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import packageJson from '../package.json' assert { type: 'json' };
import { fileURLToPath } from 'url';
const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distFolderPath = path.resolve(rootPath, 'dist');

const addPortableToPortableExecutableFileName = () => {
  const files = fs.readdirSync(distFolderPath);
  for (const file of files) {
    if (file.endsWith('.exe') && !file.match('Setup')) {
      const filePath = path.resolve(distFolderPath, file);
      const renamedFilePath = path.resolve(distFolderPath, file.replace('seedit', 'seedit Portable'));
      fs.moveSync(filePath, renamedFilePath);
    }
  }
};

const createHtmlArchive = () => {
  if (process.platform !== 'linux') {
    return;
  }
  const zipBinPath = path.resolve(rootPath, 'node_modules', '7zip-bin', 'linux', 'x64', '7za');
  const seeditHtmlFolderName = `seedit-html-${packageJson.version}`;
  const outputFile = path.resolve(distFolderPath, `${seeditHtmlFolderName}.zip`);
  const inputFolder = path.resolve(rootPath, 'build');
  try {
    // will break if node_modules/7zip-bin changes
    execSync(`${zipBinPath} a ${outputFile} ${inputFolder}`);
    // rename 'build' folder to 'seedit-html-version' inside the archive
    execSync(`${zipBinPath} rn -r ${outputFile} build ${seeditHtmlFolderName}`);
  } catch (e) {
    e.message = 'electron build createHtmlArchive error: ' + e.message;
    console.log(e);
  }
};

export default async (buildResult) => {
  addPortableToPortableExecutableFileName();
  createHtmlArchive();
};
