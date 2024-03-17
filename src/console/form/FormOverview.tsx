import { PlusOutlined } from '@ant-design/icons';
import { Flex, Typography, Button, Table, Space, Card } from 'antd';
import { delay, useOrg } from '../../utils';
import { useState } from 'react';
import Search from '../shared/Search';
import { getOrg, setStore } from '../../store';
import { showModal } from '../../shared/LightComponent';
import { message } from '../../App';
import { useNavigate } from 'react-router-dom';

export default function FormOverview() {
  const orgId = useOrg();
  function refreshData(setState = false) {
    const result = getOrg(orgId).forms;
    if (setState) setForms(result);
    return result;
  }
  const [forms, setForms] = useState(refreshData);
  const [filtered, setFiltered] = useState(forms);
  const navigate = useNavigate();
  return (<Card>
    <Flex vertical gap='small'>
      <Typography.Text>
        组织的每批纳新对应一个<Typography.Text strong>表单</Typography.Text>。
      </Typography.Text>
      <Flex wrap='wrap'>
        <Button icon={<PlusOutlined />} type='primary'
        >新增</Button>
      </Flex>
      <Search onChange={({ target: { value: search } }) => setFiltered(forms.filter(v => v.name.includes(search)))} />
      <Table title={(d) => `表单列表 (${d.length}项)`} rowKey='id' bordered columns={[{
        title: '名称',
        dataIndex: 'name'
      }, {
        title: '创建时间',
        render(value, record, index) {
          return record.createAt.stringify(true, true);
        },
      }, {
        title: '开放时间',
        render(value, record, index) {
          return record.createAt.stringify(true, true) + ' ~ ' + record.createAt.stringify(true, true);
        },
      }, {
        title: '操作',
        render(value, record, index) {
          return (<Space size={0}>
            <Button size='small' type='link'
              onClick={() => {
                setStore('form', record.id.toString());
                navigate('/console/form/edit');
              }} >编辑</Button>
            <Button size='small' type='link'
              onClick={() => {
                setStore('form', record.id.toString());
                navigate('/console/result');
              }} >结果</Button>
            <Button size='small' type='link'>复制</Button>
            <Button size='small' danger type='link'
              onClick={() => showModal({
                title: '删除表单',
                content: (<Flex vertical gap='small'><Typography.Text>
                  您确定要删除<Typography.Text underline strong>{record.name}</Typography.Text>吗？
                  <br />
                  删除表单也将删除其的候选人(包括<Typography.Text strong>已录取</Typography.Text>)与面试信息。
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
      }]} dataSource={filtered} pagination={{
        hideOnSinglePage: false,
        showSizeChanger: true,
        showQuickJumper: true
      }} expandable={{
        rowExpandable(record) { return false },
        expandIcon() { return <></> }
      }} />
    </Flex >
  </Card>);
}