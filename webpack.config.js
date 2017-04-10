/*
 * @Author: grove.liqihan
 * @Date: 2017-04-08 17:25:31
 * @Desc: http请求的封装
 */

var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: {
        "HttpClient": "./src/HttpClient.js"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
        libraryTarget: "umd",
        library: ["BDTT", "HttpClient"]
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: "json-loader"}
        ]
    },
    devtool: 'cheap-module-source-map',
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin({
    //         compress: {
    //             warnings: false
    //         }
    //     })
    // ],
    node: {
        fs: "empty"
    },
    plugins: [
        // new webpack.IgnorePlugin(/request/),
        // new webpack.IgnorePlugin(/requestretry/),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};