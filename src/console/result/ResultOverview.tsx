import { Button, Card, Checkbox, Dropdown, Flex, Radio, Segmented, Space, Table } from 'antd';
import { numSC, useStoredState } from '../../utils';
import { Id } from '../../api/models/shared';
import { useOrg } from '../shared/useOrg';
import { useEffect, useMemo } from 'react';
import { useForm } from '../shared/useForm';

/**所在阶段。1~127=第n阶段(可重命名)； */
export type StepType = number;
export type Person = {
  zjuId: string;
  /**真实姓名 */
  name: string;
  phone: string;
};
const test_person = { zjuId: '3230009999', name: '测试', phone: '12300009999' } satisfies Person;
export type Intent = {
  /**姓名、手机号通过zjuid关联的Person获取 */
  zjuId: string;
  depart: Id;
  step: StepType;
};
const test_intent = { zjuId: test_person.zjuId, depart: 2, step: 0 } satisfies Intent;
export type Result = {
  zjuId: string;
  content: { [questionId: string]: string | number[] };
};
const test_result = { zjuId: test_person.zjuId, content: {} } satisfies Result;

export default function ResultOverview() {
  const [{ departs }, orgInfoLoading] = useOrg();
  const [filterDeparts, setFilterDeparts] = useStoredState<Id[]>([], 'result/filterDeparts');
  const [form] = useForm('admin');
  const people = [test_person];
  const intents = [test_intent];
  const results = [test_result];
  const renderList = useMemo(() =>
    intents.map(intent => {
      /**const (
        Invalid  StepType = -2  //已失效，不发送拒信的已拒绝
        Rejected StepType = -1  //已拒绝
        Accepted StepType = -50 //已录取
        Applied  StepType = 0   //已填表，下一阶段为“第一阶段”
      ) */
      return {
        ...intent,
        name: people.find((peo) => peo.zjuId === intent.zjuId)?.name,
        depart: departs.find((dep) => dep.id === intent.depart)?.name,
      };
    })
    , [departs, people, intents]);
  useEffect(() => {
    if (filterDeparts.length <= 0 && orgInfoLoading)
      orgInfoLoading.then(({ departs: deps }) => setFilterDeparts(deps.map((d) => d.id)))
  }, [orgInfoLoading]);
  const stepToStageMap: { [k: number]: string } = {
    [-2]: '已失效',
    [-1]: '已拒绝',
    [-50]: '已录取',
    [0]: '已填表'
  };
  return (<Card loading={!!orgInfoLoading}>
    <Flex vertical gap='middle'>
      {departs.length //当至少有一个部门(除默认部门)才显示部门筛选
        ? <Flex wrap='wrap'>
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
        </Flex>
        : <></>}
      <Segmented block
        defaultValue={0}
        options={[0, 1, 2, -50, -1, -2].map(n => { return { label: stepToStageMap[n] ?? `第${numSC(n)}阶段`, value: n }; })} />
      <Radio.Group defaultValue='pend'>
        <Radio value='instance'>操作立即生效</Radio>
        <Radio value='pend'>操作在确认发送通知后生效</Radio>
      </Radio.Group>
      <Table dataSource={renderList}
        rowKey={(obj) => obj.zjuId + '|' + obj.depart}
        columns={[{
          dataIndex: 'name',
          title: '姓名'
        }, {
          dataIndex: 'zjuId',
          title: '学号'
        }, {
          dataIndex: 'depart',
          title: '部门'
        }, {
          title: '操作',
          render(value, record) {
            //TODO: 操作区按钮设计&逻辑&API
            return (<Space size={0}>
              <Button size='small' type='link'>简历详情</Button>
              <Dropdown.Button size='small' type='link'
                //TODO
                onClick={console.log}
                menu={{
                  items: [
                    { label: <Button size='small' type='link'>直接录取</Button> },
                  ].map((v, i) => { return { ...v, key: i } })
                }}>
                下一阶段
              </Dropdown.Button>
              <Dropdown.Button danger size='small' type='link'
                //TODO
                onClick={console.log}
                menu={{
                  items: [
                    { label: <Button size='small' type='link' danger>失效</Button> },
                    { label: <Button size='small' type='link' danger>删除</Button> },
                  ].map((v, i) => { return { ...v, key: i } })
                }}>
                拒绝
              </Dropdown.Button>
            </Space>);
          }
        }]}
        bordered title={(d) => `候选人列表 (共 ${d.length} 项)`} />
    </Flex>
  </Card>);
}