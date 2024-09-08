import { without } from '../utils';
import { message } from '../App';
import { tokenHeaderKey, saveToken, getToken } from './auth';

/**从环境变量读取api基路径(api基路径和前端基路径无关)。该值不能以/结尾 */
const apiBase = import.meta.env.VITE_APIBASE ?? 'http://127.0.0.1:8080';
export function getApiUrl(route: '' | `/${string}` = '', params?: Record<string, string>) {
  return apiBase + route +
    (params ? '?' + new URLSearchParams(params).toString() : '')
}

/**fetch的封装，禁用缓存、自动添加token、负责token刷新。不检查HTTP状态码，将fetch结果原样返回(包括401/403)。 */
async function innerFetch(...[url, config]: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const token = getToken();
  const resp = await fetch(url, {
    headers: {
      ...(token ? { [tokenHeaderKey]: token } : {}),
      ...(config?.headers) ?? {},
    },
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'origin-when-cross-origin',
    ...without(config ?? {} as any, ['headers'])
  });
  const newToken = resp.headers.get(tokenHeaderKey);
  if (newToken) saveToken(newToken);
  return resp;
}

export async function getApi(
  pathname: `/${string}`,
  params: Record<string, any> = {},
  fetchConfig: RequestInit = {}
): Promise<Response> {
  let url = getApiUrl(pathname);
  const paramsEntries = Object.entries(params);
  if (paramsEntries.length) {
    url += '?';
    const str = paramsEntries.map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    );
    url += str.join('&');
  }
  return await innerFetch(url, {
    method: 'GET',
    ...fetchConfig
  });
}

export async function postApi(
  pathname: `/${string}`,
  body: Record<string, any>,
  fetchConfig: RequestInit = {}
): Promise<Response> {
  return await innerFetch(getApiUrl(pathname), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    ...fetchConfig
  });
}

/**发送POST请求。
 * 
 * 若收到响应，将其视为json解析并返回（无论其状态码是否为200）。  
 * 
 * 如果`code`或`message`不为空，则显示一条错误消息，返回值不变。
 */
export async function pkgPost(...args: Parameters<typeof postApi>): Promise<{ code: number, message?: string }> {
  const resp = await postApi(...args);
  try {
    const jsonObj = await resp.json();
    const { code, message: errMsg } = jsonObj;
    if (code || errMsg)
      message.error(errMsg ?? '未知错误');
    return jsonObj;
  } catch (e) {
    message.error('网络错误')
  }
  return { code: -1, message: '__pkgPost错误' }
}