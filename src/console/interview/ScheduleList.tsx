import { Button, Card, Flex, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../api/useData';
import dayjs from 'dayjs';
import { formatPeriod } from './InterviewList';
import { useForm } from '../shared/useForm';
import { useOrgFromContext } from '../shared/useOrg';
import ResultDisplay from '../shared/ResultDisplay';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createRef } from 'react';

export default function ScheduleList() {
  const { interviewId } = useParams();
  const [{ startAt, endAt, location, capacity }] = useData('/interview/detail', async (resp) => {
    const obj = await resp.json();
    obj.startAt = dayjs(obj.startAt);
    obj.endAt = dayjs(obj.endAt);
    return obj;
  }, { startAt: dayjs(), endAt: dayjs() } as const, { id: interviewId }, [interviewId]);
  const [scheduledIds] = useData<string[]>('/interview/schedule', async (resp) => resp.json(), [], { id: interviewId }, [interviewId]);
  const [form] = useForm();
  const [{ departs }] = useOrgFromContext();
  const navigate = useNavigate();
  const listRef = createRef<HTMLElement>();
  return (<Card>
    <Flex vertical gap='small'>
      <Button onClick={() => navigate('/console/interview')} style={{ 'alignSelf': 'flex-start' }} icon={<ArrowLeftOutlined />} type='link'>返回</Button>
      <Typography.Text>面试时间：{formatPeriod(startAt, endAt)}</Typography.Text>
      <Typography.Text>面试地点：{location}</Typography.Text>
      <Typography.Text>报名人数：{scheduledIds.length} / {capacity}</Typography.Text>
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
      <Flex ref={listRef} vertical gap='large'>
        {scheduledIds.map((z, i) =>
          <ResultDisplay key={i} form={form} zjuId={z} departs={departs} />
        )}
      </Flex>
    </Flex>
  </Card>)
}