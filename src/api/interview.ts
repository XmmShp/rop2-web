/**面试相关API(管理面试/面试报名) */

import { Dayjs } from 'dayjs';
import { StepType } from '../console/result/ResultOverview';
import { pkgPost } from './core';

export function addInterview(formId: number, depart: number, step: StepType, capacity: number, location: string, startAt: Dayjs, endAt: Dayjs) {
  return pkgPost('/interview/add', {
    formId,
    depart,
    step,
    capacity,
    location,
    startAt,
    endAt,
  });
}

export function freezeInterview(interviewId: number) {
  return pkgPost('/interview/freeze', { id: interviewId });
}

export function deleteInterview(interviewId: number) {
  return pkgPost('/interview/delete', { id: interviewId });
}

export function deleteInterviewSchedule(interviewId: number, zjuId: string) {
  return pkgPost('/interview/schedule/delete', { id: interviewId, zjuId });
}

export function addInterviewSchedule(interviewId: number, zjuId: string) {
  return pkgPost('/interview/schedule/add', { id: interviewId, zjuId });
}
