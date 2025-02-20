interface Env {
  APIBASE: string;
}

declare global {
  interface Window {
    __env__: Env;
  }
}

// 环境变量管理类
class Environment {
  private env: Env | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = new Promise((resolve) => {
      if (import.meta.env.VITE_ENABLE_RUNTIME_CONFIG === 'true') {
        const script = document.createElement('script');
        script.src = `${location.origin}/env-config.js`;
        script.onload = () => {
          this.env = {
            APIBASE: this.getApiBase(),
          };
          resolve();
        };
        script.onerror = () => {
          console.debug('No runtime env config found, using default values');
          this.env = {
            APIBASE: this.getApiBase(),
          };
          resolve();
        };
        document.head.appendChild(script);
      } else {
        this.env = {
          APIBASE: this.getApiBase(),
        };
        resolve();
      }
    });
  }

  private getApiBase(): string {
    // 只有在启用运行时配置时才使用 window.__env__
    if (import.meta.env.VITE_ENABLE_RUNTIME_CONFIG === 'true' && typeof window !== 'undefined' && window.__env__?.APIBASE) {
      return window.__env__.APIBASE.replace(/\/+$/, '');
    }
    // 开发环境下使用 Vite 环境变量
    if (import.meta.env.VITE_APIBASE) {
      return import.meta.env.VITE_APIBASE.replace(/\/+$/, '');
    }
    // 默认值
    return 'http://127.0.0.1:8080';
  }

  getEnv(): Env {
    if (!this.env) {
      throw new Error('Environment not initialized. Call waitForInit() before accessing environment.');
    }
    return this.env;
  }

  waitForInit(): Promise<void> {
    return this.initPromise;
  }
}

// 创建单例实例
const environment = new Environment();

export const getEnv = () => environment.getEnv();
export const envInitPromise = () => environment.waitForInit();
