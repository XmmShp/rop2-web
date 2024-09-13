/**在一个构造函数的prototype上补充方法实现。
 * @param ctor 目标构造函数。请传入`Array`而非`Array.prototype`。
 * @param key 方法名。如果目标原型上存在此键，将不再添加方法。
 * @param descriptor 传入一个对象，其中`value`属性为方法实现。其它属性将被忽略。
 */
function fillMethod<T>(ctor: { new(): T }, key: keyof T, descriptor: ThisType<T> & { value: Function }) {
  const target = ctor.prototype;
  if (key in target)
    return
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: descriptor.value
  })
}

fillMethod(Array, 'toSorted', {
  value(...args: Parameters<Array<any>['sort']>) {
    return this.slice().sort(...args);
  }
});