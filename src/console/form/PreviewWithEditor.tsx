import { EditOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Select, Typography } from 'antd';
import { useState } from 'react';
import { ChoiceDepartmentQuestion, QuestionGroup, ValidQuestion } from '../../api/models/form';
import FormQuestion from '../../shared/FormQuestion';
import { getOrg } from '../../store';
import { containsTag, useOrg } from '../../utils';
import { Id } from '../../api/models/shared';

export function QuestionEditor({ question, onChange, groups, thisGroup }:
  { question: ValidQuestion, onChange: (newObj: ValidQuestion) => void, groups: QuestionGroup[], thisGroup: Id }) {
  const org = useOrg();
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
            (newObj as ChoiceDepartmentQuestion).choices ??= {};
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
    {question.type === 'choice-department' &&
      <Flex wrap='wrap' gap='large'>
        {getOrg(org).children.map((dep) => {
          if (containsTag(dep.tag, 'default')) return <></>//默认部门恒不显示
          //对于某一部门，如choices对象上不存在该键(undefined)，则隐藏该部门(不可选择)
          //如为null，表示可选择，不揭示任何问题组
          //否则，为揭示的问题组id
          let reveal = question.choices[dep.id];
          if (reveal === undefined) reveal = -2;
          else if (reveal === null) reveal = -1;
          return (<Flex key={dep.id} gap='small' align='center'>
            {dep.name}
            <Select popupMatchSelectWidth={false} value={reveal} options={[{
              label: '隐藏',
              value: -2
            }, {
              label: '不揭示',
              value: -1
            }, ...groups.map(g => { return { value: g.id, label: g.label, disabled: g.id === thisGroup } })]}
              onChange={(v) => {
                let newValue;
                if (v === -2) newValue = undefined;
                else if (v === -1) newValue = null;
                else newValue = v;
                onChange({ ...question, choices: { ...question.choices, [dep.id]: v } });
              }} />
          </Flex>);
        })}
      </Flex>}
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

export function PreviewWithEditor({ question, onConfirm, groups, thisGroup }: {
  question: ValidQuestion;
  onConfirm: (newObj: ValidQuestion) => void;
  groups: QuestionGroup[];
  thisGroup: Id;
}) {
  const [editing, setEditing] = useState<ValidQuestion | undefined>(undefined);
  const isEditing = typeof editing === 'object';
  return <Flex align={isEditing ? undefined : 'center'} gap='small' vertical={isEditing} >
    {isEditing
      ? <>
        <QuestionEditor thisGroup={thisGroup} groups={groups} question={editing} onChange={(newObj) => setEditing(newObj)} />
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
