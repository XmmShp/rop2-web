import { useEffect, useState } from 'react';
import './ApplyForm.scss';
import { Button, Card, Divider, Flex, Result, Typography } from 'antd';
import FormQuestion, { ValueOf } from '../shared/FormQuestion';
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
  type AnswerMap = {
    [questionId: string]: unknown;
  };
  const [answer, setAnswer] = useState<AnswerMap>({});
  useEffect(() => {
    if ('message' in form.children) return;
    const v: AnswerMap = {};
    form.children.forEach(
      group => group.children.forEach(q => v[q.id] = ('choices' in q) ? [] : ''));
    setAnswer(v);
    calcRevealGroups(v);
  }, [form.children]);
  const [revealGroups, setRevealGroups] = useState<string[]>([]);
  function calcRevealGroups(newAnswer: AnswerMap) {
    const knwonGroups = new Set<string>();
    const calcQueue = ['1'];
    const revealGroupsSet = new Set<string>();
    let curGroup: string | undefined;
    while (curGroup = calcQueue.shift()) {
      if (knwonGroups.has(curGroup)) continue;
      knwonGroups.add(curGroup);
      revealGroupsSet.add(curGroup);
      const curGroupInst = form.children.find(g => g.id.toString() === curGroup);
      if (!curGroupInst)
        throw new Error(`Unable to find group by id ${curGroup}`);
      curGroupInst.children.forEach(ques => {
        if ('choices' in ques) {
          const selectedOptions = newAnswer[ques.id] as string[];
          selectedOptions?.forEach(o => {
            const nextGroupId = ques.choices[o];
            if (nextGroupId)
              calcQueue.push(nextGroupId.toString());
          });
        }
      });
      if (curGroupInst.next)
        calcQueue.push(curGroupInst.next.toString());
    }
    setRevealGroups([...revealGroupsSet]);
  }

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
              {revealGroups.map((revealId) => {
                const findResult = form.children.find((group) => group.id.toString() === revealId);
                if (!findResult) throw new Error(`Unable to find group by id ${revealId}`);
                const { children, label } = findResult;
                // {form.children.filter((group) => revealGroups.some(r => r === group.id)).map(({ children, label }) =>
                return (<Flex key={label} vertical gap='middle'
                  className='group'>
                  <Divider className='divider' orientation='center'>{label}</Divider>
                  {children.map(ques => (<FormQuestion key={ques.id} question={ques}
                    value={answer[ques.id] as ValueOf<typeof ques>}
                    onChange={(v) => {
                      const newAnswer = { ...answer, [ques.id]: v };
                      setAnswer(newAnswer);
                      if (ques.type === 'choice' || ques.type === 'choice-depart')
                        calcRevealGroups(newAnswer);
                    }}
                    departs={departs} />))}
                </Flex>)
              })}
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