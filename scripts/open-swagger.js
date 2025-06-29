#!/usr/bin/env node

/**
 * Script para abrir automáticamente la documentación Swagger
 * Inicia el servidor y abre Swagger UI en el navegador
 */

const { spawn } = require('child_process');
const axios = require('axios');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const SWAGGER_URL = `http://localhost:${PORT}/api-docs`;

console.log('🚀 Iniciando servidor y abriendo Swagger UI...\n');

// Función para abrir URL en el navegador
function openBrowser(url) {
  const start =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open';
  exec(`${start} ${url}`);
}

// Función para verificar si el servidor está listo
async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url, { timeout: 1000 });
      return true;
    } catch {
      console.log(`⏳ Esperando servidor... (${i + 1}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Iniciar servidor
console.log('📍 Iniciando servidor en modo desarrollo...');
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true,
});

// Manejar salida del servidor
server.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

// Cuando el servidor esté listo, abrir el navegador
(async () => {
  console.log('\n🔍 Verificando disponibilidad del servidor...');

  const serverReady = await waitForServer(`http://localhost:${PORT}/health`);

  if (serverReady) {
    console.log('✅ Servidor listo!');
    console.log('\n📚 Abriendo Swagger UI en el navegador...');
    console.log(`🔗 ${SWAGGER_URL}`);

    // Esperar un momento adicional para que Swagger esté completamente cargado
    setTimeout(() => {
      openBrowser(SWAGGER_URL);

      console.log('\n🎉 ¡Swagger UI abierto exitosamente!');
      console.log('\n📋 Información útil:');
      console.log(`   - Swagger UI: ${SWAGGER_URL}`);
      console.log(`   - OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
      console.log(`   - OpenAPI YAML: http://localhost:${PORT}/api-docs.yaml`);
      console.log(`   - Health Check: http://localhost:${PORT}/health`);
      console.log('\n💡 Presiona Ctrl+C para detener el servidor');
    }, 2000);
  } else {
    console.error('❌ El servidor no pudo iniciarse correctamente');
    server.kill();
    process.exit(1);
  }
})();

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.log('\n\n👋 Cerrando servidor...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
