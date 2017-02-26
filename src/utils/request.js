// @flow
import axios from 'axios';

type Uri = string;
type Config = {
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'document'| 'text' | 'stream',
};

type Payload = any;

export const get:
  (Config | void) => Uri => Promise<any>
= config => async uri => (await axios.get(uri, (config: any))).data;

export const post:
  (Config | void) => Uri => Payload => Promise<any>
= config => uri => async payload => (
  await axios.post(uri, payload, (config: any))
).data;
