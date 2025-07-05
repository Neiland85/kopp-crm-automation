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
  ],
};
