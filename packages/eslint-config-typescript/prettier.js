module.exports = {
  plugins: ['prettier'],
  extends: [
    'eslint-config-prettier',
    'eslint-config-prettier/@typescript-eslint',
  ],
  rules: {
    'prettier/prettier': 'warn',
  },
}
