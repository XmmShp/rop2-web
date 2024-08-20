import { Flex, Form, Input, Select, Typography } from 'antd';
import { ChoiceDepartQuestion, ChoiceQuestion, Id, ValidQuestion } from '../console/shared/useForm';
import './FormQuestion.scss';
import { Depart } from '../console/shared/useOrg';
import { forwardRef, useState } from 'react';

export type OrderedChoices = {
  label: string;
  reveal: Id | null;
}[];

export function parseChoices(choices: (ChoiceDepartQuestion | ChoiceQuestion)['choices']): OrderedChoices {
  if (Array.isArray(choices)) return choices.filter(({ reveal }) => reveal !== undefined)
  else return Object.entries(choices).filter(([_, v]) => v !== undefined).map(([k, v]) => { return { label: k, reveal: v as Id | null } })
}
export function getTitle(question: ValidQuestion) {
  if (question.type === 'choice-depart') return '选择部门志愿';
  return question.title ?? '未知问题';
}
export type ValueOf<Q extends ValidQuestion> = Q extends { choices: Record<infer K extends string, any> } ? K[] : string;
export const FormQuestion = forwardRef(_FormQuestion);
function _FormQuestion<Q extends ValidQuestion>({ value, question, departs = [], onChange }
  : {
    value?: ValueOf<Q>, question: Q, departs?: Depart[], onChange?: (value: ValueOf<Q>) => void,
  }, ref: React.Ref<HTMLDivElement>) {
  const hasDesc = (question as any).desc?.trim().length > 0;
  const [validateStatus, setValidateStatus] = useState<'success' | 'warning' | 'error' | 'validating' | ''>('');
  function validate(newValue: ValueOf<Q>) {
    if (!question.optional)
      setValidateStatus(newValue?.length ? '' : 'error');
  }
  return <div ref={ref} className={'question-container' + (hasDesc ? ' with-desc' : '')}>
    <Form.Item className='form-item' key={question.id}
      label={<Flex vertical className='question'>
        <Typography.Text className='ques-title'>{getTitle(question)}</Typography.Text>
        {hasDesc && <Typography.Text type='secondary' className='desc'>
          {(question as any).desc ?? ''}
        </Typography.Text>}
      </Flex>}
      required={!question.optional}
      validateStatus={validateStatus}
    >
      {
        (() => {
          switch (question.type) {
            case 'choice-depart':
              {
                //null:显示选项，不reveal
                //undefined：隐藏选项
                const departOptions = parseChoices(question.choices);
                const maxCount = Math.min(question.maxSelection, departOptions.length);
                return (<Select placeholder={`最多选择 ${maxCount} 项`}
                  showSearch={false}
                  mode='multiple'
                  value={value as ValueOf<ChoiceDepartQuestion>}
                  onChange={(v: string[]) => {
                    onChange?.(v as ValueOf<Q>);
                    validate(v as ValueOf<Q>);
                  }}
                  options={departOptions.map(({ label: id, }) => {
                    let label = departs.find((d) => d.id.toString() === id)?.name;
                    if (!label) return null;
                    return {
                      value: id,
                      label
                    };
                  }).filter(v => v != null)} maxCount={maxCount} />);
              }
            case 'text':
              const { maxLine } = question;
              if (!maxLine || maxLine <= 1)
                return <Input
                  onInput={({ currentTarget: { value } }) => {
                    onChange?.(value as ValueOf<Q>);
                    validate(value as ValueOf<Q>);
                  }}
                  value={value} required={!question.optional} />;
              else
                return <Input.TextArea
                  onInput={({ currentTarget: { value } }) => {
                    onChange?.(value as ValueOf<Q>);
                    validate(value as ValueOf<Q>);
                  }}
                  value={value} required={!question.optional}
                  autoSize={{ minRows: 2, maxRows: maxLine }} />;
            case 'choice':
              {
                const options = parseChoices(question.choices)
                //注意：maxSelection为空表示可以全选
                const maxCount = Math.min(question.maxSelection ?? options.length, options.length);
                const allowMultiple = maxCount > 1;
                return (<Select className='select'
                  showSearch={false}
                  placeholder={allowMultiple ? `最多选择 ${maxCount} 项` : '选择 1 项'}
                  value={value as string[]}
                  onChange={(v: string[]) => {
                    onChange?.(v as ValueOf<Q>);
                    validate(v as ValueOf<Q>);
                  }}
                  mode={allowMultiple ? 'multiple' : undefined}
                  maxCount={allowMultiple ? maxCount : undefined}
                  options={options.map(({ label }) => { return { label, value: label } })} />);
              }
            default:
              return (<>此问题暂时无法显示<br />{JSON.stringify(question)}</>);
          }
        })()
      }
    </Form.Item>
  </div>;
}