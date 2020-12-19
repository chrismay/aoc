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

// reduce that will exit early if the reducing function ever returns undefined
// in which case, the last value of the accumulator is returned and the remainder
// of the list is ignored.
export function partialReduce<T, A>(arr: T[], f: (a: A, t: T) => A | undefined, seed: A): A {
  if (arr === []) return seed;
  const [h, ...t] = arr;
  const acc = f(seed, h);
  return acc === undefined ? seed : partialReduce(t, f, acc);
}

export const cartesianProduct: <T>(...sets: T[][]) => T[][] = <T>(...sets: T[][]) =>
  sets.reduce<T[][]>((accSets, set) => accSets.flatMap((accSet) => set.map((value) => [...accSet, value])), [[]]);

export const time = <T extends Array<any>, U>(label: string, fn: (...args: T) => U) => {
  return (...args: T): U => {
    //console.log(`${label}>>:`, Date.now());
    const ret = fn(...args);
    //console.log(`${label}<<:`, Date.now());
    return ret;
  };
};
