module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js'],

  // Module name mapper for mocking
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/tests/__mocks__/obsidian.ts'
  },

  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts'
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true
};
