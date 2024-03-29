module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/eslint-config-airbnb-with-typescript',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 0,
    'vue/max-len': 0,
    'import/prefer-default-export': 0,
    'prefer-destructuring': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    '@typescript-eslint/lines-between-class-members': 0,
    'newline-per-chained-call': 0,
    'max-classes-per-file': 0,
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true,
      },
    ],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
