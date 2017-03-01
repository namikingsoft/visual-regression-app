// @flow
import assert from 'power-assert';
import nock from 'nock';
import {
  getArtifacts,
  downloadArtifact,
} from 'domains/CircleCI';

describe('domains/CircleCI', () => {
  const artifact1 = {
    path: '/tmp/circle-artifacts.abcd/screenshot/dummy.png',
    prettyPath: '$CIRCLE_ARTIFACTS/screenshot/dummy.png',
    nodeIndex: 0,
    url: 'https://1234-gh.circle-artifacts.com/0/tmp/circle-artifacts.abcd/screenshot/dummy.png',
  };

  after(() => {
    nock.cleanAll();
  });

  describe('getArtifacts', () => {
    before(() => {
      nock('https://circleci.com')
      .get('/api/v1.1/project/github/user/repo/1/artifacts')
      .query({ 'circle-token': 'token' })
      .reply(200, [{
        path: '/tmp/circle-artifacts.abcd/screenshot/dummy.png',
        pretty_path: '$CIRCLE_ARTIFACTS/screenshot/dummy.png',
        node_index: 0,
        url: 'https://1234-gh.circle-artifacts.com/0/tmp/circle-artifacts.abcd/screenshot/dummy.png',
      }]);
    });

    it('should be get artifacts', async () => {
      assert.deepEqual(
        await getArtifacts('token')({
          vcsType: 'github',
          username: 'user',
          reponame: 'repo',
          buildNum: 1,
        }),
        [{
          path: '/tmp/circle-artifacts.abcd/screenshot/dummy.png',
          prettyPath: '$CIRCLE_ARTIFACTS/screenshot/dummy.png',
          nodeIndex: 0,
          url: 'https://1234-gh.circle-artifacts.com/0/tmp/circle-artifacts.abcd/screenshot/dummy.png',
        }],
      );
    });
  });

  describe('downloadArtifact', () => {
    before(() => {
      nock('https://1234-gh.circle-artifacts.com')
      .get('/0/tmp/circle-artifacts.abcd/screenshot/dummy.png')
      .query({ 'circle-token': 'token' })
      .reply(200, 'text');
    });

    it('should be download artifact', async () => {
      const data = await downloadArtifact('token')(artifact1);
      assert(data.path === '/screenshot/dummy.png');
      assert(String(data.buffer) === 'text');
    });
  });
});
