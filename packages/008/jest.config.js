module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/**/*.test.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|sentry-expo|native-base|react-native-svg|p-retry|retry|@szmarczak|p-timeout|is-network-error))'
  ]
};
