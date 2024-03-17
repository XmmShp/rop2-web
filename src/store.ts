import { Form } from "./api/models/form";
import { Depart, Org } from "./api/models/org";
import { Id } from "./api/models/shared";
import { Stage } from "./api/models/stage";
import { forms } from "./mockData";

type Resource = {
  children: Depart[];
  stages: Stage[];
  forms: Form[];
};
const orgMap = new Map<Id, Org & Resource>();
export function getOrg(id: Id): Org & Resource {
  const result = orgMap.get(id);
  if (result) return result;
  throw new Error('Unimplemented yet');
}
const departMap = new Map<Id, Depart>();
export function getDepart(id: Id): Depart {
  const result = departMap.get(id);
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
  //TODO fetch
  return forms[0];
  throw new Error('Unimplemented yet');
}
export function setKnown(data: Partial<{
  org: Org[],
  depart: Depart[],
  stage: Stage[],
  form: Form[]
}>) {
  const { org, depart, stage, form } = data;
  if (org)
    org.forEach(v => orgMap.set(v.id, { ...v, children: [], stages: [], forms: [] }));
  if (depart)
    depart.forEach(v => {
      getOrg(v.parent).children.push(v);
      departMap.set(v.id, v);
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