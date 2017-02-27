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
export const herokuAppName = env.HEROKU_APP_NAME;
export const appUri = herokuAppName ?
  `https://${herokuAppName}.herokuapp.com` : `http://localhost:${port}`;
