# Configuración de Linter para Datos Sensibles y RGPD

## Kopp Stadium CRM - Reglas de Análisis de Código para Privacidad

**Documento:** SEC-LINT-001  
**Versión:** 1.0  
**Fecha:** 4 de julio de 2025  
**Responsable:** CISO + DevOps Lead  
**Clasificación:** DESARROLLO

---

## 1. PROPÓSITO Y ALCANCE

### 1.1 Objetivo del Linter de Sensibilidad

Este documento define la configuración del linter especializado para detectar posibles problemas de privacidad, seguridad de datos y cumplimiento RGPD en el código del proyecto Kopp Stadium CRM.

### 1.2 Ámbito de Aplicación

- **Lenguajes:** JavaScript/TypeScript, CSS, HTML
- **Componentes:** Frontend, Backend, Serverless Functions
- **Entornos:** Desarrollo, CI/CD, Pre-producción
- **Frecuencia:** En cada commit, push y pull request

---

## 2. CONFIGURACIÓN DEL LINTER

### 2.1 Herramientas Implementadas

```javascript
// .eslintrc.gdpr.js
module.exports = {
  plugins: [
    'security',
    'sonarjs',
    'privacy',
    'gdpr-security',
    'no-secrets',
    'pii-checker',
  ],
  extends: [
    'plugin:security/recommended',
    'plugin:sonarjs/recommended',
    'plugin:privacy/recommended',
    'plugin:gdpr-security/recommended',
  ],
  rules: {
    // Reglas específicas para detección de datos sensibles
    'no-secrets/no-secrets': [
      'error',
      {
        ignoreIdentifiers: ['PUBLIC_KEY', 'VERSION', 'ENVIRONMENT'],
        additionalRegExps: {
          'Tarjeta Española': '\\b(?:\\d[ -]*?){13,16}\\b',
        },
      },
    ],

    // Reglas para prevenir fugas de PII (Información Personal Identificable)
    'privacy/no-pii': 'error',
    'privacy/no-unencrypted-pii': 'error',
    'gdpr-security/no-user-tracking-without-consent': 'error',
    'gdpr-security/require-secure-cookie-transport': 'error',
    'gdpr-security/no-unencrypted-personal-data': 'error',

    // Reglas para cookies
    'gdpr-security/cookie-samesite-required': ['error', 'strict'],
    'gdpr-security/cookie-httponly-required': 'error',
    'gdpr-security/cookie-secure-required': 'error',
    'gdpr-security/cookie-expiration-required': [
      'error',
      { maxAgeInDays: 396 }, // Máximo 13 meses según guía AEPD
    ],

    // Reglas para datos sensibles en logs
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',
    'gdpr-security/no-sensitive-data-in-logs': 'error',

    // Reglas para prevenir almacenamiento no autorizado
    'gdpr-security/no-unauthorized-data-storage': 'error',
    'gdpr-security/require-explicit-consent': 'error',
    'privacy/no-excessive-data-collection': 'warn',
  },
  overrides: [
    {
      files: ['*.test.js', '*.test.ts', '*.spec.js', '*.spec.ts'],
      rules: {
        'privacy/no-pii': 'off',
        'gdpr-security/no-sensitive-data-in-logs': 'off',
      },
    },
  ],
};
```

### 2.2 Patrones Detectados

