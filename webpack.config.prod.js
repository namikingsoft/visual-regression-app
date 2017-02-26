const webpack = require('webpack');
const config = require('./webpack.config');

delete config.devtool;
config.plugins.push(new webpack.optimize.UglifyJsPlugin());

module.exports = config;
