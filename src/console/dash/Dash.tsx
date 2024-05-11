import { FundViewOutlined, HourglassOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Flex, Statistic, Typography } from 'antd';
import { useNickname } from '../../utils';
import { useOrg } from '../shared/useOrg';
import './Dash.scss';

export default function Dash() {
  const hour = new Date().getHours();
  let greeting;
  if (hour <= 5 || hour >= 22) greeting = '夜深了';
  else if (hour <= 7) greeting = '早上好';
  else if (hour <= 11) greeting = '上午好';
  else if (hour <= 13) greeting = '中午好';
  else if (hour <= 18) greeting = '下午好';
  else greeting = '晚上好';

  const nickname = useNickname();
  const [{ org: { name: orgName } }] = useOrg();
  return (<Flex vertical gap='small'>
    <Card>
      <Typography.Text className='welcome'>{greeting}，{nickname}</Typography.Text>
      <br />
      <Typography.Text className='at'>{orgName}</Typography.Text>
    </Card>
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
    <Flex wrap='wrap' gap='small'>
      <Card>
        <Flex vertical gap='small'>
          <Flex wrap='wrap' gap='large'>
            <Statistic title='阶段' value={'已填表'} />
            <Statistic title='待定人次' value={0} prefix={<TeamOutlined />} />
            <Statistic title='总人次' value={167} />
          </Flex>
          <Flex wrap='wrap' gap='large'>
            <Statistic title='已完成面试 / 面试总场数' value={'0 / 0'} prefix={<FundViewOutlined />} />
          </Flex>
        </Flex>
      </Card>
      <Card>
        <Flex vertical gap='small'>
          <Flex wrap='wrap' gap='large'>
            <Statistic title='阶段' value={'一面'} />
            <Statistic title='待定人次' value={12} prefix={<TeamOutlined />} />
            <Statistic title='总人次' value={167} />
          </Flex>
          <Flex wrap='wrap' gap='large'>
            <Statistic title='已完成面试 / 面试总场数' value={'30 / 34'} prefix={<FundViewOutlined />} />
          </Flex>
        </Flex>
      </Card>
      <Card>
        <Flex vertical gap='small'>
          <Flex wrap='wrap' gap='large'>
            <Statistic title='阶段' value={'二面'} />
            <Statistic title='待定人次' value={89} prefix={<TeamOutlined />} />
            <Statistic title='总人次' value={89} />
          </Flex>
          <Flex wrap='wrap' gap='large'>
            <Statistic title='已完成面试 / 面试总场数' value={'0 / 12'} prefix={<FundViewOutlined />} />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  </Flex>);
}