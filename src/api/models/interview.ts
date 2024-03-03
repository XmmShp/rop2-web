import { Id, Timestamp } from "./shared";
import { Batch } from "./stage";

export interface Interview {
  /**归属`Department`的id */
  belongTo: Id;
  label: string;
  stage: Id;
  batch: Batch;
  startAt: Timestamp;
  endAt: Timestamp;
  capacity?: number;
}