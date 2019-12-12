module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    '@rosemlabs/eslint-config/recommended',
    '@rosemlabs/eslint-config-typescript/recommended',
  ],
  rules: {
    // Only allow debugger in development
    'no-debugger': process.env.PRE_COMMIT ? 'error' : 'off',
    // Only allow `console.log` in development
    'no-console': process.env.PRE_COMMIT
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off',
  },
  overrides: [
    {
      files: ['**/*.spec.ts'],
      env: {
        jest: true,
      },
    },
  ],
}
