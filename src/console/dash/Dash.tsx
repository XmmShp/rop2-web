import { FundViewOutlined, HourglassOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Flex, Statistic } from 'antd';

export default function Dash() {
  return (<Flex vertical gap='small'>
    <Card>
      <Flex vertical gap='small'>
        <Flex wrap='wrap' gap='large'>
          <Statistic title='活动' value={'正在进行的纳新名称'} />
          <Statistic title='报名人数' value={123}
            prefix={<TeamOutlined />} />
          <Statistic title='志愿合计' value={167} />
        </Flex>
        <Flex wrap='wrap' gap='large'>
          <Statistic.Countdown title='距离报名结束' value={Date.now() + 1000 * 60 * 60 * 24}
            prefix={<HourglassOutlined />} />
        </Flex>
      </Flex>
    </Card>
    <Card>
      <Flex vertical gap='small'>
        <Flex wrap='wrap' gap='large'>
          <Statistic title='阶段' value={'一面'} />
          <Statistic title='人次' value={167}
            prefix={<TeamOutlined />} />
          <Statistic title='待定人次' value={12} />
        </Flex>
        <Flex wrap='wrap' gap='large'>
          <Statistic title='总面试场数' value={34}
            prefix={<FundViewOutlined />} />
          <Statistic title='已完成面试' value={30} />
        </Flex>
      </Flex>
    </Card>
    <Card>
      <Flex vertical gap='small'>
        <Flex wrap='wrap' gap='large'>
          <Statistic title='阶段' value={'二面'} />
          <Statistic title='人次' value={89}
            prefix={<TeamOutlined />} />
          <Statistic title='待定人次' value={89} />
        </Flex>
        <Flex wrap='wrap' gap='large'>
          <Statistic title='总面试场数' value={16}
            prefix={<FundViewOutlined />} />
          <Statistic title='已完成面试' value={0} />
        </Flex>
      </Flex>
    </Card>
  </Flex>);
}