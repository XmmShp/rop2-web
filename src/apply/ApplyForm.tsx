import { useState } from 'react';
import './ApplyForm.scss';
import { Button, Card, Divider, Flex, Result, Typography } from 'antd';
import FormQuestion from '../shared/FormQuestion';
import { useForm } from '../console/shared/useForm';
import { useData } from '../api/useData';
import { Depart } from '../console/shared/useOrg';
import { useSearchParams } from 'react-router-dom';


export default function ApplyForm() {
  const [searchParams] = useSearchParams();
  const isPreview = typeof searchParams.get('preview') === 'string';

  //管理员在预览模式下使用管理渠道获取表单详情（绕过开始&结束时间限制）
  const [form] = useForm(isPreview ? 'admin' : 'applicant');
  const [departs] = useData<Depart[]>('/applicant/org', async (resp) => await resp.json(), [], { id: form.owner }, [form.owner], form.owner > 0);
  const [completed, setCompleted] = useState(false);

  //TODO reveal机制(用有向图？)
  // const [revealGroups, setRevealGroups] = useState<RevealPaths>({ [0]:  [1] });
  // useEffect(() => setRevealGroups(joinRevealGroups(form.children, [], [1])), [form.children]);
  return (<Flex justify='center'
    className='apply'>
    <Card className='card'>
      {'message' in form.children
        ? /**问卷存在异常，只显示message */ <Typography.Title level={4}>
          {form.children.message as string}
        </Typography.Title>
        : /**问卷children有效 */ (completed
          ? /**已完成页面 */ <SuccessPage formName={form.name} />
          : /**填表页面 */ <Flex vertical gap='large'>
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
                  // onRevealChange={(newReveal) => setRevealGroups(joinRevealGroups(form.children, revealGroups, newReveal))}
                  departs={departs} />))}
              </Flex>))}
            </Flex>

            <Button type='primary'
              onClick={() => {
                //TODO request API
                setCompleted(true);
              }}>提交</Button>
          </Flex>)
      }
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