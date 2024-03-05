import { useLayoutEffect, useState } from "react";

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k] extends Record<keyof any, any> ? Mutable<T[k]> : T[k];
}

export function mapRecur<
  K extends string,
  T extends { [key in K]?: Partial<T>[] } & Record<keyof any, any>,
  R extends T
>(arr: T[], key: K, handler: (obj: T, stack: T[]) => R, ancestors: T[] = []): R[] {
  return arr.map((v) => {
    const result = { ...v };
    if (result[key]?.length) (result[key] as any) = mapRecur(result[key]!, key, handler, [...ancestors, result]);
    return handler(result, ancestors);
  });
}

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

declare global {
  interface Number {
    pad(minLength?: number, floatMaxLength?: number): string;
  }
  interface Date {
    stringify(withTime?: boolean): string;
  }
}
Object.defineProperty(Number.prototype, 'pad', {
  value(minLength = 0, floatMaxLength = 0) {
    const fixed = this.toFixed(floatMaxLength);
    if (!minLength) return fixed;
    else return fixed.padStart(minLength, '0');
  }
} satisfies ThisType<number>);
Object.defineProperty(Date.prototype, 'stringify', {
  value(withTime = false) {
    let result = `${this.getFullYear()}年${this.getMonth() + 1}月${this.getDate()}日`;
    if (withTime) result += ` ${this.getHours().pad(2, 0)}:${this.getMinutes().pad(2, 0)}:${this.getSeconds().pad(2, 0)}`;
    return result;
  }
} satisfies ThisType<Date>);

/**仅限测试，返回一个指定延时后兑现的Promise */
export function delay(ms: number): Promise<void> {
  return new Promise((rs) => setTimeout(rs, ms));
}