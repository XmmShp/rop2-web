import { kvClear, kvGet, scopedKeyPrefix } from '../store/kvCache';
import { getApiUrl } from './core';

//退出登录仍保留问卷填写记录
const keepCheckerRegex = new RegExp(`${scopedKeyPrefix}\\d+:f\\d+`);
const keepChecker = (k: string) => keepCheckerRegex.test(k);
/**退出本次登录（由token生成时间确定） */
export async function logout(): Promise<void> {
  navigator.sendBeacon(getApiUrl('/logout'), JSON.stringify({ token: kvGet('token') }));//先用token发起请求，再删除本地token信息
  kvClear(keepChecker);
  //注意：zjuam会限制service，localhost等不在白名单内的域名会被跳转到其的固定地址 
  location.href =
    `https://zjuam.zju.edu.cn/cas/logout?service=${encodeURIComponent(`https://www.qsc.zju.edu.cn/passport/v4/logout?success=${encodeURIComponent(location.href)}`)}`;
}

export function getLoginRedirectUrl() {
  const continueUrl = location.href;

  const loginCallbackUrl = getApiUrl('/loginByPassportToken', { continue: continueUrl });
  const redirectUrl =
    `https://www.qsc.zju.edu.cn/passport/v4/zju/login?success=${encodeURIComponent(loginCallbackUrl)}`;
  return redirectUrl;
}