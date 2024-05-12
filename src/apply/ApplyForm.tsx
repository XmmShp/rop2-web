import { useState } from 'react';
import './ApplyForm.scss';
import { Button, Card, Divider, Flex, Result, Typography } from 'antd';
import FormQuestion from '../shared/FormQuestion';
import { useForm } from '../console/shared/useForm';
import { useData } from '../api/useData';
import { Depart } from '../console/shared/useOrg';


export default function ApplyForm() {
  const [form] = useForm('applicant');
  const [departs] = useData<Depart[]>('/applicant/org', async (resp) => await resp.json(), [], { id: form.owner }, [form.owner], form.owner > 0);
  const [completed, setCompleted] = useState(false);


  // const [revealGroups, setRevealGroups] = useState<RevealPaths>({ [0]:  [1] });
  // useEffect(() => setRevealGroups(joinRevealGroups(form.children, [], [1])), [form.children]);
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
            // {form.children.filter((group) => revealGroups.some(r => r === group.id)).map(({ children, label }) =>
            (<Flex key={label} vertical gap='middle'
              className='group'>
              <Divider className='divider' orientation='center'>{label}</Divider>
              {children.map(ques => (<FormQuestion key={ques.id} question={ques}
                //TODO 计算新的reveal结果
                // onRevealChange={(newReveal) => setRevealGroups(joinRevealGroups(form.children, revealGroups, newReveal))}
                departs={departs} />))}
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
      {/* <br /> */}
      {/* 我们将通过短信发送后续报名信息，请注意查收。 */}
    </>}
  />);
}