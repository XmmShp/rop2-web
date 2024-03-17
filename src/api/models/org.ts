import { Id, ZJUId } from "./shared";

export interface Org {
  id: Id;
  name: string;
  createdAt: Date;
  defaultDepart: Id;
}

/**表示{@link Org}下设的部门。 */
export interface Depart {
  id: Id;
  /**从属{@link Org}的id */
  parent: Id;
  name: string;
  createdAt: Date;
}

/**表示某一{@link Depart}下的候选人。 */
export interface Candidate {
  id: Id;
  zjuid: ZJUId;
  /**关联{@link Depart}的id */
  of: Id;
  /**来源表单的id */
  origin: Id;
  stage: Id;
  taskResult: (null | Id)[];
  /**用户进入此阶段的时间 */
  enterAt: Date;
  /**下一{@link Candidate}关系的id，不为空表示已进入其它阶段，不在此阶段中显示 */
  next?: Id;
}