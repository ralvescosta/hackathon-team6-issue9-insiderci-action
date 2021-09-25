module.exports = {
  roots: ['<rootDir>'],
  globals: {},
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 92,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}
