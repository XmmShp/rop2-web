import { createContext, useContext, useEffect, useId, useState } from 'react';
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


type ResponsiveOrgInfo = [OrgInfo, Promise<OrgInfo> | null, () => void];
const defaultOrg = {
  org: { defaultDepart: -1, name: '加载中', useDeparts: 0 },
  departs: []
};
export function useOrgProvider(): ResponsiveOrgInfo {
  const v = useData<OrgInfo>('/org', async (resp) => await resp.json(), defaultOrg);
  v[0].departs = v[0].departs.filter(d => d.id !== v[0].org.defaultDepart);
  return v;
}
export function useOrg(): ResponsiveOrgInfo {
  const v = useContext(OrgContext);
  return v;
}
export const OrgContext = createContext<ResponsiveOrgInfo>(null as any);