const { readFileSync } = require('fs');
const path = require('path');

const swcJestConfig = JSON.parse(
  readFileSync(path.join(__dirname, '.spec.swcrc'), 'utf-8'),
);
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@org/api',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: 'test-output/jest/coverage',
};
