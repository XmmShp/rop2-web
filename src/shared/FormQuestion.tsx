import { Flex, Input, Select, Typography } from 'antd';
import { ValidQuestion } from '../api/models/form';
import './FormQuestion.scss';
import { getDepart } from '../store';

export default function FormQuestion({ question }
  : { question: ValidQuestion }) {
  return (<Flex className='question' vertical gap='small'>
    {(() => {
      switch (question.type) {
        case 'name':
          return (<>
            <Typography.Text>
              您的姓名
            </Typography.Text>
            <Input minLength={2} maxLength={8} required={!question.optional} />
          </>);
        case 'zjuid':
          return (<>
            <Typography.Text>
              您的学号
            </Typography.Text>
            <Input minLength={6} maxLength={10} inputMode='numeric' type='number' required={!question.optional} />
          </>);
        case 'phone':
          return (<>
            <Typography.Text>
              您的手机号
            </Typography.Text>
            <Input minLength={11} maxLength={11} inputMode='numeric' type='number' required={!question.optional} />
          </>);
        case 'choice-depart':
          {
            const entries = Object.entries(question.choices).filter(([, reveal]) => reveal !== undefined);
            const maxCount = question.maxSelection ?? entries.length;
            return (<>
              <Typography.Text>
                选择部门志愿
              </Typography.Text>
              <Select placeholder={`最多选择 ${maxCount} 项`}
                mode='multiple'
                options={entries.map(([id, reveal]) => {
                  return {
                    value: id,
                    label: getDepart(Number(id)).name
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
                return <Input required={!question.optional} />;
              else
                return <Input.TextArea required={!question.optional}
                  autoSize={{ minRows: 2, maxRows: maxLine }} />;
            })()}
          </>);
        case 'choice':
          {
            const options = Object.entries(question.choices).filter(([, reveal]) => reveal !== undefined);
            //注意：maxSelection为空表示可以全选
            const maxCount = question.maxSelection ?? options.length;
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
              <Select placeholder={allowMultiple ? `最多选择 ${maxCount} 项` : '选择 1 项'}
                mode={allowMultiple ? 'multiple' : undefined}
                maxCount={allowMultiple ? maxCount : undefined}
                options={options.map(([label, reveal]) => {
                  //TODO 揭示题目组逻辑
                  return { label, value: label };
                })} />
            </>);
          }
        default:
          return (<>此问题暂时无法显示 {JSON.stringify(question)}</>);
      }
    })()}
  </Flex>);
}