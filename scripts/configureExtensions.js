#!/usr/bin/env node

/**
 * Script para configurar las extensiones de VS Code para la Fase 0
 * Solo mantiene las extensiones esenciales para el proyecto Kopp Stadium CRM
 */

const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Extensiones requeridas para la Fase 0
const REQUIRED_EXTENSIONS = [
  'GitHub.copilot-chat',
  'dbaeumer.vscode-eslint',
  'esbenp.prettier-vscode',
  'redhat.vscode-yaml',
  'ms-azuretools.vscode-docker',
  'sozercan.slack', // Extensión de Slack disponible
];

// Extensiones que definitivamente deben desinstalarse
const UNWANTED_EXTENSIONS = [
  'ms-python.python',
  'ms-python.vscode-pylance',
  'ms-vscode.cpptools',
  'msjsdiag.debugger-for-chrome',
  'ms-toolsai.jupyter',
  'ms-python.isort',
  'ms-python.black-formatter',
  'ms-python.flake8',
  'ms-python.mypy-type-checker',
];

class ExtensionManager {
  constructor() {
    this.installedExtensions = [];
    this.disabledExtensions = [];
    this.newlyInstalledExtensions = [];
    this.errors = [];
  }

  async getInstalledExtensions() {
    try {
      const { stdout } = await execAsync('code --list-extensions');
      this.installedExtensions = stdout
        .trim()
        .split('\\n')
        .filter((ext) => ext.length > 0);
      console.log(
        `📦 Extensiones instaladas encontradas: ${this.installedExtensions.length}`
      );
      return this.installedExtensions;
    } catch (error) {
      this.errors.push(
        `Error obteniendo extensiones instaladas: ${error.message}`
      );
      return [];
    }
  }

  async uninstallExtension(extensionId) {
    try {
      console.log(`❌ Desinstalando: ${extensionId}`);
      await execAsync(`code --uninstall-extension ${extensionId}`);
      this.disabledExtensions.push(extensionId);
      return true;
    } catch (error) {
      this.errors.push(`Error desinstalando ${extensionId}: ${error.message}`);
      return false;
    }
  }

  async installExtension(extensionId) {
    try {
      console.log(`✅ Instalando: ${extensionId}`);
      await execAsync(`code --install-extension ${extensionId}`);
      this.newlyInstalledExtensions.push(extensionId);
      return true;
    } catch (error) {
      this.errors.push(`Error instalando ${extensionId}: ${error.message}`);
      return false;
    }
  }

  async processExtensions() {
    console.log('🏟️ Configurando extensiones para Kopp Stadium CRM - Fase 0');
    console.log('='.repeat(60));

    // Obtener extensiones instaladas
    await this.getInstalledExtensions();

    // Desinstalar extensiones no deseadas
    console.log('\\n🚫 Desinstalando extensiones no deseadas...');
    for (const unwantedExt of UNWANTED_EXTENSIONS) {
      if (this.installedExtensions.includes(unwantedExt)) {
        await this.uninstallExtension(unwantedExt);
      }
    }

    // Instalar extensiones requeridas que faltan
    console.log('\\n📥 Instalando extensiones requeridas...');
    for (const requiredExt of REQUIRED_EXTENSIONS) {
      if (!this.installedExtensions.includes(requiredExt)) {
        await this.installExtension(requiredExt);
      } else {
        console.log(`✓ Ya instalada: ${requiredExt}`);
      }
    }

    // Desinstalar extensiones que no están en la lista requerida (excepto las del sistema)
    console.log('\\n🧹 Limpiando extensiones adicionales...');
    const systemExtensions = [
      'vscode.git',
      'vscode.github',
      'vscode.typescript-language-features',
      'vscode.json-language-features',
      'vscode.html-language-features',
      'vscode.css-language-features',
    ];

    for (const installedExt of this.installedExtensions) {
      if (
        !REQUIRED_EXTENSIONS.includes(installedExt) &&
        !systemExtensions.includes(installedExt) &&
        !UNWANTED_EXTENSIONS.includes(installedExt)
      ) {
        console.log(
          `⚠️  Extensión adicional encontrada (se recomienda revisar): ${installedExt}`
        );
        // Comentado para evitar desinstalar extensiones que el usuario pueda necesitar
        // await this.uninstallExtension(installedExt);
      }
    }
  }

  generateReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE CONFIGURACIÓN DE EXTENSIONES');
    console.log('='.repeat(60));

    console.log('\\n✅ EXTENSIONES REQUERIDAS (Fase 0):');
    REQUIRED_EXTENSIONS.forEach((ext) => {
      const status = this.newlyInstalledExtensions.includes(ext)
        ? '🆕 INSTALADA'
        : '✓ YA INSTALADA';
      console.log(`   ${ext} - ${status}`);
    });

    if (this.disabledExtensions.length > 0) {
      console.log('\\n❌ EXTENSIONES DESINSTALADAS:');
      this.disabledExtensions.forEach((ext) => {
        console.log(`   ${ext}`);
      });
    }

    if (this.newlyInstalledExtensions.length > 0) {
      console.log('\\n🆕 EXTENSIONES INSTALADAS:');
      this.newlyInstalledExtensions.forEach((ext) => {
        console.log(`   ${ext}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\\n⚠️  ERRORES ENCONTRADOS:');
      this.errors.forEach((error) => {
        console.log(`   ${error}`);
      });
    }

    console.log('\\n🎉 Configuración de extensiones completada para Fase 0');
    console.log(
      '💡 Reinicia VS Code para que los cambios tengan efecto completo'
    );
  }
}

// Ejecutar el script
async function main() {
  const manager = new ExtensionManager();
  await manager.processExtensions();
  manager.generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ExtensionManager;
