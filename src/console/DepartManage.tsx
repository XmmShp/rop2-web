import { Button, Card, Descriptions, Flex, Space, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TempInput, showDrawer, showModal } from '../shared/LightComponent';
import { message } from '../App';
import dayjs from 'dayjs';
import { addDepart, deleteDepart, renameDepart } from '../api/depart';
import { useDeparts } from './shared/useDeparts';

export default function DepartManage() {
  const [departs, loadPromise, reload, { org }] = useDeparts(false);
  //考虑到部门数据不多，不做分批查询/翻页
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
                const errMsg = await addDepart(newName);
                if (errMsg) {
                  message.error(errMsg);
                  return;
                }
                message.success("新建成功");
                reload();
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
                    children: dayjs(record.createAt).format('YYYY.MM.DD HH:mm:ss'),
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
                      const errMsg = await renameDepart(record.id, newName);
                      if (errMsg) {
                        message.error(errMsg);
                        return;
                      }
                      message.success("重命名成功");
                      reload();
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
                    const errMsg = await deleteDepart(record.id);
                    if (errMsg) {
                      message.error(errMsg);
                      return;
                    }
                    message.success("删除成功");
                    reload();
                  }
                })}>删除</Button>
            </Space>);
          },
        }]}
        dataSource={departs}
        loading={!!loadPromise}
        pagination={false}
        expandable={{
          rowExpandable() { return false; },
          expandIcon() { return <></>; }
        }} />
    </Flex>
  </Card>);
}
