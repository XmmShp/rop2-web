import { Descriptions } from 'antd';
import { useData } from '../../api/useData';
import { FormDetail } from './useForm';
import { num } from '../../utils';
import { getTitle } from '../../shared/FormQuestion';
import { Depart } from './useOrg';
import { ResultDetail } from '../../api/result';


export default function ResultDisplay({ form, zjuId, departs }: {
  form: FormDetail;
  zjuId: string;
  departs: Depart[];
}) {
  const formId = form.id;
  const defaultResult: ResultDetail = { content: '{}', name: '加载中', phone: '' };
  const [{ content, name, phone },] = useData<ResultDetail>('/result', resp => resp.json(), defaultResult, { formId, target: zjuId }, [formId, zjuId]);
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