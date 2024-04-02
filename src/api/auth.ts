import { kvClear } from '../store/kvCache';
import { getApi, postApi } from './core';

export async function login(zjuId: string, at?: number) {
  return await postApi('/login', { zju_id: zjuId, at });
}

export async function logout() {
  const prom = getApi('/logout');//先用token发起请求，再删除本地token信息
  kvClear();
  return prom;
}