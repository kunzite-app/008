const path = require("path");

const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const moduleConfig = {
  entry: "./index.js",
  output: {
    globalObject: 'typeof self !== "undefined" ? self : this',
    path: path.resolve(__dirname, "dist"),
    filename: "008Q.js",
    library: {
      name: 'Q008',
      type: 'umd'
    },
  },
  mode: "production",
  resolve: {
    fallback: {
      perf_hooks: false,
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  pluginss: [
    new webpack.DefinePlugin({
      document: 'typeof document === "undefined" ? undefined : document'
    })
  ]
};

const globalConfig = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "008Q.global.js",
    library: {
      name: "Q008",
      type: "var",
    },
  },
  mode: "production",
  resolve: {
    fallback: {
      perf_hooks: false,
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

module.exports = [globalConfig];
