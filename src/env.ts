export const env = {
  get APIBASE() {
    // 优先使用运行时环境变量
    if (typeof window !== 'undefined' && window.__env__?.APIBASE) {
      return window.__env__.APIBASE.replace(/\/+$/, '');
    }
    // 开发环境下使用 Vite 环境变量
    if (import.meta.env.VITE_APIBASE) {
      return import.meta.env.VITE_APIBASE.replace(/\/+$/, '');
    }
    // 默认值
    return 'http://127.0.0.1:8080';
  }
} as const;
