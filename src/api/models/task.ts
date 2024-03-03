export type ReviewTask = 'review' | {
  type: 'review';
  level?: number;
  count?: number;
};
export type ChooseInterviewTask = 'choose-interview';
export type Task = ChooseInterviewTask | ReviewTask;