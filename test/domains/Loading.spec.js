// @flow
import assert from 'power-assert';
import { compose } from 'ramda';
import {
  create,
  isLoading,
  startLoading,
  finishLoading,
} from 'domains/Loading';

describe('domains/Loading', () => {
  it('should be behave stack', () => {
    const a = create();
    assert(!isLoading(a));
    const b = startLoading(a);
    assert(isLoading(b));
    const c = finishLoading(b);
    assert(!isLoading(c));
  });
  it('should be behave complex stack', () => {
    const a = compose(
      startLoading,
      startLoading,
      finishLoading,
      startLoading,
    )(create());
    assert(isLoading(a));
    const b = finishLoading(a);
    assert(isLoading(b));
    const c = finishLoading(b);
    assert(!isLoading(c));
  });
  it('should not be fall below zero count', () => {
    const a = compose(finishLoading, finishLoading, finishLoading, create)();
    assert(!isLoading(a));
    const b = startLoading(a);
    assert(isLoading(b));
    const c = finishLoading(b);
    assert(!isLoading(c));
  });
});
