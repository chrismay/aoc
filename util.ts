export const cartesianProduct: <T>(...sets: T[][]) => T[][] = <T>(...sets: T[][]) =>
  sets.reduce<T[][]>((accSets, set) => accSets.flatMap((accSet) => set.map((value) => [...accSet, value])), [[]]);

export const time = <T extends Array<unknown>, U>(label: string, fn: (...args: T) => U) => {
  return (...args: T): U => {
    //console.log(`${label}>>:`, Date.now());
    const ret = fn(...args);
    //console.log(`${label}<<:`, Date.now());
    return ret;
  };
};

export function notNull<T>(t: T | undefined): T {
  if (t === undefined) {
    throw "NullPointerException!";
  }
  return t;
}

// modulo function that always returns positive values
export function absMod(val: number, mod: number): number {
  return ((val % mod) + mod) % mod;
}

// Create a generator that repeatedly applies a function to its own output.
export function* iterate<T>(f: (t: T) => T, init: T) {
  let current = init;
  while (true) {
    yield current;
    current = f(current);
  }
}

export function* reductions<TFrom, TTo>(
  input: Iterable<TFrom>,
  reducer: (acc: TTo, e: TFrom) => TTo,
  init: TTo
): Generator<TTo, TTo, unknown> {
  let result = init;
  for (const e of input) {
    result = reducer(result, e);
    yield result;
  }
  return result;
}
