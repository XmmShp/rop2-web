import { Button, Card, Checkbox, Dropdown, Flex, Radio, Segmented, Space, Table, Tooltip } from 'antd';
import { numSC, useStoredState } from '../../utils';
import { Id } from '../../api/models/shared';
import { useOrg } from '../shared/useOrg';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from '../shared/useForm';
import DisabledContext from 'antd/es/config-provider/DisabledContext';

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
  //使用表单的问题来生成简历

  const people = [test_person];
  const intents = [test_intent];
  const results = [test_result];
  let renderList = useMemo(() =>//聚合person intent result信息
    intents.map(intent => {
      const person = people.find((peo) => peo.zjuId === intent.zjuId);
      return {
        ...intent,
        name: person?.name,
        phone: person?.phone,
        depart: departs.find((dep) => dep.id === intent.depart)?.name,
      };
    })
    , [departs, people, intents]);
  //TODO 测试用
  renderList = new Array(15).fill(renderList[0], 0, 15).map((v, i) => {
    return { ...v, zjuId: v.zjuId + i };
  })

  useEffect(() => {//初始化(下载部门信息)后如果没有选择任何部门，自动全选
    if (filterDeparts.length <= 0 && orgInfoLoading)
      orgInfoLoading.then(({ departs: deps }) => setFilterDeparts(deps.map((d) => d.id)))
  }, [orgInfoLoading]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

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
      <Radio.Group defaultValue='independent'>
        <Tooltip title='所有操作仅对显示的志愿部门有效，各部门独立拒绝/录取候选人'>
          <Radio value='independent'>各志愿独立考核</Radio>
        </Tooltip>
        <Tooltip title='拒绝/下一阶段将影响候选人所有志愿；录取至某一志愿时将失效其它志愿'>
          <Radio value='unified'>所有志愿统一考核</Radio>
        </Tooltip>
      </Radio.Group>
      <DisabledContext.Provider value={selectedKeys.length <= 0}>
        <Space size='small'>
          批量操作(已选中<strong>{selectedKeys.length}</strong>项)：
          <Button>导出简历</Button>
          <Dropdown.Button type='primary'
            //TODO
            onClick={console.log}
            menu={{
              items: [
                { label: <Button size='small' type='link'>直接录取</Button> },
              ].map((v, i) => { return { ...v, key: i } })
            }}>
            下一阶段
          </Dropdown.Button>
          <Dropdown.Button danger
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
          <Button onClick={() => setSelectedKeys([])}>取消选择</Button>
        </Space>
      </DisabledContext.Provider>
      <Table
        pagination={{
          hideOnSinglePage: false,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        dataSource={renderList}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
          onChange(selectedRowKeys, selectedRows, info) {
            setSelectedKeys(selectedRowKeys as string[]);
          },
        }}
        rowKey={(obj) => obj.zjuId + '|' + obj.depart}
        columns={[{
          dataIndex: 'name',
          title: '姓名'
        }, {
          dataIndex: 'zjuId',
          title: '学号'
        }, {
          dataIndex: 'phone',
          title: '手机号'
        }, {
          dataIndex: 'depart',
          title: '志愿部门'
        }, {
          title: '单独操作',
          render(value, record) {
            //TODO: 操作区按钮设计&逻辑&API
            return (<Space size={0}>
              <Button size='small' type='link'>查看简历</Button>
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
        bordered title={(d) => `候选人列表 (本页 ${d.length} 项 / 共 ${renderList.length} 项)`} />
    </Flex>
  </Card>);
}