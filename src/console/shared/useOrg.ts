import { createContext, useContext } from 'react';
import { DataTuple, useData } from '../../api/useData';
import { kvGet } from '../../store/kvCache';
import { num } from '../../utils';

export type Depart = {
  id: number;
  name: string;
  createAt: string;
};
export type OrgInfo = {
  org: {
    id: number;
    defaultDepart: number;
    name: string;
    useDeparts: number;//TODO 解析&使用该属性
  };
  departs: Depart[];
  /**生成此OrgInfo的响应状态码，未请求时为0 */
  respStatus: number;
};


const defaultOrg = {
  org: { defaultDepart: -1, name: '加载中', useDeparts: 0 },
  departs: []
};
export function useOrg(): DataTuple<OrgInfo> {
  const v = useData<OrgInfo>('/org', async (resp) => {
    const result = resp.status >= 400 ? defaultOrg : await resp.json();
    return { ...result, respStatus: resp.status };
  }, { ...defaultOrg, org: { ...defaultOrg.org, id: num(kvGet('at')) }, respStatus: 0 });
  v[0].departs = v[0].departs.filter(d => d.id !== v[0].org.defaultDepart);
  return v;
}
/**使用Context传递的组织信息。 */
export function useOrgFromContext(): DataTuple<OrgInfo> {
  const v = useContext(OrgContext);
  return v;
}
export const OrgContext = createContext<DataTuple<OrgInfo>>(null as any);