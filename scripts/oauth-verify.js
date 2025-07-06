#!/usr/bin/env node

/**
 * Verificador OAuth rápido para Kopp Stadium CRM
 */

require('dotenv').config();

console.log('🔐 Verificación OAuth - Kopp Stadium CRM');
console.log('==========================================');
console.log('');

// Verificar variables OAuth
const oauthVars = {
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  SLACK_STATE_SECRET: process.env.SLACK_STATE_SECRET,
};

console.log('📋 Variables OAuth:');
Object.entries(oauthVars).forEach(([name, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value
    ? name === 'SLACK_CLIENT_SECRET'
      ? 'CONFIGURADO'
      : name === 'SLACK_STATE_SECRET'
        ? value.substring(0, 20) + '...'
        : value
    : 'NO CONFIGURADO';

  console.log(`   ${status} ${name}: ${displayValue}`);
});

console.log('');

// URLs OAuth
const port = process.env.PORT || 3000;
const ngrokExample = 'https://abc123.ngrok.io';

console.log('🌐 URLs OAuth (reemplaza con tu ngrok):');
console.log(`   📥 Install: ${ngrokExample}/slack/install`);
console.log(`   🔄 Redirect: ${ngrokExample}/slack/oauth_redirect`);
console.log(`   ⚡ Events: ${ngrokExample}/slack/events`);

console.log('');

// Estado general
const allConfigured = Object.values(oauthVars).every((v) => v);
if (allConfigured) {
  console.log('🎉 ¡Configuración OAuth completa!');
  console.log('');
  console.log('📝 Próximos pasos:');
  console.log('   1. npm run dev:oauth');
  console.log('   2. ngrok http 3000');
  console.log('   3. Actualizar URLs en Slack App');
  console.log('   4. Usar URL de instalación: [ngrok]/slack/install');
} else {
  console.log('⚠️  Configuración OAuth incompleta');
  console.log('');
  console.log('🔧 Para completar:');
  if (
    !process.env.SLACK_CLIENT_SECRET ||
    process.env.SLACK_CLIENT_SECRET === 'TU_CLIENT_SECRET_AQUI'
  ) {
    console.log('   • Obtener Client Secret de https://api.slack.com/apps');
    console.log('   • Basic Information → App Credentials → Client Secret');
    console.log('   • Actualizar SLACK_CLIENT_SECRET en .env');
  }
}

console.log('');
console.log('📖 Guía completa: SLACK_OAUTH_SETUP_COMPLETE.md');
