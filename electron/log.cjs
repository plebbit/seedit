// require this file to log to file in case there's a crash

// Convert all external module imports to CommonJS require
const util = require('util');
const fs = require('fs-extra');
const path = require('path');
// We will dynamically import env-paths

// Store original console methods BEFORE overriding them
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;

let logFile;

// Async function to initialize logging
async function initializeLogging() {
  try {
    const EnvPaths = (await import('env-paths')).default; // Access default export
    const envPaths = EnvPaths('plebbit', { suffix: false });
    originalConsoleLog(envPaths); // Use original console.log here

    // previous version created a file instead of folder
    // we should remove this at some point
    try {
      if (fs.lstatSync(envPaths.log).isFile()) {
        fs.removeSync(envPaths.log);
      }
    } catch (e) {}

    const logFilePath = path.join(envPaths.log, new Date().toISOString().substring(0, 7) + '.log'); // Added .log extension
    fs.ensureFileSync(logFilePath);
    logFile = fs.createWriteStream(logFilePath, { flags: 'a' });

  } catch (err) {
    originalConsoleError("Failed to initialize logging with env-paths:", err); // Use original console.error here
    // Fallback or error handling if env-paths fails
    const fallbackLogDir = path.join(process.cwd(), 'logs');
    fs.ensureDirSync(fallbackLogDir);
    const fallbackLogPath = path.join(fallbackLogDir, 'fallback-log.log');
    logFile = fs.createWriteStream(fallbackLogPath, { flags: 'a' });
    // Can't call writeLog here yet as logFile might still be undefined, use original console
    originalConsoleError("Logging initialized with fallback path due to error:", err);
  }
}

// Function to write logs, checks if logFile is ready
const writeLog = (...args) => {
  if (!logFile) {
    // Use original console.warn to avoid recursion if log file is not ready
    originalConsoleWarn("Log file not initialized yet, queuing message:", ...args);
    return;
  }
  logFile.write(new Date().toISOString() + ' ');
  for (const arg of args) {
    logFile.write(util.format(arg) + ' ');
  }
  logFile.write('\r\n');
};

// Override console methods AFTER defining original references and writeLog
console.log = (...args) => {
  writeLog(...args);
  originalConsoleLog(...args);
};
console.error = (...args) => {
  writeLog(...args);
  originalConsoleError(...args);
};
console.warn = (...args) => {
  writeLog(...args);
  originalConsoleWarn(...args);
};
console.debug = (...args) => {
  if (logFile) {
    for (const arg of args) {
      logFile.write(util.format(arg) + ' ');
    }
    logFile.write('\r\n');
  }
  originalConsoleDebug(...args);
};

// Global error handlers
process.on('uncaughtException', (err) => {
  writeLog('Uncaught Exception:', err);
  originalConsoleError('Uncaught Exception:', err); // Use original console.error
});
process.on('unhandledRejection', (reason, promise) => {
  writeLog('Unhandled Rejection at:', promise, 'reason:', reason);
  originalConsoleError('Unhandled Rejection at:', promise, 'reason:', reason); // Use original console.error
});

// Initialize logging (this is async, console overrides happen immediately)
initializeLogging();
