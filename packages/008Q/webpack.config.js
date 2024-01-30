const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "008Q.js",
    library: "Q008",
    libraryTarget: "var",
  },
  mode: "production",
};
