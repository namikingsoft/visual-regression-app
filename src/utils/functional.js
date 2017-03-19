// @flow
import camelcase from 'camelcase';
import { pipe, keys, map, reduce } from 'ramda';

export const returnPromise:
  <A:any>(A) => Promise<A>
= x => Promise.resolve(x);

export const returnPromiseAll:
  <A:any>(Promise<A>[]) => Promise<A[]>
= xs => Promise.all(xs);

export const returnPromiseInOrder:
  <A:any>((void => Promise<A>)[]) => Promise<A[]>
= async xs => {
  const results = [];
  await xs.reduce(
    (acc, fn) => acc.then(async () => {
      results.push(await fn());
    }),
    Promise.resolve(),
  );
  return results;
};

export const mapSeriesPromise:
  <A:any, B:any>(A => Promise<B>) => A[] => Promise<B[]>
= fn => pipe(
  map(x => () => fn(x)),
  returnPromiseInOrder,
);

export const andThen:
  <A:any, B:any>(A => Promise<B>) => Promise<A> => Promise<B>
= fn => p => p.then(fn);

export const camelize:
  <A:Object>(A) => A
= pipe(
  x => pipe(keys, map(k => [k, x[k]]))(x),
  reduce((acc, [k, v]) => ({ ...acc, [camelcase(k)]: v }), {}),
);

export const dump:
  <T:any>(T => any) => T => T
= dumper => x => {
  dumper(x);
  return x;
};
