import { kvClear } from '../store/kvCache';
import { getApi, getApiUrl, postApi } from './core';

/**退出本次登录（由token生成时间确定） */
export async function logout() {
  const prom = getApi('/logout');//先用token发起请求，再删除本地token信息
  kvClear();
  return prom;
}

export function redirectToLogin() {
  const continueUrl = location.href;

  const loginCallbackUrl = getApiUrl(`/loginByToken?continue=${encodeURIComponent(continueUrl)}`);
  const redirectUrl =
    `https://www.qsc.zju.edu.cn/passport/v4/zju/login?success=${encodeURIComponent(loginCallbackUrl)}`;
  location.href = redirectUrl;
}