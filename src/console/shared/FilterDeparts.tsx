import { Flex, Checkbox } from 'antd';
import { useEffect } from 'react';
import { useStoredState } from '../../utils';
import { Id } from './useForm';
import { useOrgFromContext, Depart } from './useOrg';

export function useFilterDeparts() {
  const [filterDeparts, setFilterDeparts] = useStoredState<Id[]>([], 'filterDeparts');
  const [orgInfo, orgInfoLoading] = useOrgFromContext();
  const { departs } = orgInfo;
  useEffect(() => {//初始化(下载部门信息)后如果没有选择任何部门，自动全选
    if (filterDeparts.length <= 0) {
      if (orgInfoLoading)
        orgInfoLoading.then(({ departs: deps }) => setFilterDeparts(deps.map((d) => d.id)));
      else
        setFilterDeparts(departs.map((d) => d.id));
    }
  }, [orgInfoLoading]);
  return [filterDeparts, setFilterDeparts, orgInfo, orgInfoLoading] as const;
}

export function FilterDepartsComponent({ filterDeparts, setFilterDeparts, departs }: {
  filterDeparts: Id[],
  setFilterDeparts: (newValue: Id[]) => void,
  departs: Depart[]
}) {
  return (departs.length > 0 &&
    //有至少一个部门(默认部门除外)时显示筛选
    <Flex wrap='wrap'>
      <Checkbox checked={filterDeparts.length >= departs.length}
        indeterminate={filterDeparts.length > 0 && filterDeparts.length < departs.length}
        onChange={({ target: { checked } }) => {
          if (checked) setFilterDeparts(departs.map(d => d.id));
          else setFilterDeparts([]);
        }}>全选</Checkbox>
      <Checkbox.Group options={departs.map(d => {
        return {
          label: d.name,
          value: d.id
        };
      })}
        value={filterDeparts}
        onChange={setFilterDeparts} />
    </Flex>);
}