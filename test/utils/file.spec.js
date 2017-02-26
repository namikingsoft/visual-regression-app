// @flow
import assert from 'power-assert';
import fs from 'fs';
import mock from 'mock-fs';
import {
  putFile,
  getTextFile,
  scanDir,
  scanDirWithKey,
  mkdir,
  mkdirWithFile,
} from 'utils/file';

describe('utils/file', () => {
  beforeEach(() => {
    mock({
      '/path/to/fake': {
        'test1.txt': 'text1',
        'data-dir': {
          'text2.txt': 'text2',
        },
        'empty-dir': {},
      },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('putFile', () => {
    it('should be put file making directory', async () => {
      await putFile('/path/to/fake/newdir/text3.txt')('text3');
      assert(
        fs.readFileSync('/path/to/fake/newdir/text3.txt', 'utf-8')
        === 'text3',
      );
    });

    it('should be pass through data on Promise', async () => {
      assert(
        await putFile('/path/to/fake/newdir/text3.txt')('text3')
        === 'text3',
      );
    });
  });

  describe('getTextFile', () => {
    it('should be get text from file', async () => {
      assert(
        await getTextFile('/path/to/fake/test1.txt')
        === 'text1',
      );
    });
  });

  describe('scanDir', () => {
    it('should be return files in directory recursive', async () => {
      assert.deepEqual(
        await scanDir('/path/to/fake'),
        [
          '/path/to/fake/test1.txt',
          '/path/to/fake/data-dir/text2.txt',
        ],
      );
    });
  });

  describe('scanDirWithKey', () => {
    it('should be return files in directory recursive with path', async () => {
      assert.deepEqual(
        await scanDirWithKey('/path/to/fake'),
        {
          '/test1.txt': '/path/to/fake/test1.txt',
          '/data-dir/text2.txt': '/path/to/fake/data-dir/text2.txt',
        },
      );
    });
  });

  describe('mkdir', () => {
    it('should be make directory recursive', async () => {
      await mkdir('/path/to/fake/newdir/re-newdir');
      assert(fs.statSync('/path/to/fake/newdir/re-newdir').isDirectory());
    });
  });

  describe('mkdirWithFile', () => {
    it('should be make directory recursive with file', async () => {
      await mkdirWithFile('/path/to/fake/newdir/re-newdir/test4.txt');
      assert(fs.statSync('/path/to/fake/newdir/re-newdir').isDirectory());
      assert(!fs.existsSync('/path/to/fake/newdir/re-newdir/text4.txt'));
    });
  });
});
