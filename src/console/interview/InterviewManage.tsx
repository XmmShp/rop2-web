import { Button, Card, Flex, Space, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getStepLabel } from '../result/ResultOverview';
import { useFilterDeparts, FilterDepartsComponent } from '../shared/FilterDeparts';
import Search from '../shared/Search';
import InterviewList from './InterviewList';
import dayjs from 'dayjs';
import { message } from '../../App';
import { showModal } from '../../shared/LightComponent';
import { useData } from '../../api/useData';
import { useFormId } from '../shared/useForm';
import { num } from '../../utils';
import { useState } from 'react';

export default function InterviewManage() {
  const [filterDeparts, setFilterDeparts, { departs }] = useFilterDeparts();
  const formId = useFormId();
  const [step, setStep] = useState(1);
  const [interviews] = useData('/interview', async (resp) => {
    const value = await resp.json();
    return value.map((iv: any) => {
      return { ...iv, startAt: dayjs(iv.startAt), endAt: dayjs(iv.endAt) };
    })
  }, [], { formId, step, depart: filterDeparts.join(',') }, [formId, step, filterDeparts]);
  const itemsPerRow = 3;
  return (<Card>
    <FilterDepartsComponent {...{ departs, filterDeparts, setFilterDeparts }} />
    <Tabs centered
      activeKey={String(step)}
      onChange={(k) => setStep(num(k, 1))}
      items={[1, 2].map(s => {
        return {
          label: getStepLabel(s),
          key: String(s)
        }
      })}>
    </Tabs>
    <Flex vertical gap='small'>
      {/* <Radio.Group value={1} disabled>
        <Radio value={1}>本阶段分志愿部门面试</Radio>
        <Radio value={2}>本阶段统一面试</Radio>
      </Radio.Group> */}
      <Space>{/**Space避免按钮被Flex水平拉伸 */}
        <Button icon={<PlusOutlined />} type='primary'
        >新建面试</Button>
      </Space>
      <Search placeholder='筛选' />
      <InterviewList interviews={interviews} departs={departs}
        links={[{
          label: '查看报名表',
          disabled(curInterview) {
            return curInterview.usedCapacity <= 0;
          },
          onClick(curInterview) {

          },
        }, {
          label: '冻结', danger: true, onClick: () => { }
        }, {
          label: '删除', danger: true,
          onClick(curInterview) {
            showModal({
              title: '删除面试',
              content: `确定要删除这场面试吗？`,
              async onConfirm() {
                //TODO: delete interview
                message.success('删除成功');
              }
            });
          },
        }]}
      />
    </Flex >
  </Card >);
}
