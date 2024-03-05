import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Table, Typography } from 'antd';
import { stages } from '../mockData';
import { taskLabel } from '../api/models/task';

export default function StageManage() {
  return (<Flex style={{ padding: '.4em 1em' }} vertical gap='small'>
    <Typography.Text>
      组织可以自行定义多个<Typography.Text strong>阶段</Typography.Text>。
      <br />
      候选人所在的阶段对于每个部门是独立的。
      <br />
      表单可以指定一个关联阶段，候选人提交后，将自动进入该阶段。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={undefined}>新增</Button>
    </Flex>
    <Table title={(d) => `阶段列表 (${d.length}项)`} rowKey='name' bordered columns={[{
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
      title: '操作',
      render(value, record, index) {
        return (<Space size={0}>
          <Button size='small' type='link'
            onClick={() => { }}>详情</Button>
          <Button size='small' type='link'
            onClick={() => { }}>重命名</Button>
          <Button size='small' danger type='link'
            onClick={() => { }}>删除</Button>
        </Space>);
      }
    }]} dataSource={stages}
      pagination={{ hideOnSinglePage: true }} />
  </Flex>);
}