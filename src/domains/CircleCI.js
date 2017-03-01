// @flow
import { pipe, map } from 'ramda';
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
  reponame: string,
};

type BuildNumParam = {
  buildNum: number,
};

export type BuildParam = ProjectParam & BuildNumParam;

export type Build = {
  status:
    'retried'
  | 'canceled'
  | 'infrastructure_fail'
  | 'timedout'
  | 'not_run'
  | 'running'
  | 'failed'
  | 'queued'
  | 'scheduled'
  | 'not_running'
  | 'no_tests'
  | 'fixed'
  | 'success',
  username: string,
  reponame: string,
  vcs_type: string,
  build_num: string,
  build_url: string,
};

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
const checkStatusCountLimit = 12; // 2 min
const checkStatusDeltaMsec = 10 * 1000;

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
= ({ vcsType, username, reponame }) => `/project/${vcsType}/${username}/${reponame}`;

const pathBuild:
  BuildParam => Path
= ({ buildNum, ...param }) => `${pathProject(param)}/${buildNum}`;

const pathArtifacts:
  BuildParam => Uri
= x => `${pathBuild(x)}/artifacts`;

export const getBuildViewUri:
  { username: string, reponame: string, buildNum: number } => Uri
= ({ username, reponame, buildNum }) => (
  `https://circleci.com/gh/${username}/${reponame}/${String(buildNum)}`
);

export const getBuild:
  Token => BuildParam => Promise<Build>
= token => pipe(
  pathBuild,
  buildUri(token),
  get(),
  andThen(pipe(
    camelize,
    returnPromise,
  )),
);

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

export const saveArtifacts:
  Token => DirPath => Artifact[] => Promise<any>
= token => dirpath => pipe(
  map(pipe(
    downloadArtifact(token),
    andThen(data => putFile(`${dirpath}${data.path}`)(data.buffer)),
  )),
  returnPromiseAll,
);

export const isDoneBuild:
  Build => boolean
= x => /^(no_tests|timedout|fixed|canceled|success|failed)$/.test(x.status);

export const untilDoneBuild:
  Token => BuildParam => Promise<Build>
= token => async param => {
  /* eslint-disable */
  for (let i = 0; i < checkStatusCountLimit; i += 1) {
    const build = await getBuild(token)(param);
    if (isDoneBuild(build)) return build;
    await new Promise(resolve => setTimeout(resolve, checkStatusDeltaMsec));
  }
  throw new Error('error');
  /* eslint-enable */
};
