import { PlusOutlined } from "@ant-design/icons";
import { Flex, Typography, Button, Table, Space, Card } from "antd";
import Search from "./shared/Search";
import { useState } from "react";

export default function AdminManage() {
  const fullValue = [{ nickname: 'test' }];
  const [showValue, setShowValue] = useState(fullValue);
  return (<Card>
    <Flex vertical gap='small'>
      <Typography.Text>
        <Typography.Text strong>管理员</Typography.Text>可以查看和管理组织的纳新。
      </Typography.Text>
      <Flex wrap='wrap'>
        <Button icon={<PlusOutlined />} type='primary'
        >新增</Button>
      </Flex>
      <Search onChange={({ target: { value: search } }) => setShowValue(fullValue.filter(v => v.nickname.includes(search)))} />
      <Table title={(d) => `管理员列表 (${d.length}项)`} rowKey='nickname' bordered columns={[{
        title: '昵称',
        dataIndex: 'nickname'
      }, {
        title: '权限',
        render(value, record, index) { return '可管理' }
      }, {
        title: '操作',
        render(value, record, index) {
          return (<Space size={0}>
            <Button size='small' type='link'
            >详情</Button>
            <Button size='small' type='link'
            >修改权限</Button>
          </Space>);
        }
      }]} dataSource={showValue} pagination={{
        hideOnSinglePage: false,
        showSizeChanger: true,
        showQuickJumper: true
      }} expandable={{
        rowExpandable(record) { return false },
        expandIcon() { return <></> }
      }} />
    </Flex >
  </Card>
  );
}