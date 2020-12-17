module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/prefer-default-export': 0,
    'no-param-reassign': ['error', { props: false }],
    'prefer-destructuring': 0,
    'max-len': 'off',
    'no-plusplus': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