```javascript
// Patrones de datos sensibles detectados automáticamente
const SENSITIVE_PATTERNS = {
  // Datos de identificación
  DNI: /\b\d{8}[A-Z]\b/,
  NIE: /\b[XYZ]\d{7}[A-Z]\b/,
  Pasaporte_ESP: /\b[A-Z]{3}\d{6}[A-Z]?\b/,
  Email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  Teléfono_ESP: /\b(?:\+34|0034)?[ -]?(?:6|7|8|9)[ -]?(?:\d[ -]?){8}\b/,

  // Datos financieros
  IBAN_ESP: /\bES\d{2}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/,
  Tarjeta_Crédito: /\b(?:\d[ -]*?){13,16}\b/,
  CVV: /\b\d{3,4}\b/,

  // Datos de salud y especiales
  Seguridad_Social: /\b\d{2}[ -]?\d{8}[ -]?\d{2}\b/,
  Historial_Médico: /\b(?:historial|medical|record|diagnóstico)\b/i,

  // Credenciales y tokens
  API_Key: /\b[A-Za-z0-9_-]{20,}\b/,
  Password_Pattern:
    /\b(?:password|contraseña|pwd|passwd|secret)\s*[=:]\s*['"][^'"]{3,}['"]|\bclave\b/i,
  JWT: /\bey[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\b/,

  // Datos de localización
  Coordenadas_GPS: /\b-?\d{1,3}\.\d{3,},\s*-?\d{1,3}\.\d{3,}\b/,
  Dirección_Postal: /\b(?:calle|avenida|plaza)\b.{5,50}\b\d{5}\b/i,
};
```

### 2.3 Integración con Pre-commit Hooks

```json
// .husky/pre-commit
{
  "hooks": {
    "pre-commit": "lint-staged"
  }
}

// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --config .eslintrc.gdpr.js',
    'privacy-scanner --level=high',
    'gdpr-validator --report=summary'
  ],
  '*.{json,md}': [
    'pii-detector --mask',
    'secretlint'
  ]
}
```

---

## 3. REGLAS DE DETECCIÓN PRINCIPALES

### 3.1 Detección de Datos Personales

| Regla                                        | Descripción                            | Severidad | Ejemplo de Violación                                                     |
| -------------------------------------------- | -------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `privacy/no-pii`                             | Previene uso de PII sin protección     | ERROR     | `const userEmail = "ejemplo@dominio.com";`                               |
| `privacy/no-excessive-data-collection`       | Detecta recolección excesiva de datos  | WARN      | `const userForm = { nombre, email, telefono, direccion, edad, genero };` |
| `gdpr-security/no-unencrypted-personal-data` | Requiere cifrado para datos personales | ERROR     | `db.users.insert({ email: userEmail, password: plainPassword });`        |
| `no-secrets/no-secrets`                      | Detecta secretos hardcodeados          | ERROR     | `const apiKey = "a1b2c3d4e5f6g7h8i9j0";`                                 |

### 3.2 Gestión de Cookies

| Regla                                      | Descripción                              | Severidad | Ejemplo de Violación                             |
| ------------------------------------------ | ---------------------------------------- | --------- | ------------------------------------------------ |
| `gdpr-security/cookie-samesite-required`   | Requiere atributo SameSite               | ERROR     | `document.cookie = "session=abc123; Path=/";`    |
| `gdpr-security/cookie-httponly-required`   | Requiere HttpOnly para cookies sensibles | ERROR     | `res.cookie('authToken', token, { path: '/' });` |
| `gdpr-security/cookie-secure-required`     | Requiere flag Secure                     | ERROR     | `setCookie("userData", JSON.stringify(user));`   |
| `gdpr-security/cookie-expiration-required` | Exige fecha de expiración                | ERROR     | `document.cookie = "preferences=dark;";`         |

### 3.3 Consentimiento y Logging

| Regla                                            | Descripción                          | Severidad | Ejemplo de Violación                                    |
| ------------------------------------------------ | ------------------------------------ | --------- | ------------------------------------------------------- |
| `gdpr-security/no-user-tracking-without-consent` | Previene tracking sin consentimiento | ERROR     | `analytics.track(userId, { page: currentPage });`       |
| `gdpr-security/require-explicit-consent`         | Exige verificación de consentimiento | ERROR     | `enableMarketing(userId);` sin verificar consentimiento |
| `gdpr-security/no-sensitive-data-in-logs`        | Previene logging de datos sensibles  | ERROR     | `console.log("User registered:", user);`                |

---

