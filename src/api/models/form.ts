import { type Candidate } from "./org";
import { Id } from "./shared";

type QuestionType = 'name' | 'zjuid' | 'phone' | 'choice-depart' | 'text' | 'choice';
interface Question {
  id: Id;
  type: QuestionType;
  /**是否可选，为空默认必填 */
  optional?: boolean;
}
export interface NameQuestion extends Question { type: 'name' }
export interface ZJUIdQuestion extends Question { type: 'zjuid' }
export interface PhoneQuestion extends Question { type: 'phone' }
export interface ChoiceDepartQuestion extends Question {
  type: 'choice-depart';
  optional?: false;
  /**最多选择项数 */
  maxSelection: number;
  choices: {
    //选择对应id揭示的问题组
    [departId: Id]: Id | null | undefined;
  };
}
export type BuiltinQuestion = NameQuestion | ZJUIdQuestion | PhoneQuestion | ChoiceDepartQuestion;
export interface CustomQuestion extends Question {
  title: string;
  desc?: string;
}
export interface TextQuestion extends CustomQuestion {
  type: 'text';
  /**答题时输入框最多拓展到的行数，为空默认为1 */
  maxLine?: number;
}
export interface ChoiceQuestion extends CustomQuestion {
  type: 'choice';
  /**最多选择项数，为空则可全选 */
  maxSelection?: number;
  choices: {
    [label: string]: Id | null;
  };
}

export type ValidQuestion = BuiltinQuestion | TextQuestion | ChoiceQuestion;

export interface Form {
  owner: Id;
  id: Id;
  name: string;
  desc: string
  children: QuestionGroup[];
  /**首个问题组 */
  entry: Id;
  createAt: Date;
  startAt: Date | null;
  endAt: Date | null;
  /**提交后生成的{@link Candidate.stage} */
  enter: Id;
}

export interface QuestionGroup {
  id: Id;
  label: string;
  children: ValidQuestion[];
  next?: Id;
}

/**表示表单答卷。姓名、zjuid等属性在储存时不做特殊处理，提交时由后端生成{@link Candidate}关系 */
export interface Answer {
  id: Id;
  /**来源{@link Form}的id */
  of: Id;
  data: {
    /**问题答案，对选择题为string[]，对部门志愿为Id[]，其它为string */
    [questionId: Id]: string | string[] | Id[];
  };
  sumbitAt: Date;
}