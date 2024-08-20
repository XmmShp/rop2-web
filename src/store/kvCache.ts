//使用localStorage实现的键值对存储
//此储存方式适用于储存不同结构、小规模的值

/**生成项目特定的localStorage key，防止冲突 */
export const scopedKeyPrefix = 'rop2:';
function scopedKey<S extends string>(from: S): `rop2:${S}` {
  return `${scopedKeyPrefix}${from}`;
}

export const zjuIdKey = 'zjuId';
export function kvGet(key: string): string | null {
  return localStorage.getItem(scopedKey(key));
}

export function kvSet(key: string, value: string) {
  localStorage.setItem(scopedKey(key), value);
}

export function kvUnset(key: string) {
  localStorage.removeItem(scopedKey(key));
}

export function kvClear(keepChecker: (fullKey: string, value: string) => boolean = () => false) {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(scopedKeyPrefix) && !keepChecker(key, localStorage.getItem(key)!))
      keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}