## 4. IMPLEMENTACIÓN Y CUMPLIMIENTO

### 4.1 Integración en CI/CD

```yaml
# .github/workflows/gdpr-lint.yml
name: GDPR & Privacy Linting

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  gdpr-security-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run GDPR & Privacy Linters
        run: |
          npm run lint:gdpr
          npm run privacy-scan
      - name: Generate Security Report
        run: npm run gdpr-report
      - name: Upload Report Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: gdpr-security-reports
          path: reports/
```

### 4.2 Excepciones y Falsos Positivos

- **Archivos de prueba:** Reglas relajadas en archivos _.test.js y_.spec.js
- **Documentación:** Permitido en comentarios con tag especial `@gdpr-approved`
- **Datos anónimos:** Permitido cuando se comprueba pseudoanonimización
- **Exclusiones justificadas:** Documentadas en archivo `.gdprignore`

### 4.3 Proceso de Corrección

1. **Análisis automático** en cada commit/PR
2. **Revisión manual** por el responsable de seguridad
3. **Clasificación de hallazgos** por severidad e impacto
4. **Plan de remediación** con plazos según criticidad
5. **Verificación** con nuevos tests de seguridad

---

## 5. MÉTRICAS Y REPORTE

### 5.1 Métricas de Seguimiento

- **Número de hallazgos** por categoría y severidad
- **Tiempo de resolución** por tipo de hallazgo
- **Cobertura del análisis** (% código analizado)
- **Tendencia de hallazgos** (incremento/reducción)
- **Tasa de falsos positivos**

### 5.2 Informes Generados

- **Informe ejecutivo:** Resumen para dirección y DPO
- **Informe técnico:** Detalles para equipo de desarrollo
- **Reporte de tendencias:** Evolución mensual
- **Dashboard de cumplimiento:** Visualización en tiempo real

### 5.3 Ejemplo de Reporte

```json
// Ejemplo de output de reporte GDPR Lint
{
  "summary": {
    "totalFiles": 256,
    "scannedFiles": 248,
    "totalIssues": 23,
    "criticalIssues": 3,
    "highIssues": 8,
    "mediumIssues": 12,
    "lowIssues": 0
  },
  "criticalIssues": [
    {
      "file": "src/services/analytics.ts",
      "line": 48,
      "rule": "gdpr-security/no-user-tracking-without-consent",
      "message": "User tracking implemented without consent verification"
    },
    {
      "file": "src/components/UserRegistration.tsx",
      "line": 112,
      "rule": "privacy/no-unencrypted-pii",
      "message": "Personal data stored without encryption"
    },
    {
      "file": "src/utils/logger.js",
      "line": 87,
      "rule": "gdpr-security/no-sensitive-data-in-logs",
      "message": "Potential PII logged in error reporting"
    }
  ]
  // Resto del reporte...
}
```

---

## 6. MANTENIMIENTO Y EVOLUCIÓN

### 6.1 Actualización de Reglas

- **Frecuencia:** Trimestral o ante cambios normativos
- **Responsable:** CISO + DevOps Lead
- **Proceso:** Evaluación, Testing, Documentación, Despliegue
- **Comunicación:** Notificación al equipo de desarrollo

### 6.2 Formación y Concienciación

- **Workshops:** Trimestrales sobre nuevas reglas/patrones
- **Documentación:** Wiki interna con ejemplos y buenas prácticas
- **Code reviews:** Enfocados en aspectos GDPR/privacidad
- **Gamificación:** Reconocimiento a equipos con menos hallazgos

---

**Documento técnico - Uso interno desarrollo**  
**Próxima revisión:** 4 de octubre de 2025  
**Versión:** 1.0  
**ID:** SEC-LINT-001

---

### CONTROL DE CAMBIOS

| Versión | Fecha      | Cambios         | Autor          |
| ------- | ---------- | --------------- | -------------- |
| 1.0     | 04/07/2025 | Versión inicial | DevSecOps Lead |
