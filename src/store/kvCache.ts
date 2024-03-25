//使用localStorage实现的键值对存储
//此储存方式适用于储存不同结构、小规模的值

/**生成项目特定的localStorage key，防止冲突 */
function scopedKey(from: string): string {
  return `rop2:${from}`;
}

export function kvGet(key: string): string | null {
  return localStorage.getItem(scopedKey(key));
}

export function kvSet(key: string, value: string) {
  localStorage.setItem(scopedKey(key), value);
}
