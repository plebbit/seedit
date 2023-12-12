// hook that runs after electron-build

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const rootPath = path.resolve(__dirname, '..');
const distFolderPath = path.resolve(rootPath, 'dist');

const addPortableToPortableExecutableFileName = () => {
  const files = fs.readdirSync(distFolderPath);
  for (const file of files) {
    if (file.endsWith('.exe') && !file.match('Setup')) {
      const filePath = path.resolve(distFolderPath, file);
      const renamedFilePath = path.resolve(
        distFolderPath,
        file.replace('seedit', 'seedit Portable')
      );
      fs.moveSync(filePath, renamedFilePath);
    }
  }
};

const createHtmlArchive = () => {
  if (process.platform !== 'linux') {
    return;
  }
  const { version } = require('../package.json');
  const zipBinPath = path.resolve(rootPath, 'node_modules', '7zip-bin', 'linux', 'x64', '7za');
  const seeditHtmlFolderName = `seedit-html-${version}`;
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

exports.default = async (buildResult) => {
  addPortableToPortableExecutableFileName();
  createHtmlArchive();
};
