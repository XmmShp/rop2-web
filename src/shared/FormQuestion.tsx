import { Flex, Input, Select, Typography } from 'antd';
import { ValidQuestion } from '../console/shared/useForm';
import './FormQuestion.scss';
import { Depart } from '../console/shared/useOrg';

export default function FormQuestion({ value, question, departs = [], onRevealChange }
  : { value?: string | string[], question: ValidQuestion, departs?: Depart[], onRevealChange?: (revealGroups: number[]) => void }) {
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
                value={value as string[]}
                onChange={(v: string[]) => onRevealChange?.(v.map(v => question.choices[v]).filter((v) => typeof v === 'number'))}
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
                return <Input value={value} required={!question.optional} />;
              else
                return <Input.TextArea value={value} required={!question.optional}
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
                onChange={(v: string[]) => onRevealChange?.(v.map(v => question.choices[v]).filter((v) => typeof v === 'number'))}
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