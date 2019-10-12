const random = require('lodash/random')
// Use a random port number for the mock API by default,
// to support multiple instances of Jest running
// simultaneously, like during pre-commit lint.
process.env.MOCK_API_PORT = process.env.MOCK_API_PORT || random(9000, 9999)

module.exports = {
  // setupFiles: ['<rootDir>/tests/unit/setup'],
  // globalSetup: '<rootDir>/tests/unit/global-setup',
  // globalTeardown: '<rootDir>/tests/unit/global-teardown',
  // setupTestFrameworkScriptFile: '<rootDir>/tests/unit/matchers',
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  moduleNameMapper: {
    '^(@rosemlabs.*)$': '<rootDir>/packages/$1',
    // we'll use commonjs version of lodash for tests
    // because we don't need to use any kind of tree shaking
    '^lodash-es$': '<rootDir>/node_modules/lodash/index.js',
    // Transform any static assets to empty strings
    '\\.(jpe?g|png|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)$':
      '<rootDir>/__tests__/fixtures/emptyString.js',
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: ['**/__tests__/*.(js|jsx|ts|tsx)'],
  // https://facebook.github.io/jest/docs/en/configuration.html#testurl-string
  // Set the `testURL` to a provided base URL if one exists, or the mock API base URL
  // Solves: https://stackoverflow.com/questions/42677387/jest-returns-network-error-when-doing-an-authenticated-request-with-axios
  testURL:
    process.env.API_BASE_URL || `http://localhost:${process.env.MOCK_API_PORT}`,
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  coverageDirectory: '<rootDir>/__tests__/coverage',
  collectCoverageFrom: [
    'packages/**/*.{js,vue,ts}',
    '!packages/**/router/index.js',
    '!packages/**/router/routes.js',
    '!packages/**/state/store.js',
    '!packages/**/state/modules/index.js',
    '!**/node_modules/**',
  ],
}
