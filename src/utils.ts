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