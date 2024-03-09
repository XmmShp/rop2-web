import { type Member } from "./org";
import { Id, Timestamp } from "./shared";

type QuestionType = 'name' | 'zjuid' | 'phone' | 'choice-department' | 'text' | 'choice';
interface Question {
  id: Id;
  type: QuestionType;
  /**是否可选，为空默认必填 */
  optional?: boolean;
}
interface NameQuestion extends Question { type: 'name' }
interface ZJUIdQuestion extends Question { type: 'zjuid' }
interface PhoneQuestion extends Question { type: 'phone' }
export interface ChoiceDepartmentQuestion extends Question {
  type: 'choice-department';
  optional?: false;
  /**最多选择项数，为空则可全选 */
  maxSelection?: number;
  choices: {
    //选择对应id揭示的问题组
    [departmentId: Id]: Id | null | undefined;
  };
}
type BuiltinQuestion = NameQuestion | ZJUIdQuestion | PhoneQuestion | ChoiceDepartmentQuestion;
export interface CustomQuestion extends Question {
  title: string;
  desc?: string;
}
interface TextQuestion extends CustomQuestion {
  type: 'text';
  /**答题时输入框最多拓展到的行数，为空默认为1 */
  maxLine?: number;
}
interface ChoiceQuestion extends CustomQuestion {
  type: 'choice';
  /**最多选择项数，为空则可全选 */
  maxSelection?: number;
  choices: {
    [label: string]: Id | null;
  };
}

export type ValidQuestion = BuiltinQuestion | TextQuestion | ChoiceQuestion;

export interface Form {
  belongTo: Id;
  id: Id;
  name: string;
  desc: string
  children: QuestionGroup[];
  /**首个问题组 */
  entry: Id;
  createAt: Timestamp;
  startAt: Timestamp;
  endAt: Timestamp;
  /**提交后生成的{@link Member.stage} */
  stage: Id;
}

export interface QuestionGroup {
  id: Id;
  label: string;
  children: ValidQuestion[];
  next?: Id;
}

/**表示表单答卷。姓名、zjuid等属性在储存时不做特殊处理，提交时由后端生成{@link Member}关系 */
interface Answer {
  id: Id;
  /**来源{@link Form}的id */
  of: Id;
  data: {
    /**问题答案，对选择题为string[]，对部门志愿为Id[]，其它为string */
    [questionId: Id]: string | string[] | Id[];
  };
  sumbitAt: Timestamp;
}