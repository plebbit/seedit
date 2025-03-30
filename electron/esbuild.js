#!/usr/bin/env node

import { build } from 'esbuild';

async function runBuild() {
  try {
    const result = await build({
      entryPoints: ['electron/main.js'],
      bundle: true,
      platform: 'node',
      target: 'node16',
      outfile: 'electron/main.bundle.js',
      format: 'esm',
      external: [
        // Core module that should be excluded
        'electron',
        // Database drivers that are optionally required by dependencies
        'pg',
        'mysql',
        'mysql2',
        'oracledb',
        'tedious',
        'pg-query-stream',
        // Other problematic imports
        './v6',
        'skia-canvas',
      ],
      logLevel: 'warning',
    });

    console.log('Build complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();
