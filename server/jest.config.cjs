module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  transform: {},
  injectGlobals: true,
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
  forceExit: true,
  clearMocks: true,
};
