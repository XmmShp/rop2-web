import { Alert, Button, Card, Checkbox, DatePicker, Flex, Form, Radio, Space, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getStepLabel } from '../result/ResultOverview';
import { useFilterDeparts, FilterDepartsComponent } from '../shared/FilterDeparts';
import InterviewList, { Interview } from './InterviewList';
import dayjs from 'dayjs';
import { message } from '../../App';
import { showModal, TempInput } from '../../shared/LightComponent';
import { useData } from '../../api/useData';
import { useForm } from '../shared/useForm';
import { basename, num, useStoredState } from '../../utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CopyZone from '../../shared/CopyZone';
import { addInterview, deleteInterview, freezeInterview } from '../../api/interview';

export const stepsWithInterview = [1, 2] as const;
export default function InterviewManage() {
  const navigate = useNavigate();
  const [
    filterDeparts,
    setFilterDeparts,
    {
      departs,
      org: { name: orgName, defaultDepart },
    },
    orgInfoLoading,
  ] = useFilterDeparts();
  const [form] = useForm();
  const formId = form.id;
  const [step, setStep] = useStoredState(1, 'interviewStep');
  const [interviews, interviewsLoading, reload] = useData<Interview[]>(
    '/interview',
    async (resp) => {
      const value = await resp.json();
      return value.map((iv: any) => {
        return { ...iv, startAt: dayjs(iv.startAt), endAt: dayjs(iv.endAt) };
      });
    },
    [],
    { formId, step, depart: [defaultDepart, ...filterDeparts].join(',') },
    [formId, step, filterDeparts, orgInfoLoading],
    !orgInfoLoading
  );
  const [showEndedInterviews, setShowEndedInterviews] = useStoredState(false, 'showEndedInterviews');
  //还未结束的面试
  const interviewsNotEnded = interviews.filter((iv) => iv.endAt.isAfter(dayjs()));
  return (
    <Card>
      <Flex vertical gap="middle">
        <Typography.Text>
          候选人选择面试链接：
          <CopyZone inline text={`${location.origin}${basename}/status/${formId}`} />
        </Typography.Text>
        <FilterDepartsComponent {...{ filterDeparts, setFilterDeparts }} />
        {filterDeparts.length > 1 && <Alert showIcon type="warning" message={`您正在查看来自多个部门的面试(已选中 ${filterDeparts.length} 个部门)。`} />}
        {filterDeparts.length === 0 && <Alert showIcon type="error" message="您没有选择任何部门，请先选择至少一个部门。" />}
        <Tabs
          centered
          activeKey={String(step)}
          onChange={(k) => setStep(num(k, 1))}
          items={stepsWithInterview.map((s) => {
            return {
              label: getStepLabel(s),
              key: String(s),
            };
          })}
        ></Tabs>
        <Flex vertical gap="small">
          {/* <Radio.Group value={1} disabled>
        <Radio value={1}>本阶段分志愿部门面试</Radio>
        <Radio value={2}>本阶段统一面试</Radio>
      </Radio.Group> */}
          <Space>
            {/**Space避免按钮被Flex水平拉伸 */}
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                let ivDepart = filterDeparts.length === 1 ? filterDeparts[0] : -1;
                const capacityRef = { value: '5' };
                const locationRef = { value: '' };
                let startTime = dayjs();
                startTime = startTime.add(1, 'hour');
                startTime = startTime.set('minute', 0);
                startTime = startTime.set('second', 0);
                const durationRef = { value: '60' };
                const commentRef = { value: '' };
                showModal({
                  title: '新建面试',
                  content: (
                    <Form size="small">
                      <Form.Item required label="阶段">
                        <Typography.Text>
                          {getStepLabel(step)} (ID: {step})
                        </Typography.Text>
                      </Form.Item>
                      <Form.Item label="部门" required>
                        <Radio.Group
                          defaultValue={ivDepart}
                          onChange={(e) => (ivDepart = e.target.value satisfies number)}
                          //注意，这里把默认部门关了
                          options={departs.map((dep) => {
                            return {
                              label: dep.name,
                              value: dep.id,
                            };
                          })}
                        />
                      </Form.Item>
                      <Form.Item label="容量" required>
                        <TempInput inputMode="numeric" vref={capacityRef} maxLength={3} />
                      </Form.Item>
                      <Form.Item label="地点" required>
                        <TempInput inputMode="text" vref={locationRef} />
                      </Form.Item>
                      <Form.Item label="开始时间" required>
                        <DatePicker
                          showTime={{
                            format: 'HH:mm',
                            minuteStep: 5,
                          }}
                          format="YYYY.MM.DD HH:mm"
                          defaultValue={startTime}
                          minDate={dayjs().add(-7, 'day')}
                          maxDate={dayjs().add(3, 'month')}
                          onChange={(v) => (startTime = v)}
                        />
                      </Form.Item>
                      <Form.Item label="持续时间(分钟)" required>
                        <TempInput inputMode="numeric" vref={durationRef} maxLength={3} />
                      </Form.Item>
                      <Form.Item label="备注">
                        <TempInput placeholder="选择此面试时的注意事项，可留空" inputMode="text" vref={commentRef} />
                      </Form.Item>
                    </Form>
                  ),
                  async onConfirm() {
                    if (ivDepart <= 0) {
                      message.error('请选择面试部门');
                      return false;
                    }
                    const capacity = num(capacityRef.value, 0);
                    if (capacity <= 0) {
                      message.error('容量必须大于0');
                      return false; //阻止对话框关闭
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
                    const { code } = await addInterview(formId, ivDepart, step, capacity, location, startAt, endAt);
                    if (!code) message.success('新建面试成功');
                    reload();
                  },
                });
              }}
            >
              新建面试
            </Button>
            <Checkbox checked={showEndedInterviews} onChange={({ target: { checked: v } }) => setShowEndedInterviews(v)}>
              显示已结束面试 ({interviews.length - interviewsNotEnded.length} 项)
            </Checkbox>
          </Space>
          <InterviewList
            interviews={showEndedInterviews ? interviews : interviewsNotEnded}
            departs={departs}
            orgName={orgName}
            links={[
              {
                label: '查看报名表',
                onClick(curInterview) {
                  navigate(`/console/interview/schedule/${curInterview.id}`);
                },
              },
              {
                label(curInterview) {
                  return curInterview.status === 20 ? '已冻结' : '冻结';
                },
                onClick(curInterview) {
                  showModal({
                    title: '冻结面试',
                    content: (
                      <Typography.Text>
                        确定要冻结这场面试吗？
                        <br />
                        冻结后将停止报名，已报名的候选人不受影响。
                        <br />
                        冻结后不可恢复。
                      </Typography.Text>
                    ),
                    async onConfirm() {
                      const { code } = await freezeInterview(curInterview.id);
                      if (!code) message.success('冻结面试成功');
                      reload();
                    },
                  });
                },
                disabled(curInterview) {
                  return curInterview.status === 20;
                },
              },
              {
                label: '删除',
                danger: true,
                onClick(curInterview) {
                  showModal({
                    title: '删除面试',
                    content: (
                      <Typography.Text>
                        确定要删除这场面试吗？
                        <br />
                        删除后，已报名该面试的候选人需重新报名其他面试场次。
                        <br />
                        删除后无法恢复。
                      </Typography.Text>
                    ),
                    async onConfirm() {
                      const { code } = await deleteInterview(curInterview.id);
                      if (!code) message.success('删除面试成功');
                      reload();
                    },
                  });
                },
              },
            ]}
          />
        </Flex>
      </Flex>
    </Card>
  );
}
