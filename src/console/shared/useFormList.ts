import { createContext, useContext } from 'react';
import { DataTuple, useData } from '../../api/useData';

export type FormOutline = {
  id: number;
  name: string;
  startAt?: string;
  endAt?: string;
  createAt: string;
  // updateAt: string;//not used yet
};
export type FormList = FormOutline[];

export function useFormList(): DataTuple<FormList> {
  return useData<FormList>('/form/list', async (resp) => {
    if (resp.status === 403) return []; //确保不报错，403错误在GET /org中处理
    return await resp.json()
  }, []);
}
export function useFormListFromContext(): DataTuple<FormList> {
  const v = useContext(FormListContext);
  return v;
}
export const FormListContext = createContext<DataTuple<FormList>>(null as any);