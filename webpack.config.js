const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            devMiddleware: {
                writeToDisk: true,
            },
            watchFiles: {
                paths: ['src/*.html', 'src/**/*.html', 'dist/**/*', 'dist/*'],
                options: {
                    usePolling: true,
                },
            },
            hot: false,
            compress: false,
            port: 4000,
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: 'src/index.html', to: '' },
                    { from: 'src/favicon', to: 'favicon' },
                ],
            }),
            new MiniCssExtractPlugin({
                filename: '/css/main.css',
            }),
            new webpack.ProvidePlugin({
                Hammer: 'hammerjs',
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
