const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Script de validación OAuth para ngrok específico
 * URL configurada: https://your-ngrok-url.ngrok.io
 */

// Cargar variables de entorno desde .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  console.log('📋 Variables .env cargadas');
}

// Logger simple
const logger = {
  info: (message, data = {}) => {
    console.log(`ℹ️  ${message}`, Object.keys(data).length ? data : '');
  },
  warn: (message, data = {}) => {
    console.warn(`⚠️  ${message}`, Object.keys(data).length ? data : '');
  },
  error: (message, data = {}) => {
    console.error(`❌ ${message}`, Object.keys(data).length ? data : '');
  },
};

// Configuración
const NGROK_URL = 'https://your-ngrok-url.ngrok.io';
const LOCAL_PORT = process.env.PORT || 3000;

// Variables OAuth requeridas
const requiredEnvVars = [
  'SLACK_CLIENT_ID',
  'SLACK_CLIENT_SECRET',
  'SLACK_SIGNING_SECRET',
  'SLACK_STATE_SECRET',
];

/**
 * Función para hacer requests HTTP/HTTPS
 */
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const req = lib.get(url, { timeout }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Verificar variables de entorno
 */
function verifyEnvironmentVariables() {
  logger.info('🔍 Verificando variables de entorno OAuth...');

  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logger.error('Variables OAuth faltantes:', { missing });
    throw new Error(`Variables requeridas: ${missing.join(', ')}`);
  }

  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    const masked = value ? `${value.substring(0, 8)}...` : 'N/A';
    logger.info(`✅ ${varName}: ${masked}`);
  });

  return true;
}

/**
 * Verificar servidor local
 */
async function verifyLocalServer() {
  logger.info('🔍 Verificando servidor local...');

  try {
    const response = await makeRequest(`http://localhost:${LOCAL_PORT}/health`);

    if (response.statusCode === 200) {
      logger.info(`✅ Servidor local funcionando en puerto ${LOCAL_PORT}`);
      return true;
    } else {
      logger.warn(
        `⚠️  Servidor local respondió con código ${response.statusCode}`
      );
      return false;
    }
  } catch (error) {
    logger.warn('⚠️  Servidor local no detectado:', { error: error.message });
    logger.info('💡 Ejecuta: npm run dev:oauth');
    return false;
  }
}

/**
 * Verificar conectividad ngrok
 */
async function verifyNgrokConnectivity() {
  logger.info('🔍 Verificando conectividad ngrok...');

  try {
    const response = await makeRequest(NGROK_URL);

    if (response.statusCode < 400) {
      logger.info(`✅ ngrok funcionando: ${NGROK_URL}`);
      return true;
    } else {
      logger.error(`❌ ngrok respondió con código ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logger.error(`❌ Error conectando a ngrok: ${error.message}`);
    logger.info(
      '💡 Verifica que ngrok esté corriendo: ngrok http ' + LOCAL_PORT
    );
    return false;
  }
}

/**
 * Verificar endpoints OAuth específicos
 */
async function verifyOAuthEndpoints() {
  logger.info('🔍 Verificando endpoints OAuth...');

  const endpoints = [
    { name: 'Install', path: '/slack/install' },
    { name: 'OAuth Redirect', path: '/slack/oauth_redirect' },
    { name: 'Events', path: '/slack/events' },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const url = `${NGROK_URL}${endpoint.path}`;
      const response = await makeRequest(url);

      const status = response.statusCode < 500 ? '✅' : '❌';
      const result = {
        name: endpoint.name,
        url,
        statusCode: response.statusCode,
        success: response.statusCode < 500,
      };

      logger.info(`${status} ${endpoint.name}: ${response.statusCode}`);
      results.push(result);
    } catch (error) {
      logger.error(`❌ Error en ${endpoint.name}:`, { error: error.message });
      results.push({
        name: endpoint.name,
        url: `${NGROK_URL}${endpoint.path}`,
        error: error.message,
        success: false,
      });
    }
  }

  return results;
}

/**
 * Mostrar resumen de configuración
 */
function showConfigurationSummary() {
  console.log(`
🎯 RESUMEN DE CONFIGURACIÓN OAUTH
==================================

📍 NGROK URL: ${NGROK_URL}
🔌 Puerto local: ${LOCAL_PORT}

🌐 URLs para configurar en api.slack.com:
------------------------------------------

🔗 OAuth & Permissions > Redirect URLs:
   ${NGROK_URL}/slack/oauth_redirect

📨 Event Subscriptions > Request URL:
   ${NGROK_URL}/slack/events

🏠 Manage Distribution > Sharable URL:
   ${NGROK_URL}/slack/install

📋 Variables OAuth:
------------------
${requiredEnvVars
  .map((varName) => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const masked = value ? `${value.substring(0, 8)}...` : 'N/A';
    return `   ${status} ${varName}: ${masked}`;
  })
  .join('\n')}

🎯 Test de instalación:
-----------------------
1. 🌐 Abre: ${NGROK_URL}/slack/install
2. 🔐 Autoriza la app en tu workspace
3. ⚡ Prueba los comandos:
   • /kop-test
   • /kop-status  
   • /kop-leads
   • /kop-help

🛠️  Comandos útiles:
-------------------
• npm run dev:oauth     (Iniciar servidor OAuth)
• npm run oauth:verify  (Verificar configuración)
• npm run slack:verify  (Probar comandos)
  `);
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando validación OAuth con ngrok específico...');
    console.log('======================================================\n');

    // 1. Verificar variables de entorno
    verifyEnvironmentVariables();
    console.log('');

    // 2. Verificar servidor local
    const localOk = await verifyLocalServer();
    console.log('');

    // 3. Verificar ngrok
    const ngrokOk = await verifyNgrokConnectivity();
    console.log('');

    // 4. Verificar endpoints OAuth
    const endpointResults = await verifyOAuthEndpoints();
    console.log('');

    // 5. Mostrar resumen
    showConfigurationSummary();

    // Resultado final
    const allEndpointsOk = endpointResults.every((r) => r.success);

    if (localOk && ngrokOk && allEndpointsOk) {
      logger.info('🎉 ¡Configuración OAuth completamente funcional!');
      process.exit(0);
    } else {
      logger.warn('⚠️  Algunos componentes necesitan atención');

      if (!localOk) logger.warn('   • Servidor local no detectado');
      if (!ngrokOk) logger.warn('   • ngrok no accesible');
      if (!allEndpointsOk)
        logger.warn('   • Algunos endpoints OAuth con problemas');

      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Error en validación OAuth:', { error: error.message });
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  verifyEnvironmentVariables,
  verifyLocalServer,
  verifyNgrokConnectivity,
  verifyOAuthEndpoints,
  NGROK_URL,
  LOCAL_PORT,
};
