import { RefObject, createRef, useMemo, useRef, useState } from 'react';
import { useForm } from '../../utils';
import { getForm } from '../../store';
import { Collapse, Flex, Input, Select, Tabs, Tooltip, Typography } from 'antd';
import './FormEdit.scss';
import { QuestionGroup } from '../../api/models/form';
import { QuestionEditor } from './QuestionEditor';
import { ArrowRightOutlined, LoginOutlined } from '@ant-design/icons';
import { Id } from '../../api/models/shared';

export default function FormEdit() {
  const formId = useForm();
  const [form, setForm] = useState(() => getForm(formId));
  const pageRef = useRef<HTMLDivElement>(null);
  const groups: (QuestionGroup & { ref: RefObject<HTMLDivElement> })[] = useMemo(() => form.children.map(g => {
    return { ...g, ref: createRef() };
  }), [form]);
  const [curGroup, setCurGroup] = useState<QuestionGroup | null>(null);

  const editingTitle = useRef(form.name);//由于antd的可编辑文本特性，此处使用useRef而非useState
  const [editingDesc, setEditingDesc] = useState(form.desc);
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
        <Flex className='form' vertical>
          <Typography.Title editable={{
            onChange(v) { editingTitle.current = v; },
            onEnd() {
              //TODO request API
              setForm({ ...form, name: editingTitle.current });
            }
          }} className='title'>{form.name}</Typography.Title>
          <QuestionEditor
            question={
              <Typography.Text className='desc'>
                {form.desc ?? ''}
              </Typography.Text>
            }
            editor={<Input.TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              value={editingDesc}
              onChange={(ev) => { setEditingDesc(ev.target.value) }} />}
            onConfirm={() => {
              //TODO request API
              setForm({ ...form, desc: editingDesc });
            }} />

          {groups.map((group, index) => <GroupCard key={group.id}
            isEntry={form.entry === group.id} group={group} groups={groups}
            onEdit={(newObj) => {
              //TODO request API
              setForm({ ...form, children: form.children.with(index, newObj) });
            }} />)}
        </Flex>
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
  const [nextGroup, setNextGroup] = useState<Id | undefined>(group.next);
  function saveChange() {
    onEdit({ ...group, label: labelRef.current, children: questions, next: nextGroup });
  }
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
        <Typography.Text style={{ flex: '1 0 auto' }} editable={{
          onChange(v) { labelRef.current = v },
          onEnd() { saveChange() }
        }}>
          {group.label}
        </Typography.Text>
      </Flex>),
      children: (<Flex vertical gap={'large'}>
        {group.children.map((ques) => (<Input className='question' key={ques.id}></Input>))}
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
          <Select value={nextGroup ?? -1} popupMatchSelectWidth={false} style={{ minWidth: '6em' }}
            onSelect={(v) => {
              setNextGroup(v);
              saveChange();
            }}
            options={[
              { label: '无', value: -1 },
              ...groups.map(g => {
                return {
                  label: g.label,
                  disabled: g.id === group.id,
                  value: g.id
                };
              })
            ]} />
        </Flex>
      </Flex>)
    }]} />);
}