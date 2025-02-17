import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        hashCharacters: 'base64',
        assetFileNames: 'assets/[name]-[hash:8][extname]',
        chunkFileNames: '[name]-[hash:6].js',
        manualChunks: {
          react: ['react-router-dom', 'react-dom', 'react'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
  },
});
