import { Descriptions } from 'antd';
import { useData } from '../../api/useData';
import { FormDetail } from './useForm';
import { num } from '../../utils';
import { getTitle } from '../../shared/FormQuestion';
import { Depart } from './useOrg';
import { ResultDetail } from '../../api/result';
import { useMemo } from 'react';
import { calcRevealGroups } from '../../apply/ApplyForm';


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
  const displayedGroups = useMemo(() => calcRevealGroups(form, content), [form, content]);
  return (<div>
    <Descriptions layout='vertical' size='small'
      column={12} colon={false} bordered
      items={[
        { label: '姓名', children: name, span: 4 },
        { label: '学号', children: zjuId, span: 4 },
        { label: '手机号', children: phone, span: 4 },
        //此处显示逻辑：根据设计时的题目组顺序、题目顺序，显示填写的内容
        ...displayedGroups.map(group =>
          group.children.map(ques => {
            const quesId = ques.id.toString();
            const rawAnswer = content[quesId];
            let renderAnswer: string;
            if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '')
              renderAnswer = '(未填写)';
            else if (ques.type === 'choice-depart')
              renderAnswer = (rawAnswer as string[]).map((v, i) => `[${i + 1}]` + (departs.find(d => d.id === num(v, NaN))?.name ?? '未知部门')).join('\n');
            else renderAnswer = String(rawAnswer);
            return {
              label: `[${group.label}] ${getTitle(ques)}`,
              children: <span style={{ whiteSpace: 'pre-wrap' }}>{renderAnswer}</span>,
              span: isShort(renderAnswer) && isShort(getTitle(ques)) ? 6 : 12
            };
          })
        ).flat().filter(obj => obj !== null),
      ]} />
  </div>);
}

//检测是否可缩小span。让学号、手机号、年级、性别等短文本span更小
function isShort(str: string) {
  return /^[0-9a-zA-Z]{,16}$/.test(str) || (str.length <= 8 && !str.includes('\n'));
}