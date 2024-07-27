import { Button, Card, Checkbox, DatePicker, Flex, Form, Radio, Space, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getStepLabel } from '../result/ResultOverview';
import { useFilterDeparts, FilterDepartsComponent } from '../shared/FilterDeparts';
import Search from '../shared/Search';
import InterviewList from './InterviewList';
import dayjs from 'dayjs';
import { message } from '../../App';
import { showModal, TempInput } from '../../shared/LightComponent';
import { useData } from '../../api/useData';
import { useFormId } from '../shared/useForm';
import { num } from '../../utils';
import { useState } from 'react';
import { pkgPost, postApi } from '../../api/core';

export const stepsWithInterview = [1, 2] as const;
export default function InterviewManage() {
  const [filterDeparts, setFilterDeparts, { departs, org: { name: orgName, defaultDepart } }, orgInfoLoading] = useFilterDeparts();
  const formId = useFormId();
  const [step, setStep] = useState(1);
  const [interviews, interviewsLoading, reload] = useData('/interview', async (resp) => {
    const value = await resp.json();
    return value.map((iv: any) => {
      return { ...iv, startAt: dayjs(iv.startAt), endAt: dayjs(iv.endAt) };
    })
  }, [], { formId, step, depart: [defaultDepart, ...filterDeparts].join(',') }, [formId, step, filterDeparts, orgInfoLoading], !orgInfoLoading);
  return (<Card>
    <FilterDepartsComponent {...{ departs, filterDeparts, setFilterDeparts }} />
    <Tabs centered
      activeKey={String(step)}
      onChange={(k) => setStep(num(k, 1))}
      items={stepsWithInterview.map(s => {
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
          onClick={() => {
            let ivDepart = defaultDepart;
            const capacityRef = { value: '5' };
            const locationRef = { value: '' };
            let startTime = dayjs();
            const durationRef = { value: '60' };
            showModal({
              title: '新建面试',
              content: (<Form size='small'>
                <Form.Item required label='阶段'>
                  <Typography.Text>{getStepLabel(step)} (ID: {step})</Typography.Text>
                </Form.Item>
                <Form.Item label='部门' required>
                  <Radio.Group
                    defaultValue={ivDepart}
                    onChange={(e) => ivDepart = e.target.value satisfies number}
                    options={[{ id: defaultDepart, name: orgName }, ...departs].map(dep => {
                      return {
                        label: dep.name,
                        value: dep.id
                      }
                    })} />
                </Form.Item>
                <Form.Item label='容量' required>
                  <TempInput inputMode='numeric' vref={capacityRef} maxLength={3} />
                </Form.Item>
                <Form.Item label='地点' required>
                  <TempInput inputMode='text' vref={locationRef} />
                </Form.Item>
                <Form.Item label='开始时间' required>
                  <DatePicker showTime
                    defaultValue={startTime}
                    minDate={dayjs().add(-7, 'day')}
                    maxDate={dayjs().add(3, 'month')}
                    onChange={(v) => startTime = v} />
                </Form.Item>
                <Form.Item label='持续时间(分钟)' required>
                  <TempInput inputMode='numeric' vref={durationRef} maxLength={3} />
                </Form.Item>
              </Form>),
              async onConfirm() {
                const capacity = num(capacityRef.value, 0);
                if (capacity <= 0) {
                  message.error('容量必须大于0');
                  return false;//阻止对话框关闭
                }
                if (capacity > 100) {
                  message.error('容量不能超过100');
                  return false;
                }
                const location = locationRef.value.trim();
                if (!location) {
                  message.error('地点不能为空');
                  return false;
                }
                if (location.length > 50) {
                  message.error('地点不能超过50字');
                  return false;
                }
                const startAt = startTime;
                const endAt = startTime.add(num(durationRef.value, 0), 'minute');
                const { message: errMsg } = await pkgPost('/interview/add', {
                  formId,
                  depart: ivDepart,
                  step,
                  capacity,
                  location,
                  startAt,
                  endAt
                })
                if (errMsg)
                  message.error(errMsg);
                else
                  message.success('新建成功');
                reload();
              }
            });
          }}
        >新建面试</Button>
      </Space>
      <Search placeholder='筛选' />
      <InterviewList interviews={interviews} departs={departs} orgName={orgName}
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
