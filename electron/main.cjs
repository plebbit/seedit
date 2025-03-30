// This is a CommonJS file to bootstrap our bundled main.bundle.js file
// We use this because our project is ESM, but Electron works better with CommonJS
module.exports = require('./main.bundle.js'); 