import { type Member } from "./org";
import { Id, Timestamp } from "./shared";

type QuestionType = 'name' | 'gender' | 'zjuid' | 'phone' | 'choice-department' | 'text' | 'choice';
interface Question {
  id: Id;
  type: QuestionType;
  /**是否可选，为空默认必填 */
  optional?: boolean;
}
interface NameQuestion extends Question { type: 'name' }
interface GenderQuestion extends Question { type: 'gender' }
interface ZJUIdQuestion extends Question { type: 'zjuid' }
interface PhoneQuestion extends Question { type: 'phone' }
interface ChoiceDepartmentQuestion extends Question {
  type: 'choice-department';
  optional?: false;
  /**最多选择项数，为空则可全选 */
  maxSelection?: number;
  choices: {
    department: Id;
    reveal?: Id;
  }[];
}
type BuiltinQuestion = NameQuestion | GenderQuestion | ZJUIdQuestion | PhoneQuestion | ChoiceDepartmentQuestion;
interface CustomQuestion extends Question {
  title: string;
  desc?: string;
}
interface TextQuestion extends CustomQuestion {
  type: 'text';
  maxLine?: number;
  minLength?: number;
  maxLength?: number;
  validate?: string;
}
interface ChoiceQuestion extends CustomQuestion {
  type: 'choice';
  /**最少选择项数，默认为1；如果`optional`为`true`，则可选择0项。 */
  minSelection?: number;
  /**最多选择项数，为空则可全选 */
  maxSelection?: number;
  choices: {
    label: string;
    reveal?: Id;
  }[];
}

type ValidQuestion = BuiltinQuestion | TextQuestion | ChoiceQuestion;

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