// @flow
import assert from 'power-assert';
import nock from 'nock';
import { get, post } from 'utils/request';

describe('utils/request', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('get', () => {
    before(() => {
      nock('http://example.com')
      .get('/builds/1')
      .reply(200, {
        id: 1,
        value: 'test',
      });
      nock('http://example.com')
      .get('/builds')
      .reply(200, [{
        id: 1,
        value: 'test',
      }]);
    });

    it('should be get specified resource', async () => {
      assert.deepEqual(
        await get()('http://example.com/builds/1'),
        {
          id: 1,
          value: 'test',
        },
      );
      assert.deepEqual(
        await get()('http://example.com/builds'),
        [{
          id: 1,
          value: 'test',
        }],
      );
    });
  });

  describe('post', () => {
    before(() => {
      nock('http://example.com')
      .post('/builds')
      .reply(200, {
        id: 1,
        value: 'test',
      });
    });

    it('should be post specified resource', async () => {
      assert.deepEqual(
        await post()('http://example.com/builds')({
          value: 'test',
        }),
        {
          id: 1,
          value: 'test',
        },
      );
    });
  });
});
