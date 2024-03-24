import { base64 } from "rfc4648";
import { getStore, setStore } from "../store";
import { without } from "../utils";

let apiBase = import.meta.env.VITE_APIBASE ?? 'http://127.0.0.1:8080';

async function saveToken(token: string) {
  setStore('token', token);
  const [objB64,] = token.split(' ');
  const bytes = base64.parse(objB64, { loose: true });
  const decoder = new TextDecoder('utf-8');
  const objJson = decoder.decode(bytes);
  const { at, nickname, level } = JSON.parse(objJson) as {
    at: number,//登录组织id
    nickname: string,
    level: number//权限级别
  };
  setStore('at', at.toString());
  setStore('nickname', nickname);
  setStore('level', level.toString());
}

async function innerFetch(...[url, config]: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const token = getStore('token');
  const resp = await fetch(url, {
    headers: {
      ...(token ? { 'rop-token': token } : {}),
      ...(config?.headers) ?? {}
    },
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'origin-when-cross-origin',
    ...without(config ?? {} as any, ['headers'])
  });
  console.log(resp)
  const newToken = resp.headers.get('rop-refresh-token');
  if (newToken)
    saveToken(newToken)
  return resp;
}

export async function getApi(
  pathname: `/${string}`,
  params?: Record<string, any>
): Promise<Response> {
  let url = apiBase + pathname;
  if (params) {
    url += '?';
    const str = Object.entries(params)
      .map(([key, value]) =>
        encodeURIComponent(key)
        + '='
        + encodeURIComponent(value)
      );
    url += str.join('&');
  }
  return await innerFetch(url, {
    method: 'GET'
  });
}

export async function postApi(
  pathname: `/${string}`,
  body: Record<string, any>
): Promise<Response> {
  return await innerFetch(apiBase + pathname, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  });
}