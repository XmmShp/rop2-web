import { createRef, useEffect, useMemo, useRef, useState } from 'react';
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
import { kvGet, kvSet, zjuIdKey } from '../store/kvCache';
import { getLoginRedirectUrl } from '../api/auth';

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
function getAnswerStoreKey(zjuId: string, formId: number) {
  return `${zjuId}:f${formId}`;
}
export default function ApplyForm() {
  const [searchParams] = useSearchParams();
  const isPreview = typeof searchParams.get('preview') === 'string';
  const zjuId = useMemo(() => kvGet(zjuIdKey)!, []);

  const [{ phone: profilePhone, respStatus }, profilePromise] = useData<{ phone: string, respStatus: number }>('/applicant/profile', async (resp) => {
    const profile = resp.status >= 400 ? {} : await resp.json();
    profile.phone ??= '';
    return { ...profile, respStatus: resp.status };
  }, { phone: '', respStatus: 0 }, {}, []);
  useEffect(() => {
    if (profilePromise?.then) profilePromise.then((prof) => setPhone(prof.phone));
  }, [profilePromise]);
  //管理员在预览模式下使用管理渠道获取表单详情（绕过开始&结束时间限制）
  const [form, formLoading] = useForm(isPreview ? 'admin' : 'applicant', false, true);
  useEffect(() => {
    if (form.name)
      document.title = `${form.name} - 纳新开放系统`;
  }, [form.name])
  const [departs] = useData<Depart[]>('/applicant/org', (resp) => resp.json(), [], { id: form.owner }, [form.owner], !formLoading && form.owner > 0);
  const [completed, setCompleted] = useState(false);
  const [phone, setPhone] = useState(profilePhone);
  const answerStoreKey = useMemo(() => getAnswerStoreKey(zjuId, form.id), [zjuId]);
  const [answer, _setAnswer] = useState<AnswerMap>(() => {
    //即使form还在fetch，id也是有效的；同时kvGet为同步函数
    const cached = kvGet(answerStoreKey) ?? '{}';
    console.log('using cached answer:', JSON.parse(cached))
    return JSON.parse(cached) as AnswerMap;
  });
  const answerMapRef = useRef(answer);
  function setAnswer(newAnswer: AnswerMap) {
    console.log('set answer', newAnswer)
    answerMapRef.current = newAnswer;
    _setAnswer(newAnswer);
  }
  useEffect(() => {
    function saveCurrentAnswer() {
      kvSet(answerStoreKey, JSON.stringify(answerMapRef.current));
    }
    window.addEventListener('unload', saveCurrentAnswer);
    const timer = setInterval(() => {
    }, 3000); //每3s保存一次，同时unload时也会保存(不询问是否退出)
    return () => {
      clearInterval(timer);
      window.removeEventListener('unload', saveCurrentAnswer);
    }
  }, [answerStoreKey]);

  //保存html元素引用便于错误定位
  type RefMap = Record<string, React.RefObject<HTMLDivElement>>;
  const [refMap, setRefMap] = useState<RefMap>({});
  useEffect(() => {
    if ('message' in form.children) return;//表单异常，不需要初始化
    const newRefMap: RefMap = { phoneRef: createRef() };
    form.children.forEach(
      group => group.children.forEach(q =>
        newRefMap[q.id] = createRef()
      ));
    setRevealGroups(calcRevealGroups(form, answer));
    setRefMap(newRefMap);
  }, [form.children]);
  const [revealGroups, setRevealGroups] = useState<QuestionGroup[]>([]);

  useEffect(() => {
    if (respStatus === 401)
      location.href = getLoginRedirectUrl();
  }, [respStatus === 401]);

  return (<Flex justify='center'
    className='apply'>
    <Card className='card'>
      {respStatus === 401
        ? <>您需要登录后方可填写表单哦~
          <br /><a href={getLoginRedirectUrl()} target='_self'>如未自动跳转，请点击此处</a></>
        : (<>
          {isPreview && <Flex vertical>
            <Typography.Text>您目前正在预览该表单。</Typography.Text>
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
              <SuccessPage form={form} />
              : /**填表页面 */
              <Flex vertical gap='large'>
                <Typography.Title level={3} className='title'>
                  {form.name}
                </Typography.Title>
                {form.desc.length > 0 && <Typography.Text>
                  {form.desc}
                </Typography.Text>}
                {formLoading ? <></> : <Form layout='vertical'
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
                    const { children, label, id: groupId, hideSeparator = false } = group;
                    const isEntry = groupId === 1;
                    return (<Flex key={label} vertical gap='middle'
                      className='group'>
                      {hideSeparator ? <></> : <Divider className='divider' orientation='center'>{label}</Divider>}
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
                </Form>}
              </Flex>)
          }
        </>)}
    </Card>
  </Flex>);
}

function SuccessPage({ form }: { form: FormDetail }) {
  return (<>
    <Result
      status='success'
      title='提交成功'
      subTitle={<div className='success-subtitle'>
        感谢您参与{form.name}。
        <br />
        如需<a href={`${basename}/apply/${form.id}`}>修改答卷</a>，您可在问卷开放时间内返回此页，重新提交答卷。
      </div>}
    />
    <Typography.Text type='secondary' className='support'>技术支持 求是潮纳新开放系统</Typography.Text>
  </>);
}