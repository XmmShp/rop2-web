import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { kvGet, kvSet } from './store/kvCache';

export function singleMatch(str: string, regexp: RegExp): string | null {
  const result = str.match(regexp);
  if (!result)
    return null;
  return result[1];
}

export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);
  useLayoutEffect(() => {
    const updateMatches = ({ matches }: MediaQueryListEvent) => setIsDark(matches);
    const m = globalThis.matchMedia('(prefers-color-scheme: dark)');
    m.addEventListener('change', updateMatches);
    if (m.matches) setIsDark(true);
    return () => { m.removeEventListener('change', updateMatches); }
  });
  return isDark;
}

export function without<K extends string | symbol, O extends Record<K, any>>(obj: O, keys: K[]): Omit<O, K> {
  const nObj: any = {};
  for (const [k, v] of Object.entries(obj))
    if (!keys.includes(k as any)) nObj[k] = v;
  return nObj;
}

type FalseTypes = undefined | null | false | 0;
declare global {
  interface Number {
    pad(minLength?: number, floatMaxLength?: number): string;
  }
  interface Date {
    stringify(withTime?: boolean, useDot?: boolean): string;
  }
  interface Array<T> {
    first<R extends Exclude<any, FalseTypes>>(cb: (v: T) => R | FalseTypes): R | undefined;
  }
}
Object.defineProperty(Number.prototype, 'pad', {
  value(minLength = 0, floatMaxLength = 0) {
    const fixed = this.toFixed(floatMaxLength);
    if (!minLength) return fixed;
    else return fixed.padStart(minLength, '0');
  },
  configurable: true,
} satisfies ThisType<number> & PropertyDescriptor);
Object.defineProperty(Date.prototype, 'stringify', {
  value(withTime = false, useDot = false) {
    const sep = useDot ? ['.', '.', ''] : ['年', '月', '日'];
    let result = `${this.getFullYear()}${sep[0]}${this.getMonth() + 1}${sep[1]}${this.getDate()}${sep[2]}`;
    if (withTime) result += ` ${this.getHours().pad(2, 0)}:${this.getMinutes().pad(2, 0)}:${this.getSeconds().pad(2, 0)}`;
    return result;
  },
  configurable: true,
} satisfies ThisType<Date> & PropertyDescriptor);
Object.defineProperty(Array.prototype, 'first', {
  value<R extends Exclude<any, FalseTypes>>(cb: (v: unknown) => R | FalseTypes): R | undefined {
    for (let i = 0; i < this.length; i++) {
      const r = cb(this[i]);
      if (r) return r;
    }
  },
  configurable: true,
} satisfies ThisType<Array<any>> & PropertyDescriptor);

/**仅限测试，返回一个指定延时后兑现的Promise */
export function delay(ms: number): Promise<void> {
  return new Promise((rs) => setTimeout(rs, ms));
}

/**如果`arg`为`undefined`或`null`，返回空数组；
 * 
 * 否则，返回`arg`或`[arg]`(取决于`arg`是否为数组)。 */
export function toArray<T extends NonNullable<any>>(arg: undefined | null | T | T[]): T[] {
  if (arg === null || arg === undefined) return []
  if (Array.isArray(arg)) return arg;
  return [arg];
}

export function num(...from: (string | undefined | null | number)[]): number {
  for (const f of from) {
    if (typeof f === 'number') return f;
    if (f === undefined || f === null || !f.trim()) continue;
    const r = Number(f);
    if (Number.isSafeInteger(r)) return r;
  }
  throw new Error('数字转换失败');
  // return 0;
}

export function newUniqueLabel(labels: string[], prefix: string): string {
  let usedCount = 0;
  let result = `${prefix}${labels.length + 1}`;
  while (labels.includes(result)) {
    usedCount++;
    result = `${prefix}${labels.length + 1}(${usedCount})`;
  }
  return result;
}

/**将数组内某个元素前后移指定位置，返回新数组，不改变原数组 */
export function moveElement<T>(array: T[], prevIndex: number, delta: number) {
  const newArray = [...array];
  if (!delta) return newArray;
  const length = newArray.length;
  const element = newArray[prevIndex];
  let newIndex;
  const tryIndex = prevIndex + delta;
  if (delta > 0) {
    newIndex = Math.min(tryIndex, length - 1);
    newArray.copyWithin(prevIndex, prevIndex + 1, newIndex + 1);
  } else {
    newIndex = Math.max(tryIndex, 0);
    newArray.copyWithin(newIndex + 1, newIndex, prevIndex);
  }
  newArray[newIndex] = element;
  return newArray;
}

export function useStoredState<T>(initer: T | (() => T), storeKey: string) {
  const [value, setValue] = useState(() => {
    const storedValue = kvGet(storeKey);
    if (storedValue) return JSON.parse(storedValue) as T;
    else {
      if (initer instanceof Function) return initer();
      else return initer;
    }
  });
  return [value, (newValue: T) => {
    setValue(newValue);
    kvSet(storeKey, JSON.stringify(newValue));
  }] as const;
}

/**保证不以/结尾的basename，如/rop2。如果直接在根目录部署，返回空字符串 */
export const basename: string = import.meta.env.BASE_URL.replace(/\/+$/, '');
//`import.meta.env.BASE_URL`在编译时会被vite静态替换

/**返回一个数，该数每经过`second`秒后自增1(需要重新调用此函数获取)。 */
export function period(second: number) {
  return Math.floor(Date.now() / 1000 / second);
}

/**React Hook，每隔一定时间更新一次组件。返回值为已经过的周期数(初始调用时为0) */
export function usePeriod(second: number): number {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  useEffect(() => {
    const timerId = setInterval(() => {
      const newCount = countRef.current + 1;
      setCount(newCount);
      countRef.current = newCount;
    }, second * 1000);
    return () => clearInterval(timerId);
  }, [second])
  return count;
}
export function useNickname() {
  /**每隔15s才查询localStorage(如果没有组件更新不会主动更新，与usePeriod不同) */
  return useMemo<string | null>(() => kvGet('nickname'), [period(15)]);
}

/**尝试用简体中文表示一个整数，对于0~10返回零~十，其它返回数字toString */
export function numSC(from: number): string {
  const base = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  return base[from] ?? from.toString();
}

/**获得函数的防抖版本。忽略this(读取为null)和返回值。*/
export function debounce<A extends any[]>(f: (...args: A) => void, wait: number): (...args: A) => void {
  let timerId: number;
  return function (...args: A) {
    clearTimeout(timerId);
    timerId = setTimeout(() => f.apply(null, args), wait);
  };
}

export const throwArgs = (...args: any[]) => { throw args };

export function pathname(): string {
  const p = location.pathname;
  if (p.startsWith(basename)) return p.slice(basename.length);
  console.error('basename不匹配', p, basename);
  return p;
}

export function useReloader(): { (): void, count: number } {
  const [count, setCount] = useState(0);
  const result = () => setCount(count + 1);
  result.count = count;
  return result;
}