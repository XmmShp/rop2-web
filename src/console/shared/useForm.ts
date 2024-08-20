import dayjs, { Dayjs } from 'dayjs';
import { DataTuple, useData } from '../../api/useData';
import { useNavigate, useParams } from 'react-router-dom';
import { kvGet, kvSet } from '../../store/kvCache';
import { num } from '../../utils';
import { message } from '../../App';
import { useFormList } from './useFormList';
import { OrderedChoices } from '../../shared/FormQuestion';

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
  } | OrderedChoices;
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
  } | OrderedChoices;
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
export function useFormId(avoidFormList = false): Id {
  const { formId: paramFormId } = useParams();
  if (avoidFormList) return num(paramFormId, -1);
  const [forms] = useFormList();
  const navigate = useNavigate();
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
/**获取单个表单详情。支持管理员和候选人两种访问路径。
 * 在没有ConsoleLayout包裹时，无法使用useFormList(从而自动设置最新formId)，需设置hasContext为false。
 */
export function useForm(type: 'admin' | 'applicant' = 'admin', hasContext = true): DataTuple<FormDetail> {
  const formId = useFormId(type === 'applicant' || !hasContext);
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
  const apiPath = type === 'admin' ? '/form/detail' : '/applicant/form';

  const [form, loadPromise, reload] = useData<FormDetail>(apiPath,
    async (resp) => {
      if (resp.status == 404) {
        if (type == 'applicant')
          return { ...defaultForm, children: { message: '表单不存在' } };
        navigate('/console/form');
        message.error('表单不存在，可能已被删除');
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