import { useRef, useState } from 'react';
import { useForm } from '../../utils';
import { getForm } from '../../store';
import { Anchor, Col, Flex, Form, Row, Typography } from 'antd';
import './FormEdit.scss';

export default function FormEdit() {
  const formId = useForm();
  const [form, setForm] = useState(() => getForm(formId));
  const editorRef = useRef<HTMLDivElement>(null);
  return (
    //TODO correctly place anchor
    <Flex className='editor' ref={editorRef}>
      <Anchor className='anchor'
        // getContainer={() => editorRef.current!}
        getCurrentAnchor={() => location.hash}
        items={form.children.map(group => {
          return {
            key: group.id,
            title: group.label,
            href: `#group-${group.id}`
          };
        })} />
      <Flex className='page' vertical>
        <Typography.Title className='title'>{form.name}</Typography.Title>
        <div className='desc'>{form.desc ?? ''}</div>
      </Flex>
    </Flex>);
}