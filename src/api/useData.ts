import { useEffect, useState } from 'react';
import { getApi } from './core';

/**React Hook，实现异步加载数据。返回一个数组，元素分别为：数据；加载Promise(加载完后设为null)；刷新函数
 * 
 * 首次渲染时先返回默认值避免阻塞渲染；同时发送GET请求，用响应对象调用`dataProcessor`（可返回Promise），然后用返回值更新state。
 * 
 * 当deps发生变化时，重新发送GET请求。此函数不会自动追踪params的变化。
 */
export function useData<T>(
  pathname: `/${string}`,
  dataProcessor: (resp: Response) => T | Promise<T>,
  initialState: T | (() => T),
  params: Record<string, any> = {},
  deps: React.DependencyList = []
): [T, Promise<T> | null, () => void] {
  const [data, setData] = useState<T>(initialState);
  const [loadPromise, setLoadPromise] = useState<Promise<T> | null>(null);
  const [forceReloadTimes, setForceReloadTimes] = useState(0);
  useEffect(() => {
    let abortFunc: () => void;
    const promise = new Promise<T>((rs, rj) => {
      const abortCtrl = new AbortController();
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
            console.warn('fetch failed: ', reason);
            rj(reason);
          }
        );
      abortFunc = abortCtrl.abort.bind(abortCtrl);
    });
    promise.then((v) => {
      setLoadPromise(null);
      setData(v);
    });
    setLoadPromise(promise);
    return abortFunc!; // 非空断言
  }, [forceReloadTimes, ...deps]);
  return [data, loadPromise, () => setForceReloadTimes(forceReloadTimes + 1)];
}