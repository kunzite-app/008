const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");

const moduleConfig = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "008Q.js",
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

module.exports = [moduleConfig, globalConfig];
