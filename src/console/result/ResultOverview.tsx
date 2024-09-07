import { Alert, Button, Card, Checkbox, Dropdown, Flex, message, Segmented, Space, Table, Typography } from 'antd';
import { debounce, numSC } from '../../utils';
import { useState } from 'react';
import { useForm } from '../shared/useForm';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import Search from '../shared/Search';
import { useData } from '../../api/useData';
import { ResultDetail, setIntents } from '../../api/result';
import { showDrawer, showModal } from '../../shared/LightComponent';
import ResultDisplay, { formatAnswer, formatQuestionTitle } from '../shared/ResultDisplay';
import { useFilterDeparts, FilterDepartsComponent } from '../shared/FilterDeparts';
import CopyZone from '../../shared/CopyZone';
import dayjs from 'dayjs';
import { stepsWithInterview } from '../interview/InterviewManage';
import { getApi } from '../../api/core';

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
function toCsv(data: string[][]): string {
  return data.map((row) =>
    row.map(
      (cell) =>//用双引号包裹每个值，值中的每个双引号用两个双引号代替
        `"${cell.replace(/"/g, '""')}"`
    ).join(',')
  ).join('\r\n')
}
function downloadBlob(blob: Blob, download: string) {
  const blobUrl = URL.createObjectURL(blob)
  const eleA = document.createElement('a')
  eleA.href = blobUrl
  eleA.download = download
  eleA.style.display = 'hidden'
  document.body.appendChild(eleA)
  eleA.click()
  eleA.remove()
}
export default function ResultOverview() {
  const [offset, setOffset] = useState(0);
  //把指定的函数包装成一个新函数，调用时会重置offset和selectedKeys
  function withResetOffset<F extends (...args: any[]) => any>(f: F): F {
    return function () {
      setOffset(0);
      setSelectedKeys([]);
      return f(...arguments);
    } as any
  }
  const [filterDeparts, setFilterDeparts, { departs, org: { defaultDepart, name: orgName } }, orgInfoLoading]
    = useFilterDeparts(withResetOffset(() => { }));

  //使用表单的问题来生成简历
  const [form] = useForm();

  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('');
  const debouncedSetFilter = debounce(withResetOffset(setFilter), 250);
  const [step, _setStep] = useState<StepType>(0);
  const hasInterview = stepsWithInterview.includes(step as any);
  const [copyPhonesWithoutInterviewOnly, setCopyPhonesWithoutInterviewOnly] = useState(true);
  const setStep = withResetOffset(_setStep);
  type IntentOutline = {
    id: number,
    depart: number,
    order: number,
    interviewTime?: string,
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
    console.log('setIntentsStep', intentIds, step);
    setSelectedKeys([]);
    const msg = (await setIntents(form.id, intentIds, step)).message;
    reload(intentList);
    return msg;
  }

  return (<Card loading={!!orgInfoLoading}>
    <Flex vertical gap='middle'>
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
          <Button onClick={async () => {
            //导出的是志愿(姓名/学号/手机号/部门)+答卷
            //有性能优化空间，但眼下暂不考虑

            /**要查询答卷的学号 */
            const zjuIdsToQuery = new Set()
            /**选中的志愿对象数组(选中id=>选中对象) */
            const selectedIntents = selectedKeys.map(k => {
              const intent = intents.find(i => i.id === k)!
              zjuIdsToQuery.add(intent.zjuId)
              return intent
            })
            /**查询到的答卷 */
            const results = (await (await getApi(
              '/result',
              { formId: form.id, target: [...zjuIdsToQuery].join(',') }
            )).json())
              .map((r: any) => { return { ...r, content: JSON.parse(r.content) } }) as ResultDetail[]

            type Column = { title: string, format(intent: IntentOutline, resultDetail: ResultDetail): string }
            /**生成的csv每列的定义(标题+格式化方法) */
            const cols: Column[] = [
              { title: '学号', format(intent) { return intent.zjuId } },
              { title: '姓名', format(intent) { return intent.name } },
              { title: '手机号', format(intent) { return intent.phone } },
              { title: '志愿部门', format(intent) { return formatIntentDepart(intent) } },
              { title: '面试时间', format(intent) { return formatInterviewTime(intent) } },
              ...form.children.map(
                group => group.children.map(
                  ques => {
                    return {
                      title: formatQuestionTitle(group, ques),
                      format(_: never, resultDetail: ResultDetail) { return formatAnswer(ques, resultDetail.content[ques.id], departs, '') }
                    }
                  }
                )
              ).flat()
            ]

            const finalRows: string[][] = [cols.map(c => c.title)]
            selectedIntents.forEach(
              curIntent => {
                const curResult = results.find(r => r.zjuId === curIntent.zjuId)!
                finalRows.push(cols.map(c => c.format(curIntent, curResult)))
              }
            )

            const csvText = toCsv(finalRows)
            const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]).buffer, csvText], { type: 'text/csv', endings: 'transparent' })
            downloadBlob(blob, `ROP报名表-${dayjs().format('YYYY_MM_DD_HHmm')}.csv`)
          }}>导出CSV</Button>
          <Dropdown.Button type='primary'
            onClick={() => { setIntentsStep(selectedKeys, getNextStep(step)) }}
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
            onClick={() => { setIntentsStep(selectedKeys, rejected) }}
            menu={{
              items: [
                {
                  label: <Button
                    onClick={() => { setIntentsStep(selectedKeys, invalid) }} type='link' size='small' danger>失效</Button>
                }, {
                  label: <Button
                    onClick={() => { setIntentsStep(selectedKeys, initial) }} type='link' size='small' danger>重置至已填表</Button>
                },
              ].map((v, i) => { return { ...v, key: i } })
            }}>
            拒绝
          </Dropdown.Button>
          <Button
            onClick={() =>
              copyPhones(selectedKeys.map(k => {
                const intent = intents.find(i => i.id === k);
                if (copyPhonesWithoutInterviewOnly && hasInterview && intent?.interviewTime)
                  return null;
                return intent?.phone;
              }))}>
            复制手机号
          </Button>
          {hasInterview &&
            <Checkbox disabled={false}
              checked={copyPhonesWithoutInterviewOnly}
              onChange={({ target: { checked: v } }) => setCopyPhonesWithoutInterviewOnly(v)}>
              仅复制无面试者手机号
            </Checkbox>}
          <Button disabled={false} target='_blank' href='https://docs.qq.com/doc/DSGV2U215ZWtWZ3hS'>群发短信指南</Button>
        </Space>
      </DisabledContext.Provider>
      {filterDeparts.length > 1 &&
        <Alert showIcon type='warning' message={`您正在查看来自多个部门的候选人(已选中 ${filterDeparts.length} 个部门)。`} />}
      {filterDeparts.length === 0 &&
        <Alert showIcon type='error' message='您没有选择任何部门，请先选择至少一个部门。' />}
      <Search onChange={({ target: { value } }) => debouncedSetFilter(value)} placeholder='筛选姓名/学号/手机号' />
      <Table
        loading={Boolean(loading)}
        pagination={{
          hideOnSinglePage: false,
          showSizeChanger: true,
          showQuickJumper: true,
          total: filteredCount,//所有页合计
          onShowSizeChange(current, size) {
            setLimit(size);
            setOffset(Math.floor(offset / size) * size);
          },
          onChange(page) { setOffset((page - 1) * limit) },
          current: Math.floor(offset / limit) + 1,
        }}
        dataSource={intents}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
          onChange(selectedRowKeys, selectedRows, info) {
            setSelectedKeys(selectedRowKeys as number[]);
          },
        }}
        rowKey={'id'}
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
            return formatIntentDepart(record);
          },
        }, ...(hasInterview ? [{
          title: '面试时间',
          render(value: never, record: IntentOutline, index: never) {
            return formatInterviewTime(record);
          }
        }] : []), {
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
                onClick={() => { setIntentsStep([record.id], getNextStep(step)) }}
                menu={{
                  items: [{
                    label: <Button
                      onClick={() => { setIntentsStep([record.id], accepted) }}
                      size='small' type='link'>直接录取</Button>
                  },].map((v, i) => { return { ...v, key: i } })
                }}>
                下一阶段
              </Dropdown.Button>
                <Dropdown.Button danger size='small' type='link'
                  onClick={() => { setIntentsStep([record.id], rejected) }}
                  menu={{
                    items: [
                      {
                        label: <Button
                          onClick={() => { setIntentsStep([record.id], invalid) }}
                          size='small' type='link' danger>失效</Button>
                      }, {
                        label: <Button
                          onClick={() => { setIntentsStep([record.id], initial) }}
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
          候选人列表 (本页 {d.length} 项{filter ? ` / 筛选到 ${filteredCount} 项` : ''} / 共 {count} 项)</Space>} />
    </Flex>
  </Card>);

  /**将志愿显示为 `[志愿序号] 部门名` */
  function formatIntentDepart(intent: IntentOutline) {
    const depId = intent.depart;
    const depName = depId === defaultDepart ? orgName : departs.find((d) => d.id === intent.depart)?.name ?? `未知(${depId})`;
    return `[${intent.order}]${depName}`;
  }
  function formatInterviewTime(intent: IntentOutline) {
    if (!intent.interviewTime) return ''
    const time = dayjs(intent.interviewTime);
    return time.format('MM/DD HH:mm');
  }

  async function copyPhones(phones: (string | undefined | null)[]) {
    phones = phones.filter(p => Boolean(p));
    async function copy() {
      const txt = phones.join('\n');
      try {
        await navigator.clipboard.writeText(txt);
        message.success(`复制成功(共 ${phones.length} 项)`);
      } catch {
        showDrawer({
          title: '手动复制', children: <div>
            <Typography.Text>因浏览器限制，请手动复制以下内容：</Typography.Text>
            <CopyZone text={txt} />
          </div>
        });
      }
    }
    if (phones.some((p, i) => phones.indexOf(p, i + 1) >= 0)) {
      showModal({
        title: '发现重复手机号',
        content: <Typography.Text>
          您选择的 {phones.length} 项候选人中存在重复的手机号。
          <br />这可能是选中了多个部门导致的。
          <br />要继续复制吗？(重复的手机号将不做处理)
        </Typography.Text>,
        onConfirm: copy
      });
    } else await copy();
  }
}