// @flow
import * as request from 'utils/request';
import type { EncodedIdentifier, DiffBuild } from 'domains/DiffBuild';

const get = request.get();

export const getDiffBuild:
  EncodedIdentifier => Promise<DiffBuild>
= encoded => get(`/api/v1/builds/${encoded}`);
