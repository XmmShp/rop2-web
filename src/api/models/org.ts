import { Id, Timestamp, ZJUId } from "./shared";

interface Org {
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

/**表示来源批次，如[2024,1] */
type Batch = [number, number];

/**表示(候选)成员阶段。具体意义(包括N面、实习/正式成员、退休、已拒绝等)可自定义。 */
interface Stage {
  /**定义/管理此阶段的{@link Org}的id */
  owner: Id;
  id: Id;
  label: string;
}

/**表示用户对某一{@link Department}的候选或成员等关系。 */
interface Member {
  zjuid: ZJUId;
  /**关联{@link Department}的id */
  of: Id;
  batch: Batch;
  stage: Stage;
  /**用户最后一次阶段改变的时间 */
  changeAt: Timestamp;
}