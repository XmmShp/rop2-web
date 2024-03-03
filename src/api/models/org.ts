import { Batch, Stage } from "./stage";
import { Id, Timestamp, ZJUId } from "./shared";

export interface Org {
  id: Id;
  name: string;
  createdAt: Timestamp;
}

/**表示{@link Org}下设的部门。 */
interface Department {
  id: Id;
  /**从属{@link Org}的id */
  parent: Id;
  name: string;
  createdAt: Timestamp;
}

/**表示用户对某一{@link Department}的候选或成员等关系。 */
export interface Member {
  id: Id;
  zjuid: ZJUId;
  /**关联{@link Department}的id */
  of: Id;
  batch: Batch;
  stage: Id;
  taskResult: (null | Id)[];
  /**用户进入此阶段的时间 */
  enterAt: Timestamp;
  /**下一{@link Member}关系的id，不为空表示已进入其它阶段，不在此阶段中显示 */
  next?: Id;
}