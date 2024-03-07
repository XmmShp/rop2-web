import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, theme } from 'antd';
import { ForwardedRef, ReactNode, forwardRef, useState } from 'react';

function _QuestionEditor({ question, editor, onConfirm }: {
  question: ReactNode,
  editor: ReactNode,
  onConfirm?: () => unknown
}, ref: ForwardedRef<HTMLDivElement>) {
  const [editing, setEditing] = useState(false);
  return <Flex align={editing ? 'flex-end' : 'center'} gap='small' vertical={editing} ref={ref}>
    {editing ?
      <>
        {editor}
        <Flex gap='small' justify='flex-end'>
          <Button
            onClick={() => setEditing(false)}>
            取消
          </Button>
          <Button type='primary'
            onClick={() => {
              setEditing(false);
              onConfirm?.();
            }}>
            确定
          </Button>
        </Flex>

      </>
      : <>
        <Button icon={<EditOutlined />} type='dashed'
          onClick={() => setEditing(true)} />
        {question}
      </>}
  </Flex>
}

export const QuestionEditor = forwardRef(_QuestionEditor);