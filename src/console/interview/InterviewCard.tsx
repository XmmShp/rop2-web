import { Dayjs } from 'dayjs';
import { StepType } from '../result/ResultOverview';

export type InterviewStatusType = keyof typeof InterviewStatus;
export const InterviewStatus = {
  [0]: '默认',
  [10]: '容量无限',
  [20]: '停止报名'
};
export type Interview = {
  id: number;
  form: number;//表单id
  depart: number;
  step: StepType;
  capacity: number;

  location: string;
  startAt: Dayjs;
  endAt: Dayjs;
};

export default function InterviewCard() {
  return (<></>)
}