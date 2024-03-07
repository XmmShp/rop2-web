import { PlusOutlined } from "@ant-design/icons";
import { Flex, Typography, Button, Table, Space } from "antd";
import { notImplement } from "../../utils";
import Search from "../shared/Search";
import { useState } from "react";

//TODO 目前还未定义管理员的数据结构
export default function AdminManage() {
  const fullValue = [{ nickname: 'test' }];
  const [showValue, setShowValue] = useState(fullValue);
  return (<Flex vertical gap='small'>
    <Typography.Text>
      每个部门可以拥有多个<Typography.Text strong>管理员</Typography.Text>。
      <br />
      管理员在<Typography.Text strong>默认部门</Typography.Text>的权限将被视为在所有部门下的权限。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={notImplement}>新增</Button>
    </Flex>
    <Search onChange={({ target: { value: search } }) => setShowValue(fullValue.filter(v => v.nickname.includes(search)))} />
    <Table title={(d) => `管理员列表 (${d.length}项)`} rowKey='nickname' bordered columns={[{
      title: '昵称',
      dataIndex: 'nickname'
    }, {
      title: '权限',
      render(value, record, index) { return 'unknown' }
    }, {
      title: '操作',
      render(value, record, index) {
        return (<Space size={0}>
          <Button size='small' type='link'
            onClick={notImplement}>详情</Button>
          <Button size='small' type='link'
            onClick={notImplement}>修改权限</Button>
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
  </Flex >);
}