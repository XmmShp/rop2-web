import { Button, Card, Flex, Form, Input, Typography } from 'antd';
import './Profile.scss';
import { kvGet } from '../store/kvCache';

export default function Profile() {
  return (<Flex vertical align='center' >
    <Card className='card'>
      <Form layout='vertical'>
        <Flex vertical gap='middle'>
          <Typography.Title level={3}>
            个人信息管理
          </Typography.Title>
          <Typography.Text>
            您的信息仅提供给报名的社团和组织。
          </Typography.Text>
          <Flex vertical>
            <Form.Item label='学号' required>
              <Input inputMode='numeric' readOnly disabled value={kvGet('zjuId') ?? '未登录'} />
            </Form.Item>
            <Form.Item label='手机号' required>
              <Input inputMode='numeric' required />
            </Form.Item>
          </Flex>
          <Button type='primary' htmlType='submit'>保存</Button>
        </Flex>
      </Form>
    </Card>
  </Flex>);
}