import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true
  },
  server: {
    port: 5173,
    strictPort: true
  }, build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react-dom']
        }
      }
    }
  }
});
