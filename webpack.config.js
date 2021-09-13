const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (ENV, ARGV) => {
  return {
    entry: ['./src/js/main.js'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/all.js',
    },
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 1000,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '/css/main.css',
      }),
      new webpack.ProvidePlugin({
        jQuery: 'jquery',
        jquery: 'jquery',
        $: 'jquery',
        Hammer: 'hammerjs',
        _: 'lodash',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.s[ac]ss$/i,
          include: [path.resolve(__dirname, 'src/style')],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  sourceMap: true,
                  plugins: ['autoprefixer'],
                },
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },
  };
};
