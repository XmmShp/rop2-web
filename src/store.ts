import { Department, Org } from "./api/models/org";
import { Id } from "./api/models/shared";
import { Stage } from "./api/models/stage";

const orgMap = new Map<Id, Org>();
export function getOrg(id: Id): Org {
  const result = orgMap.get(id);
  if (result) return result;
  throw new Error('Unimplemented yet');
}
const departmentMap = new Map<Id, Department>();
export function getDepartment(id: Id): Department {
  const result = departmentMap.get(id);
  if (result) return result;
  throw new Error('Unimplemented yet');
}
const stageMap = new Map<Id, Stage>();
export function getStage(id: Id): Stage {
  const result = stageMap.get(id);
  if (result) return result;
  throw new Error('Unimplemented yet');
}
export function setKnown(data: Partial<{
  org: Org[],
  department: Department[],
  stage: Stage[]
}>) {
  const { org, department, stage } = data;
  if (org)
    org.forEach(v => orgMap.set(v.id, v));
  if (department)
    department.forEach(v => departmentMap.set(v.id, v));
  if (stage)
    stage.forEach(v => stageMap.set(v.id, v));
}