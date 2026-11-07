import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './': the built site works under any path, so GitHub Pages serves it at
// https://<user>.github.io/<repo>/ for this repo and for every fork.
export default defineConfig({
  base: './',
  plugins: [react()],
});
