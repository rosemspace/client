module.exports = {
  plugins: ['@typescript-eslint'],
  extends: [
    '@rosemlabs/eslint-config',
    './index.js',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // this rule, if on, would require explicit return type on the `render` function
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  overrides: [
    {
      files: ['shims-tsx.d.ts'],
      rules: {
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
}
