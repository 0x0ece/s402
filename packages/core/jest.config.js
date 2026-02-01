module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: '@s402/core',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**'],
  moduleNameMapper: {
    '^@s402/core$': '<rootDir>/src/index.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@noble|@ltonetwork)/)'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'ts-jest'
  }
};
