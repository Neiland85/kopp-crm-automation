#!/usr/bin/env node

/**
 * Script para limpiar extensiones no esenciales para Fase 0
 * Desinstala todas las extensiones excepto las requeridas
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Extensiones requeridas para la Fase 0 (SOLO ESTAS SE MANTIENEN)
const REQUIRED_EXTENSIONS = [
  'GitHub.copilot-chat',
  'dbaeumer.vscode-eslint',
  'esbenp.prettier-vscode',
  'redhat.vscode-yaml',
  'ms-azuretools.vscode-docker',
  'sozercan.slack',
];

// Extensiones del sistema que NO se deben desinstalar
const SYSTEM_EXTENSIONS = [
  'vscode.git',
  'vscode.github',
  'vscode.typescript-language-features',
  'vscode.json-language-features',
  'vscode.html-language-features',
  'vscode.css-language-features',
  'vscode.javascript',
  'vscode.markdown',
  'vscode.theme-defaults',
  'ms-ceintl.vscode-language-pack-es', // Paquete de idioma español
];

class ExtensionCleaner {
  constructor() {
    this.installedExtensions = [];
    this.toUninstall = [];
    this.uninstalled = [];
    this.errors = [];
    this.kept = [];
  }

  async getInstalledExtensions() {
    try {
      const { stdout } = await execAsync('code --list-extensions');
      this.installedExtensions = stdout
        .trim()
        .split('\\n')
        .filter((ext) => ext.length > 0);
      console.log(
        `📦 Total de extensiones instaladas: ${this.installedExtensions.length}`
      );
      return this.installedExtensions;
    } catch (error) {
      this.errors.push(`Error obteniendo extensiones: ${error.message}`);
      return [];
    }
  }

  async uninstallExtension(extensionId) {
    try {
      console.log(`❌ Desinstalando: ${extensionId}`);
      await execAsync(`code --uninstall-extension ${extensionId}`);
      this.uninstalled.push(extensionId);
      // Pequeña pausa entre desinstalaciones
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      this.errors.push(`Error desinstalando ${extensionId}: ${error.message}`);
      return false;
    }
  }

  categorizeExtensions() {
    console.log('\\n🔍 Analizando extensiones instaladas...');

    for (const ext of this.installedExtensions) {
      if (REQUIRED_EXTENSIONS.includes(ext)) {
        this.kept.push({ id: ext, reason: 'REQUERIDA' });
      } else if (SYSTEM_EXTENSIONS.includes(ext)) {
        this.kept.push({ id: ext, reason: 'SISTEMA' });
      } else {
        this.toUninstall.push(ext);
      }
    }

    console.log(`✅ Extensiones a mantener: ${this.kept.length}`);
    console.log(`❌ Extensiones a desinstalar: ${this.toUninstall.length}`);
  }

  async cleanExtensions() {
    console.log('\\n🏟️ LIMPIEZA DE EXTENSIONES - FASE 0 KOPP STADIUM CRM');
    console.log('='.repeat(65));

    await this.getInstalledExtensions();
    this.categorizeExtensions();

    if (this.toUninstall.length === 0) {
      console.log('\\n✨ No hay extensiones adicionales para desinstalar');
      return;
    }

    console.log(
      `\\n🧹 Iniciando desinstalación de ${this.toUninstall.length} extensiones...`
    );

    // Confirmar antes de proceder
    console.log(
      '\\n⚠️  ADVERTENCIA: Se van a desinstalar TODAS las extensiones excepto:'
    );
    REQUIRED_EXTENSIONS.forEach((ext) => console.log(`   ✓ ${ext}`));
    console.log('\\n⏱️  Iniciando en 3 segundos...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Desinstalar extensiones en lotes pequeños
    const batchSize = 5;
    for (let i = 0; i < this.toUninstall.length; i += batchSize) {
      const batch = this.toUninstall.slice(i, i + batchSize);
      console.log(
        `\\n📦 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(this.toUninstall.length / batchSize)}`
      );

      for (const ext of batch) {
        await this.uninstallExtension(ext);
      }

      // Pausa entre lotes
      if (i + batchSize < this.toUninstall.length) {
        console.log('⏱️  Pausa entre lotes...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  generateReport() {
    console.log('\\n' + '='.repeat(65));
    console.log('📊 RESUMEN DE LIMPIEZA DE EXTENSIONES');
    console.log('='.repeat(65));

    console.log('\\n✅ EXTENSIONES MANTENIDAS:');
    this.kept.forEach((ext) => {
      console.log(`   ${ext.id} (${ext.reason})`);
    });

    if (this.uninstalled.length > 0) {
      console.log('\\n❌ EXTENSIONES DESINSTALADAS:');
      this.uninstalled.forEach((ext) => {
        console.log(`   ${ext}`);
      });
      console.log(`\\n📊 Total desinstaladas: ${this.uninstalled.length}`);
    }

    if (this.errors.length > 0) {
      console.log('\\n⚠️  ERRORES:');
      this.errors.forEach((error) => {
        console.log(`   ${error}`);
      });
    }

    console.log('\\n🎉 LIMPIEZA COMPLETADA');
    console.log(
      '💡 Reinicia VS Code completamente para aplicar todos los cambios'
    );
    console.log(
      '🏟️ Tu workspace está optimizado para la Fase 0 de Kopp Stadium CRM'
    );
  }
}

async function main() {
  const cleaner = new ExtensionCleaner();
  await cleaner.cleanExtensions();
  cleaner.generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ExtensionCleaner;
