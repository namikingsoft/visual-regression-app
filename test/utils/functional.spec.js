// @flow
import assert from 'power-assert';
import { pipe } from 'ramda';
import {
  returnPromise,
  returnPromiseAll,
  andThen,
  camelize,
  dump,
} from 'utils/functional';

describe('utils/functional', () => {
  const promise1 = Promise.resolve(1);
  const add = x => y => x + y;
  const add1p = x => Promise.resolve(x + 1);
  const div = x => y => new Promise((resolve, reject) => (
    x === 0 ? reject('cannot div 0') : resolve(y / x)
  ));

  describe('returnPromise', () => {
    it('should be behave unit of Promise', async () => {
      assert(await returnPromise(1234) === 1234);
      assert(await returnPromise('hello') === 'hello');
    });
    it('should be behave sugar syntax of Promise.resolve', async () => {
      assert(await returnPromise(1234) === await Promise.resolve(1234));
      assert(await returnPromise('hello') === await Promise.resolve('hello'));
    });
    it('can be pipe on babel', async () => {
      const fn = pipe(x => x + 1, returnPromise);
      assert(await fn(1) === 2);
    });
  });

  describe('returnPromiseAll', () => {
    it('should be collect array of Promise', async () => {
      assert.deepEqual(
        await returnPromiseAll([
          returnPromise(1),
          returnPromise(2),
          returnPromise(3),
          returnPromise(4),
        ]),
        [1, 2, 3, 4],
      );
    });
  });

  describe('andThen', () => {
    it('should be convert function chainable', async () => {
      const result = await andThen(add1p)(promise1);
      assert(result === 2);
    });
    it('should be pipe chain', async () => {
      const fn = pipe(
        div(2),
        andThen(pipe(
          add(1),
          returnPromise,
        )),
      );
      assert(await fn(4) === 3);
      assert(await fn(6) === 4);
    });
  });

  describe('camelize', () => {
    it('should be convert keys in object to camelcase', () => {
      assert.deepEqual(
        camelize({
          path: 'test1',
          pretty_path: 'test2',
        }),
        {
          path: 'test1',
          prettyPath: 'test2',
        },
      );
    });
  });

  describe('dump', () => {
    it('should be pass through', () => {
      assert(dump(() => null)(1234) === 1234);
      assert(dump(() => null)('test') === 'test');
      assert.deepEqual(
        dump(() => null)({
          key: 'key1',
          val: 'val1',
        }),
        {
          key: 'key1',
          val: 'val1',
        },
      );
    });

    it('should be dump by dumper function', () => {
      let log; // eslint-disable-line immutable/no-let
      const dumper = x => { log = x; };
      // const dumper = console.log;
      dump(dumper)('hello');
      assert(log === 'hello');
    });
  });
});
