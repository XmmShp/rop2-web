import { pkgPost } from './core';

export async function createForm(name: string) {
  return (await pkgPost('/form/create', { name })).message;
}