import { Card, Checkbox, Flex, Table } from 'antd';
import { useStoredState } from '../../utils';
import { Id } from '../../api/models/shared';
import { useOrg } from '../shared/useOrg';

export default function ResultOverview() {
  const [{ departs }, orgInfoLoading] = useOrg(false);
  const [filterDeparts, setFilterDeparts] = useStoredState<Id[]>(() => {
    if (departs.length === 1) return [departs[0].id];
    else return [];
  }, 'result/filterDeparts');
  return (<Card loading={!!orgInfoLoading}>
    <Flex vertical gap='middle'>
      {departs.length
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
      <Table bordered title={(d) => `候选人列表 (共 ${d.length} 项)`} />
    </Flex>
  </Card>);
}