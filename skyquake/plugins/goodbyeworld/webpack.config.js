
/*
 * 
 *   Copyright 2016 RIFT.IO Inc
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
var Webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'src', 'main.js');
var frameworkPath = '../../../framework';
var HtmlWebpackPlugin = require('html-webpack-plugin');

var config = {
    devtool: 'eval',
    entry:  [
            'webpack/hot/dev-server',
            'webpack-dev-server/client?http://localhost:8080',
            mainPath
        ]
    ,
    output: {
        path: buildPath,
        filename: 'bundle.js',
        publicPath: 'http://localhost:8000/build/'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.scss'],
        root: path.resolve(frameworkPath),
        alias: {
            'widgets': path.resolve(frameworkPath) + '/widgets',
            'style':  path.resolve(frameworkPath) + '/style'
        }
    },
    module: {
        loaders: [{
                test: /\.(jpe?g|png|gif|svg|ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/i,
                loader: "file-loader"
            },
            {
                test: /\.(js|jsx)$/,
                exclude: [nodeModulesPath],
                loader: 'babel-loader',
                query: {
                    presets: ["es2015", "stage-0", "react"]
                },
            },
            {
                test: /\.css$/,
                loader: 'style!css?sourceMap'
            }, {
                test: /\.scss/,
                loader: 'style!css?sourceMap!sass'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: '../index.html',
            templateContent: '<div id="content"></div>'
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js", Infinity)
    ]
};
module.exports = config;
