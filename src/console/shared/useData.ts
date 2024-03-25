import { useState } from 'react';
import { DataType } from '../../store/dbCache';

export function useData<T>(dataType: DataType,
  loader: () => Promise<T[]>):
  [boolean, T[], () => Promise<void>] {
  //TODO use idb
  const newLoader = () => loader().then(v => {
    setInnerData(v);
    setLoading(false);
  });
  const [loading, setLoading] = useState(true);
  const [innerData, setInnerData] = useState<T[]>(() => {
    newLoader();
    return [];
  });
  return [loading, innerData, newLoader];
}