// @flow
import camelcase from 'camelcase';
import { pipe, keys, map, reduce } from 'ramda';

export const returnPromise:
  <A:any>(A) => Promise<A>
= x => Promise.resolve(x);

export const returnPromiseAll:
  <A:any>(Promise<A>[]) => Promise<A[]>
= xs => Promise.all(xs);

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
