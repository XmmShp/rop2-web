import { Button, Card, Descriptions, Flex, Space, Table, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { delay, useOrg } from '../../utils';
import { getOrg, getStage } from '../../store';
import { taskLabel } from '../../api/models/task';
import { TempInput, showDrawer, showModal } from '../../shared/LightComponent';
import { message } from '../../App';

export default function OrgManage() {

  return (<Tabs centered
    items={[{
      label: '部门管理',
      children: <DepartManage />
    }, {
      label: '阶段管理',
      children: <StageManage />
    }].map(v => { return { ...v, key: v.label } })} />);
}

function DepartManage() {
  const orgId = useOrg();
  function refreshData(setState = false) {
    const result = getOrg(orgId);
    if (setState) {
      setOrg(result);
      setDeparts(result.children);
    }
    return result;
  }
  const [org, setOrg] = useState(() => refreshData(false));
  const [departs, setDeparts] = useState(org.children);
  return (<Card>
    <Flex vertical gap='small'>
      <Typography.Text>
        组织可以下设<Typography.Text strong>部门</Typography.Text>。
      </Typography.Text>
      <Flex wrap='wrap'>
        <Button icon={<PlusOutlined />} type='primary'
          onClick={() => {
            const vref = { value: '' };
            showModal({
              title: '新建部门',
              content: (<Flex vertical gap='small'><Typography.Text>
                输入新部门的名称:
              </Typography.Text>
                <TempInput vref={vref} showCount maxLength={20} /></Flex>),
              async onConfirm() {
                const newName = vref.value.trim();
                if (!newName) {
                  message.error('名称不能为空');
                  return;
                }
                //TODO
                await delay(500);
                message.success("新建成功");
              },
            });
          }}>新增</Button>
      </Flex>
      <Table title={(d) => `部门列表 (${d.length}项)`} rowKey='id' bordered
        columns={[{
          title: '名称',
          dataIndex: 'name'
        }, {
          title: '操作',
          render(value, record, index) {
            return (<Space size={0}>
              <Button size='small' type='link'
                onClick={() => showDrawer({
                  size: 'large',
                  title: '部门详情',
                  placement: 'right',
                  children: <Descriptions column={3} bordered items={[{
                    label: 'ID',
                    children: record.id,
                    span: 1
                  }, {
                    label: '创建时间',
                    children: record.createdAt.stringify(),
                    span: 2
                  }, {
                    label: '名称',
                    children: record.name,
                    span: 3
                  }, {
                    label: '归属组织',
                    children: org.name,
                    span: 3
                  }]} />
                })}>详情</Button>
              <Button size='small' type='link'
                onClick={() => {
                  const vref = { value: '' };
                  showModal({
                    title: '重命名部门',
                    content: (<Flex vertical gap='small'><Typography.Text>
                      为<Typography.Text underline strong>{record.name}</Typography.Text>指定新名称(须在组织内唯一):
                    </Typography.Text>
                      <TempInput vref={vref} showCount maxLength={20} /></Flex>),
                    async onConfirm() {
                      const newName = vref.value.trim();
                      if (!newName) {
                        message.error('名称不能为空');
                        return;
                      }
                      //TODO
                      await delay(500);
                      message.success("重命名成功");
                    }
                  });
                }}>重命名</Button>
              <Button size='small' danger type='link'
                onClick={() => showModal({
                  title: '删除部门',
                  content: (<Flex vertical gap='small'><Typography.Text>
                    您确定要删除<Typography.Text underline strong>{record.name}</Typography.Text>吗？
                    <br />
                    删除部门也将删除其的所有候选人与面试。
                  </Typography.Text></Flex>),
                  okButtonProps: { danger: true },
                  async onConfirm() {
                    //TODO
                    await delay(500);
                    message.success("删除成功");
                  }
                })}>删除</Button>
            </Space>);
          },
        }]}
        dataSource={departs.filter(({ id }) => id !== org.defaultDepart)}
        pagination={false}
        expandable={{
          rowExpandable() { return false },
          expandIcon() { return <></> }
        }} />
    </Flex >
  </Card>);
}

function StageManage() {
  const orgId = useOrg();
  function refreshData(setState = false) {
    const result = getOrg(orgId).stages;
    if (setState) setStages(result);
    return result;
  }
  const [stages, setStages] = useState(refreshData);
  return (<Card>
    <Flex vertical gap='small'>
      <Typography.Text>
        候选人按顺序完成所在<Typography.Text strong>阶段</Typography.Text>的所有流程后，会自动进入下一阶段。
      </Typography.Text>
      <Flex wrap='wrap'>
        <Button icon={<PlusOutlined />} type='primary'
          onClick={() => {
            const vref = { value: '' };
            showModal({
              title: '新建阶段',
              content: (<Flex vertical gap='small'><Typography.Text>
                输入新阶段的名称:
              </Typography.Text>
                <TempInput vref={vref} showCount maxLength={20} /></Flex>),
              async onConfirm() {
                const newName = vref.value.trim();
                if (!newName) {
                  message.error('名称不能为空');
                  return;
                }
                //TODO
                await delay(500);
                message.success("新建成功");
              },
            });
          }}>新增</Button>
      </Flex>
      <Table title={(d) => `阶段列表 (${d.length}项)`} rowKey='id' bordered columns={[{
        title: '名称',
        dataIndex: 'label'
      }, {
        title: '流程',
        render(value, record, index) {
          return record.tasks.map(v => {
            if (typeof v === 'string') return v;
            return v.type;
          }).map(v => taskLabel[v] ?? '位置').join(', ') || '无';
        }
      }, {
        title: '下一阶段',
        render(value, record, index) {
          if (record.next) return getStage(record.next).label;
          return '无';
        }
      }, {
        title: '操作',
        render(value, record, index) {
          return (<Space size={0}>
            <Button size='small' type='link'
            >管理</Button>
            <Button size='small' danger type='link'
              onClick={() => showModal({
                title: '删除阶段',
                content: (<Flex vertical gap='small'><Typography.Text>
                  您确定要删除<Typography.Text underline strong>{record.label}</Typography.Text>吗？
                  <br />
                  删除阶段也将删除所有该阶段的候选人信息。
                </Typography.Text></Flex>),
                okButtonProps: { danger: true },
                async onConfirm() {
                  //TODO
                  await delay(500);
                  message.success("删除成功");
                }
              })}>删除</Button>
          </Space>);
        }
      }]} dataSource={stages}
        pagination={false}
        expandable={{
          rowExpandable(record) { return false; },
          expandIcon() { return <></>; }
        }} />
    </Flex>
  </Card>);
}
