import { createRef, forwardRef, useMemo, useRef, useState } from 'react';
import { basename, moveElement, newUniqueLabel, throwArgs } from '../../utils';
import { Button, Collapse, DatePicker, Flex, FloatButton, Grid, Tabs, Tooltip, Typography } from 'antd';
import './FormEdit.scss';
import { QuestionGroup } from '../shared/useForm';
import { DescEditor, PreviewWithEditor } from './PreviewWithEditor';
import { ArrowDownOutlined, ArrowRightOutlined, ArrowUpOutlined, DeleteOutlined, EyeOutlined, LoginOutlined, PlusOutlined } from '@ant-design/icons';
import QuestionGroupSelect from './QuestionGroupSelect';
import { message } from '../../App';
import { showModal } from '../../shared/LightComponent';
import dayjs from 'dayjs';
import { useForm } from '../shared/useForm';
import { editForm } from '../../api/form';
import CopyZone from '../../shared/CopyZone';

export const builtinPhoneQuestion = { type: 'text', title: '您的手机号', maxLine: 1, id: -1 } as const;
export default function FormEdit() {
  const [form, , reloadForm] = useForm('admin');
  const pageRef = useRef<HTMLDivElement>(null);
  const groups = form.children;
  const [curGroupIndex, setCurGroupIndex] = useState(-1);
  const refs = useMemo(() => groups.map(() => createRef<HTMLDivElement>()), [groups]);
  const { lg = false } = Grid.useBreakpoint();

  const editingTitle = useRef(form.name);//由于antd的可编辑文本特性，此处使用useRef而非useState
  return (
    <Flex className='editor'>
      <FloatButton tooltip='预览表单' type='primary' icon={<EyeOutlined />}
        onClick={() => window.open(`${basename}/apply/${form.id}?preview=1`, '_blank')} />
      <Flex className={'anchor' + (lg ? '' : ' hidden')}>
        <Tabs tabPosition='left'
          activeKey={groups[curGroupIndex]?.id?.toString() ?? 'header'}
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
              setCurGroupIndex(-1);
            }
            else {
              const groupIndex = groups.findIndex(g => g.id.toString() === key)!;
              refs[groupIndex].current!.scrollIntoView();
              setCurGroupIndex(groupIndex);
            }
          }} />
      </Flex>
      <Flex className='page' vertical ref={pageRef}
        onScroll={() => {
          const scrollTop = pageRef.current!.scrollTop;
          const alignMargin = 1.2 * 14;//1.2em
          const curG = refs.findLastIndex(r => r.current!.offsetTop <= scrollTop + alignMargin) ?? -1;
          setCurGroupIndex(curG);
        }}>
        <Flex className='form' vertical gap='middle'>
          <Typography.Text type='secondary'>
            您正在编辑问卷。请注意，同一份问卷不支持多人同时编辑。
            <br />
            编辑部分区域时若无保存按钮，可使用回车保存。
            <br />
            报名者的姓名、学号通过浙大统一认证获取，无需在问卷中填写。
            <br />
            侯选人界面中，显示出的题目组相对顺序和设计问卷时保持一致。
            <br />
            候选人正常填表地址：<CopyZone inline text={`${location.origin}${basename}/apply/${form.id}`} />
          </Typography.Text>
          <Tooltip title={<>
            可随时修改开放时间，问卷仅在开放时间内接受提交。
            <br />
            面试等功能不受此处的开放时间影响。
          </>}>
            <Flex vertical>
              <Typography.Text>设置开放时间</Typography.Text>
              <DatePicker.RangePicker showTime
                value={[form.startAt && dayjs(form.startAt), form.endAt && dayjs(form.endAt)]}
                allowEmpty={[true, true]}
                placeholder={['即刻起', '长期有效']}
                minDate={dayjs().add(-7, 'day')}
                maxDate={dayjs().add(3, 'month')}
                onChange={async (value) => {
                  const [start, end] = value ?? [];
                  //unix时间戳<100即为设空
                  const startAt = start ?? dayjs.unix(1);
                  //>2048年即为设空
                  const endAt = end ?? dayjs('2050-01-01T00:00:00.000Z');
                  const prom = editForm(form.id, { startAt, endAt });
                  reloadForm({ ...form, startAt, endAt }, prom);
                  const { code } = await prom;
                  if (!code) message.success('开放时间已保存');
                }} />
            </Flex>
          </Tooltip>
          <Typography.Title level={3} editable={{
            onChange(v) { editingTitle.current = v; },
            async onEnd() {
              const newForm = { ...form, name: editingTitle.current };
              const prom = editForm(form.id, { name: editingTitle.current });
              reloadForm(newForm, prom);
              await prom;
              message.success('标题已保存');
            }
          }} className='title'>{form.name}</Typography.Title>
          <DescEditor desc={form.desc} onConfirm={async (newDesc) => {
            const newForm = { ...form, desc: newDesc };
            const prom = editForm(form.id, { desc: newDesc });
            reloadForm(newForm, prom);
            await prom;
            message.success('简介已保存');
          }} />

          {groups.map((group, index) => <GroupCard key={group.id}
            ref={refs[index]}
            isEntry={1 === group.id} group={group} groups={groups}
            onEdit={async (newObj) => {
              const newChildren = groups.with(index, newObj);
              const newForm = { ...form, children: newChildren };
              const prom = editForm(form.id, { children: JSON.stringify(newChildren) });
              reloadForm(newForm, prom);
              const { code } = await prom;
              if (!code) message.success('修改已保存');
            }}
            onDelete={async () => await showModal({
              title: '删除问题组',
              content: <Typography.Text>
                您确定要删除问题组
                <Typography.Text strong>{group.label}</Typography.Text>
                吗？
                <br />
                删除问题组将删除其包含的所有题目(共 {group.children.length} 题)。
              </Typography.Text>,
              async onConfirm() {
                const newChildren = groups.toSpliced(index, 1);
                const newForm = { ...form, children: newChildren };
                const prom = editForm(form.id, { children: JSON.stringify(newChildren) });
                reloadForm(newForm, prom);
                const { code } = await prom;
                if (!code) message.success('修改已保存');
              }
            })}
            onMove={async (delta) => {
              const newChildren = moveElement(groups, index, delta);
              const newForm = { ...form, children: newChildren };
              const prom = editForm(form.id, { children: JSON.stringify(newChildren) });
              reloadForm(newForm, prom);
              const { code } = await prom;
              if (!code) message.success('修改已保存');
            }}
            //第一个问题组位置固定，不可移动；
            //其它题目组只要不是最前/最后一个(第一个题目组不计)，就可以上移/下移
            showMove={[
              index >= 2, //上移：当前至少是第三个题目组(计入入口题目组)
              index >= 1 && index < groups.length - 1 //下移：不是入口，且不是最后一个
            ]}
          />)}

          <Button type='default' icon={<PlusOutlined />}
            onClick={async () => {
              let maxGroupId = 0;
              groups.forEach(({ id }) => {
                if (id > maxGroupId) maxGroupId = id;
              })
              const newGroup: QuestionGroup = {
                id: maxGroupId + 1,
                children: [],
                label: newUniqueLabel(groups.map(gr => gr.label), '问题组')
              };
              const newChildren = [...groups, newGroup];
              const newForm = { ...form, children: newChildren };
              const prom = editForm(form.id, { children: JSON.stringify(newChildren) });
              reloadForm(newForm, prom);
              const { code } = await prom;
              if (!code) message.success('修改已保存');
            }}>新建题目组</Button>
        </Flex>
      </Flex>
    </Flex >);
}

