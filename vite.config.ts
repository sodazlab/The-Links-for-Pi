import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow REACT_APP_ prefix for environment variables to match existing convention
  envPrefix: 'REACT_APP_',
  build: {
    outDir: 'dist',
  }
});