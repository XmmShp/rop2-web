import { Card, Flex, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useData } from '../../api/useData';
import dayjs from 'dayjs';
import { formatPeriod } from './InterviewList';
import { useForm } from '../shared/useForm';
import { useOrg } from '../shared/useOrg';
import ResultDisplay from '../shared/ResultDisplay';

export default function ScheduleList() {
  const { interviewId } = useParams();
  const [{ startAt, endAt }] = useData('/interview/detail', async (resp) => {
    const obj = await resp.json();
    obj.startAt = dayjs(obj.startAt);
    obj.endAt = dayjs(obj.endAt);
    return obj;
  }, { startAt: dayjs(), endAt: dayjs() } as const, { id: interviewId }, [interviewId]);
  const [scheduledIds] = useData<string[]>('/interview/schedule', async (resp) => resp.json(), [], { id: interviewId }, [interviewId]);
  const [form] = useForm('admin');
  const [{ departs }] = useOrg();
  return (<Card>
    <Flex vertical gap='16px'>
      <Typography.Text>面试[id: {interviewId}] ({formatPeriod(startAt, endAt)})</Typography.Text>
      <Flex vertical gap='12px'>
        {scheduledIds.map((z, i) =>
          <ResultDisplay key={i} form={form} zjuId={z} departs={departs} />
        )}
      </Flex>
    </Flex>
  </Card>)
}