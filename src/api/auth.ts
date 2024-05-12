import { kvClear } from '../store/kvCache';
import { getApi, postApi } from './core';

export async function adminLogin(zjuId: string, at?: number) {
  return await postApi('/adminLogin', { zjuId, at });
}
//TODO: 接入passport，候选人登录，etc

export async function logout() {
  const prom = getApi('/logout');//先用token发起请求，再删除本地token信息
  kvClear();
  return prom;
}