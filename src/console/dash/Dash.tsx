import { FundViewOutlined, HourglassOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Flex, Statistic, Typography } from 'antd';
import { useNickname, usePeriod } from '../../utils';
import { useOrgFromContext } from '../shared/useOrg';
import './Dash.scss';
import { useForm } from '../shared/useForm';
import dayjs, { Dayjs } from 'dayjs';
import { useData } from '../../api/useData';
import { getStepLabel, StepType, validSteps } from '../result/ResultOverview';
import { stepsWithInterview } from '../interview/InterviewManage';

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

  const nickname = useNickname();
  const [{ org: { name: orgName } }] = useOrgFromContext();
  const [form] = useForm('admin', true);

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
    const { steps, peopleCount } = await resp.json() as StepStatistics;
    const stepsWithStatistic = [...new Set([...stepsWithInterview, ...validSteps])];
    const newSteps = [
      ...stepsWithStatistic.map(stepId =>
        steps.find(({ id }) => id === stepId)
        ?? { id: stepId, peopleCount: 0, intentsCount: 0, interviewDone: 0, interviewCount: 0 }),
      ...steps.filter(({ id }) => !stepsWithStatistic.includes(id))];
    return { steps: newSteps, peopleCount };
  }, { steps: [], peopleCount: 0 }, { id: form.id }, [form.id]);
  return (<Flex vertical gap='small'>
    <Card>
      <Typography.Text className='welcome'>{greeting}，{nickname}</Typography.Text>
      <br />
      <Typography.Text className='at'>{orgName}</Typography.Text>
    </Card>
    {statisticLoading ? <></>
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
        <Flex wrap='wrap' gap='small'>
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