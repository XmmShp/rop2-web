//使用localStorage实现的键值对存储
//此储存方式适用于储存不同结构、小规模的值

/**生成项目特定的localStorage key，防止冲突 */
const scopedKeyRegex = /^rop2:.+$/;
function scopedKey(from: string): string {
  return `rop2:${from}`;
}

export function kvGet(key: string): string | null {
  return localStorage.getItem(scopedKey(key));
}

export function kvSet(key: string, value: string) {
  localStorage.setItem(scopedKey(key), value);
}

export function kvUnset(key: string) {
  localStorage.removeItem(scopedKey(key));
}

export function kvClear() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.match(scopedKeyRegex))
      keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}