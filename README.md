Visual Regression App
========================================
This is Web Application that detected image difference.


Getting Started
----------------------------------------
```bash
npm install
cp .env.template .env
vi .env
npm start
http://localhost:3000
```


Deploy to Heroku
----------------------------------------
```bash
heroku create
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set AWS_ACCESS_KEY_ID="(have s3 policy of image repository)"
heroku config:set AWS_SECRET_ACCESS_KEY="(have s3 policy image repository)"
heroku config:set AWS_S3_BUCKET_NAME="example-of-bucketname"
heroku config:set IMAGEDIFF_API_ENDPOINT="https://****-api.ap-northeast-1.amazonaws.com/dev/image/diff"
git push heroku master
```


Example of AWS S3 Policy
----------------------------------------
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1470786961000",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::example-of-bucketname",
                "arn:aws:s3:::example-of-bucketname/*"
            ]
        }
    ]
}
```


Post example Github PR driven on CicleCI
----------------------------------------
```bash
#!/bin/sh -eu

PR_NUMBER="$(echo "$CIRCLE_PULL_REQUEST" | sed -e 's@^.*/@@')"

base_branch_sha1() {
  MERGED_BRANCH="pull/${PR_NUMBER}/merge"
  git fetch origin "${MERGED_BRANCH}:${MERGED_BRANCH}" > /dev/null
  git log "${MERGED_BRANCH}" --oneline | head -n1 | sed -e 's/^.* into //'
}

json() {
  echo "{
  \"mode\": \"strict\",
  \"actualPath\": \"${CIRCLE_SHA1}\",
  \"expectPath\": \"$(base_branch_sha1)\",
  \"threshold\": ${IMAGEDIFF_THRESHOLD:-0.005},
  \"pathFilters\": [\"\\\\\\.png$\"]
}" | tr -d '\n'
}

curl -v \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -X POST -d "$(json)" \
  http://(server host)/api/v1/builds
```
