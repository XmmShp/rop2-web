import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Select, Typography } from 'antd';
import { ForwardedRef, MutableRefObject, ReactNode, forwardRef, useState } from 'react';
import { ChoiceDepartmentQuestion, ValidQuestion } from '../../api/models/form';
import FormQuestion from '../../shared/FormQuestion';

export function QuestionEditor({ question, onChange }:
  { question: ValidQuestion, onChange: (newObj: ValidQuestion) => void }) {
  return (<Flex vertical gap='small'>
    <Flex align='center' gap='small'>
      问题类型
      <Select
        popupMatchSelectWidth={false}
        className='choice-type'
        value={question.type}
        defaultValue={question.type}
        onChange={(v) => {
          const newObj = { ...question, type: v };
          if (newObj.type === 'choice-department')
            (newObj as ChoiceDepartmentQuestion).choices = [];
          onChange(newObj as any);//TODO support other types
        }}
        options={[{
          label: '姓名',
          value: 'name'
        }, {
          label: '学号',
          value: 'zjuid'
        }, {
          label: '性别',
          value: 'gender'
        }, {
          label: '手机号',
          value: 'phone'
        }, {
          label: '部门志愿选择',
          value: 'choice-department'
        }] satisfies {
          label: string;
          value: ValidQuestion['type'];
        }[]} />
    </Flex>
  </Flex>);
}

export function DescEditor({ desc, onConfirm }: { desc: string, onConfirm: (newDesc: string) => void }) {
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const isEditing = typeof editing === 'string';
  return <Flex align={isEditing ? undefined : 'center'} gap='small' vertical={isEditing} >
    {isEditing
      ? <>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          value={editing}
          onChange={(ev) => { setEditing(ev.target.value) }} />
        <Flex gap='small' justify='flex-end'>
          <Button
            onClick={() => setEditing(undefined)}>
            取消
          </Button>
          <Button type='primary'
            onClick={() => {
              onConfirm(editing);
              setEditing(undefined);
            }}>
            确定
          </Button>
        </Flex>
      </>
      : <>
        <Button style={{ flex: '0 0 auto' }}
          icon={<EditOutlined />} type='dashed'
          onClick={() => setEditing(desc)} />
        <Typography.Text className='desc'>
          {desc}
        </Typography.Text>
      </>}
  </Flex>
}

export function PreviewWithEditor({ question, onConfirm }: {
  question: ValidQuestion,
  onConfirm: (newObj: ValidQuestion) => void
}) {
  const [editing, setEditing] = useState<ValidQuestion | undefined>(undefined);
  const isEditing = typeof editing === 'object';
  return <Flex align={isEditing ? undefined : 'center'} gap='small' vertical={isEditing} >
    {isEditing
      ? <>
        <QuestionEditor question={editing} onChange={(newObj) => setEditing(newObj)} />
        <Flex gap='small' justify='flex-end'>
          <Button
            onClick={() => setEditing(undefined)}>
            取消
          </Button>
          <Button type='primary'
            onClick={() => {
              onConfirm(editing);
              setEditing(undefined);
            }}>
            确定
          </Button>
        </Flex>
      </>
      : <>
        <Button style={{ flex: '0 0 auto' }}
          icon={<EditOutlined />} type='dashed'
          onClick={() => setEditing(question)} />
        <FormQuestion question={question} />
      </>}
  </Flex>
}
