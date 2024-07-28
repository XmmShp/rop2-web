import { pkgPost } from './core';

export async function addDepart(name: string) {
  return (await pkgPost('/org/addDepart', { name }));
}

export async function deleteDepart(id: number) {
  return (await pkgPost('/org/deleteDepart', { id }));
}

export async function renameDepart(id: number, newName: string) {
  return (await pkgPost('/org/renameDepart', { id, newName }));
}