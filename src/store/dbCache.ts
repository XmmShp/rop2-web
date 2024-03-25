//使用IndexedDB实现的结构化数据存储
//适用于存储同类型、大量的结构化数据

//调试使用的删库方法
(globalThis as any).deleteDb = async () => {
  const dbs = await idb.databases();
  await Promise.all(dbs.map(d => idb.deleteDatabase(d.name!)));
}

const idb = globalThis.indexedDB;
const dbName = 'rop:cache';
const dbVersion = 1;
const objectStoreConfig = [
  { name: 'form', keyPath: 'id' }
] as const satisfies { name: string, keyPath: string }[];
export type DataType = typeof objectStoreConfig[number]['name'];
const db = await new Promise<IDBDatabase>((rs) => {
  const req = idb.open(dbName, dbVersion);
  req.addEventListener('upgradeneeded', () => {
    const d = req.result;
    objectStoreConfig.forEach(c =>
      d.createObjectStore(c.name, { keyPath: c.keyPath }));
  });
  req.addEventListener('success', () => {
    rs(req.result);
  });
});

export function dbStore(storeName: DataType, mode?: 'readonly' | 'readwrite') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

export function toPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((rs, rj) => {
    request.addEventListener('success', () => rs(request.result));
    request.addEventListener('error', () => rj());
  });
}