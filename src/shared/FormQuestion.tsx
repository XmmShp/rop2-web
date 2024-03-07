import { Flex, Input, Typography } from 'antd';
import { ValidQuestion } from '../api/models/form';

export default function FormQuestion({ question, readonly = false }
  : { question: ValidQuestion, readonly?: boolean }) {
  switch (question.type) {
    case 'name':
      return (<Flex style={{ flex: '1 0 auto' }} vertical gap='small'>
        <Typography.Text  >
          您的姓名
        </Typography.Text>
        <Input readOnly={readonly} required={!question.optional} />
      </Flex>);
    default:
      return (<Flex>Not supported yet</Flex>);
  }
}