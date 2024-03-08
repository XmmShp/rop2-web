import { Flex, Input, InputNumber, Radio, Typography } from 'antd';
import { ValidQuestion } from '../api/models/form';
import './FormQuestion.scss';

export default function FormQuestion({ question }
  : { question: ValidQuestion }) {
  switch (question.type) {
    case 'name':
      return (<Flex className='question' vertical gap='small'>
        <Typography.Text>
          您的姓名
        </Typography.Text>
        <Input minLength={2} maxLength={8} required={!question.optional} />
      </Flex>);
    case 'zjuid':
      return (<Flex className='question' vertical gap='small'>
        <Typography.Text>
          您的学号
        </Typography.Text>
        <Input minLength={6} maxLength={10} inputMode='numeric' type='number' required={!question.optional} />
      </Flex>);
    case 'gender':
      return (<Flex className='question gender' vertical gap='small'>
        <Typography.Text>
          您的性别
        </Typography.Text>
        <Radio.Group>
          <Radio value={0}>男</Radio>
          <Radio value={1}>女</Radio>
          <Radio value={101}>保密</Radio>
        </Radio.Group>
      </Flex>);
    case 'phone':
      return (<Flex className='question' vertical gap='small'>
        <Typography.Text>
          您的手机号
        </Typography.Text>
        <Input minLength={11} maxLength={11} inputMode='numeric' type='number' required={!question.optional} />
      </Flex>);
    default:
      return (<Flex>Not supported yet</Flex>);
  }
}