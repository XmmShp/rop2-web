import { createContext, useContext, useEffect, useId, useState } from 'react';
import { DataTuple, useData } from '../../api/useData';

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


const defaultOrg = {
  org: { defaultDepart: -1, name: '加载中', useDeparts: 0 },
  departs: []
};
export function useOrgProvider(): DataTuple<OrgInfo> {
  const v = useData<OrgInfo>('/org', async (resp) => await resp.json(), defaultOrg);
  v[0].departs = v[0].departs.filter(d => d.id !== v[0].org.defaultDepart);
  return v;
}
export function useOrg(): DataTuple<OrgInfo> {
  const v = useContext(OrgContext);
  return v;
}
export const OrgContext = createContext<DataTuple<OrgInfo>>(null as any);