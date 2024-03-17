import { Id } from './shared';

export interface Interview {
  /**归属`Depart`的id */
  belongTo: Id;
  label: string;
  stage: Id;
  startAt: Date;
  capacity?: number;
}