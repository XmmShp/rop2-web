import { StepType } from '../console/result/ResultOverview';
import { getApi, pkgPost } from './core';

export async function setIntents(formId: number, intentIds: number[], step: StepType) {
  return await pkgPost('/result/set', { intentIds, step, formId });
}

export type ResultDetail = {
  content: string, //json
  name: string,
  phone: string
} 