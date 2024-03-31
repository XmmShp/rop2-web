import { useEffect, useState } from 'react';
import { getApi } from './core';

export async function useData<T>(
  pathname: `/${string}`,
  dataProcessor: (resp: Response) => T,
  initialState: T | (() => T),
  params: Record<string, any> = {},
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T>(initialState);
  useEffect(() => {
    const abortCtrl = new AbortController();
    getApi(pathname, params, { signal: abortCtrl.signal })
      .then(
        (resp) => setData(dataProcessor(resp)),
        (reason) => console.warn('fetch failed: ', reason)
      );
    return abortCtrl.abort.bind(abortCtrl);
  }, [params, ...deps]);
  return data;
}