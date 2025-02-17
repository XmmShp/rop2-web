import dayjs, { Dayjs } from 'dayjs';
import { DataTuple, useData } from '../../api/useData';
import { useNavigate } from 'react-router-dom';
import { message } from '../../App';
import { OrderedChoices } from '../../shared/FormQuestion';
import { createContext, useContext } from 'react';

export type Id = number;
type QuestionType = 'name' | 'zjuid' | 'phone' | 'choice-depart' | 'text' | 'choice';
interface Question {
  id: Id;
  type: QuestionType;
  /**是否可选，为空默认必填 */
  optional?: boolean;
}
// export interface NameQuestion extends Question { type: 'name'; }
// export interface ZJUIdQuestion extends Question { type: 'zjuid'; }
// export interface PhoneQuestion extends Question { type: 'phone'; }
export interface ChoiceDepartQuestion extends Question {
  type: 'choice-depart';
  optional?: false;
  /**最多选择项数 */
  maxSelection: number;
  choices:
    | {
        //选择对应id揭示的问题组
        [departId: string]: Id | null | undefined;
      }
    | OrderedChoices;
}
export type BuiltinQuestion = ChoiceDepartQuestion;
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
  choices:
    | {
        [label: string]: Id | null;
      }
    | OrderedChoices;
}
export type ValidQuestion = BuiltinQuestion | TextQuestion | ChoiceQuestion;
export interface QuestionGroup {
  id: Id;
  label: string;
  children: ValidQuestion[];
  next?: Id;
  hideSeparator?: boolean;
}

export type FormDetail = {
  owner: number;
  id: number;
  name: string;
  desc: string;
  children: QuestionGroup[];
  /**首个问题组默认为1 */
  startAt: Dayjs | null;
  endAt: Dayjs | null;
};
/**
 * 获取当前表单id。若无法获取，返回-1。
 * @param avoidFormList 是否避免useFormList。一个组件请保持为常量否则Hook报错。
 * @returns
 */
export function useFormId(): Id {
  return useContext(FormIdContext);
}

export const defaultForm = {
  owner: -1,
  id: -1,
  name: '加载中……',
  desc: '',
  children: [{ id: 1, label: 'loading', children: [], hideSeparator: true } satisfies QuestionGroup],
  startAt: null,
  endAt: null,
};
/**以管理员权限获取单个表单详情。 */
export function useForm(): DataTuple<FormDetail> {
  const formId = useFormId();
  //仅有id正确的默认表单
  const defaultFormWithId = { ...defaultForm, id: formId };
  const navigate = useNavigate();

  const [form, loadPromise, reload] = useData<FormDetail>(
    '/form/detail',
    async (resp) => {
      if (resp.status == 404) {
        navigate('/console/form');
        message.error(`表单不存在，可能已被删除(ID:${formId})`);
        return defaultFormWithId;
      }
      const value = await resp.json();
      value.children = JSON.parse(value.children);
      if (value.startAt) value.startAt = dayjs(value.startAt);
      if (value.endAt) value.endAt = dayjs(value.endAt);
      return value;
    },
    defaultFormWithId,
    { id: formId },
    [formId],
    formId > 0
  );
  return [form, loadPromise, reload];
}

export const FormIdContext = createContext<number>(-1);
