Image Diff on CI
========================================
This is Web Application that detected image difference on CircleCI.


Required
----------------------------------------
Install ImageMagick before start this application.
https://www.imagemagick.org/script/index.php


Getting Started
----------------------------------------
```bash
npm install
cp .env.template .env
vi .env
npm start
```


Deploy to Heroku
----------------------------------------
```bash
heroku create
heroku heroku config:set CRYPT_SECRET="****"
heroku heroku config:set MAGICK_THREAD_LIMIT=1
heroku heroku config:set NPM_CONFIG_PRODUCTION=false
git push heroku master
```


Post example on CicleCI
----------------------------------------
```bash
#!/bin/sh -eu

json() {
  echo "{
  \"ciToken\": \"${IMAGEDIFF_CIRCLE_TOKEN}\",
  \"username\": \"${CIRCLE_PROJECT_USERNAME}\",
  \"reponame\": \"${CIRCLE_PROJECT_REPONAME}\",
  \"actualBuildNum\": ${CIRCLE_BUILD_NUM},
  \"expectBuildNum\": ${CIRCLE_PREVIOUS_BUILD_NUM},
  \"threshold\": 0.005,
  \"pathFilters\": [\"\\\\\.png$\"],
  \"slackIncoming\": \"${IMAGEDIFF_SLACK_INCOMING}\"
}" | tr -d '\n'
}

if [ "${CIRCLE_BRANCH}" = "master" ]; then
  curl -v \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -X POST -d "$(json)" \
    http://localhost:3000/api/v1/builds
fi
```
