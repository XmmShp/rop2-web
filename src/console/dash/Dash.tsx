import { FundViewOutlined, HourglassOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Flex, Skeleton, Statistic, Typography } from 'antd';
import { useNickname, usePeriod } from '../../utils';
import { useOrgFromContext } from '../shared/useOrg';
import './Dash.scss';
import dayjs, { Dayjs } from 'dayjs';
import { useData } from '../../api/useData';
import { getStepLabel, StepType, validSteps } from '../result/ResultOverview';
import { stepsWithInterview } from '../interview/InterviewManage';
import { FormListContext } from '../ConsoleLayout';
import { useContext, useMemo } from 'react';
import { defaultForm, useFormId } from '../shared/useForm';
import { message } from '../../App';

function padZero(n: number): string { return Math.floor(n).toFixed(0).padStart(2, '0'); }
function countdownText(now: Dayjs, futureMoment: Dayjs): string {
  const secondsLeft = futureMoment.diff(now, 'second');
  const secondsInADay = 60 * 60 * 24;
  const daysLeft = Math.floor(secondsLeft / secondsInADay);
  if (daysLeft <= 0)
    return `${padZero(secondsLeft / 3600)}:${padZero(secondsLeft % 3600 / 60)}:${padZero(secondsLeft % 60)}`;
  else return `${daysLeft}天${Math.floor(secondsLeft % secondsInADay / 3600)}小时`;
}
/**获取倒计时文本，本组件不会自行刷新。 */
function CountdownStatistic({ startAt, endAt }: { startAt: Dayjs | null, endAt: Dayjs | null }) {
  const now = dayjs();
  if (startAt && startAt.isAfter(now)) //如果startAt不存在，等同已开始
    return <Statistic title='距离报名开始' value={countdownText(now, startAt)} prefix={<HourglassOutlined />} />
  if (endAt)
    if (endAt?.isAfter(now))
      return <Statistic title='距离报名结束' value={countdownText(now, endAt)} prefix={<HourglassOutlined />} />
    else
      return <Statistic title='报名状态' value='已结束' />
}
export default function Dash() {
  usePeriod(1);
  const hour = new Date().getHours();
  let greeting;
  if (hour <= 5 || hour >= 22) greeting = '夜深了';
  else if (hour <= 7) greeting = '早上好';
  else if (hour <= 11) greeting = '上午好';
  else if (hour <= 13) greeting = '中午好';
  else if (hour <= 18) greeting = '下午好';
  else greeting = '晚上好';
  const [fromList] = useContext(FormListContext);
  const formId = useFormId();
  const form = useMemo<{ id: number, name: string, startAt: Dayjs | null, endAt: Dayjs | null }>(() => {
    const findResult = fromList.find(({ id }) => id === formId);
    if (!findResult) return defaultForm;
    if (findResult.startAt) findResult.startAt = dayjs(findResult.startAt) as any;
    if (findResult.endAt) findResult.endAt = dayjs(findResult.endAt) as any;
    return {
      ...findResult,
      startAt: findResult.startAt ? dayjs(findResult.startAt) : null,
      endAt: findResult.endAt ? dayjs(findResult.endAt) : null
    };
  }, [fromList, formId]);

  const nickname = useNickname();
  const [{ org: { name: orgName } }] = useOrgFromContext();

  type StepStatistics = {
    steps: {
      id: StepType;
      peopleCount: number;
      intentsCount: number;
      interviewDone: number;
      interviewCount: number;
    }[],
    peopleCount: number
  };
  const [{ steps, peopleCount }, statisticLoading] = useData<StepStatistics>('/form/statistic', async (resp) => {
    if (resp.status === 404 || resp.status === 403) {
      message.error(`表单不存在(ID: ${formId})`);
      return { steps: [], peopleCount: 0 };
    }
    const { steps, peopleCount } = await resp.json() as StepStatistics;
    const stepsWithStatistic = [...new Set([...stepsWithInterview, ...validSteps])];
    const newSteps = [
      ...stepsWithStatistic.map(stepId =>
        steps.find(({ id }) => id === stepId)
        ?? { id: stepId, peopleCount: 0, intentsCount: 0, interviewDone: 0, interviewCount: 0 }),
      ...steps.filter(({ id }) => !stepsWithStatistic.includes(id))];
    return { steps: newSteps, peopleCount };
  }, { steps: [], peopleCount: 0 }, { id: formId }, [formId], formId > 0);
  return (<Flex vertical gap='small'>
    <Card>
      <Typography.Text className='welcome'>{greeting}，{nickname}</Typography.Text>
      <br />
      <Typography.Text className='at'>{orgName}</Typography.Text>
    </Card>
    {statisticLoading
      ? <Skeleton active loading />
      : (<>
        <Card>
          <Flex vertical gap='small'>
            <Flex wrap='wrap' gap='large'>
              <Statistic title='表单名称' value={form.name} />
              {/**总人数不能用各阶段求和。可能有候选人多个志愿处于不同的状态。 */}
              <Statistic title='报名人数' value={peopleCount} prefix={<TeamOutlined />} />
              <Statistic title='志愿合计' value={steps.reduce((acc, cur) => acc + cur.intentsCount, 0)} />
            </Flex>
            <Flex wrap='wrap' gap='large'>
              <CountdownStatistic startAt={form.startAt} endAt={form.endAt} />
            </Flex>
          </Flex>
        </Card>
        <Flex wrap='wrap' gap='small' align='flex-start'>
          {steps.map(
            ({ id, peopleCount, intentsCount, interviewDone, interviewCount }) =>
            (<Card key={id}>
              <Flex vertical gap='small'>
                <Flex wrap='wrap' gap='large'>
                  <Statistic title='阶段' value={getStepLabel(id)} />
                  <Statistic title='待定人数' value={peopleCount} prefix={<TeamOutlined />} />
                  <Statistic title='待定志愿' value={intentsCount} />
                </Flex>
                {interviewCount == 0 && !stepsWithInterview.some(v => v === id) ? <></>//目前没有安排面试的阶段不显示面试信息
                  : <Flex wrap='wrap' gap='large'>
                    <Statistic title='已完成面试 / 面试总场数' value={`${interviewDone} / ${interviewCount}`} prefix={<FundViewOutlined />} />
                  </Flex>}
              </Flex>
            </Card>)
          )}
        </Flex>
      </>)}
  </Flex>);
}