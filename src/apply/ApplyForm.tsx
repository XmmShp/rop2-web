import { useParams } from 'react-router-dom';
import { num } from '../utils';
import { getForm } from '../store';
import { useMemo, useState } from 'react';
import './ApplyForm.scss';
import { Button, Card, Divider, Flex, Result, Typography } from 'antd';
import FormQuestion from '../shared/FormQuestion';

export default function ApplyForm() {
  const params = useParams();
  const id = num(params.id, 0);
  const form = useMemo(() => getForm(id), [id]);
  const [completed, setCompleted] = useState(false);
  return (<Flex justify='center'
    className='apply'>
    <Card className='card'>
      {completed ? <SuccessPage formName={form.name} /> :
        <Flex vertical gap='large'>
          <Typography.Title level={3} className='title'>
            {form.name}
          </Typography.Title>
          <Typography.Text>
            {form.desc}
          </Typography.Text>
          <Flex vertical >
            {form.children.map(({ children, label }) =>
            (<Flex key={label} vertical gap='middle'
              className='group'>
              <Divider className='divider' orientation='center'>{label}</Divider>
              {children.map(ques => (<FormQuestion key={ques.id} question={ques} />))}
            </Flex>))}
          </Flex>

          <Button type='primary'
            onClick={() => {
              //TODO request API
              setCompleted(true);
            }}>提交</Button>
        </Flex>}

    </Card>
  </Flex>);
}

function SuccessPage({ formName }: { formName: string }) {
  return (<Result
    status='success'
    title='提交成功'
    subTitle={<>
      感谢您参与{formName}。
      <br />
      我们将通过短信发送后续报名信息，请注意查收。
    </>}
  />);
}