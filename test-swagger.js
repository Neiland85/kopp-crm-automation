#!/usr/bin/env node

/**
 * Script de prueba para verificar que Swagger está funcionando correctamente
 * Ejecuta el servidor temporalmente y hace peticiones a los endpoints de documentación
 */

const axios = require('axios');

// Importar la app
const app = require('./dist/app.js').default || require('./src/app.ts');

const PORT = 3001; // Puerto diferente para evitar conflictos
const BASE_URL = `http://localhost:${PORT}`;

console.log('🧪 Iniciando pruebas de Swagger...\n');

// Función para hacer peticiones HTTP
async function testEndpoint(url, description) {
  try {
    console.log(`⏳ Probando: ${description}`);
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ ${description} - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

// Función principal de pruebas
async function runTests() {
  console.log(`🚀 Iniciando servidor en puerto ${PORT}...\n`);

  const server = app.listen(PORT, async () => {
    console.log(`📍 Servidor iniciado en ${BASE_URL}\n`);

    // Esperar un momento para que el servidor esté listo
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('🔍 Probando endpoints de documentación:\n');

    // Probar endpoints principales
    const tests = [
      { url: `${BASE_URL}/`, description: 'Endpoint raíz de la API' },
      { url: `${BASE_URL}/health`, description: 'Health check básico' },
      {
        url: `${BASE_URL}/health/detailed`,
        description: 'Health check detallado',
      },
      { url: `${BASE_URL}/version`, description: 'Información de versión' },
      {
        url: `${BASE_URL}/api-docs.json`,
        description: 'Especificación OpenAPI JSON',
      },
      {
        url: `${BASE_URL}/api-docs.yaml`,
        description: 'Especificación OpenAPI YAML',
      },
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
      const success = await testEndpoint(test.url, test.description);
      if (success) passed++;
    }

    // Verificar que el endpoint de Swagger UI esté disponible
    try {
      console.log(`⏳ Probando: Swagger UI HTML`);
      const response = await axios.get(`${BASE_URL}/api-docs`, {
        timeout: 5000,
      });
      if (response.data.includes('swagger-ui')) {
        console.log(`✅ Swagger UI HTML - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ Swagger UI HTML - No contiene contenido esperado`);
      }
      total++;
    } catch (error) {
      console.log(`❌ Swagger UI HTML - Error: ${error.message}`);
      total++;
    }

    console.log(`\n📊 Resultados de las pruebas:`);
    console.log(`   ✅ Exitosas: ${passed}/${total}`);
    console.log(`   ❌ Fallidas: ${total - passed}/${total}`);

    if (passed === total) {
      console.log(
        `\n🎉 ¡Todas las pruebas pasaron! Swagger está funcionando correctamente.`
      );
      console.log(`\n📚 Enlaces de documentación:`);
      console.log(`   - Swagger UI: ${BASE_URL}/api-docs`);
      console.log(`   - OpenAPI JSON: ${BASE_URL}/api-docs.json`);
      console.log(`   - OpenAPI YAML: ${BASE_URL}/api-docs.yaml`);
    } else {
      console.log(`\n⚠️  Algunas pruebas fallaron. Revisa la configuración.`);
    }

    console.log(`\n🛑 Cerrando servidor de pruebas...`);
    server.close();
    process.exit(passed === total ? 0 : 1);
  });

  // Manejar errores del servidor
  server.on('error', (error) => {
    console.error(`❌ Error del servidor: ${error.message}`);
    process.exit(1);
  });
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests().catch((error) => {
    console.error(`❌ Error en las pruebas: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
