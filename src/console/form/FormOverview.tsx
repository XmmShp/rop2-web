import { PlusOutlined } from "@ant-design/icons";
import { Flex, Typography, Button, Table, Space } from "antd";
import { notImplement } from "../../utils";
import { forms } from "../../mockData";
import { useState } from "react";
import Search from "../shared/Search";

export default function () {
  const fullValue = forms;
  const [showValue, setShowValue] = useState(fullValue);
  return (<Flex vertical gap='small'>
    <Typography.Text>
      组织的每批纳新对应一个<Typography.Text strong>表单</Typography.Text>。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={notImplement}>新增</Button>
    </Flex>
    <Search onChange={({ target: { value: search } }) => setShowValue(fullValue.filter(v => v.name.includes(search)))} />
    <Table title={(d) => `表单列表 (${d.length}项)`} rowKey='id' bordered columns={[{
      title: '名称',
      dataIndex: 'name'
    }, {
      title: '创建时间',
      render(value, record, index) {
        return new Date(record.createAt * 1000).stringify(true, true);
      },
    }, {
      title: '开放时间',
      render(value, record, index) {
        return new Date(record.startAt * 1000).stringify(true, true) + ' ~ ' + new Date(record.endAt * 1000).stringify(true, true);
      },
    }, {
      title: '操作',
      render(value, record, index) {
        return (<Space size={0}>
          <Button size='small' type='link'
            onClick={notImplement}>编辑</Button>
          <Button size='small' type='link'
            onClick={notImplement}>选拔</Button>
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