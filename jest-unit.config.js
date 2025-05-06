const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js', 
    '<rootDir>/src/__tests__/utils/setup-mocks.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/entities/**/*.test.(ts|tsx)', 
    '**/__tests__/features/**/*.test.(ts|tsx)',
    '**/__tests__/shared/**/*.test.(ts|tsx)',
    '!**/__tests__/integration/**',
    '!**/__tests__/e2e/**',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/*.config.js',
    '!**/.next/**',
    '!**/node_modules/**',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
