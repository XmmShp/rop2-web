import { Department, Org } from "./api/models/org";
import { Timestamp } from "./api/models/shared";
import { setKnown } from "./store";

let id = 0;
export function newId() { return id++; }
export function now(): Timestamp { return Math.floor(Date.now() / 1000); }
export const org: Org = { createdAt: now(), id: newId(), name: '测试组织' };
export const departs: Department[] = [
  '部门A',
  'To be, or not to be, that is a question',
].map(name => {
  return { name, id: newId(), parent: org.id, createdAt: now() };
});

setKnown({ org: [org], department: departs })