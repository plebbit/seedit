// Polyfills for Node.js built-ins
import { Buffer } from 'buffer';
import process from 'process';
import 'isomorphic-fetch';

window.Buffer = Buffer;
window.process = process;
window.global = window;

// For ethers.js
window.process.version = ''; // Fake Node.js version
window.process.env = window.process.env || {};

// Add any missing fetch polyfill
if (!window.fetch) {
  console.warn('Fetch API is not available, using polyfill');
}

// For crypto support
if (typeof window.crypto === 'undefined') {
  window.crypto = {};
}
if (typeof window.crypto.getRandomValues === 'undefined') {
  window.crypto.getRandomValues = function (array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  };
}
