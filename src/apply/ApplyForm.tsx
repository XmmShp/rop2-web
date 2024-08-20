import { createRef, useEffect, useState } from 'react';
import './ApplyForm.scss';
import { Button, Card, Divider, Flex, Form, Result, Typography } from 'antd';
import { ValueOf, FormQuestion, parseChoices } from '../shared/FormQuestion';
import { FormDetail, QuestionGroup, useForm, ValidQuestion } from '../console/shared/useForm';
import { useData } from '../api/useData';
import { Depart } from '../console/shared/useOrg';
import { useSearchParams } from 'react-router-dom';
import { saveResult } from '../api/applicant';
import { message } from '../App';
import { builtinPhoneQuestion } from '../console/form/FormEdit';
import { basename, num } from '../utils';
import CopyZone from '../shared/CopyZone';

export function validate(question: ValidQuestion, value: unknown): boolean {
  if (!question.optional) {
    if (!((value as Record<keyof any, any> | undefined)?.length)) {
      return false;
    }
  }
  return true;
}
type AnswerMap = Record<string, unknown>;
export function calcRevealGroups(form: FormDetail, newAnswer: AnswerMap) {
  const knwonGroups = new Set<QuestionGroup>();
  const calcQueue = ['1'];
  const revealGroupsSet = new Set<QuestionGroup>();
  let curGroup: string | undefined;
  while (curGroup = calcQueue.shift()) {
    const curGroupInst = form.children.find(g => g.id.toString() === curGroup);
    if (!curGroupInst)
      throw new Error(`Unable to find group by id ${curGroup}`);
    if (knwonGroups.has(curGroupInst)) continue;
    knwonGroups.add(curGroupInst);
    revealGroupsSet.add(curGroupInst);
    curGroupInst.children.forEach(ques => {
      if ('choices' in ques) {
        const orderedChoices = parseChoices(ques.choices);
        let selectedOptions = newAnswer[ques.id] as string[] | string;
        if (!Array.isArray(selectedOptions)) selectedOptions = [selectedOptions];
        selectedOptions?.forEach(selectedCur => {
          const nextGroupId = orderedChoices.find(({ label }) => label === selectedCur)?.reveal;
          if (nextGroupId)
            calcQueue.push(nextGroupId.toString());
        });
      }
    });
    if (curGroupInst.next)
      calcQueue.push(curGroupInst.next.toString());
  }
  const newRevealGroups = [...revealGroupsSet];
  // 把newRevealGroups按照forms的children的顺序排序，
  // 保证表单设计时显示的顺序和填表的顺序一致
  // 性能不好，但是数据量不大，先这样
  newRevealGroups.sort((a, b) => form.children.findIndex(g => g.id === a.id) - form.children.findIndex(g => g.id === b.id));
  return newRevealGroups;
}
export default function ApplyForm() {
  const [searchParams] = useSearchParams();
  const isPreview = typeof searchParams.get('preview') === 'string';

  //管理员在预览模式下使用管理渠道获取表单详情（绕过开始&结束时间限制）
  const [{ phone: profilePhone }, profilePromise] = useData<{ phone: string }>('/applicant/profile', async (resp) => {
    const profile = await resp.json();
    profile.phone ??= '';
    return profile;
  }, { phone: '' }, {}, []);
  useEffect(() => {
    if (profilePromise?.then) profilePromise.then((prof) => setPhone(prof.phone));
  }, [profilePromise]);
  const [form, formLoading] = useForm(isPreview ? 'admin' : 'applicant', false);
  useEffect(() => {
    if (form.name)
      document.title = `${form.name} - 纳新开放系统`;
  }, [form.name])
  const [departs] = useData<Depart[]>('/applicant/org', (resp) => resp.json(), [], { id: form.owner }, [form.owner], !formLoading);
  const [completed, setCompleted] = useState(false);
  const [phone, setPhone] = useState(profilePhone);
  const [answer, setAnswer] = useState<AnswerMap>({});
  type RefMap = Record<string, React.RefObject<HTMLDivElement>>;
  const [refMap, setRefMap] = useState<RefMap>({});
  useEffect(() => {
    if ('message' in form.children) return;//表单异常，不需要初始化
    const newAnswerMap: AnswerMap = {};
    const newRefMap: RefMap = { phoneRef: createRef() };
    form.children.forEach(
      group => group.children.forEach(q => {
        newAnswerMap[q.id] = ('choices' in q) ? [] : '';
        newRefMap[q.id] = createRef();
      }));
    setAnswer(newAnswerMap);
    setRevealGroups(calcRevealGroups(form, newAnswerMap));
    setRefMap(newRefMap);
  }, [form.children]);
  const [revealGroups, setRevealGroups] = useState<QuestionGroup[]>([]);

  return (<Flex justify='center'
    className='apply'>
    <Card className='card'>
      {isPreview && <Flex vertical>
        <Typography.Text>您目前正处在预览模式。</Typography.Text>
        <Typography.Text>候选人正常填表地址：<CopyZone inline text={`${location.origin}${basename}/apply/${form.id}`} /></Typography.Text>
      </Flex>}
      {'message' in form.children
        ? /**问卷存在异常，只显示message */
        <Typography.Title level={4}>
          {form.children.message as string}
        </Typography.Title>
        : /**问卷children有效 */
        (completed
          ? /**已完成页面 */
          <SuccessPage formName={form.name} />
          : /**填表页面 */
          <Flex vertical gap='large'>
            <Typography.Title level={3} className='title'>
              {form.name}
            </Typography.Title>
            {form.desc.length > 0 && <Typography.Text>
              {form.desc}
            </Typography.Text>}
            <Form layout='vertical'
              onFinish={async (v) => {
                const choiceDepartQuestion = form.children.first(
                  (g) => g.children.first(
                    (q) => q.type === 'choice-depart' && q
                  )
                );
                const intentDeparts = choiceDepartQuestion ? (answer[choiceDepartQuestion.id] as string[]).map(id => num(id)) : [];
                const failedQues = revealGroups.first(rg => rg.children.first(q => validate(q, answer[q.id]) ? false : q));
                if (failedQues) {
                  const quesEle = refMap[failedQues.id]?.current!;
                  quesEle.scrollIntoView();
                  message.error('请填写所有必填项');
                  return;
                }
                const { code } = await saveResult(form.id, { phone }, intentDeparts, answer);
                if (!code)
                  setCompleted(true);
              }}>
              {revealGroups.map((group) => {
                const { children, label, id: groupId } = group;
                const isEntry = groupId === 1;
                return (<Flex key={label} vertical gap='middle'
                  className='group'>
                  <Divider className='divider' orientation='center'>{label}</Divider>
                  {isEntry && <FormQuestion
                    ref={refMap['phoneRef']}
                    question={builtinPhoneQuestion}
                    value={phone}
                    onChange={(v) => setPhone(v as string)} />}
                  {children.map(ques => (
                    <FormQuestion
                      ref={refMap[ques.id]}
                      question={ques} key={ques.id}
                      value={answer[ques.id] as ValueOf<typeof ques>}
                      onChange={(v) => {
                        const newAnswer = { ...answer, [ques.id]: v };
                        setAnswer(newAnswer);
                        if (ques.type === 'choice' || ques.type === 'choice-depart')
                          setRevealGroups(calcRevealGroups(form, newAnswer));
                      }}
                      departs={departs} />
                  ))}
                </Flex>)
              })}
              <Button type='primary' htmlType='submit'>提交</Button>
            </Form>
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