/**增删改表单的API */

import { Dayjs } from 'dayjs';
import { pkgPost } from './core';

export async function createForm(name: string) {
  return await pkgPost('/form/create', { name });
}

type FormMutations = {
  startAt?: Dayjs;
  endAt?: Dayjs;
  name?: string;
  desc?: string;
  children?: string;
};
/**修改表单。支持仅更新部分字段 */
export async function editForm(id: number, modifyFields: FormMutations) {
  return await pkgPost('/form/edit', { ...modifyFields, id });
}

export async function deleteForm(id: number) {
  return await pkgPost('/form/delete', { formId: id });
}
