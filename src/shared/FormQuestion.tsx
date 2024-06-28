import { Flex, Input, Select, Typography } from 'antd';
import { ChoiceDepartQuestion, ValidQuestion } from '../console/shared/useForm';
import './FormQuestion.scss';
import { Depart } from '../console/shared/useOrg';

export type ValueOf<Q extends ValidQuestion> = Q extends { choices: Record<infer K extends string, any> } ? K[] : string;
export default function FormQuestion<Q extends ValidQuestion>({ value, question, departs = [], onChange }
  : {
    value?: ValueOf<Q>, question: Q, departs?: Depart[], onChange?: (value: ValueOf<Q>) => void
  }) {
  return (<Flex className='question' vertical gap='small'>
    {(() => {
      switch (question.type) {
        // case 'name':
        //   return (<>
        //     <Typography.Text>
        //       您的姓名
        //     </Typography.Text>
        //     <Input minLength={2} maxLength={8} required={!question.optional} />
        //   </>);
        // case 'zjuid':
        //   return (<>
        //     <Typography.Text>
        //       您的学号
        //     </Typography.Text>
        //     <Input minLength={6} maxLength={10} inputMode='numeric' type='number' required={!question.optional} />
        //   </>);
        // case 'phone':
        //   return (<>
        //     <Typography.Text>
        //       您的手机号
        //     </Typography.Text>
        //     <Input minLength={11} maxLength={11} inputMode='numeric' type='number' required={!question.optional} />
        //   </>);
        case 'choice-depart':
          {
            const entries = Object.entries(question.choices).filter(([, reveal]) => reveal !== undefined);
            const maxCount = Math.min(question.maxSelection, entries.length);
            return (<>
              <Typography.Text>
                选择部门志愿
              </Typography.Text>
              <Select placeholder={`最多选择 ${maxCount} 项`}
                mode='multiple'
                value={value as ValueOf<ChoiceDepartQuestion>}
                onChange={(v: string[]) => { onChange?.(v as ValueOf<Q>); }}
                options={entries.map(([id, reveal]) => {
                  return {
                    value: id,
                    label: departs.find((d) => d.id.toString() === id)?.name ?? '加载中'
                  };
                })} maxCount={maxCount} />
            </>);
          }
        case 'text':
          return (<>
            <Flex vertical>
              <Typography.Text>
                {question.title}
              </Typography.Text>
              <Typography.Text className='desc'>
                {question.desc ?? ''}
              </Typography.Text>
            </Flex>
            {(() => {
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
            })()}
          </>);
        case 'choice':
          {
            const options = Object.entries(question.choices).filter(([, reveal]) => reveal !== undefined);
            //注意：maxSelection为空表示可以全选
            const maxCount = Math.min(question.maxSelection ?? options.length, options.length);
            const allowMultiple = maxCount > 1;
            return (<>
              <Flex vertical>
                <Typography.Text>
                  {question.title}
                </Typography.Text>
                <Typography.Text className='desc'>
                  {question.desc ?? ''}
                </Typography.Text>
              </Flex>
              <Select className='select' placeholder={allowMultiple ? `最多选择 ${maxCount} 项` : '选择 1 项'}
                value={value as string[]}
                onChange={(v: string[]) => onChange?.(v as ValueOf<Q>)}
                mode={allowMultiple ? 'multiple' : undefined}
                maxCount={allowMultiple ? maxCount : undefined}
                options={options.map(([label, reveal]) => {
                  //TODO 揭示题目组逻辑
                  return { label, value: label };
                })} />
            </>);
          }
        default:
          return (<>此问题暂时无法显示<br />{JSON.stringify(question)}</>);
      }
    })()}
  </Flex>);
}