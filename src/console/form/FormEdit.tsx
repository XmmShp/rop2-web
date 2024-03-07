import { RefObject, createRef, useEffect, useMemo, useRef, useState } from 'react';
import { singleMatch, useForm } from '../../utils';
import { getForm } from '../../store';
import { Flex, Tabs, Typography } from 'antd';
import './FormEdit.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionGroup } from '../../api/models/form';

export default function FormEdit() {
  const navigate = useNavigate();
  const formId = useForm();
  const [form, setForm] = useState(() => getForm(formId));
  const pageRef = useRef<HTMLDivElement>(null);
  const groups: (QuestionGroup & { ref: RefObject<HTMLDivElement> })[] = useMemo(() => form.children.map(g => {
    return { ...g, ref: createRef() };
  }), [form]);
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) navigate('#header');
  });
  return (
    <Flex className='editor'>
      <Flex className='anchor'>
        <Tabs tabPosition='left'
          activeKey={hash}
          items={[{
            key: '#header',
            label: '标题'
          }, ...form.children.map(group => {
            return {
              key: `#group-${group.id.toString()}`,
              label: group.label
            };
          })]}
          onTabClick={(key) => {
            navigate(key);
            if (key === '#header')
              pageRef.current?.scrollTo({ top: 0 });
            else {
              const id = singleMatch(key, /#group-(\d+)$/);
              groups.find(g => g.id.toString() === id)?.ref?.current?.scrollIntoView();
            }
          }}
        />
      </Flex>
      <Flex className='page' vertical
        ref={pageRef} onScroll={() => {
          const scrollTop = pageRef.current!.scrollTop;
          const id = groups.findLast(g => g.ref.current!.offsetTop <= scrollTop)?.id;
          if (id) navigate(`#group-${id.toString()}`);
          else navigate('#header');
        }}>
        <Flex className='form' vertical>
          <Typography.Title
            id='header' className='title'
            editable={{ onEnd: (...a) => console.log(a) }}>{form.name}</Typography.Title>
          <div className='desc'>{form.desc ?? ''}</div>
          {groups.map((group) => (<Flex
            className='group' vertical key={group.id}
            ref={group.ref}>
            {group.children.map((ques) => (<div className='question' key={ques.id}>{JSON.stringify(ques)}</div>))}
          </Flex>))}
        </Flex>
      </Flex>
    </Flex >);
}