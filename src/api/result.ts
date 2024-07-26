import { StepType } from '../console/result/ResultOverview';
import { getApi, pkgPost } from './core';

export async function setIntents(formId: number, intentIds: number[], step: StepType) {
  return await pkgPost('/result/set', { intentIds, step, formId });
}

export async function getResults(formId: number, zjuIds: string[]) {
  let resp = await getApi('/result', { formId, target: zjuIds.join(',') });
  return await resp.json();
}