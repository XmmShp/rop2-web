import { base64 } from 'rfc4648';
import { kvGet, kvSet } from '../store/kvCache';
import { without } from '../utils';
import { message } from '../App';
import { redirectToLogin } from './auth';

//从环境变量读取api基路径(api基路径和前端基路径无关)。该值不能以/结尾
const apiBase = import.meta.env.VITE_APIBASE ?? 'http://127.0.0.1:8080';
export function getApiUrl(route: '' | `/${string}` = '', params?: Record<string, string>) {
  return apiBase + route +
    (params ? '?' + new URLSearchParams(params).toString() : '')
}

//保存token，同步函数
export function saveToken(token: string) {
  kvSet('token', token);
  const [objB64,] = token.split(' ');
  const bytes = base64.parse(objB64, { loose: true });
  const decoder = new TextDecoder('utf-8');
  const objJson = decoder.decode(bytes);
  const { at = 0, nickname = '', level = 0, zjuId } = JSON.parse(objJson) as {
    at: number,//登录组织id
    nickname: string,
    level: number,//权限级别
    zjuId: string,
  };
  //没有管理权限的用户at nickname level均为默认值
  //以下字段仅供缓存(显示)使用，不作为凭据
  kvSet('at', at.toString());
  kvSet('nickname', nickname);
  kvSet('level', level.toString());
  kvSet('zjuId', zjuId);
}

//fetch的封装，自动添加token，处理401(跳登录页)和token刷新
async function innerFetch(...[url, config]: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const token = kvGet('token');
  const resp = await fetch(url, {
    headers: {
      ...(token ? { 'rop-token': token } : {}),
      ...(config?.headers) ?? {},
    },
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'origin-when-cross-origin',
    ...without(config ?? {} as any, ['headers'])
  });
  const newToken = resp.headers.get('rop-refresh-token');
  if (newToken)
    saveToken(newToken)
  if (resp.status === 401)
    redirectToLogin();
  if (resp.status === 403)
    redirectToLogin(); //TODO 优化403处理逻辑
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
  const jsonObj = await resp.json();
  const { code, message: errMsg } = jsonObj;
  if (code || errMsg)
    message.error(errMsg ?? '未知错误');
  return jsonObj;
}