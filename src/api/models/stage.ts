import { Id } from "./shared";

/**表示来源批次，如[2024,1] */
export type Batch = [number, number];

/**表示(候选)成员阶段。具体意义(包括N面、实习/正式成员、退休、已拒绝等)可自定义。 */
export interface Stage {
  /**定义/管理此阶段的{@link Org}的id */
  owner: Id;
  id: Id;
  label: string;
}