import { defineConfig } from 'vite';
import { cp } from 'node:fs/promises';

export default defineConfig({
  plugins: [{ name: 'credited-photographs', async closeBundle() { await cp('assets/photos', 'dist/assets/photos', { recursive: true }); } }],
  base: process.env.PAGES_BUILD === '1' ? '/localcanon/' : '/',
  server: { host: '127.0.0.1', port: 4173 },
  preview: { host: '127.0.0.1', port: 4173 },
});
