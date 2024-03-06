import { PlusOutlined } from "@ant-design/icons";
import { Flex, Typography, Button, Table, Space } from "antd";
import { notImplement } from "../../utils";

export default function AdminManage() {
  return (<Flex vertical gap='small'>
    <Typography.Text>
      组织和部门都可以拥有多个<Typography.Text strong>管理员</Typography.Text>。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={notImplement}>新增</Button>
    </Flex>
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
    }]} dataSource={[{ nickname: 'test' }]} pagination={{
      hideOnSinglePage: false,
      showSizeChanger: true,
      showQuickJumper: true
    }} />
  </Flex >);
}