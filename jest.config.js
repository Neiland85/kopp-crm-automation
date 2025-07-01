module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(chai|nock)/)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'clover'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  // Configuración para mocks automáticos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Configuración para reportes detallados
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './coverage', outputName: 'junit.xml' }],
  ],
  // Configuración de ambiente
  // Cache para mejor performance
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
};
