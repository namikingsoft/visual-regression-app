// @flow
require('dotenv').config({ silent: true });

type Key = string;
type Value = string;

const env = process.env;

const getOrDie:
  Key => Value
= key => {
  if (env[key] !== null && env[key] !== undefined && env[key].length > 0) {
    return env[key];
  }
  if (!env.IS_BROWSER) {
    console.log(`Please set env: ${key}`);
    process.exit(1);
  }
  return ''; // dummy
};

export const cryptSecret = getOrDie('CRYPT_SECRET');
export const port = Number(env.PORT || 3000);
export const nodeEnv = env.NODE_ENV || 'development';
export const workDirPath = '/tmp/imagediff';
export const appUri = nodeEnv === 'production' ?
  'https://imagediff.herokuapp.com' : `http://localhost:${port}`;
export const awsAccessKeyId = getOrDie('AWS_ACCESS_KEY_ID');
export const awsSecretAccessKey = getOrDie('AWS_SECRET_ACCESS_KEY');
export const awsS3BucketName = getOrDie('AWS_S3_BUCKET_NAME');
