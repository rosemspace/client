module.exports = {
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2020: true,
  },
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    require.resolve('eslint-config-prettier'),
    // require.resolve('eslint-config-prettier/rosem')
  ],
  rules: {
    'prettier/prettier': 'warn',
  },
}
