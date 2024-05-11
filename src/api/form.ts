import { pkgPost } from './core';

export async function createForm(name: string) {
  return (await pkgPost('/form/create', { name })).message;
}

export async function editForm(id: number, modifyFields: { [key: string]: unknown }) {
  return await pkgPost('/form/edit', { ...modifyFields, id });
}