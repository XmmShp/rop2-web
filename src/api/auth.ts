import { base64 } from 'rfc4648';
import { kvClear, kvGet, kvSet, scopedKeyPrefix, zjuIdKey } from '../store/kvCache';
import { getApiUrl, pkgPost } from './core';

export const tokenHeaderKey = 'rop-token';
const tokenStoreKey = 'token';
export function getToken() {
  return kvGet(tokenStoreKey);
}
//保存token并解析zjuId/nickname等信息，同步函数
export function saveToken(token: string) {
  kvSet(tokenStoreKey, token);
  const [objB64,] = token.split(' ');
  const bytes = base64.parse(objB64, { loose: true });
  const decoder = new TextDecoder('utf-8');
  const objJson = decoder.decode(bytes);
  const { at = 0, nickname = '', level = 0, zjuId } = JSON.parse(objJson) as {
    at: number; //登录组织id
    nickname: string;
    level: number; //权限级别
    zjuId: string;
  };
  //没有管理权限的用户at nickname level均为默认值
  //以下字段仅供缓存(显示)使用，不作为凭据
  kvSet('at', at.toString());
  kvSet('nickname', nickname);
  kvSet('level', level.toString());
  kvSet(zjuIdKey, zjuId);
}

//退出登录仍保留问卷填写记录
const keepCheckerRegex = new RegExp(`${scopedKeyPrefix}\\d+:f\\d+`);
const keepChecker = (k: string) => keepCheckerRegex.test(k);
/**退出登录。清除本地缓存的token信息，并向rop2后端请求本次token失效(sendBeacon，异步请求且不干扰导航)；  
 * 退出zjuam登录(会改变url)，然后重定向到passport，退出passport登录。
 */
export function logout(callbackUrl: string = location.href) {
  const token = getToken();
  kvClear(keepChecker);
  navigator.sendBeacon(getApiUrl('/logout'), JSON.stringify({
    token
  }));//先用token发起请求，再删除本地token信息
  //注意：zjuam会限制service，localhost等不在白名单内的域名会被跳转到其的固定地址
  location.href =
    `https://zjuam.zju.edu.cn/cas/logout?service=${encodeURIComponent(`https://www.qsc.zju.edu.cn/passport/v4/logout?success=${encodeURIComponent(callbackUrl)}`)}`;
}

/**获得前往登录的url，登录成功会返回原页面(`location.href`)。 */
export function getLoginRedirectUrl() {
  const continueUrl = location.href;
  const loginCallbackUrl = getApiUrl('/loginByPassportToken', { continue: continueUrl });
  const redirectUrl =
    `https://www.qsc.zju.edu.cn/passport/v4/zju/login?success=${encodeURIComponent(loginCallbackUrl)}`;
  return redirectUrl;
}

export function switchOrg(orgId: number) {
  //清除部分与组织绑定的本地缓存
  kvSet('form', '')
  kvSet('filterDeparts', '[]')
  return pkgPost(`/switchOrg`, { orgId })
}