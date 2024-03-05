import { Button, Descriptions, Drawer, Flex, Space, Table } from 'antd';
import './DepartmentManage.scss';
import { PlusOutlined } from '@ant-design/icons';
import { departs } from '../mockData';
import { useState } from 'react';
import { DescriptionsItemType } from 'antd/es/descriptions';
import { getOrg } from '../store';

export default function DepartmentManage() {
  const [detailObj, setDetailObj] = useState<DescriptionsItemType[] | null>(null);
  return (<Flex className='department' vertical gap='small'>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'>新增</Button>
    </Flex>
    <Table rowKey='name' bordered columns={[{
      title: '名称',
      dataIndex: 'name'
    }, {
      title: '操作',
      render(value, record, index) {
        return (<Space size='small'>
          <Button size='small' type='link'
            onClick={() => {
              setDetailObj([{
                label: '归属组织',
                children: getOrg(record.parent).name,
                span: 4
              }, {
                label: '名称',
                children: record.name,
                span: 4
              }, {
                label: '创建时间',
                children: new Date(record.createdAt * 1000).stringify()
              }]);
            }}>详情</Button>
          <Button size='small' type='link'
            onClick={() => {

            }}>重命名</Button>
          <Button size='small' danger type='link'>删除</Button>
        </Space>);
      },
    }]} dataSource={departs}
      pagination={{ hideOnSinglePage: true }} />
    <DetailDrawer detailObj={detailObj} onClose={() => setDetailObj(null)} />
  </Flex >);
}

function DetailDrawer({ detailObj, onClose }: { detailObj: DescriptionsItemType[] | null; onClose?: () => void; }) {
  return <Drawer title='部门详情' placement='right' closable open={Boolean(detailObj)} onClose={onClose}>
    <Descriptions bordered items={detailObj ?? undefined} />
  </Drawer>;
}
