import { Descriptions } from 'antd';
import { useData } from '../../api/useData';
import { Person } from '../result/ResultOverview';
import { FormDetail } from './useForm';
import { num } from '../../utils';
import { getTitle } from '../../shared/FormQuestion';
import { Depart } from './useOrg';

export type FullResult = {
  form: number,
  zjuId: string,
  content: string, //json
  createAt: string,
  updateAt: string,
}
export default function ResultDisplay({ form, person: { name, zjuId, phone }, departs }: {
  form: FormDetail;
  person: Person;
  departs: Depart[];
}) {
  const formId = form.id;
  const defaultResult: FullResult = { form: formId, zjuId, content: '{}', createAt: '', updateAt: '' };
  const [[{ content }],] = useData<FullResult[]>('/result', resp => resp.json(), [defaultResult], { formId, target: [zjuId] }, [formId, zjuId]);
  function findQuestion(id: string) {
    const numId = num(id, NaN);
    return form.children.first(group => group.children.first(q => q.id === numId && q));
  }
  return (<div>
    <Descriptions layout='vertical' size='small'
      column={12} colon={false} bordered
      items={[
        { label: '姓名', children: name, span: 4 },
        { label: '学号', children: zjuId, span: 4 },
        { label: '手机号', children: phone, span: 4 },
        ...Object.entries(JSON.parse(content)).map(([id, value]) => {
          const question = findQuestion(id);
          if (!question) return null;
          let children = String(value);
          if (question.type === 'choice-depart')
            children = children.split(',').map(v => departs.find(d => d.id === num(v, NaN))?.name ?? '未知部门').join(', ');
          return {
            label: getTitle(question),
            children,
            span: 12
          };
        }).filter(v => v != null),
      ]} />
  </div>);
}