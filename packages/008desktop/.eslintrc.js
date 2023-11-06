module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true
  },
  extends: ['standard', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  ignorePatterns: ['assets/', 'dist/', 'node_modules/', 'public/', 'build/'],
  rules: {
    camelcase: [1, { properties: 'never' }],
    'prettier/prettier': 'error'
  },
  plugins: ['prettier']
};
