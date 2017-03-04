// @flow
import crypto from 'crypto';

type Password = any;
type Plain = any;
type Encoded = string;
type Hash = string;

const cryptAlgorithm = 'aes192';
const hashAlgorithm = 'sha224';
const plainType = 'utf8';
const encodedType = 'base64';

const safeURI:
  string => string
= x => x.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const unsafeURI:
  string => string
= x => x.replace(/-/g, '+').replace(/_/g, '/');

export const encode:
  Password => Plain => Encoded
= password => plain => {
  const json = JSON.stringify(plain);
  const cipher = crypto.createCipher(cryptAlgorithm, password);
  return safeURI([
    cipher.update(json, plainType, encodedType),
    cipher.final(encodedType),
  ].join(''));
};

export const decode:
  Password => Encoded => Plain
= password => encoded => {
  const decipher = crypto.createDecipher(cryptAlgorithm, password);
  return JSON.parse([
    decipher.update(unsafeURI(encoded), encodedType, plainType),
    decipher.final(plainType),
  ].join(''));
};

export const hash:
  Plain => Hash
= plain => crypto
  .createHash(hashAlgorithm)
  .update(JSON.stringify(plain))
  .digest('hex');
