import { Flex, Card, Typography, Collapse, Descriptions, message } from "antd";
import { useData } from "../api/useData";
import { Depart } from "../console/shared/useOrg";
import { useForm } from "../console/shared/useForm";
import { kvGet } from "../store/kvCache";
import { numSC } from "../utils";
import { getStepLabel } from "../console/result/ResultOverview";
import './StatusPage.scss';
import InterviewList, { formatPeriod, Interview } from "../console/interview/InterviewList";
import dayjs, { Dayjs } from "dayjs";
import { pkgPost } from "../api/core";
import { showModal } from "../shared/LightComponent";

type Intent = {
  depart: number;
  order: number;
  step: number;
};
function IntentStatus({ intent, formId, depart, departs }: {
  intent: Intent,
  formId: number,
  depart: Depart,
  departs: Depart[]
}) {
  const [ivs, ivsLoading, reloadIvs] = useData<Interview | Interview[]>('/applicant/interview/list',
    async (resp) => {
      const rs = await resp.json();
      function parseTimeInObj<T extends { startAt: string, endAt: string }>(obj: T)
        : Omit<T, 'startAt' | 'endAt'> & { startAt: Dayjs, endAt: Dayjs } {
        return { ...obj, startAt: dayjs(obj.startAt), endAt: dayjs(obj.endAt) };
      }
      if (Array.isArray(rs))
        return rs.map(iv => parseTimeInObj(iv)) as Interview[];
      else
        return parseTimeInObj(rs) as Interview;
    },
    [], { formId, departId: intent.depart }, [formId, intent.depart]);
  const scheduled = !Array.isArray(ivs);//如果返回的不是数组，说明已安排面试，返回的是唯一面试信息
  return (<Flex vertical>
    <Descriptions items={[{
      label: '志愿序号',
      children: intent.order
    }, {
      label: '部门',
      children: depart.name
    }, {
      label: '状态',
      children: getStepLabel(intent.step)
    }]} />
    {scheduled
      ? (<Flex vertical>
        <Typography.Text>您已经在此阶段报名面试。</Typography.Text>
        <Typography.Text>面试时间：{formatPeriod(ivs.startAt, ivs.endAt)}</Typography.Text>
        <Typography.Text>面试地点：{ivs.location}</Typography.Text>
      </Flex>)
      : (ivs.length > 0 ? (<Flex vertical gap='small'>
        <Typography.Text>
          管理员已安排以下面试，请您报名一场。如无合适的面试场次，请联系管理员。
        </Typography.Text>
        <InterviewList interviews={ivs} departs={departs} links={[{
          label: '报名',
          disabled(curInterview) {
            return dayjs().isAfter(curInterview.startAt) || //已经开始
              (curInterview.status === 20) ||//管理员冻结
              (curInterview.status !== 10 && curInterview.usedCapacity >= curInterview.capacity)//容量不足
          },
          async onClick(curInterview) {
            showModal({
              title: '报名面试',
              content: (<Typography.Text>
                确定要报名这场面试吗？
                <br />
                报名后将无法自行取消，如有需要请联系管理员处理。
              </Typography.Text>),
              async onConfirm() {
                //出错了会自己message.error
                const { code } = await pkgPost('/applicant/interview/schedule', { formId, interviewId: curInterview.id });
                if (!code) message.success('报名成功');
                reloadIvs();
              }
            }
            )

          },
        }]} />
      </Flex>) : null)}
  </Flex>)
}

export default function StatusPage() {
  //这里的form可能已经结束，children无效，但是name等仍然有效
  const [form, formLoading] = useForm('applicant', false);
  const { id: formId, owner } = form;

  //虽然form的实际数据(owner)需要等待useForm加载，但是formId是有效的，故intents获取不需要等待useForm
  const [intents] = useData<Intent[]>('/applicant/status', async (resp) => resp.json(), [], { formId }, [formId]);
  const [departs] = useData<Depart[]>('/applicant/org', (resp) => resp.json(), [], { id: owner }, [owner], !formLoading);
  return (<Flex justify='center' className='status'>
    <Card className='card'>
      <Flex vertical gap='4px'>
        <Typography.Text>学号: {kvGet('zjuId')}</Typography.Text>
        <Typography.Text>
          您在 <Typography.Text strong>{form.name}</Typography.Text> 各志愿的状态：
        </Typography.Text>
        <Collapse
          accordion={false} destroyInactivePanel={false}
          collapsible='header'
          items={intents.map(intent => {
            const departId = intent.depart;
            const depart = departs.find(d => d.id === departId);
            if (!depart) return null;
            return {
              label: `【第${numSC(intent.order)}志愿】${depart.name}`, key: departId,
              children: <IntentStatus intent={intent} formId={formId} depart={depart} departs={departs} />,
              forceRender: true,
            };
          }).filter(v => v !== null)} />
      </Flex>
    </Card>
  </Flex>);
}