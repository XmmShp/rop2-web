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
  const defaultResult: ResultDetail = { content: {}, name: '加载中', phone: '' };
  const [{ content, name, phone },] = useData<ResultDetail>('/result', async resp => {
    const result = await resp.json();
    result.content = JSON.parse(result.content);
    return result;
  }, defaultResult, { formId, target: zjuId }, [formId, zjuId]);
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
        //此处显示逻辑：根据设计时的题目组顺序、题目顺序，显示填写的内容
        ...form.children.map(group =>
          group.children.map(ques => {
            const quesId = ques.id.toString();
            if (!(quesId in content)) return null;
            let quesAnswer = String(content[quesId]);
            if (ques.type === 'choice-depart')
              quesAnswer = quesAnswer.split(',').map(v => departs.find(d => d.id === num(v, NaN))?.name ?? '未知部门').join(', ');
            return {
              label: `[${group.label}] ${getTitle(ques)}`,
              children: quesAnswer,
              span: 12
            };
          })
        ).flat().filter(obj => obj !== null),
      ]} />
  </div>);
}