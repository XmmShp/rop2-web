import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
/**@ts-ignore */
import { execSync } from 'node:child_process';

function sh(cmd: string) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}
let headSha: string, headCommitCount: string, headBranch: string, anyChanges: boolean;
try {
  headSha = sh('git rev-parse HEAD');
  headCommitCount = sh('git rev-list --count HEAD');
  headBranch = sh('git rev-parse --abbrev-ref HEAD');
  anyChanges = sh('git status --porcelain -uall').length > 0;
} catch {
  headSha = 'unknown';
  headCommitCount = 'unknown';
  headBranch = 'unknown';
  anyChanges = false;
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_BUILD_INFO': JSON.stringify(`构建版本 ${headCommitCount}${anyChanges ? '*' : ''}`),
    'import.meta.env.VITE_BUILD_INFO_DETAIL': JSON.stringify(`${anyChanges ? '有未提交的更改\n' : ''}branch: ${headBranch}\ncommit: ${headSha}`),
  },
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
