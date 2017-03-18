// @flow
import type { Stats } from 'fs';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import recursive from 'recursive-readdir';
import { pipe, map, reduce } from 'ramda';
import { andThen, returnPromise } from 'utils/functional';

type DirPath = string;
type FilePath = string;
type Data = any;

export const mkdir:
  DirPath => Promise<FilePath>
= dirpath => new Promise((resolve, reject) => {
  mkdirp(dirpath, err => (err ? reject(err) : resolve(dirpath)));
});

export const mkdirWithFile:
  FilePath => Promise<FilePath>
= filepath => new Promise((resolve, reject) => {
  mkdirp(
    filepath.replace(/[^/]*$/, ''),
    err => (err ? reject(err) : resolve(filepath)),
  );
});

export const stat:
  FilePath => Promise<Stats>
= async filepath => new Promise((resolve, reject) => (
  fs.stat(filepath, (err, stats) => (err ? reject(err) : resolve(stats)))
));

export const exists:
  FilePath => Promise<boolean>
= async filepath => new Promise(resolve => (
  fs.access(filepath, fs.constants.R_OK, err => resolve(!err))
));

export const putFile:
  FilePath => Data => Promise<any>
= filepath => async data => {
  await mkdirWithFile(filepath);
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, err => (err ? reject(err) : resolve(data)));
  });
};

export const getTextFile:
  FilePath => Promise<any>
= filepath => new Promise((resolve, reject) => {
  fs.readFile(filepath, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
});

export const scanDir:
  DirPath => Promise<FilePath[]>
= dirpath => new Promise((resolve, reject) => {
  recursive(dirpath, (err, files) => (err ? reject(err) : resolve(files)));
});

export const scanDirWithKey:
  DirPath => {[key: string]: string}
= dirpath => pipe(
  scanDir,
  andThen(pipe(
    map(path.normalize),
    reduce((acc, x) => ({
      ...acc,
      [x.substring(path.normalize(dirpath).length)]: x,
    }), {}),
    returnPromise,
  )),
)(dirpath);
