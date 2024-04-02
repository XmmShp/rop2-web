import { PlusOutlined } from '@ant-design/icons';
import { Flex, Typography, Button, Table, Space, Card } from 'antd';
import { delay } from '../../utils';
import { useState } from 'react';
import Search from '../shared/Search';
import { kvSet } from "../../store/kvCache";
import { showModal, TempInput } from '../../shared/LightComponent';
import { message } from '../../App';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../api/useData';
import dayjs from 'dayjs';
import { createForm } from '../../api/form';

export default function FormOverview() {
  const [forms, loadingPromise, reload] = useData<{
    id: string;
    name: string;
    startAt?: string;
    endAt?: string;
    createAt: string;
    updateAt: string;
  }[]>('/form/list', async (resp) => resp.json(), []);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  return (<Card>
    <Flex vertical gap='small'>
      <Typography.Text>
        组织的每批纳新对应一个<Typography.Text strong>表单</Typography.Text>。
      </Typography.Text>
      <Flex wrap='wrap'>
        <Button icon={<PlusOutlined />} type='primary'
          onClick={() => {
            const vref = { value: '' };
            showModal({
              title: '新建表单',
              content: (<Flex vertical gap='small'><Typography.Text>
                输入新表单的名称:
              </Typography.Text>
                <TempInput vref={vref} showCount maxLength={25} /></Flex>),
              async onConfirm() {
                const newName = vref.value.trim();
                if (!newName) {
                  message.error('名称不能为空');
                  return;
                }
                const errMsg = await createForm(newName);
                if (errMsg) {
                  message.error(errMsg);
                  return;
                }
                message.success("新建成功");
                reload();
              },
            });
          }}
        >新增</Button>
      </Flex>
      <Search value={searchValue}
        onChange={({ target: { value } }) => setSearchValue(value)} />
      <Table title={(d) => `表单列表 (${d.length}项)`} rowKey='id' bordered columns={[{
        title: '名称',
        dataIndex: 'name'
      }, {
        title: '创建时间',
        render(value, record, index) {
          return dayjs(record.createAt).format('YYYY.MM.DD HH:mm:ss');
        },
      }, {
        title: '开放时间',
        render(value, record, index) {
          const start = record.startAt ? dayjs(record.startAt).format('YYYY.MM.DD HH:mm:ss') : '即刻';
          const end = record.endAt ? dayjs(record.endAt).format('YYYY.MM.DD HH:mm:ss') : '无结束时间';
          return start + ' ~ ' + end;
        },
      }, {
        title: '操作',
        render(value, record, index) {
          return (<Space size={0}>
            <Button size='small' type='link'
              onClick={() => {
                kvSet('form', record.id.toString());
                navigate('/console/form/edit');
              }} >编辑</Button>
            <Button size='small' type='link'
              onClick={() => {
                kvSet('form', record.id.toString());
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
                  reload();
                }
              })}>删除</Button>
          </Space>);
        }
      }]}
        loading={!!loadingPromise}
        dataSource={forms.filter(f => f.name.includes(searchValue))}
        pagination={{
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