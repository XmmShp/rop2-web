import { postApi } from './core';

export async function login(): Promise<void> {
  await postApi('/login', {});
}