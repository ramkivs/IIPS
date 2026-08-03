import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: {
    outDir: '../../build/react-app',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
