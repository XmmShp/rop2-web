import { Flex, Checkbox } from 'antd';
import { useEffect } from 'react';
import { useStoredState } from '../../utils';
import { Id } from './useForm';
import { useOrgFromContext, Depart } from './useOrg';

/**
 * react hook，从localStorage读写部门过滤选项；同时也返回useOrgContext的结果。
 * @param setHook 当部门过滤变化，调用回调
 * @returns
 */
export function useFilterDeparts(setHook?: (newValue: Id[]) => void) {
  const [filterDeparts, setFilterDeparts] = useStoredState<Id[]>([], 'filterDeparts');
  const [orgInfo, orgInfoLoading] = useOrgFromContext();
  const { departs } = orgInfo;
  useEffect(() => {
    //初始化(下载部门信息)后如果没有选择任何部门，自动全选
    if (filterDeparts.length <= 0) {
      if (orgInfoLoading) orgInfoLoading.then(({ departs: deps }) => setFilterDeparts(deps.map((d) => d.id)));
      else setFilterDeparts(departs.map((d) => d.id));
    }
  }, [orgInfoLoading]);
  return [
    filterDeparts,
    (ids: Id[]) => {
      setFilterDeparts(ids);
      setHook?.(ids);
    },
    orgInfo,
    orgInfoLoading,
  ] as const;
}

export function FilterDepartsComponent({ filterDeparts, setFilterDeparts }: { filterDeparts: Id[]; setFilterDeparts: (newValue: Id[]) => void }) {
  const [
    {
      departs: departsWithoutDefault,
      org: { defaultDepart, name: orgName },
    },
  ] = useOrgFromContext();
  const departs = [{ id: defaultDepart, name: orgName }, ...departsWithoutDefault];
  return (
    <Flex wrap="wrap">
      <Checkbox
        checked={filterDeparts.length >= departs.length}
        indeterminate={filterDeparts.length > 0 && filterDeparts.length < departs.length}
        onChange={({ target: { checked } }) => {
          if (checked) setFilterDeparts(departs.map((d) => d.id));
          else setFilterDeparts([]);
        }}
      >
        全选
      </Checkbox>
      <Checkbox.Group
        options={departs.map((d) => {
          return {
            label: d.name,
            value: d.id,
          };
        })}
        value={filterDeparts}
        onChange={setFilterDeparts}
      />
    </Flex>
  );
}
