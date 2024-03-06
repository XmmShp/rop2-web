import { Form } from "./api/models/form";
import { Department, Org } from "./api/models/org";
import { Id } from "./api/models/shared";
import { Stage } from "./api/models/stage";

type Resource = {
  children: Department[];
  stages: Stage[];
  forms: Form[];
};
const orgMap = new Map<Id, Org & Resource>();
export function getOrg(id: Id): Org & Resource {
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
const formMap = new Map<Id, Form>();
export function getForm(id: Id): Form {
  const result = formMap.get(id);
  if (result) return result;
  throw new Error('Unimplemented yet');
}
export function setKnown(data: Partial<{
  org: Org[],
  department: Department[],
  stage: Stage[],
  form: Form[]
}>) {
  const { org, department, stage, form } = data;
  if (org)
    org.forEach(v => orgMap.set(v.id, { ...v, children: [], stages: [], forms: [] }));
  if (department)
    department.forEach(v => {
      getOrg(v.parent).children.push(v);
      departmentMap.set(v.id, v);
    });
  if (stage)
    stage.forEach(v => {
      getOrg(v.owner).stages.push(v);
      stageMap.set(v.id, v);
    });
  if (form)
    form.forEach(v => {
      getOrg(v.belongTo).forms.push(v);
      formMap.set(v.id, v);
    });
}