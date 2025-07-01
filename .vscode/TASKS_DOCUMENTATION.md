# 🔧 Tareas VS Code - Kopp CRM Automation

## 📋 Tareas Disponibles

### 🛠️ Configuración y Build

- **🛠️ Setup Completo del Workspace**: Configura todo el entorno de desarrollo
- **🔧 Build Proyecto**: Compila TypeScript a JavaScript
- **🧹 Clean All**: Limpia archivos generados
- **🔄 Reinstalar Dependencies**: Limpia e instala dependencias

### 🧪 Testing

- **🧪 Ejecutar Tests**: Ejecuta toda la suite de tests
- **🧪 Tests en Modo Watch**: Tests en modo watch (se ejecutan automáticamente)
- **📊 Coverage Report**: Genera reporte de cobertura
- **⚡ Validación Local Rápida**: Validación rápida antes de commit

### 🚀 Desarrollo

- **🚀 Servidor de Desarrollo**: Inicia servidor en modo desarrollo con hot reload
- **🎯 Lint y Fix**: Ejecuta ESLint y corrige errores automáticamente

### ⚡ Zapier

- **⚡ Zapier: Validar**: Valida la aplicación Zapier
- **⚡ Zapier: Test**: Ejecuta tests específicos de Zapier

### 📊 Funcionalidades Avanzadas

#### Dashboard Emocional

- **📊 Generar Dashboard Emocional**: Genera y publica dashboard en GitHub Pages
- **🧪 Test Dashboard Emocional**: Ejecuta tests del dashboard

#### Notion Integration

- **📈 Ingerir Métricas a Notion**: Ingiere métricas diarias a Notion

#### Dropout Positivo

- **💫 Test Dropout Positivo**: Ejecuta tests del sistema de dropout
- **📝 Ver Logs Dropout Actions**: Muestra logs en tiempo real de acciones

#### Slack Journal

- **📝 Test Slack Journal**: Ejecuta tests del sistema de journaling

### 🎯 Combinadas

- **🎯 Test Funcionalidades Avanzadas**: Ejecuta todos los tests de las nuevas funcionalidades
- **🚀 Demo Completo**: Ejecuta demo completo (build + dashboard + tests)

## 🔥 Cómo usar las tareas

### Desde VS Code:

1. **Ctrl+Shift+P** (o **Cmd+Shift+P** en Mac)
2. Escribe **"Tasks: Run Task"**
3. Selecciona la tarea que quieres ejecutar

### Desde terminal:

```bash
# Usar npm scripts directamente
npm run dashboard:generate
npm run notion:ingest
npm run dropout:validate
npm run journal:test
```

## 🛠️ Problem Matchers Configurados

- **$tsc**: Para errores de TypeScript
- **$eslint-stylish**: Para errores de ESLint
- **Custom Jest**: Para errores de Jest en modo watch

## 🎯 Flujo de Trabajo Recomendado

1. **🛠️ Setup Completo del Workspace** (primera vez)
2. **🔧 Build Proyecto** (después de cambios)
3. **🧪 Tests en Modo Watch** (durante desarrollo)
4. **📊 Generar Dashboard Emocional** (para ver visualizaciones)
5. **🎯 Test Funcionalidades Avanzadas** (antes de commit)

## 🚨 Troubleshooting

### Error de Problem Matcher

Si ves errores como "La descripción no se puede convertir en un buscador de coincidencias de problemas", significa que hay un problema en la configuración del `problemMatcher` en `tasks.json`.

**Solución**: El archivo ya fue corregido y ahora usa problem matchers válidos.

### Tareas que no aparecen

- Asegúrate de estar en el workspace correcto
- Verifica que el archivo `.vscode/tasks.json` existe
- Recarga VS Code si es necesario

### Dependencias

- Ejecuta **🔄 Reinstalar Dependencies** si hay problemas con packages
- Usa **🧹 Clean All** para limpiar archivos corruptos
