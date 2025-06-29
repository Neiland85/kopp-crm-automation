# ADR-004: Configuración de GitHub Copilot y Pre-commit Hooks

## Estado

Aceptado

## Contexto

El proyecto necesita configuración estandarizada para GitHub Copilot y herramientas de calidad de código automatizadas para mantener consistencia y eficiencia en el desarrollo.

## Decisión

### GitHub Copilot Configuration

- **Scopes habilitados**: `*.ts`, `*.js`, `*.json`, `*.yaml`, `*.md`
- **Linters integrados**: ESLint, YAMLLint
- **Formatters**: Prettier
- **Test frameworks**: Jest
- **Introspection**: Deshabilitada en fase inicial (será habilitada en fases posteriores)

### Pre-commit Hooks

- **Herramienta**: Husky + lint-staged
- **Archivos TypeScript/JavaScript**: ESLint fix + Prettier format
- **Archivos JSON/YAML/Markdown**: Prettier format
- **Ejecución**: Automática en cada commit

## Configuración Implementada

### `.vscode/copilot.settings.json`

```json
{
  "github.copilot.enable": { "*": true },
  "copilot.experimental.inlineSuggest.enable": true,
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "typescript", "yaml", "json"],
  "copilot.settings": {
    "scopes": ["**/*.ts", "**/*.js", "**/*.json", "**/*.yaml", "**/*.md"],
    "linters": { "eslint": true, "yamllint": true },
    "formatters": { "prettier": true },
    "testFrameworks": { "jest": true },
    "enableIntrospection": false
  }
}
```

### `package.json` - lint-staged

```json
{
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{json,yaml,yml,md}": ["prettier --write"]
  }
}
```

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged
```

## Consecuencias

### Positivas

- **Consistencia de código**: Pre-commit hooks aseguran formato uniforme
- **Productividad mejorada**: Copilot optimizado para nuestros tipos de archivo
- **Calidad automática**: Linting y formatting automático antes de commits
- **Configuración versionada**: Toda la configuración está en el repositorio

### Negativas

- **Overhead en commits**: Pre-commit hooks pueden agregar tiempo a los commits
- **Curva de aprendizaje**: Desarrolladores deben familiarizarse con herramientas

## Notas de Implementación

- Introspection se habilitará en ADR futura cuando la estructura sea más estable
- Pre-commit hooks pueden ser bypass con `git commit --no-verify` en casos especiales
- Configuración es extensible para futuras herramientas

## Referencias

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)

_Fecha: 2025-06-29_
_Autor: AI Assistant_
_Revisión: Fase 0 - Setup inicial_
