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
