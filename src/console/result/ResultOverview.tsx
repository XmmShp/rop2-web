import { Card, Checkbox, Flex, Segmented, Table } from 'antd';
import { useMemo } from 'react';
import { useForm, useOrg, useStoredState } from '../../utils';
import { getOrg } from '../../store';
import { Id } from '../../api/models/shared';

export default function ResultOverview() {
  const orgId = useOrg();
  const formId = useForm();
  const org = useMemo(() => getOrg(orgId), [orgId]);
  const departs = useMemo(() => {
    const deps = org.children;
    if (deps.length > 1)
      return deps.filter(d => d.id !== org.defaultDepart);
    else
      return deps;
  }, [orgId]);
  const [filterDeparts, setFilterDeparts] = useStoredState<Id[]>(() => {
    if (departs.length === 1) return [departs[0].id];
    else return [];
  }, 'result/filterDeparts');
  const [filterStage, setFilterStage] = useStoredState<Id>(org.stages[0].id, 'result/filterStage');
  return (<Card>
    <Flex vertical gap='middle'>
      {departs.length > 1
        ? <Flex wrap='wrap'>
          <Checkbox checked={filterDeparts.length === departs.length}
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
        </Flex>
        : <></>}

      <Segmented block size='middle'
        value={filterStage}
        onChange={setFilterStage}
        options={org.stages.map((stage) => {
          return {
            label: stage.name,
            value: stage.id
          };
        })} />

      <Table bordered title={(d) => `候选人列表 (共 ${d.length} 项)`} />
    </Flex>
  </Card>);
}