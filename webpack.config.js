const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const path = require('path');

module.exports = {
    entry: {
        main: './src/js/app.jsx',
    },
    devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                plugins: ['transform-runtime'],
                presets: ['es2015', 'react'],
            },
        }, {
            test: /\.hbs$/,
            loader: 'handlebars',
        }, {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader?importLoaders=1', 'postcss-loader'],
            exclude: ['node_modules'],
        }, {
            test: /\.scss$/,
            loaders: ['style-loader', 'css-loader?importLoaders=1', 'sass-loader'],
            exclude: ['node_modules'],
        }, {
            test: /\.json$/,
            loader: 'json-loader',
        }, {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'file-loader',
        }, {
            test: /\.(woff|woff2)$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'url-loader?prefix=font/&limit=5000',
        }, {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
        }, {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            include: [path.resolve(__dirname, 'src/images/svg')],
            loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
        },
        {
            test: /\.mp3$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'file-loader',
        },
        {
            test: /\.svg$/,
            include: [path.resolve(__dirname, 'src/images/inline-svg')],
            loader: 'raw-loader',
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Intro to Webpack',
            template: './src/index.html',
        }),
    ],
    devtool: 'source-map',
    devServer: {
        host: '0.0.0.0',
        historyApiFallback: true,
        inline: true,
        hot: true,
        contentBase: './src/',
    },
};
