import { useEffect, useId, useState } from 'react';
import { useData } from '../../api/useData';

export type Depart = {
  id: number;
  name: string;
  createAt: string;
};
export type OrgInfo = {
  org: {
    defaultDepart: number;
    name: string;
    useDeparts: number;//TODO 解析&使用该属性
  };
  departs: Depart[];
};


type ResponsiveOrgInfo = readonly [OrgInfo, Promise<OrgInfo> | null, () => void];
let consumers: Map<string, (newState: ResponsiveOrgInfo) => void> = new Map();
let current: ResponsiveOrgInfo;
/**获取组织信息(含departs，自动筛除默认部门)。
 * 
 * 当且仅当组件是最先获取组织信息的组件时，参数`isProvider`为true。该组件将调用useData；
 * 
 * 否则，该组件将使用来自上述组件的缓存，支持响应式刷新和reload方法。
 */
export function useOrg(isProvider = false): ResponsiveOrgInfo {
  if (isProvider) {
    const [orgInfo, loadPromise, reload] = useData<OrgInfo>('/org',
      async (resp) => await resp.json(),
      //默认值
      {
        org: { defaultDepart: -1, name: '加载中', useDeparts: 0 },
        departs: []
      });
    orgInfo.departs = orgInfo.departs.filter(d => d.id !== orgInfo.org.defaultDepart);
    const respInfo = [orgInfo, loadPromise, reload] as const;
    current = respInfo;
    //React不允许在组件渲染期间修改另一组件的state
    queueMicrotask(() => {
      for (const [, setF] of consumers.entries())
        setF(respInfo);
    });
    return respInfo;
  }
  else {
    const id = useId();
    const [respInfo, setRespInfo] = useState<ResponsiveOrgInfo>(current);
    consumers.set(id, setRespInfo);
    useEffect(() => (() => { consumers.delete(id) }), []);
    return respInfo;
  }
}