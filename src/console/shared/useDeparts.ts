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
  };
  departs: Depart[];
};
export function useDeparts(includeDefaultDepart: boolean = false): [Depart[], Promise<OrgInfo> | null, () => void, OrgInfo] {
  const [orgInfo, loadPromise, reload] = useData<OrgInfo>('/org',
    async (resp) => await resp.json(),
    {
      org: { defaultDepart: -1, name: '加载中' },
      departs: []
    });
  let departs = orgInfo.departs;
  if (!includeDefaultDepart)
    departs = departs.filter(d => d.id !== orgInfo.org.defaultDepart);
  return [departs, loadPromise, reload, orgInfo];
}