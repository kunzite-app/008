const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const isElectron = process.env.IS_ELECTRON === 'yes';

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
