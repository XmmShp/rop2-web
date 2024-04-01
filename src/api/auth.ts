import { postApi } from './core';

export async function login(zjuId: string, at?: number) {
  return await postApi('/login', { zju_id: zjuId, at });
}