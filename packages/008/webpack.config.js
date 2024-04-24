const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const isElectron = process.env.ELECTRON_ENV === 'true';

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env
    },
    argv
  );

  if (!isElectron) config.output.publicPath = '/';

  return config;
};
