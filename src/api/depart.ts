import { pkgPost } from './core';

export async function addDepart(name: string) {
  return (await pkgPost('/org/addDepart', { name })).message;
}

export async function deleteDepart(id: number) {
  return (await pkgPost('/org/deleteDepart', { id })).message;
}

export async function renameDepart(id: number, newName: string) {
  return (await pkgPost('/org/renameDepart', { id, newName })).message;
}