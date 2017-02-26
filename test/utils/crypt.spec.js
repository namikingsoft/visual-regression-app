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
        === 'c00a483af30dd223a4839824359fe15d',
      );
    });

    it('should be encode plain mixed', () => {
      assert(
        encode('password')({ key: 1234, text: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        === '46f1f2ab3a709445249fdc2c35a68c6e108b6e55a7b50b171fe0fd43f038a22da574783752d2ac5c47b176a32e8a9ea73de0b2d7a54ab4c291441feec3971f7d',
      );
    });
  });

  describe('decode', () => {
    it('should be decode encoded text', () => {
      assert(
        decode('password')('c00a483af30dd223a4839824359fe15d')
        === 'test',
      );
    });

    it('should be decode encoded mixed', () => {
      assert.deepEqual(
        decode('password')('46f1f2ab3a709445249fdc2c35a68c6e108b6e55a7b50b171fe0fd43f038a22da574783752d2ac5c47b176a32e8a9ea73de0b2d7a54ab4c291441feec3971f7d'),
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
