import { pkgPost } from "./core";

export async function editAdmin(zjuId: string, nickname: string, level: number) {
  return await pkgPost('/admin/edit', { zjuId, nickname, level });
}