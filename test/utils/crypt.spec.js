// @flow
import assert from 'power-assert';
import {
  encode,
  decode,
  hash,
} from 'utils/crypt';

describe('utils/crypt', () => {
  describe('encode', () => {
    it('should be encode plain text', () => {
      assert(
        encode('password')('test')
        === 'wApIOvMN0iOkg5gkNZ_hXQ',
      );
    });

    it('should be encode plain mixed', () => {
      assert(
        encode('password')({ key: 1234, text: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        === 'RvHyqzpwlEUkn9wsNaaMbhCLblWntQsXH-D9Q_A4oi2ldHg3UtKsXEexdqMuip6nPeCy16VKtMKRRB_uw5cffQ',
      );
    });
  });

  describe('decode', () => {
    it('should be decode encoded text', () => {
      assert(
        decode('password')('wApIOvMN0iOkg5gkNZ_hXQ')
        === 'test',
      );
    });

    it('should be decode encoded mixed', () => {
      assert.deepEqual(
        decode('password')('RvHyqzpwlEUkn9wsNaaMbhCLblWntQsXH-D9Q_A4oi2ldHg3UtKsXEexdqMuip6nPeCy16VKtMKRRB_uw5cffQ'),
        { key: 1234, text: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
      );
    });
  });

  describe('decode', () => {
    it('should be hash text', () => {
      assert(
        hash('test')
        === 'fca18be45bdf42df02bf327c68249cd9450e8c245f3bf2b34d1eed6d',
      );
    });

    it('should be hash mixed', () => {
      assert(
        hash({ key: 1234 })
        === '731a5206e3021ccf2e530bec1418b4318b3f4d9cbeb59e9b27368331',
      );
    });
  });
});
