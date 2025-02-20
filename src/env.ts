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
  private initPromise: Promise<void>;
  private env: Env | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    try {
      // 尝试加载环境配置，使用 vite-ignore 避免构建时转译
      await import(/* @vite-ignore */ `${location.origin}/env-config.js`);
    } catch (err) {
      // 如果配置文件不存在，静默失败
      console.debug('No runtime env config found, using default values');
    }

    // 初始化环境变量
    this.env = {
      APIBASE: this.getApiBase()
    };
  }

  private getApiBase(): string {
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

  async getEnv(): Promise<Env> {
    await this.initPromise;
    return this.env!;
  }
}

// 创建单例实例
const environment = new Environment();

// 导出获取环境变量的函数
export const getEnv = () => environment.getEnv();
