import { Button, Card, Dropdown, Flex, message, Segmented, Space, Table, Typography } from 'antd';
import { debounce, numSC } from '../../utils';
import { useState } from 'react';
import { useForm } from '../shared/useForm';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import Search from '../shared/Search';
import { useData } from '../../api/useData';
import { setIntents } from '../../api/result';
import { showDrawer } from '../../shared/LightComponent';
import ResultDisplay from '../shared/ResultDisplay';
import { useFilterDeparts, FilterDepartsComponent } from '../shared/FilterDeparts';
import CopyZone from '../../shared/CopyZone';
import dayjs, { Dayjs } from 'dayjs';

/**所在阶段。1~127=第n阶段(可重命名)； */
export type StepType = number;
const initial = 0;
const accepted = -50;
const rejected = -1;
const invalid = -2;
export const validSteps = [0, 1, 2, -50, -1, -2];
export function getStepLabel(n: number): string {
  const stepLabels: { [k: string]: string } = {
    [-2]: '已失效',
    [-1]: '已拒绝',
    [-50]: '已录取',
    [0]: '已填表'
  };
  return stepLabels[n] ?? `阶段${numSC(n)}`
}
function getNextStep(n: number): number {
  if (n < 0) return n;
  if (n >= 2) return accepted;
  return n + 1;
}
export type Person = { name: string, zjuId: string, phone: string, };
function isStillOpen(startAt: Dayjs | null, endAt: Dayjs | null) {
  const now = dayjs();
  if (startAt && startAt.isAfter(now)) return false;
  if (endAt && endAt.isBefore(now)) return false;
  return true;
}
export default function ResultOverview() {
  const [filterDeparts, setFilterDeparts, { departs, org: { defaultDepart, name: orgName } }, orgInfoLoading] = useFilterDeparts();

  //使用表单的问题来生成简历
  const [form] = useForm('admin');

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('');
  const debouncedSetFilter = debounce(setFilter, 250);
  const [step, setStep] = useState<StepType>(0);
  type IntentOutline = {
    id: number,
    depart: number, order: number,
  } & Person
  type IntentList = { intents: IntentOutline[], count: number, filteredCount: number }
  const [intentList, loading, reload] = useData<IntentList>('/result/intents', async (resp) => {
    return await resp.json();
  }, { intents: [], count: 0, filteredCount: 0 },
    { offset, limit, filter, depart: [...new Set([defaultDepart, ...filterDeparts])].join(','), formId: form.id, step },
    [offset, limit, filter, filterDeparts, form.id, step], defaultDepart > 0)
  const { intents, count, filteredCount } = intentList;

  const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
  async function setIntentsStep(intentIds: number[], step: StepType): Promise<string | undefined> {
    setSelectedKeys([]);
    const msg = (await setIntents(form.id, intentIds, step)).message;
    reload(intentList);
    return msg;
  }

  return (<Card loading={!!orgInfoLoading}>
    <Flex vertical gap='middle'>
      <Typography.Text>表单：{form.name}</Typography.Text>
      <FilterDepartsComponent {...{ departs, filterDeparts, setFilterDeparts }} />
      <Segmented block
        defaultValue={0}
        value={step}
        onChange={setStep}
        options={validSteps.map(n => { return { label: getStepLabel(n), value: n } })} />
      {/* <Radio.Group defaultValue='pend'>
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
      </Radio.Group> */}
      <DisabledContext.Provider value={selectedKeys.length <= 0}>
        <Space size='small'>
          批量操作(已选中<strong>{selectedKeys.length}</strong>项)
          <Button onClick={() => {
            //TODO
          }}>导出简历(TODO)</Button>
          <Dropdown.Button type='primary'
            onClick={() => setIntentsStep(selectedKeys, getNextStep(step))}
            menu={{
              items: [
                {
                  label: <Button
                    onClick={() => setIntentsStep(selectedKeys, accepted)} size='small' type='link'>直接录取</Button>
                },
              ].map((v, i) => { return { ...v, key: i } })
            }}>
            下一阶段
          </Dropdown.Button>
          <Dropdown.Button danger
            onClick={() => setIntentsStep(selectedKeys, rejected)}
            menu={{
              items: [
                {
                  label: <Button
                    onClick={() => setIntentsStep(selectedKeys, invalid)} type='link' size='small' danger>失效</Button>
                }, {
                  label: <Button
                    onClick={() => setIntentsStep(selectedKeys, initial)} type='link' size='small' danger>重置至已填表</Button>
                },
              ].map((v, i) => { return { ...v, key: i } })
            }}>
            拒绝
          </Dropdown.Button>
          <Button
            onClick={async () => {
              const txt = selectedKeys.map(id => intents.find(i => i.id === id)?.phone).join('\n');
              try {
                await navigator.clipboard.writeText(txt);
                message.success('复制成功');
              } catch {
                showDrawer({
                  title: '手动复制', children: <div>
                    <Typography.Text>因浏览器限制，请手动复制以下内容：</Typography.Text>
                    <CopyZone text={txt} />
                  </div>
                })
              }
            }}>复制手机号</Button>
          <Button target='_blank' href='https://docs.qq.com/doc/DSGV2U215ZWtWZ3hS'>发送短信指南</Button>
        </Space>
      </DisabledContext.Provider>
      {isStillOpen(form.startAt, form.endAt) &&
        <Typography.Text>问卷目前尚在开放时间内。开放时间内，候选人可重新提交答卷，重置其所有志愿至"已填表"。请谨慎进行阶段操作。</Typography.Text>}
      <Search onChange={({ target: { value } }) => debouncedSetFilter(value)} placeholder='筛选姓名/学号/手机号' />
      <Table
        loading={!!loading}
        pagination={{
          hideOnSinglePage: false,
          showSizeChanger: true,
          showQuickJumper: true,
          total: count,//所有页合计
          onShowSizeChange(current, size) {
            setLimit(size);
            setOffset(Math.floor(offset / size) * size);
          },
          onChange(page) { setOffset((page - 1) * limit) }
        }}
        dataSource={intents}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
          onChange(selectedRowKeys, selectedRows, info) {
            setSelectedKeys(selectedRowKeys as number[]);
          },
        }}
        rowKey={(obj) => obj.id}
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
          title: '志愿部门',
          render(value, record, index) {
            const depId = record.depart;
            const depName = depId === defaultDepart ? orgName : departs.find((d) => d.id === record.depart)?.name ?? `未知(${depId})`;
            return `[${record.order}]${depName}`;
          },
        }, {
          title: '单独操作',
          render(value, record) {
            return (<Space size={0}>
              <Button size='small' type='link'
                onClick={() => {
                  showDrawer({
                    placement: 'left',
                    size: 'large',
                    title: `${record.name}(${record.zjuId}) 的报名表`,
                    children: <ResultDisplay form={form} zjuId={record.zjuId} departs={departs} />
                  });
                }}
              >查看简历</Button>
              {step >= 0 && <><Dropdown.Button size='small' type='link'
                onClick={() => setIntentsStep([record.id], getNextStep(step))}
                menu={{
                  items: [{
                    label: <Button
                      onClick={() => setIntentsStep([record.id], accepted)}
                      size='small' type='link'>直接录取</Button>
                  },].map((v, i) => { return { ...v, key: i } })
                }}>
                下一阶段
              </Dropdown.Button>
                <Dropdown.Button danger size='small' type='link'
                  onClick={() => setIntentsStep([record.id], rejected)}
                  menu={{
                    items: [
                      {
                        label: <Button
                          onClick={() => setIntentsStep([record.id], invalid)}
                          size='small' type='link' danger>失效</Button>
                      }, {
                        label: <Button
                          onClick={() => setIntentsStep([record.id], initial)}
                          size='small' type='link' danger>重置至已填表</Button>
                      },
                    ].map((v, i) => { return { ...v, key: i } })
                  }}>
                  拒绝
                </Dropdown.Button></>}
            </Space>);
          }
        }]}
        bordered title={(d) => <Space size='small'>
          <Typography.Text strong style={{
            color:
              step === 0 ? 'gray'
                : step > 0 ? '#00b8ff' :
                  step === -50 ? 'green' : 'red'
          }}>{getStepLabel(step)}</Typography.Text>
          候选人列表 (本页 {d.length} 项 / 本页 {new Set(d.map(d => d.zjuId)).size} 人{filter ? ` / 筛选到 ${filteredCount} 项` : ''} / 共 {count} 项)</Space>} />
    </Flex>
  </Card>);
}