import { Id, Timestamp } from "./shared";

export interface Interview {
  /**归属`Department`的id */
  belongTo: Id;
  label: string;
  stage: Id;
  startAt: Timestamp;
  endAt: Timestamp;
  capacity?: number;
}