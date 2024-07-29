import dayjs, { Dayjs } from 'dayjs';
import { DataTuple, useData } from '../../api/useData';
import { useNavigate, useParams } from 'react-router-dom';
import { kvGet, kvSet } from '../../store/kvCache';
import { num } from '../../utils';
import { message } from '../../App';
import { useFormList } from './useFormList';

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
  choices: {
    //选择对应id揭示的问题组
    [departId: string]: Id | null | undefined;
  };
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
  choices: {
    [label: string]: Id | null;
  };
}
export type ValidQuestion = BuiltinQuestion | TextQuestion | ChoiceQuestion;
export interface QuestionGroup {
  id: Id;
  label: string;
  children: ValidQuestion[];
  next?: Id;
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
}
export function useFormId(): Id {
  const [forms] = useFormList();
  const navigate = useNavigate();
  const { formId: paramFormId } = useParams();
  const staticFormId = paramFormId ?? kvGet('form');
  if (!staticFormId) {
    if (forms.length === 0) {
      navigate('/console/form');
      message.error('表单不存在，请新建表单');
      return -1;
    }
    else {
      const latestFormId = forms[0].id;
      kvSet('form', latestFormId.toString());
      message.info('工作表单设置为：' + forms[0].name);
      return latestFormId;
    }
  } else return num(staticFormId);
}
/**获取单个表单详情。支持管理员和候选人两种访问路径。 */
export function useForm(type: 'admin' | 'applicant' = 'admin'): DataTuple<FormDetail> {
  const formId = useFormId();
  const defaultForm = {
    owner: -1,
    id: formId,
    name: '加载中',
    desc: '',
    children: [{ id: 1, label: 'loading', children: [] } satisfies QuestionGroup],
    startAt: null,
    endAt: null
  };
  const navigate = useNavigate();
  // if (formId < 0) {
  //   useEffect(() => {
  //     navigate('/console/form');
  //     message.error('未指定表单，请先选择目前工作表单');
  //   }, []);
  //   return [defaultForm, Promise.resolve(defaultForm), () => { }];
  // } else
  //   //React Hook调用顺序和数量必须恒定
  //   useEffect(() => { }, []);
  const apiPath = type === 'admin' ? '/form/detail' : '/applicant/form';

  const [form, loadPromise, reload] = useData<FormDetail>(apiPath,
    async (resp) => {
      if (resp.status == 404) {
        navigate('/console/form');
        message.error('表单不存在，请新建表单');
        return defaultForm;
      }
      const value = await resp.json();
      value.children = JSON.parse(value.children);
      if (value.startAt) value.startAt = dayjs(value.startAt);
      if (value.endAt) value.endAt = dayjs(value.endAt);
      return value;
    },
    defaultForm,
    { id: formId }, [formId]);
  return [form, loadPromise, reload];
}