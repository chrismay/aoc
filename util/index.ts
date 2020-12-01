export function distinct<T>(e: T, i: number, arr: T[]): boolean {
    return arr.indexOf(e) === i;
  }

  export function cartesianProduct<T>(...allEntries: T[][]): T[][] {
    return allEntries.reduce<T[][]>(
      (results, entries) =>
        results
          .map(result => entries.map(entry => [...result, entry] ))
          .reduce((subResults, result) => [...subResults, ...result]   , []), 
      [[]]
    );
  }