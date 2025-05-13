import { downloadIpfsClients } from './before-pack.js';

// Wrap the download in an async IIFE and exit when done
(async () => {
  try {
    await downloadIpfsClients();
    console.log('IPFS clients downloaded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('IPFS clients download error:', err);
    process.exit(1);
  }
})();
