module.exports = {
  plugins: ['prettier'],
  extends: ['eslint-config-prettier', 'eslint-config-prettier/standard'],
  rules: {
    'prettier/prettier': 'warn',
  },
}
