module.exports = {
  env: {
    node: true,
    es6: true,
    jest: true, // Añadir entorno Jest
  },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': 'off',
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
      rules: {
        // Reglas específicas para tests
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
