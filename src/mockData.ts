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
  label: '已填表',
  owner: org.id,
  createAt: now(),
  tasks: ['choose-interview', 'review']
}, {
  id: newId(),
  label: '录取',
  owner: org.id,
  createAt: now(),
  tasks: []
}];

setKnown({ org: [org], department: departs, stage: stages })