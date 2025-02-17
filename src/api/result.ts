import { StepType } from '../console/result/ResultOverview';
import { pkgPost } from './core';

export async function setIntents(formId: number, intentIds: number[], step: StepType) {
  return await pkgPost('/result/set', { intentIds, step, formId });
}

export type ResultDetail = {
  zjuId: string;
  content: Record<string, unknown>; //json
  name: string;
  phone: string;
};
