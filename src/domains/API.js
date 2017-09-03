// @flow
import * as request from 'utils/request';
import { stringify } from 'query-string';
import type {
  DiffBuild,
  BuildParam,
} from 'domains/DiffBuild';

const get = request.get();

export const getDiffBuild:
  BuildParam => Promise<DiffBuild>
= buildParam => get(`/api/v1/builds?${stringify(buildParam)}`);
