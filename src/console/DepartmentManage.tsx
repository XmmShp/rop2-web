import { Button, Descriptions, Drawer, Flex, Input, Modal, Space, Table, Typography } from 'antd';
import './DepartmentManage.scss';
import { PlusOutlined } from '@ant-design/icons';
import { departs } from '../mockData';
import { useState } from 'react';
import { DescriptionsItemType } from 'antd/es/descriptions';
import { getOrg } from '../store';
import { Department } from '../api/models/org';
import { delay } from '../utils';
import { msg } from '../App';
import LoadableModal from '../LoadableModal';

export default function DepartmentManage() {
  const [detailObj, setDetailObj] = useState<DescriptionsItemType[] | null>(null);
  const [renameObj, setRenameObj] = useState<Department | null>(null);
  const [deleteObj, setDeleteObj] = useState<Department | null>(null);
  return (<Flex className='department' vertical gap='small'>
    <Typography.Text>
      组织可以下设一个或多个<Typography.Text strong>部门</Typography.Text>。
      <br />
      所有组织创建时都具有一个特殊的<Typography.Text strong>默认部门</Typography.Text>，其组织的面试可在整个组织共享。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'>新增</Button>
    </Flex>
    <Table title={(d) => `部门列表 (${d.length}项)`} rowKey='name' bordered columns={[{
      title: '名称',
      dataIndex: 'name'
    }, {
      title: '操作',
      render(value, record, index) {
        return (<Space size='small'>
          <Button size='small' type='link'
            onClick={() => {
              setDetailObj([{
                label: 'ID',
                children: record.id,
                span: 1
              }, {
                label: '创建时间',
                children: new Date(record.createdAt * 1000).stringify(),
                span: 1
              }, {
                label: '名称',
                children: record.name,
                span: 2
              }, {
                label: '归属组织',
                children: getOrg(record.parent).name,
                span: 2
              }]);
            }}>详情</Button>
          <Button size='small' type='link'
            onClick={() => setRenameObj(record)}>重命名</Button>
          <Button size='small' danger type='link'
            onClick={() => setDeleteObj(record)}>删除</Button>
        </Space>);
      },
    }]} dataSource={departs}
      pagination={{ hideOnSinglePage: true }} />
    <DetailDrawer
      onClose={() => setDetailObj(null)}
      detailObj={detailObj} />
    <RenameModal
      onCancel={() => setRenameObj(null)}
      onConfirm={async (obj) => { await delay(2000); setRenameObj(null); }}
      renameObj={renameObj} />
    <DeleteModal
      onCancel={() => setDeleteObj(null)}
      onConfirm={async (obj) => { await delay(2000); setDeleteObj(null); }}
      deleteObj={deleteObj} />
  </Flex >);
}

function DetailDrawer({ detailObj, onClose }: { detailObj: DescriptionsItemType[] | null; onClose: () => void; }) {
  return <Drawer size='large' title='部门详情' placement='right' closable open={Boolean(detailObj)} onClose={onClose}>
    <Descriptions column={2} bordered items={detailObj ?? undefined} />
  </Drawer>;
}

function RenameModal({ renameObj, onConfirm, onCancel }: { renameObj: Department | null, onConfirm: (obj: Department, newName: string) => Promise<void>, onCancel: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  if (!renameObj) {
    if (name)
      setName('');
    return <></>;
  }
  return (<LoadableModal open title='重命名部门'
    okButtonProps={{ disabled: !name }}
    onCancel={onCancel} onOk={async () => {
      setLoading(true);
      await onConfirm(renameObj!, name);
      setLoading(false);
      msg.success('重命名成功');
    }}>
    <Typography.Text>
      为<Typography.Text underline strong>{renameObj.name}</Typography.Text>指定新名称(须在组织内唯一):
    </Typography.Text>
    <Input disabled={loading} value={name} onChange={(ev) => setName((ev.target.value))} showCount maxLength={16} />
  </LoadableModal>);
}

function DeleteModal({ deleteObj, onCancel, onConfirm }: { deleteObj: Department | null, onCancel: () => void, onConfirm: (obj: Department) => Promise<void> }) {
  if (!deleteObj) return <></>;
  return (<LoadableModal open title='删除部门'
    okButtonProps={{ danger: true }} onCancel={onCancel} onOk={async () => {
      await onConfirm(deleteObj);
      msg.success('删除成功');
    }}>
    <Typography.Text>
      您确定要删除<Typography.Text underline strong>{deleteObj.name}</Typography.Text>吗？
    </Typography.Text>
  </LoadableModal>);
}