import { Button, Card, Flex, Input, Typography } from 'antd';
import './Profile.scss';

export default function Profile() {
  return (<Flex vertical align='center' >
    <Card className='card'>
      <Flex vertical gap='middle'>
        <Typography.Title level={3}>
          个人信息管理
        </Typography.Title>
        <Typography.Text>
          我们仅会将您的信息提供给您主动报名的社团和组织。
        </Typography.Text>
        <Flex vertical>
          <Typography.Text>手机号</Typography.Text>
          <Typography.Text className='desc'>
            我们将使用钉钉发送报名结果通知。请确保在此填写的手机号为您的钉钉绑定手机号。
          </Typography.Text>
          <Input inputMode='numeric' />
        </Flex>
        <Button type='primary'>保存</Button>
      </Flex>
    </Card>
  </Flex>);
}