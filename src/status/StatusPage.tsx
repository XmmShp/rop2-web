import { Flex, Card, Typography, Collapse, Descriptions, message, Skeleton } from "antd";
import { useData } from "../api/useData";
import { Depart } from "../console/shared/useOrg";
import { defaultForm, useForm } from "../console/shared/useForm";
import { kvGet, zjuIdKey } from "../store/kvCache";
import { num, numSC } from "../utils";
import { getStepLabel } from "../console/result/ResultOverview";
import './StatusPage.scss';
import InterviewList, { formatPeriod, Interview } from "../console/interview/InterviewList";
import dayjs, { Dayjs } from "dayjs";
import { pkgPost } from "../api/core";
import { showModal } from "../shared/LightComponent";
import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import CopyZone from "../shared/CopyZone";
import { base64url } from "rfc4648";
import { getLoginRedirectUrl } from "../api/auth";

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
                if (!code) message.success('报名成功~请记得准时参加面试哦！');
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
  useEffect(() => { document.title = `面试选择 - 纳新开放系统` }, [])
  const { formId: paramsformId } = useParams();
  if (!paramsformId) return <>404 Not Found</>;
  const formId = num(paramsformId);

  //这里的form可能已经结束，children无效，但是name等仍然有效
  const [{ owner, name, respStatus }, formLoading] =
    useData<{ name: string, owner: number, respStatus: number }>('/form/detail',
      async (resp) => {
        if (resp.status === 401)
          location.href = getLoginRedirectUrl();
        return { ...(resp.status === 200 ? await resp.json() : defaultForm), respStatus: resp.status };
      }, { ...defaultForm, respStatus: 0 }, { id: formId }, [formId], formId > 0);
  const zjuId = useMemo(() => kvGet(zjuIdKey)!, []);

  //虽然form的实际数据(owner)需要等待useForm加载，但是formId是有效的，故intents获取不需要等待useForm
  const [intents] = useData<Intent[]>('/applicant/status', async (resp) => resp.json(), [], { formId }, [formId]);
  const [departs, departsLoading] = useData<Depart[]>('/applicant/org', (resp) => resp.json(), [], { id: owner }, [owner], !formLoading && owner > 0);
  return (<Flex justify='center' className='status'>
    <Card className='card'>
      {respStatus === 401
        ? <>您需要登录后方可填写表单哦~
          <br /><a href={getLoginRedirectUrl()} target='_self'>如未自动跳转，请点击此处</a></>
        : (formLoading || departsLoading
          ? <Skeleton active loading />
          : (respStatus === 200
            ? <Flex vertical gap='4px'>
              <Typography.Text>您的学号: {zjuId}</Typography.Text>
              <Typography.Text>
                您在 <Typography.Text strong>{name}</Typography.Text> 各志愿的状态：
              </Typography.Text>
              {intents.length
                ? <>
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
                </>
                : <>
                  <Typography.Text>
                    <Typography.Text strong>未找到您在该表单下的报名信息</Typography.Text>。请确认您是否点击了正确的链接(ID: {formId})。
                    <br />如有疑问，请联系您报名的组织的管理员。
                  </Typography.Text>
                </>
              }
            </Flex>
            : (respStatus === 404
              ? <Typography.Title level={4}>表单不存在，请确认链接是否正确(ID: {formId})</Typography.Title>
              : <Typography.Title level={4}>表单加载失败(Status: {respStatus})</Typography.Title>
            )
          )
        )}
    </Card>
  </Flex>);
}