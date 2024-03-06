import { PlusOutlined } from "@ant-design/icons";
import { Flex, Typography, Button, Table, Space } from "antd";
import { notImplement, useOrg } from "../../utils";
import { useState } from "react";
import Search from "../shared/Search";
import { getForm, getOrg } from "../../store";
import { Id } from "../../api/models/shared";

export default function FormOverview() {
  const orgId = useOrg();
  function refreshData(setState = false) {
    const result = getOrg(orgId).forms;
    if (setState) setForms(result);
    return result;
  }
  const [forms, setForms] = useState(refreshData);
  const [filtered, setFiltered] = useState(forms);
  function getHref(formId: Id, op: 'edit' | 'inspect'): string {
    return `/console/${op === 'edit' ? 'form/edit' : 'inspect/answer'}?org=${orgId}&form=${formId}${op === 'edit' ? `#group-${getForm(formId).entry}` : ''}`;
  }
  return (<Flex vertical gap='small'>
    <Typography.Text>
      组织的每批纳新对应一个<Typography.Text strong>表单</Typography.Text>。
    </Typography.Text>
    <Flex wrap='wrap'>
      <Button icon={<PlusOutlined />} type='primary'
        onClick={notImplement}>新增</Button>
    </Flex>
    <Search onChange={({ target: { value: search } }) => setFiltered(forms.filter(v => v.name.includes(search)))} />
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
            href={getHref(record.id, 'edit')}>编辑</Button>
          <Button size='small' type='link'
            href={getHref(record.id, 'inspect')}>选拔</Button>
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
  </Flex >);
}