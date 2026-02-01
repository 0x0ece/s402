module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: '@s402/express',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**']
};
