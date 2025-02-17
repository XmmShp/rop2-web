import dayjs, { Dayjs } from 'dayjs';
import { StepType } from '../result/ResultOverview';
import './InterviewList.scss';
import { Depart } from '../shared/useOrg';
import { Button, Empty, Flex } from 'antd';
import { InterviewInfo } from './InterviewInfo';
import { useMemo } from 'react';

export type InterviewStatus = keyof typeof interviewStatus;
export const interviewStatus = {
  [0]: '默认',
  [10]: '容量无限',
  [20]: '停止报名',
};
export type Interview = {
  id: number;

  depart: number;
  step: StepType;
  capacity: number;
  status: InterviewStatus;

  location: string;
  startAt: Dayjs;
  endAt: Dayjs;
  comment?: string;

  usedCapacity: number;
};

export function formatPeriod(startAt: Dayjs, endAt: Dayjs) {
  //假定不跨天
  let result = '';
  if (startAt.year() !== dayjs().year()) result += startAt.year() + '.';
  result += `${startAt.format('M.D HH:mm')} ~ ${endAt.format('HH:mm')}`;
  return result;
}

function formatTimeLeft(startAt: Dayjs, endAt: Dayjs) {
  const now = dayjs();
  if (now.isAfter(endAt)) return '已结束';
  if (now.isAfter(startAt)) return '进行中';
  const hourDiff = startAt.diff(now, 'hour');
  if (hourDiff < 1) return `即将开始`;
  if (hourDiff < 24) return `${hourDiff}小时后开始`;
  return `${startAt.diff(now, 'day')}天${hourDiff % 24}小时后开始`;
}

export default function InterviewList({
  interviews,
  departs,
  links,
  keepOrder = false,
}: {
  interviews: Interview[];
  departs: Depart[];
  orgName?: string;
  links: {
    label: string | ((curInverview: Interview) => string);
    danger?: boolean;
    disabled?: boolean | ((curInterview: Interview) => boolean);
    onClick: (curInterview: Interview) => void;
  }[];
  /**是否保持原有顺序（一般按id升序）显示面试列表。默认按面试开始时间升序显示。 */
  keepOrder?: boolean;
}) {
  const showInterviews = useMemo(() => {
    if (!keepOrder) return interviews.toSorted((a, b) => a.startAt.diff(b.startAt));
    else return interviews;
  }, [interviews, keepOrder]);
  return (
    <div className="interview-list">
      {showInterviews.length ? (
        showInterviews.map((curInterview) => {
          return (
            <Flex vertical key={curInterview.id} className="interview-card">
              <Flex vertical className="info">
                <div className="period">{formatPeriod(curInterview.startAt, curInterview.endAt)}</div>
                <div className="time-left">
                  {formatTimeLeft(curInterview.startAt, curInterview.endAt) + ` (ID: ${curInterview.id})`}
                  {curInterview.status !== 0 && ' (' + (interviewStatus[curInterview.status] ?? `未知状态${curInterview.status}`) + ')'}
                </div>
                <InterviewInfo showUsedCapacity interview={curInterview} departs={departs} />
              </Flex>
              <div className="operations">
                {links.map((link, i) => {
                  let disabled = false;
                  if (typeof link.disabled === 'function') disabled = link.disabled(curInterview);
                  else if (typeof link.disabled === 'boolean') disabled = link.disabled;
                  return (
                    <Button key={i} type="link" size="small" danger={link.danger} disabled={disabled} onClick={() => link.onClick(curInterview)}>
                      {link.label instanceof Function ? link.label(curInterview) : link.label}
                    </Button>
                  );
                })}
              </div>
            </Flex>
          );
        })
      ) : (
        <Flex justify="center" style={{ flexGrow: 1 }}>
          <Empty />
        </Flex>
      )}
    </div>
  );
}
