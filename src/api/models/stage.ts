import { Id, Timestamp } from "./shared";
import { Task } from "./task";

/**表示(候选)成员的阶段。具体意义(包括N面、实习/正式成员、退休、已拒绝等)可自定义。 */
export interface Stage {
  /**定义/管理此阶段的{@link Org}的id */
  owner: Id;
  id: Id;
  label: string;
  tasks: Task[];
  /**理想情况下完成{@link tasks}后进入的下一阶段。 */
  next?: Id;
  createAt: Timestamp;
}