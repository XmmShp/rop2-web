import { RefObject, createRef, useMemo, useRef, useState } from 'react';
import { useForm } from '../../utils';
import { getForm } from '../../store';
import { Collapse, Flex, Form, Select, Tabs, Tooltip, Typography } from 'antd';
import './FormEdit.scss';
import { QuestionGroup } from '../../api/models/form';
import { DescEditor, PreviewWithEditor } from './PreviewWithEditor';
import { ArrowRightOutlined, LoginOutlined } from '@ant-design/icons';
import QuestionGroupSelect from './QuestionGroupSelect';

export default function FormEdit() {
  const formId = useForm();
  const [form, setForm] = useState(() => getForm(formId));
  const pageRef = useRef<HTMLDivElement>(null);
  const groups: (QuestionGroup & { ref: RefObject<HTMLDivElement> })[] = useMemo(() => form.children.map(g => {
    return { ...g, ref: createRef() };
  }), [form]);
  const [curGroup, setCurGroup] = useState<QuestionGroup | null>(null);

  const editingTitle = useRef(form.name);//由于antd的可编辑文本特性，此处使用useRef而非useState
  return (
    <Flex className='editor'>
      <Flex className='anchor'>
        <Tabs tabPosition='left'
          activeKey={curGroup?.id?.toString() ?? 'header'}
          items={[{
            key: 'header',
            label: <div className='tab header'>表单抬头</div>
          }, ...form.children.map(group => {
            return {
              key: group.id.toString(),
              label: <div className='tab'>{group.label}</div>
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
          }} />
      </Flex>
      <Flex className='page' vertical
        ref={pageRef} onScroll={(ev) => {
          const scrollTop = pageRef.current!.scrollTop;
          const curG = groups.findLast(g => g.ref.current!.offsetTop <= scrollTop) ?? null;
          setCurGroup(curG);
        }}>
        <Form className='form'>
          <Typography.Title editable={{
            onChange(v) { editingTitle.current = v; },
            onEnd() {
              //TODO request API
              setForm({ ...form, name: editingTitle.current });
            }
          }} className='title'>{form.name}</Typography.Title>
          <DescEditor desc={form.desc} onConfirm={(newDesc) => {
            //TODO request API
            setForm({ ...form, desc: newDesc });
          }} />

          {groups.map((group, index) => <GroupCard key={group.id}
            isEntry={form.entry === group.id} group={group} groups={groups}
            onEdit={(newObj) => {
              //TODO request API
              setForm({ ...form, children: form.children.with(index, newObj) });
            }} />)}
        </Form>
      </Flex>
    </Flex >);
}

function GroupCard({ group, isEntry, groups, onEdit }: {
  group: QuestionGroup & { ref: RefObject<HTMLDivElement> };
  groups: QuestionGroup[];
  isEntry: boolean;
  onEdit: (newObj: QuestionGroup) => void
}) {
  const labelRef = useRef(group.label);
  const [questions, setQuestions] = useState(group.children);
  return (<Collapse
    className='group'
    ref={group.ref}
    defaultActiveKey='default'
    collapsible='icon'
    items={[{
      key: 'default',
      label: (<Flex gap='small'
        //此监听用于防止Enter键直接折叠卡片
        //https://github.com/ant-design/ant-design/issues/42503
        onKeyDown={(ev) => ev.stopPropagation()}
      >
        {isEntry ? (<Tooltip trigger='hover'
          title={<>
            此为问卷的入口问题组。
            <br />
            所有候选人都必须完成该问题组。
          </>}>
          <LoginOutlined />
        </Tooltip>) : <></>}
        <Typography.Text editable={{
          onChange(v) { labelRef.current = v },
          onEnd() {
            onEdit({ ...group, label: labelRef.current });
          }
        }}>
          {group.label}
        </Typography.Text>
      </Flex>),
      children: (<Flex vertical gap={'large'}>
        {group.children.map((ques, index) => (
          <PreviewWithEditor key={ques.id}
            question={ques}
            groups={groups}
            thisGroup={group.id}
            onConfirm={(newObj) => {
              //TODO request API
              // setQuestions(questions.with(index, newObj));
              onEdit({ ...group, children: questions.with(index, newObj) });
            }} />
        ))}
        <Flex wrap='wrap' align='center' gap='small'>
          <Tooltip title={<>
            指定须填写的下一个问题组。
            <br />
            相当于无条件的<strong>揭示</strong>另一问题组。
          </>}>
            <Flex gap='small'>
              <ArrowRightOutlined />
              下一问题组
            </Flex>
          </Tooltip>
          <QuestionGroupSelect
            value={group.next ?? null}
            groups={groups}
            thisGroup={group.id}
            onChange={(newGroup) => {
              onEdit({ ...group, next: newGroup ?? undefined })
            }} />
        </Flex>
      </Flex>)
    }]} />);
}