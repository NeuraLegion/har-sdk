export const first = <T>(
  promises: PromiseLike<T>[],
  predicate: (value: T) => unknown
): Promise<T | undefined> => {
  const newPromises: Promise<T | undefined>[] = promises.map(
    (p) =>
      new Promise<T>((resolve, reject) =>
        p.then((v) => !!predicate(v) && resolve(v), reject)
      )
  );
  newPromises.push(Promise.all(promises).then(() => undefined));

  return Promise.race(newPromises);
};
