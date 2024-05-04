import dayjs, { Dayjs } from 'dayjs';
import { QuestionGroup } from '../../api/models/form';
import { useData } from '../../api/useData';

export type FormDetail = {
  owner: number;
  id: number;
  name: string;
  desc: string;
  children: QuestionGroup[];
  /**首个问题组 */
  entry: number;
  startAt: Dayjs | null;
  endAt: Dayjs | null;
}
/**获取单个表单详情。支持管理员和候选人两种访问路径。 */
export function useForm(formId: number, type: 'admin' | 'applicant' = 'admin'): [FormDetail, Promise<FormDetail> | null, () => void] {
  const apiPath = type === 'admin' ? '/form/detail' : '/applicant/form';
  const [form, loadPromise, reload] = useData<FormDetail>(apiPath,
    async (resp) => {
      const value = await resp.json();
      value.children = JSON.parse(value.children);
      if (value.startAt) value.startAt = dayjs(value.startAt);
      if (value.endAt) value.endAt = dayjs(value.endAt);
      return value;
    },
    {
      owner: -1,
      id: formId,
      name: '加载中',
      desc: '',
      children: [],
      entry: -1,
      startAt: null,
      endAt: null
    },
    { id: formId }, [formId]);
  return [form, loadPromise, reload];
}