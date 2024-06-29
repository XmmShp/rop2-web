import { Flex, Form, Input, Select, Typography } from 'antd';
import { ChoiceDepartQuestion, ValidQuestion } from '../console/shared/useForm';
import './FormQuestion.scss';
import { Depart } from '../console/shared/useOrg';

export type ValueOf<Q extends ValidQuestion> = Q extends { choices: Record<infer K extends string, any> } ? K[] : string;
export default function FormQuestion<Q extends ValidQuestion>({ value, question, departs = [], onChange }
  : {
    value?: ValueOf<Q>, question: Q, departs?: Depart[], onChange?: (value: ValueOf<Q>) => void,
  }) {
  const hasDesc = (question as any).desc?.trim().length > 0;
  return <div className={'question-container' + (hasDesc ? ' with-desc' : '')}>
    <Form.Item className='form-item'
      label={'title' in question ? question.title : '选择部门志愿'}
      required={!question.optional} key={question.id}>
      {hasDesc && <Typography.Text type='secondary' className='desc'>
        {(question as any).desc ?? ''}
      </Typography.Text>}
      {
        (() => {
          switch (question.type) {
            case 'choice-depart':
              {
                //null:显示选项，不reveal
                //undefined：隐藏选项
                const departOptions = Object.entries(question.choices).filter(([, reveal]) => reveal !== undefined);
                const maxCount = Math.min(question.maxSelection, departOptions.length);
                return (<Select placeholder={`最多选择 ${maxCount} 项`}
                  mode='multiple'
                  value={value as ValueOf<ChoiceDepartQuestion>}
                  onChange={(v: string[]) => { onChange?.(v as ValueOf<Q>); }}
                  options={departOptions.map(([id, reveal]) => {
                    return {
                      value: id,
                      label: departs.find((d) => d.id.toString() === id)?.name ?? '加载中'
                    };
                  })} maxCount={maxCount} />);
              }
            case 'text':
              const { maxLine } = question;
              if (!maxLine || maxLine <= 1)
                return <Input
                  onInput={({ currentTarget: { value } }) => onChange?.(value as ValueOf<Q>)}
                  value={value} required={!question.optional} />;
              else
                return <Input.TextArea
                  onInput={({ currentTarget: { value } }) => onChange?.(value as ValueOf<Q>)}
                  value={value} required={!question.optional}
                  autoSize={{ minRows: 2, maxRows: maxLine }} />;
            case 'choice':
              {
                const options = Object.entries(question.choices).filter(([, reveal]) => reveal !== undefined);
                //注意：maxSelection为空表示可以全选
                const maxCount = Math.min(question.maxSelection ?? options.length, options.length);
                const allowMultiple = maxCount > 1;
                return (<Select className='select'
                  placeholder={allowMultiple ? `最多选择 ${maxCount} 项` : '选择 1 项'}
                  value={value as string[]}
                  onChange={(v: string[]) => onChange?.(v as ValueOf<Q>)}
                  mode={allowMultiple ? 'multiple' : undefined}
                  maxCount={allowMultiple ? maxCount : undefined}
                  options={options.map(([label, reveal]) => {
                    //TODO 揭示题目组逻辑
                    return { label, value: label };
                  })} />);
              }
            default:
              return (<>此问题暂时无法显示<br />{JSON.stringify(question)}</>);
          }
        })()
      }
    </Form.Item>
  </div>;
}