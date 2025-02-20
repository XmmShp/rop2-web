import { without } from '../utils';
import { message } from '../App';
import { tokenHeaderKey, saveToken, getToken } from './auth';
import { getEnv } from '../env';

/**从环境变量读取api基路径(api基路径和前端基路径无关)。该值不能以/结尾 */
let apiBase: string;
getEnv().then(env => {
  apiBase = env.APIBASE;
  console.log('API Base URL:', apiBase);
});

// 等待环境变量加载，最多等待1秒
async function waitForApiBase(): Promise<void> {
  const startTime = Date.now();
  while (!apiBase && Date.now() - startTime < 1000) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  if (!apiBase) {
    throw new Error('Environment is not initialized after 1 second timeout');
  }
}

export async function getApiUrl(route: '' | `/${string}` = '', params?: Record<string, string>) {
  await waitForApiBase();
  return apiBase + route + (params ? '?' + new URLSearchParams(params).toString() : '');
}

/**fetch的封装，禁用缓存、自动添加token、负责token刷新。不检查HTTP状态码，将fetch结果原样返回(包括401/403)。 */
async function innerFetch(...[url, config]: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const token = getToken();
  const resp = await fetch(url, {
    headers: {
      ...(token ? { [tokenHeaderKey]: token } : {}),
      ...(config?.headers ?? {}),
    },
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'origin-when-cross-origin',
    ...without(config ?? ({} as any), ['headers']),
  });
  const newToken = resp.headers.get(tokenHeaderKey);
  if (newToken) saveToken(newToken);
  return resp;
}

export async function getApi(pathname: `/${string}`, params: Record<string, any> = {}, fetchConfig: RequestInit = {}): Promise<Response> {
  let url = await getApiUrl(pathname);
  const paramsEntries = Object.entries(params);
  if (paramsEntries.length) {
    url += '?';
    const str = paramsEntries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    url += str.join('&');
  }
  return await innerFetch(url, {
    method: 'GET',
    ...fetchConfig,
  });
}

export async function postApi(pathname: `/${string}`, body: Record<string, any>, fetchConfig: RequestInit = {}): Promise<Response> {
  return await innerFetch(await getApiUrl(pathname), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    ...fetchConfig,
  });
}

type PkgPostResult = Promise<{ code: number; message?: string }> & {
  /**如果此次pkgPost成功完成(code和message均为假值)，显示一条成功消息。
   * 返回一个Promise，其兑现值表示pkgPost是否成功完成。
   */
  msgSuccess(message: string): Promise<boolean>;
};
/**发送POST请求。返回的Promise带有额外的`msgSuccess`方法。
 *
 * 若收到响应，将其视为json解析并返回（无论其状态码是否为200）。
 *
 * 如果`code`或`message`不为空，则显示一条错误消息，返回值不变。
 */
export function pkgPost(...args: Parameters<typeof postApi>): PkgPostResult {
  let success = false;
  const prom = new Promise((rs, rj) => {
    postApi(...args)
      .then((r) => r.json())
      .then((jsonObj) => {
        try {
          const { code, message: errMsg } = jsonObj;
          if (code || errMsg) message.error(errMsg ?? '未知错误');
          else success = true;
          rs(jsonObj);
        } catch (e) {
          message.error('网络错误');
        }
        rs({ code: -1, message: '__pkgPost错误' });
      });
  }) as PkgPostResult;
  prom.msgSuccess = async (msg) => {
    await prom;
    if (success) message.success(msg);
    return success;
  };
  return prom;
}
