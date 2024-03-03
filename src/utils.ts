export type Mutable<T> = {
  -readonly [k in keyof T]: T[k] extends Record<keyof any, any> ? Mutable<T[k]> : T[k];
}