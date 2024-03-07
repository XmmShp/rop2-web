import { RefObject, createRef, useMemo, useRef, useState } from 'react';
import { useForm } from '../../utils';
import { getForm } from '../../store';
import { Collapse, Flex, Input, Tabs, Typography } from 'antd';
import './FormEdit.scss';
import { QuestionGroup } from '../../api/models/form';
import { QuestionEditor } from './QuestionEditor';

export default function FormEdit() {
  const formId = useForm();
  const [form, setForm] = useState(() => getForm(formId));
  const pageRef = useRef<HTMLDivElement>(null);
  const groups: (QuestionGroup & { ref: RefObject<HTMLDivElement> })[] = useMemo(() => form.children.map(g => {
    return { ...g, ref: createRef() };
  }), [form]);
  const [curGroup, setCurGroup] = useState<QuestionGroup | null>(null);
  return (
    <Flex className='editor'>
      <Flex className='anchor'>
        <Tabs tabPosition='left'
          activeKey={curGroup?.id?.toString() ?? 'header'}
          items={[{
            key: 'header',
            label: '标题'
          }, ...form.children.map(group => {
            return {
              key: group.id.toString(),
              label: group.label
            };
          })]}
          onTabClick={(key) => {
            if (key === 'header') {
              pageRef.current?.scrollTo({ top: 0 });
              setCurGroup(null);
            }
            else {
              const group = groups.find(g => g.id.toString() === key)!;
              group.ref.current!.scrollIntoView();
              setCurGroup(group);
            }
          }}
        />
      </Flex>
      <Flex className='page' vertical
        ref={pageRef} onScroll={() => {
          const scrollTop = pageRef.current!.scrollTop;
          const curG = groups.findLast(g => g.ref.current!.offsetTop <= scrollTop) ?? null;
          setCurGroup(curG);
        }}>
        <Flex className='form' vertical>
          <Typography.Title
            id='header' className='title'>{form.name}</Typography.Title>
          <QuestionEditor
            question={
              <Typography.Text
                className='desc'>{form.desc ?? ''}</Typography.Text>
            }
            editor={<Input />} />

          {groups.map((group) => (<Collapse
            className='group' key={group.id}
            ref={group.ref}
            defaultActiveKey='default'
            items={[{
              key: 'default',
              label: group.label,
              children: <Flex vertical gap={'large'}>{group.children.map((ques) => (<Input className='question' key={ques.id}></Input>))}</Flex>
            }]}
          />))}
        </Flex>
      </Flex>
    </Flex >);
}