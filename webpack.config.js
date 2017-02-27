const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const postcss = require('./webpack.postcss');

const { NODE_ENV } = process.env;

module.exports = { // eslint-disable-line immutable/no-mutation
  devtool: 'source-map',
  entry: {
    app: [
      './src/front',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader?module',
            'postcss-loader',
          ],
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.css$/,
        exclude: /src\/styles/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.jpg$/,
        use: {
          loader: 'url-loader',
          options: {
            minetype: 'image/jpeg',
          },
        },
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: {
            minetype: 'image/png',
          },
        },
      },
      {
        test: /\.svg/,
        use: {
          loader: 'url-loader',
          options: {
            minetype: 'image/svg+xml',
          },
        },
      },
      {
        test: /\.ttf/,
        use: {
          loader: 'url-loader',
          options: {
            minetype: 'application/octet-stream',
          },
        },
      },
      {
        test: /\.woff/,
        use: {
          loader: 'url-loader',
          options: {
            minetype: 'application/font-woff',
          },
        },
      },
      {
        test: /\.eot/,
        use: {
          loader: 'url-loader',
          options: {
            minetype: 'application/vnd.ms-fontobject',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },
  devServer: {
    hot: true,
    // stats: 'none',
    // TODO: not work
    // historyApiFallback: true,
  },
  node: {
    fs: 'empty',
    net: 'empty',
    process: 'mock',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        IS_BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
    }),
    new ExtractTextPlugin('style.bundle.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'App',
      mobile: true,
    }),
    new webpack.LoaderOptionsPlugin({ options: { postcss } }),
  ],
};
