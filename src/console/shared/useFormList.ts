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

export function useFormListProvider(): DataTuple<FormList> {
  return useData<FormList>('/form/list', async (resp) => await resp.json(), []);
}
export function useFormList(): DataTuple<FormList> {
  const v = useContext(FormListContext);
  return v;
}
export const FormListContext = createContext<DataTuple<FormList>>(null as any);