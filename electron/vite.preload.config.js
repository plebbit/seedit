import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    conditions: ['node'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'preload.mjs'),
      name: 'Preload',
      fileName: () => 'preload.cjs',
      formats: ['cjs'],
    },
    outDir: resolve(__dirname, '../build/electron'),
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron'],
    },
    target: 'node20',
    minify: false,
  },
});
