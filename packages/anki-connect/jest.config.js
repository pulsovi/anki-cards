/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverage: true,
  coverageDirectory: '.coverage',
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'jest-environment-node',
};
