module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.jsx'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/tests/styleMock.cjs',
    '\\.(svg|png)$': '<rootDir>/tests/assetMock.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageReporters: ['text', 'html', 'lcov', 'json', 'json-summary'],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
};
