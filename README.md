# 🏟️ Kopp CRM Automation

Automatización estratégica de Slack y HubSpot para Kopp Stadium con integración futura a Firebase, reemplazo progresivo de Zapier y despliegue en Vercel.

## 🚀 Inicio Rápido

### Configuración Automática

```bash
# Clonar y configurar
git clone [tu-repo]
cd kopp-crm-automation
./setup.sh
```

### Configuración Manual del Workspace

1. **Abrir Workspace:**
   ```bash
   # En VS Code: File → Open Workspace → kopp-stadium.code-workspace
   ```

2. **Seguir el workflow completo:**
   Ver [WORKFLOW.md](./WORKFLOW.md) para instrucciones detalladas paso a paso.

## 📁 Estructura del Proyecto

```
kopp-crm-automation/
├── 📄 kopp-stadium.code-workspace    # Configuración del workspace VS Code
├── 📄 WORKFLOW.md                    # Guía paso a paso de configuración
├── 📦 package.json                   # Dependencias y scripts npm
├── ⚙️ tsconfig.json                  # Configuración TypeScript
├── 🔧 .eslintrc.js                   # Configuración ESLint
├── 🎨 .prettierrc                    # Configuración Prettier
├── 🔒 .env.example                   # Variables de entorno de ejemplo
├── 🛠️ setup.sh                      # Script de configuración automática
├── 📂 src/                           # Código fuente principal
│   └── 📄 index.ts                   # Punto de entrada de la aplicación
└── 📂 scripts/                       # Scripts de automatización
    └── 📄 bootstrapSlack.ts          # Bootstrap de configuración Slack
```

## 🛠️ Scripts Disponibles

```bash
npm run lint          # Ejecutar linting con ESLint
npm run test          # Ejecutar tests (placeholder)
npm run build         # Compilar TypeScript
npm run bootstrap:all # Ejecutar configuración inicial completa
```

## 🔧 Extensiones VS Code Requeridas

- ✅ **GitHub Copilot Chat** - Asistente de código IA
- ✅ **ESLint** - Linting de código
- ✅ **Prettier** - Formateo de código
- ✅ **YAML** - Soporte para archivos YAML
- ✅ **Docker** - Soporte para containerización
- ✅ **Slack API** - Desarrollo de aplicaciones Slack
- ✅ **Zapier CLI** - Integración con Zapier

## 🔗 Integraciones Planificadas

- **Slack** → Automatización de eventos y notificaciones
- **HubSpot** → Sincronización de datos CRM
- **Zapier** → Migración gradual de workflows existentes
- **Firebase** → Base de datos y autenticación
- **Vercel** → Despliegue y hosting

## 📋 Workflow de Desarrollo

1. **Configuración inicial:** Seguir [WORKFLOW.md](./WORKFLOW.md)
2. **Desarrollo:** Usar VS Code con configuración optimizada
3. **Linting:** Automático al guardar con Prettier + ESLint
4. **Testing:** TDD con configuración de tasks integrada
5. **Deployment:** Pipeline automático a Vercel

## 🔐 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

## 🤖 Copilot Configuration

El workspace está optimizado para GitHub Copilot:
- ✅ Introspección desactivada (mejor rendimiento)
- ✅ Chat integrado para consultas contextuales
- ✅ Sugerencias de código específicas para Slack/HubSpot APIs

## 📞 Soporte

Para problemas con la configuración del workspace, consulta [WORKFLOW.md](./WORKFLOW.md) o revisa la configuración en `kopp-stadium.code-workspace`.

---

**Desarrollado para Kopp Stadium** 🏟️
