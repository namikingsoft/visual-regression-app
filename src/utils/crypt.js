// @flow
import crypto from 'crypto';

type Password = any;
type Plain = any;
type Encoded = string;
type Hash = string;

const cryptAlgorithm = 'aes192';
const hashAlgorithm = 'sha224';
const plainType = 'utf8';
const encodedType = 'hex';

export const encode:
  Password => Plain => Encoded
= password => plain => {
  const json = JSON.stringify(plain);
  const cipher = crypto.createCipher(cryptAlgorithm, password);
  return [
    cipher.update(json, plainType, encodedType),
    cipher.final(encodedType),
  ].join('');
};

export const decode:
  Password => Encoded => Plain
= password => encoded => {
  const decipher = crypto.createDecipher(cryptAlgorithm, password);
  return JSON.parse([
    decipher.update(encoded, encodedType, plainType),
    decipher.final(plainType),
  ].join(''));
};

export const hash:
  Plain => Hash
= plain => crypto
  .createHash(hashAlgorithm)
  .update(JSON.stringify(plain))
  .digest(encodedType);
