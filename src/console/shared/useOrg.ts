import { createContext, useContext, useMemo } from 'react';
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
    useDeparts: number; //TODO 解析&使用该属性
  };
  departs: Depart[];
  /**生成此OrgInfo的响应状态码，未请求时为0 */
  respStatus: number;
  defaultDepart: Depart;
};

const defaultOrg = {
  org: { defaultDepart: -1, name: '加载中', useDeparts: 0 },
  departs: [],
  defaultDepart: { id: -1, name: '加载中', createAt: new Date(0).toString() },
};
export function useOrg(): DataTuple<OrgInfo> {
  // adminAt仅在页面加载时刷新
  const adminAt = useMemo(() => num(kvGet('at'), -1), []);
  const v = useData<OrgInfo>(
    '/org',
    async (resp) => {
      const result = resp.status >= 400 ? defaultOrg : await resp.json();
      return { ...result, respStatus: resp.status, defaultDepart: result.departs.find((d: Depart) => d.id === result.org.defaultDepart) };
    },
    { ...defaultOrg, org: { ...defaultOrg.org, id: adminAt }, respStatus: 0 }
  );
  v[0].departs = v[0].departs.filter((d) => d.id !== v[0].org.defaultDepart);
  return v;
}
/**使用Context传递的组织信息。
 *
 * @param includeDefaultDepart 是否包含默认部门，默认false。
 */
export function useOrgFromContext(includeDefaultDepart = false): DataTuple<OrgInfo> {
  let v = useContext(OrgContext);
  if (includeDefaultDepart) v = [{ ...v[0], departs: [v[0].defaultDepart, ...v[0].departs] }, ...(v.slice(1) as any)] as any;
  console.warn('use org context', includeDefaultDepart, v[0]);
  return v;
}
export const OrgContext = createContext<DataTuple<OrgInfo>>(null as any);
