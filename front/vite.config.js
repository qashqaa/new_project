import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    ///host: '26.97.240.227',
    host: '0.0.0.0',
    port: 3000,
    headers: {
      'Content-Security-Policy':
        "default-src * 'unsafe-eval' 'unsafe-inline' blob: data:; " +
        "script-src * 'unsafe-eval' 'unsafe-inline' blob:; " +
        'worker-src * blob: data:; ' +
        'connect-src *;',
    },
    proxy: {
      '/api': {
        target: 'http://back:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
