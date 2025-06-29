import app from './app';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Iniciar aplicación solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log('🚀 Kopp Stadium CRM API iniciada exitosamente!');
    console.log(`📍 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('🎯 Endpoints principales:');
    console.log('   - GET  /health - Verificación de salud');
    console.log('   - POST /slack/notify - Notificaciones Slack');
    console.log('   - POST /hubspot/contacts - Crear contactos');
    console.log('   - POST /zapier/webhook/lead-scoring - Webhook scoring');
    console.log(
      '   - POST /zapier/webhook/form-submission - Webhook formularios'
    );
    console.log('');
    console.log('🔗 Integraciones activas:');
    console.log('   - 📢 Slack API');
    console.log('   - 📊 HubSpot CRM');
    console.log('   - ⚡ Zapier Webhooks');
    console.log('   - 📈 Google Sheets');
    console.log('');
    console.log('✨ ¡API lista para automatizar Kopp Stadium CRM!');
  });
}

export default app;
