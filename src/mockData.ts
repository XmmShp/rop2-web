import { Form } from "./api/models/form";
import { Department, Org } from "./api/models/org";
import { Timestamp } from "./api/models/shared";
import { Stage } from "./api/models/stage";
import { setKnown } from "./store";

let id = 0;
export function newId() { return id++; }
export function now(): Timestamp { return Math.floor(Date.now() / 1000); }

export const org: Org = { createdAt: now(), id: newId(), name: '测试组织' };

export const departs: Department[] = [{
  name: '默认部门',
  id: newId(),
  parent: org.id,
  createdAt: now(),
  tag: 'default'
}, ...[
  '部门A',
  '部门B',
  '部门C',
  '部门D',
  '部门E',
  '部门F',
  'To be, or not to be, that is a question',
].map(name => {
  return { name, id: newId(), parent: org.id, createdAt: now() };
})];

export const stages: Stage[] = [{
  id: newId(),
  label: '已拒绝',
  owner: org.id,
  createAt: now(),
  tasks: [],
}, {
  id: newId(),
  label: '已填表',
  owner: org.id,
  createAt: now(),
  tasks: ['review'],
}, {
  id: newId(),
  label: '一面',
  owner: org.id,
  createAt: now(),
  tasks: ['choose-interview', 'review'],
}, {
  id: newId(),
  label: '二面',
  owner: org.id,
  createAt: now(),
  tasks: ['choose-interview', 'review'],
}, {
  id: newId(),
  label: '录取',
  owner: org.id,
  createAt: now(),
  tasks: []
}]
stages.forEach((v, i) => {
  if (i < stages.length - 1 && i > 0) {
    v.next = stages[i + 1].id;
  }
});

const entryGroupId = newId();
export const forms: Form[] = [{
  belongTo: org.id,
  createAt: now(),
  stage: stages[1].id,
  children: [{
    id: entryGroupId,
    label: '基本信息',
    children: []
  }, {
    id: newId(),
    label: '部门A命题',
    children: []
  }],
  name: '求是潮2024春季纳新',
  desc: '欢迎您参加求是潮2024春季纳新。\n请您准确填写以下信息，以便我们整理信息进行面试。',
  entry: entryGroupId,
  id: newId(),
  startAt: now() - 60 * 30,
  endAt: now() + 60 * 30
}];

setKnown({ org: [org], department: departs, stage: stages, form: forms })