const GroupCard = forwardRef<HTMLDivElement,
  {
    group: QuestionGroup;
    groups: QuestionGroup[];
    isEntry: boolean;
    onEdit: (newObj: QuestionGroup) => Promise<void>;
    onDelete: () => Promise<boolean>;
    /**上下移问题组 */
    onMove: (delta: number) => Promise<void>;
    showMove: [boolean, boolean]
  }
>(function ({ group, isEntry, groups, onEdit, onDelete, onMove, showMove: [showMoveUp, showMoveDown] }, ref) {
  const labelRef = useRef(group.label);
  const questions = group.children;
  return (<Collapse
    className='group'
    ref={ref}
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
          async onEnd() {
            await onEdit({ ...group, label: labelRef.current });
          }
        }}>
          {group.label}
        </Typography.Text>
        <Button disabled={!showMoveUp} type='link' size='small' icon={<ArrowUpOutlined />}
          onClick={() => onMove(-1)} />
        <Button disabled={!showMoveDown} type='link' size='small' icon={<ArrowDownOutlined />}
          onClick={() => onMove(1)} />
        <Button disabled={isEntry} type='link' size='small' icon={<DeleteOutlined />}
          onClick={() => onDelete()} />
      </Flex>),
      children: (<Flex vertical gap='small'>
        {isEntry && <PreviewWithEditor
          readOnly //每个表单固定的手机号问题，不能编辑
          question={builtinPhoneQuestion}
          groups={groups}
          thisGroup={group.id}
          onConfirm={throwArgs}
          onDelete={throwArgs}
          onMove={throwArgs}
        />}
        {questions.map((ques, index) => (
          <PreviewWithEditor key={ques.id}
            question={ques}
            groups={groups}
            thisGroup={group.id}
            onConfirm={async (newObj) => await onEdit({ ...group, children: questions.with(index, newObj) })}
            onDelete={async () => await onEdit({ ...group, children: questions.toSpliced(index, 1) })}
            onMove={async (delta) => await onEdit({ ...group, children: moveElement(questions, index, delta) })} />
        ))}
        <Flex wrap='wrap' align='center' gap='small'>
          <Button type='primary' icon={<PlusOutlined />}
            onClick={async () => {
              let maxId = 0;
              groups.forEach(gr =>
                gr.children.forEach(({ id }) => {
                  if (id > maxId) maxId = id;
                }));
              await onEdit({ ...group, children: [...questions, { type: 'text', title: '新问题', id: maxId + 1 }] });
            }}>新建问题</Button>
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
});