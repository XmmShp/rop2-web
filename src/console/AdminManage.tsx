import { PlusOutlined } from '@ant-design/icons';
import { Flex, Typography, Button, Table, Space, Card, Form } from 'antd';
import Search from './shared/Search';
import { useState } from 'react';
import { showModal, TempInput, TempRadioGroup } from '../shared/LightComponent';
import { message } from '../App';
import { debounce, num } from '../utils';
import { useData } from '../api/useData';
import dayjs, { Dayjs } from 'dayjs';
import { editAdmin } from '../api/admin';

const levels: Record<string, string> = { _: '未知({})', 10: '可查看', 20: '可管理' };
export type AdminProfile = { nickname: string; zjuId: string; level: number; createAt: Dayjs };
export type AdminList = { admins: AdminProfile[]; count: number; filteredCount: number };
function describeLevel(level: number) {
  return levels[level] || levels['_'].replace('{}', level.toString());
}
export default function AdminManage() {
  const [filter, _setFilter] = useState('');
  const setFilterDebounced = debounce(
    //节流，避免每个字符都查一次服务器
    (f: string) => {
      _setFilter(f);
      setOffset(0); //修改filter时同时重置offset(返回第一页)
    },
    250
  );
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [list, loading, reload] = useData<AdminList>(
    '/admin',
    async (resp) => {
      const result = await resp.json();
      result.admins.forEach((v: AdminProfile) => (v.createAt = dayjs(v.createAt)));
      return result;
    },
    { admins: [], count: 0, filteredCount: 0 },
    { limit, offset, filter },
    [limit, offset, filter]
  );
  const { admins, count, filteredCount } = list;
  function showEditModal(id: string, nickname: string, level: number, type: 'add' | 'edit') {
    const isAdd = type === 'add';
    const vrefId = { value: id };
    const vrefNickname = { value: nickname };
    const vrefLevel = { value: level };
    const optionPairs: [string, string][] = Object.entries(levels).filter(([k]) => !Object.is(num(k, NaN), NaN));
    if (!isAdd) optionPairs.unshift(['0', '无']); //权限从小到大排序，第一项为无(即删除)
    showModal({
      title: `${isAdd ? '添加' : '修改'}管理员`,
      content: (
        <Form layout="vertical">
          <Form.Item required label="学工号">
            <TempInput disabled={!isAdd} vref={vrefId} showCount maxLength={10} />
          </Form.Item>
          <Form.Item required label="昵称">
            <TempInput vref={vrefNickname} showCount maxLength={10} />
          </Form.Item>
          <Form.Item required label="权限">
            <TempRadioGroup
              vref={vrefLevel}
              options={optionPairs.map(([k, v]) => {
                return { label: v, value: num(k, 0) };
              })}
            />
          </Form.Item>
        </Form>
      ),
      async onConfirm() {
        const newAdminId = vrefId.value.trim();
        if (!newAdminId) {
          message.error('学工号不能为空');
          return false;
        }
        const newAdminNickname = vrefNickname.value.trim();
        if (!newAdminNickname) {
          message.error('昵称不能为空');
          return false;
        }
        const { code } = await editAdmin(newAdminId, newAdminNickname, vrefLevel.value);
        if (!code) message.success('管理员修改成功');
        reload(list);
      },
    });
  }
  return (
    <Card>
      <Flex vertical gap="small">
        <Typography.Text>
          <Typography.Text strong>管理员</Typography.Text>可以查看和管理组织的纳新。
        </Typography.Text>
        <Flex wrap="wrap">
          <Button icon={<PlusOutlined />} type="primary" onClick={() => showEditModal('', '', 20, 'add')}>
            新建
          </Button>
        </Flex>
        <Search onChangeTrimmed={(v) => setFilterDebounced(v)} />
        <Table
          bordered
          loading={!!loading}
          title={(d) => `管理员列表 (本页 ${d.length} 项${filter ? ` / 筛选到 ${filteredCount} 项` : ''} / 共 ${count} 项)`}
          rowKey="nickname"
          columns={[
            {
              title: '昵称',
              dataIndex: 'nickname',
            },
            {
              title: '权限',
              render(value, record, index) {
                return <Typography.Text type={record.level >= 20 ? 'success' : undefined}>{describeLevel(record.level)}</Typography.Text>;
              },
            },
            {
              title: '操作',
              render(value, record, index) {
                return (
                  <Space size={0}>
                    <Button size="small" type="link" onClick={() => showEditModal(record.zjuId, record.nickname, record.level, 'edit')}>
                      修改
                    </Button>
                  </Space>
                );
              },
            },
          ]}
          dataSource={admins}
          pagination={{
            total: filteredCount,
            hideOnSinglePage: false,
            showSizeChanger: true,
            showQuickJumper: true,
            onShowSizeChange(current, size) {
              setLimit(size);
              setOffset(Math.floor(offset / size) * size);
            },
            onChange(page) {
              setOffset((page - 1) * limit);
            },
          }}
          expandable={{
            rowExpandable: () => false,
            expandIcon: () => undefined,
          }}
        />
      </Flex>
    </Card>
  );
}
