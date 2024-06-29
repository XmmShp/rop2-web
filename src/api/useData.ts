import { useEffect, useState } from 'react';
import { getApi } from './core';

export type DataTuple<T> = [T, Promise<T> | null, (newValue: T, waitUntil?: Promise<unknown>) => void];
/**React Hook，异步加载数据。返回一个数组，元素分别为：数据；加载Promise(加载完后设为null，可判真切换加载UI)；刷新函数。
 * 
 * 首次渲染时先返回默认值，避免阻塞渲染；同时发送GET请求，用响应对象调用`dataProcessor`(可返回Promise)，然后用(异步)返回值更新state。
 * 
 * 当deps发生变化时，重新发送请求(响应前仍使用旧数据，但加载Promise不为空)。不会自动追踪`params`的变化。不传`deps`视同传空数组，不会在每次重渲染时重新fetch。
 * 
 * 刷新函数被调用时，将立即使用参数作为新的值，同时发送请求并异步更新。
 */
export function useData<T>(
  pathname: `/${string}`,
  dataProcessor: (resp: Response) => T | Promise<T>,
  initialState: T | (() => T),
  params: Record<string, any> = {},
  deps: React.DependencyList = [],
  condition = true, //对于有顺序的请求，可以等待前一个请求完成(condition为false时不发送本请求)
): DataTuple<T> {
  const [data, setData] = useState<T>(initialState);
  const [loadPromise, setLoadPromise] = useState<Promise<T> | null>(null);
  const [forceReloadTimes, setForceReloadTimes] = useState(0);
  useEffect(() => {
    if (!condition) {
      setLoadPromise(new Promise(() => { }));
      return;
    }
    const abortCtrl = new AbortController();
    const promise = new Promise<T>((rs, rj) => {
      getApi(pathname, params, { signal: abortCtrl.signal })
        .then(
          (resp) => {
            const result = dataProcessor(resp);
            if (result instanceof Promise) result.then(rs);
            else rs(result);
          },
          (reason) => {
            if (reason instanceof DOMException && reason.name === 'AbortError') {
              console.warn('fetch aborted', pathname, params);
              return;
            }
            console.error('fetch failed: ', reason);
            rj(reason);
          }
        );
    });
    promise.then((v) => {
      setLoadPromise(null);
      setData(v);
    });
    setLoadPromise(promise);
    return abortCtrl.abort.bind(abortCtrl);
  }, [condition, forceReloadTimes, ...deps]);
  return [data, loadPromise, (newValue: T, waitUntil) => {
    setData(newValue);
    if (waitUntil)
      waitUntil.then(() => { setForceReloadTimes(forceReloadTimes + 1) })
    else
      setForceReloadTimes(forceReloadTimes + 1);
  }];
}