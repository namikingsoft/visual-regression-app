// @flow
import * as s3 from 's3';

type LocalDir = string;

type S3Options = {
  accessKeyId: string,
  secretAccessKey: string,
};

type S3Params = {
  Bucket: string,
  Prefix: string,
};

export const downloadDirFromS3:
  S3Options => (S3Params, LocalDir) => Promise<void>
= s3Options => (s3Params, localDir) => new Promise((resolve, reject) => {
  s3.createClient({ s3Options })
  .downloadDir({
    localDir,
    s3Params,
    deleteRemoved: true,
  })
  .on('end', resolve)
  .on('error', reject);
});
