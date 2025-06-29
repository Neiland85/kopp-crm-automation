# Kopp CRM Automation - Installation Guide

## Requisitos del Sistema

### Software Requerido

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** >= 2.30.0
- **Python** >= 3.8.0 (para scripts auxiliares)

### Cuentas y Servicios

- Cuenta de HubSpot con API access
- Workspace de Slack con permisos de administrador
- Proyecto de Firebase
- Cuenta de Vercel (para deployment)
- Cuenta de Zapier (para migración)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/kopp-stadium/kopp-crm-automation.git
cd kopp-crm-automation
```

### 2. Instalar Dependencias Node.js

```bash
npm install
```

### 3. Instalar Dependencias Python (Opcional)

```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales reales
nano .env
```

### 5. Configurar VS Code (Opcional)

```bash
# Abrir workspace optimizado
code kopp-stadium-clean.code-workspace

# O instalar extensiones automáticamente
npm run configure:extensions
```

## Configuración de Servicios

### HubSpot

1. Ir a HubSpot Developer Dashboard
2. Crear nueva aplicación privada
3. Generar API key
4. Configurar scopes necesarios:
   - `contacts` (read/write)
   - `companies` (read/write)
   - `deals` (read/write)

### Slack

1. Ir a https://api.slack.com/apps
2. Crear nueva aplicación
3. Configurar Bot Token Scopes:
   - `chat:write`
   - `channels:read`
   - `users:read`
4. Instalar aplicación en workspace
5. Copiar Bot User OAuth Token

### Firebase

1. Crear proyecto en Firebase Console
2. Habilitar Firestore Database
3. Generar service account key
4. Descargar archivo JSON de credenciales
5. Configurar reglas de seguridad

### Vercel

1. Conectar repositorio de GitHub
2. Configurar variables de entorno en dashboard
3. Configurar dominio personalizado (opcional)

## Verificación de Instalación

### 1. Tests de Conectividad

```bash
# Verificar configuración
npm run test

# Verificar linting
npm run lint:check

# Verificar build
npm run build
```

### 2. Test de Servicios

```bash
# Modo desarrollo
npm run dev

# Verificar endpoints
curl http://localhost:3000/health
```

### 3. Verificar Integración Slack

```bash
# Enviar mensaje de prueba
npm run test:slack
```

### 4. Verificar Integración HubSpot

```bash
# Listar contactos de prueba
npm run test:hubspot
```

## Configuración de Desarrollo

### Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run test             # Ejecutar tests
npm run lint             # Linting automático
npm run deploy           # Deploy a producción
```

### Hot Reload

El servidor de desarrollo incluye hot reload automático para cambios en el código.

### Debug Mode

```bash
# Activar modo debug
NODE_ENV=development npm run dev
```

## Configuración de Producción

### Variables de Entorno Críticas

```bash
NODE_ENV=production
HUBSPOT_API_KEY=your-production-key
SLACK_WEBHOOK_URL=your-production-webhook
FIREBASE_PROJECT_ID=your-production-project
```

### Deployment Automático

El deployment se ejecuta automáticamente cuando:

- Se hace push a rama `main`
- Se crea un nuevo tag `v*`

### Monitoreo Post-Deployment

- Verificar logs en Vercel Dashboard
- Monitorear notificaciones en Slack
- Revisar métricas de Firebase

## Troubleshooting

### Problemas Comunes

#### Error de Conectividad HubSpot

```bash
# Verificar API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.hubapi.com/contacts/v1/lists/all/contacts/all
```

#### Error de Conectividad Slack

```bash
# Verificar webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_SLACK_WEBHOOK_URL
```

#### Error de Build

```bash
# Limpiar cache y reinstalar
npm run clean
npm install
npm run build
```

### Logs de Debug

```bash
# Ver logs en tiempo real
tail -f logs/development.log

# Filtrar errores
grep "ERROR" logs/production.log
```

## Soporte

### Documentación Adicional

- [API Reference](./API.md)
- [Workflow Guide](../WORKFLOW.md)
- [Extension Setup](../EXTENSIONS_SETUP.md)

### Contacto

- Email: dev@kopp-stadium.com
- Slack: #kopp-crm-automation
- GitHub Issues: Repository issues
