import { Descriptions } from 'antd';
import { useData } from '../../api/useData';
import { FormDetail, QuestionGroup, ValidQuestion } from './useForm';
import { num } from '../../utils';
import { getTitle } from '../../shared/FormQuestion';
import { Depart } from './useOrg';
import { ResultDetail } from '../../api/result';
import { useMemo } from 'react';
import { calcRevealGroups } from '../../apply/ApplyForm';
import React, { useEffect, useState } from 'react';

/**将问题标题按 `[问题组名] 问题` 格式化 */
export function formatQuestionTitle(group: QuestionGroup, question: ValidQuestion): string {
  return `[${group.label}] ${getTitle(question)}`;
}
/**将部门选择等题目的id答案转换为人类可读字符串 */
export function formatAnswer(question: ValidQuestion, answer: unknown, departs: Depart[], defaultValue = ''): string {
  if (answer === undefined || answer === null || answer === '') return defaultValue;
  else if (question.type === 'choice-depart')
    return (answer as string[])
      .map((v, i) => {
        const answerId = num(v, NaN);
        return `[${i + 1}]` + (departs.find((d) => d.id === answerId)?.name ?? `未知部门(ID: ${v})`);
      })
      .join('\n');
  else return String(answer);
}
export default function ResultDisplay({
  form,
  zjuId,
  departs,
  onDataLoaded,
}: {
  form: FormDetail;
  zjuId: string;
  departs: Depart[];
  onDataLoaded?: (data: { name: string; phone: string; zjuId: string }) => void;
}) {
  const formId = form.id;
  const defaultResult: ResultDetail = { content: {}, name: '加载中', phone: '', zjuId };
  // GET /result API
  // 提供formId和target两个参数，target为以,分隔的学号列表
  const [[{ content, name, phone }]] = useData<ResultDetail[]>(
    '/result',
    async (resp) => {
      const result = await resp.json();
      return result.map((r: any) => {
        return { ...r, content: JSON.parse(r.content) };
      });
    },
    [defaultResult],
    { formId, target: zjuId },
    [formId, zjuId]
  );
  const displayedGroups = useMemo(() => calcRevealGroups(form.children, content), [form, content]);
  useEffect(() => {
    if (onDataLoaded) {
      onDataLoaded({ name, phone, zjuId });
    }
  }, [name, phone, zjuId, onDataLoaded]);
  return (
    <div>
      <Descriptions
        layout="vertical"
        size="small"
        column={12}
        colon={false}
        bordered
        items={[
          { label: '姓名', children: name, span: 4 },
          { label: '学号', children: zjuId, span: 4 },
          { label: '手机号', children: phone, span: 4 },
          //此处显示逻辑：根据设计时的题目组顺序、题目顺序，显示填写的内容
          ...displayedGroups
            .map((group) =>
              group.children.map((ques) => {
                const quesId = ques.id.toString();
                const rawAnswer = content[quesId];
                const renderAnswer = formatAnswer(ques, rawAnswer, departs, '(未填写)');
                return {
                  label: formatQuestionTitle(group, ques),
                  children: <span style={{ whiteSpace: 'pre-wrap' }}>{renderAnswer}</span>,
                  span: isShort(renderAnswer) && isShort(getTitle(ques)) ? 6 : 12,
                };
              })
            )
            .flat()
            .filter((obj) => obj !== null),
        ]}
      />
    </div>
  );
}

//检测是否可缩小span。让学号、手机号、年级、性别等短文本span更小
function isShort(str: string) {
  return /^[0-9a-zA-Z]{,16}$/.test(str) || (str.length <= 8 && !str.includes('\n'));
}
