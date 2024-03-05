export type ReviewTask = 'review' | {
  type: 'review';
  level?: number;
  count?: number;
};
export type ChooseInterviewTask = 'choose-interview';
export const taskLabel = {
  'choose-interview': '选择面试场次',
  'review': '审批'
} as const;
export type Task = ChooseInterviewTask | ReviewTask;