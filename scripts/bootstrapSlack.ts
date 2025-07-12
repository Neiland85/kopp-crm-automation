import { WebClient } from '@slack/web-api';
import { config } from 'dotenv';

/**
 * Bootstrap script para configurar la integración inicial con Slack
 * Fase 0: Configuración básica y validación de conexión
 */

// Cargar variables de entorno
config();

console.log('🚀 Iniciando Bootstrap Fase 0: Configuración Slack');

export async function bootstrapSlack() {
  console.log('📡 Configurando cliente Slack...');

  try {
    // Verificar que existe el token de Slack
    const slackToken = process.env.SLACK_BOT_TOKEN;

    if (!slackToken) {
      console.error('❌ Error: SLACK_BOT_TOKEN no encontrado en las variables de entorno');
      console.log('💡 Tip: Asegúrate de tener configurado el archivo .env con SLACK_BOT_TOKEN');
      return false;
    }

    // Crear cliente de Slack
    const slackClient = new WebClient(slackToken);

    // Verificar conexión básica
    console.log('🔍 Verificando conexión con Slack...');
    const authTest = await slackClient.auth.test();

    if (authTest.ok) {
      console.log('✅ Conexión con Slack exitosa');
      console.log(`� Bot configurado en workspace: ${authTest.team}`);
      console.log(`🤖 Bot ID: ${authTest.user_id}`);
      console.log('✅ Bootstrap Slack completado exitosamente');
      return true;
    } else {
      console.error('❌ Error en la conexión con Slack:', authTest.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Error durante el bootstrap de Slack:', error);
    console.log('💡 Verifica que el token de Slack sea válido y tenga los permisos necesarios');
    return false;
  }
}

if (require.main === module) {
  bootstrapSlack().catch(console.error);
}
