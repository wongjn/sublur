module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier'],
  plugins: ['svelte3'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/{svelte,vite}.config.js'],
      },
    ],
  },
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
