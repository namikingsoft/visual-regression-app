// @flow
import { pipe, map, filter } from 'ramda';
import { andThen, returnPromise, returnPromiseAll, camelize } from 'utils/functional';
import { get } from 'utils/request';
import { putFile } from 'utils/file';

type Uri = string;
type Path = string;
type Token = string;
type DirPath = string;

type ProjectParam = {
  vcsType: string,
  username: string,
  project: string,
};

type BuildNumParam = {
  buildNum: number,
};

export type BuildParam = ProjectParam & BuildNumParam;

export type Artifact = {
  path: string,
  prettyPath: string,
  nodeIndex: number,
  url: string,
};

export type ArtifactData = {
  path: string,
  buffer: ArrayBuffer,
};

const apiBaseUri = 'https://circleci.com/api/v1.1';

const prefixBaseUri:
  Path => Uri
= x => `${apiBaseUri}${x}`;

const suffixToken:
  Token => Uri => Uri
= token => x => `${x}?circle-token=${token}`;

const buildUri:
  Token => Path => Uri
= token => pipe(
  prefixBaseUri,
  suffixToken(token),
);

const pathProject:
  ProjectParam => Path
= ({ vcsType, username, project }) => `/project/${vcsType}/${username}/${project}`;

const pathBuild:
  BuildParam => Path
= ({ buildNum, ...param }) => `${pathProject(param)}/${buildNum}`;

const pathArtifacts:
  BuildParam => Uri
= x => `${pathBuild(x)}/artifacts`;

export const getArtifacts:
  Token => BuildParam => Promise<Artifact[]>
= token => pipe(
  pathArtifacts,
  buildUri(token),
  get(),
  andThen(pipe(
    map(camelize),
    returnPromise,
  )),
);

export const downloadArtifact:
  Token => Artifact => Promise<ArtifactData>
= token => artifact => pipe(
  suffixToken(token),
  get({ responseType: 'arraybuffer' }),
  andThen(pipe(
    buffer => ({
      path: artifact.prettyPath.replace(/\$CIRCLE_ARTIFACTS/, ''),
      buffer,
    }),
    returnPromise,
  )),
)(artifact.url);

export const downloadArtifacts:
  Token => DirPath => BuildParam => Promise<any>
= token => dirpath => pipe(
  getArtifacts(token),
  andThen(pipe(
    filter(x => /login/.test(x.path)),
    filter(x => /[0-9]\.png$/.test(x.path)),
    map(pipe(
      downloadArtifact(token),
      andThen(data => putFile(`${dirpath}${data.path}`)(data.buffer)),
    )),
    returnPromiseAll,
  )),
);
