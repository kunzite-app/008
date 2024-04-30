const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "008Q.global.js",
    library: "Q008",
    libraryTarget: "var",
  },
  /*
  resolve: {
    fallback: {
      perf_hooks: false,
    },
  },
  */
  mode: "production",
};
