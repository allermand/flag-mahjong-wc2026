import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Relative base so the built assets resolve correctly when served from a
  // GitHub Pages project subpath (https://<user>.github.io/<repo>/).
  base: './',
  plugins: [react()],
});
