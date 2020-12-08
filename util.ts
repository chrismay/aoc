// hide mutable implementation...
export function doWhile<T>(f: (t: T) => T, test: (t: T) => boolean, init: T): T {
  let ret = init;
  let carryOn = test(init);
  while (carryOn) {
    ret = f(ret);
    carryOn = test(ret);
  }
  return ret;
}
