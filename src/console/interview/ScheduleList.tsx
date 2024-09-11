import { Button, Card, Dropdown, Flex, message, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../api/useData';
import dayjs from 'dayjs';
import { Interview } from './InterviewList';
import { useForm } from '../shared/useForm';
import { useOrgFromContext } from '../shared/useOrg';
import ResultDisplay from '../shared/ResultDisplay';
import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons';
import { createRef } from 'react';
import { addInterviewSchedule, deleteInterviewSchedule } from '../../api/interview';
import { num } from '../../utils';
import { showModal, TempInput } from '../../shared/LightComponent';
import { getStepLabel } from '../result/ResultOverview';
import { InterviewInfo } from './InterviewInfo';

export default function ScheduleList() {
  const { interviewId } = useParams();
  const numIvId = num(interviewId)
  const [scheduledIds, scheduledIdsLoading, reloadScheduledIds] = useData<string[]>('/interview/schedule', async (resp) => resp.json(), [], { id: numIvId }, [interviewId]);
  const [interview] = useData<Interview>('/interview/detail', async (resp) => {
    const obj = await resp.json();
    obj.startAt = dayjs(obj.startAt);
    obj.endAt = dayjs(obj.endAt);
    return obj;
  }, {
    id: numIvId, startAt: dayjs(), endAt: dayjs(),
    depart: NaN, step: NaN, capacity: NaN, status: 0, location: '加载中', usedCapacity: NaN
  } as const, { id: interviewId }, [interviewId]);
  interview.usedCapacity = scheduledIds.length;
  const { step, depart } = interview;
  const [form] = useForm();
  const [{ departs }] = useOrgFromContext();
  const navigate = useNavigate();
  const listRef = createRef<HTMLElement>();
  return (<Card>
    <Flex vertical gap='small'>
      <Button onClick={() => navigate('/console/interview')} style={{ 'alignSelf': 'flex-start' }} icon={<ArrowLeftOutlined />} type='link'>返回</Button>
      <InterviewInfo interview={interview} departs={departs} showUsedCapacity />
      <Space>
        <Button type='primary'
          onClick={() => {
            const range = document.createRange();
            range.selectNode(listRef.current!);
            const windowSelection = window.getSelection();
            windowSelection?.removeAllRanges();
            windowSelection?.addRange(range);
          }}>选中全部</Button>
        受浏览器限制，选中后需自行Ctrl+C复制。
      </Space>
      <Space>
        <Button onClick={() => {
          const vref = { value: '' }
          showModal({
            title: '添加面试者',
            content: (<Flex gap='small' vertical>
              输入要添加的面试者学号：
              <TempInput inputMode='numeric' maxLength={10} showCount vref={vref} />
              <Typography.Text>
                面试者须有
                <Typography.Text strong>{departs.find(d => d.id === depart)?.name
                  ?? `未知部门 (ID: ${depart})`}</Typography.Text>
                的志愿，且该志愿处于
                <Typography.Text strong>{getStepLabel(step)}</Typography.Text>
                中。
              </Typography.Text>
              <Typography.Text>
                如果同阶段同部门下已有另一面试报名，将取消该面试报名，并添加此场面试报名。
              </Typography.Text>
              <Typography.Text>
                管理员添加面试者时，不受面试冻结和人数限制。
              </Typography.Text>
            </Flex>),
            async onConfirm() {
              if (!vref.value) {
                message.error('面试者学号不能为空')
                return false
              }
              await addInterviewSchedule(numIvId, vref.value).msgSuccess('添加面试安排成功')
              reloadScheduledIds()
            },
          })
        }}>添加面试者</Button>
        <Dropdown menu={{
          items: scheduledIds.map(zjuId => {
            return {
              key: zjuId,
              label: zjuId,
              async onClick({ key }: { key: string }) {
                await deleteInterviewSchedule(numIvId, zjuId)
                  .msgSuccess('已移除该面试报名')
                reloadScheduledIds()
              }
            }
          })
        }}><Button>
            <Space>
              删除面试者
              <DownOutlined />
            </Space>
          </Button></Dropdown>
      </Space>
      <Flex ref={listRef} vertical gap='large'>
        {scheduledIds.map((z, i) =>
          <ResultDisplay key={i} form={form} zjuId={z} departs={departs} />
        )}
      </Flex>
    </Flex>
  </Card>)
}