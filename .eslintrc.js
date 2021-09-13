module.exports = {
  env: {
    browser: true,
    es2021: true,
    jquery: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prefer-const': ['error'],
    'no-unused-vars': ['warn']
  },
  globals: {
    '_': 'readonly', 
    'Hammer': 'readonly', 
    '$': 'readonly', 
  }
};
