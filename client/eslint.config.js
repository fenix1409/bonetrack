// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
<<<<<<< HEAD
    rules: {
      'react/display-name': 'off',
    },
=======
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
  },
]);
