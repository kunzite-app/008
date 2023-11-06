module.exports = {
  stories: ['../stories/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-react-native-web'],
  core: {
    builder: 'webpack5'
  },
  framework: '@storybook/react',
  staticDirs: ['../web']
};
