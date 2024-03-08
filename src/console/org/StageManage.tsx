import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Table, Typography } from 'antd';
import { taskLabel } from '../../api/models/task';
import { getOrg, getStage } from '../../store';
import { notImplement, useOrg } from '../../utils';
import { useState } from 'react';

export default function StageManage() {
  const orgId = useOrg();
  function refreshData(setState = false) {
    const result = getOrg(orgId).stages;
    if (setState) setStages(result);
    return result;
  }
  const [stages, setStages] = useState(refreshData);
  return (<Flex vertical gap='small'>
    <Typography.Text>
      组织可以定义多个<Typography.Text strong>阶段</Typography.Text>。
      <br />
      候选人所在的阶段对于每个部门是独立的。
      <br />
      候选人按顺序完成所有流程后，会自动进入下一阶段。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={notImplement}>新增</Button>
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
            onClick={notImplement}>详情</Button>
          <Button size='small' type='link'
            onClick={notImplement}>管理</Button>
          <Button size='small' danger type='link'
            onClick={notImplement}>删除</Button>
        </Space>);
      }
    }]} dataSource={stages}
      pagination={false}
      expandable={{
        rowExpandable(record) { return false },
        expandIcon() { return <></> }
      }} />
  </Flex>);
}