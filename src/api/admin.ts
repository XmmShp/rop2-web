/**编辑(添加&修改&删除)管理员相关API */

import { pkgPost } from "./core";

export async function editAdmin(zjuId: string, nickname: string, level: number) {
  return await pkgPost('/admin/edit', { zjuId, nickname, level });
}