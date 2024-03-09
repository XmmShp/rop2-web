import { Flex, Input, Radio, Select, Typography } from 'antd';
import { ValidQuestion } from '../api/models/form';
import './FormQuestion.scss';
import { getDepartment } from '../store';

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
        case 'choice-department':
          const entries = Object.entries(question.choices);
          const maxCount = question.maxSelection ?? entries.length;
          return (<>
            <Typography.Text>
              选择部门志愿 (最多 {maxCount} 项)
            </Typography.Text>
            <Select mode='multiple' options={entries.map(([id, reveal]) => {
              return {
                value: id,
                label: getDepartment(Number(id)).name
              };
            })} maxCount={maxCount} />
          </>);
        default:
          return (<>Not supported yet: {JSON.stringify(question)}</>);
      }
    })()}
  </Flex>);

}