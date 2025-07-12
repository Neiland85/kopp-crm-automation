module.exports = {
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Reglas básicas mínimas
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unreachable': 'error',
  },
  // Configuración específica para archivos de test
  overrides: [
    {
      files: [
        '**/__tests__/**/*.{js,ts}',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
      ],
      env: {
        jest: true,
      },
    },
    // Configuración para archivos del lado del cliente (navegador)
    {
      files: [
        'src/hooks/**/*.{js,ts}',
        'src/services/ConsentStorageService.ts',
        'src/policies/**/*.{js,ts}',
      ],
      env: {
        browser: true,
        node: true,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
      },
    },
    // Configuración para archivos de definición de tipos
    {
      files: ['**/*.d.ts'],
      rules: {
        'no-unused-vars': 'off',
      },
    },
  ],
};
