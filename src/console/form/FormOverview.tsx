import { PlusOutlined } from "@ant-design/icons";
import { Flex, Typography, Button, Table, Space } from "antd";
import { notImplement } from "../../utils";
import { now } from "../../mockData";

export default function () {
  return (<Flex vertical gap='small'>
    <Typography.Text>
      组织的每批纳新对应一个<Typography.Text strong>表单</Typography.Text>。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={notImplement}>新增</Button>
    </Flex>
    <Table title={(d) => `表单列表 (${d.length}项)`} rowKey='id' bordered columns={[{
      title: '名称',
      dataIndex: 'name'
    }, {
      title: '创建时间',
      render(value, record, index) {
        return new Date(record.createAt * 1000).stringify(true, true);
      },
    }, {
      title: '起止时间'
    }, {
      title: '操作',
      render(value, record, index) {
        return (<Space size={0}>
          <Button size='small' type='link'
            onClick={notImplement}>编辑</Button>
          <Button danger size='small' type='link'
            onClick={notImplement}>停止</Button>
        </Space>);
      }
    }]} dataSource={[{ id: -1, name: '求是潮2024春季纳新', createAt: now() }]}
      pagination={false} />
  </Flex >);
}