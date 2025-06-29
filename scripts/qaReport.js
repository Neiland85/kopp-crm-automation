#!/usr/bin/env node

/**
 * Script para generar reportes de QA completos y enviarlos a Slack
 * Incluye análisis de código, pruebas, cobertura, linting, y métricas de deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
require('dotenv').config();

class QAReporter {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.slackChannel = process.env.SLACK_QA_CHANNEL || '#kopp-crm-qa';
    this.slackBotName = process.env.SLACK_BOT_NAME || 'Kopp CRM QA Bot';
    this.projectName = 'Kopp CRM Automation';
    this.environment = process.env.NODE_ENV || 'development';

    this.colors = {
      success: '#36a64f',
      warning: '#ff9500',
      error: '#ff0000',
      info: '#36a7db',
    };

    this.qaResults = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      branch: process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || 'local',
      commit: process.env.GITHUB_SHA || process.env.GIT_COMMIT || 'unknown',
      buildUrl: this.getBuildUrl(),
      tests: null,
      coverage: null,
      lint: null,
      build: null,
      security: null,
      performance: null,
    };
  }

  getBuildUrl() {
    if (
      process.env.GITHUB_SERVER_URL &&
      process.env.GITHUB_REPOSITORY &&
      process.env.GITHUB_RUN_ID
    ) {
      return `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    }
    return null;
  }

  /**
   * Ejecuta las pruebas y captura los resultados
   */
  async runTests() {
    console.log('🧪 Ejecutando pruebas...');

    try {
      // Ejecutar pruebas con cobertura
      const testOutput = execSync('npm run test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      this.qaResults.tests = {
        status: 'passed',
        output: testOutput,
        coverage: this.readCoverageReport(),
      };

      console.log('✅ Pruebas completadas exitosamente');
    } catch (error) {
      this.qaResults.tests = {
        status: 'failed',
        error: error.message,
        output: error.stdout || error.stderr || 'No output available',
      };

      console.log('❌ Pruebas fallaron');
    }
  }

  /**
   * Ejecuta linting y captura los resultados
   */
  async runLinting() {
    console.log('🔍 Ejecutando análisis de código (linting)...');

    try {
      const lintOutput = execSync('npm run lint:check', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      this.qaResults.lint = {
        status: 'passed',
        output: lintOutput,
      };

      console.log('✅ Linting completado exitosamente');
    } catch (error) {
      this.qaResults.lint = {
        status: 'failed',
        error: error.message,
        output: error.stdout || error.stderr || 'No output available',
      };

      console.log('❌ Linting falló');
    }
  }

  /**
   * Ejecuta build y captura los resultados
   */
  async runBuild() {
    console.log('🏗️  Ejecutando build...');

    try {
      const buildOutput = execSync('npm run build', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      this.qaResults.build = {
        status: 'passed',
        output: buildOutput,
        size: this.getBuildSize(),
      };

      console.log('✅ Build completado exitosamente');
    } catch (error) {
      this.qaResults.build = {
        status: 'failed',
        error: error.message,
        output: error.stdout || error.stderr || 'No output available',
      };

      console.log('❌ Build falló');
    }
  }

  /**
   * Obtiene el tamaño del build
   */
  getBuildSize() {
    try {
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        return this.formatBytes(this.getFolderSize(distPath));
      }
    } catch (error) {
      console.error('Error calculando tamaño del build:', error.message);
    }
    return 'unknown';
  }

  /**
   * Calcula el tamaño de una carpeta recursivamente
   */
  getFolderSize(folderPath) {
    let size = 0;
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        size += this.getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }

    return size;
  }

  /**
   * Formatea bytes a formato legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Lee el reporte de cobertura
   */
  readCoverageReport() {
    const coveragePath = path.join(
      process.cwd(),
      'coverage/coverage-summary.json'
    );

    try {
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        return coverage.total;
      }
    } catch (error) {
      console.error('Error reading coverage report:', error.message);
    }

    return null;
  }

  /**
   * Analiza seguridad básica (dependencias)
   */
  async runSecurityCheck() {
    console.log('🔒 Ejecutando análisis de seguridad...');

    try {
      // Verificar vulnerabilidades conocidas
      const auditOutput = execSync('npm audit --audit-level=moderate', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      this.qaResults.security = {
        status: 'passed',
        output: auditOutput,
      };

      console.log('✅ Análisis de seguridad completado');
    } catch (error) {
      this.qaResults.security = {
        status: 'warning',
        error: error.message,
        output: error.stdout || error.stderr || 'No output available',
      };

      console.log('⚠️  Vulnerabilidades encontradas en dependencias');
    }
  }

  /**
   * Determina el estado general del QA
   */
  getOverallStatus() {
    const results = this.qaResults;

    // Si alguna prueba crítica falló
    if (
      results.tests?.status === 'failed' ||
      results.build?.status === 'failed'
    ) {
      return 'error';
    }

    // Si hay warnings
    if (
      results.lint?.status === 'failed' ||
      results.security?.status === 'warning'
    ) {
      return 'warning';
    }

    return 'success';
  }

  /**
   * Genera el mensaje de Slack
   */
  generateSlackMessage() {
    const status = this.getOverallStatus();
    const statusText =
      status === 'error'
        ? '❌ QA FAILED'
        : status === 'warning'
          ? '⚠️  QA WARNING'
          : '✅ QA PASSED';
    const color = this.colors[status];

    const attachments = [
      {
        color: color,
        title: `${this.projectName} - QA Report`,
        title_link: this.qaResults.buildUrl,
        fields: [
          {
            title: 'Environment',
            value: this.qaResults.environment.toUpperCase(),
            short: true,
          },
          {
            title: 'Status',
            value: statusText,
            short: true,
          },
          {
            title: 'Branch',
            value: this.qaResults.branch,
            short: true,
          },
          {
            title: 'Commit',
            value: this.qaResults.commit.substring(0, 8),
            short: true,
          },
        ],
        footer: 'Kopp CRM QA',
        ts: Math.floor(Date.now() / 1000),
      },
    ];

    // Agregar información detallada de cada check
    const checks = [
      {
        name: 'Tests',
        result: this.qaResults.tests,
        icon: this.qaResults.tests?.status === 'passed' ? '✅' : '❌',
      },
      {
        name: 'Lint',
        result: this.qaResults.lint,
        icon: this.qaResults.lint?.status === 'passed' ? '✅' : '❌',
      },
      {
        name: 'Build',
        result: this.qaResults.build,
        icon: this.qaResults.build?.status === 'passed' ? '✅' : '❌',
      },
      {
        name: 'Security',
        result: this.qaResults.security,
        icon: this.qaResults.security?.status === 'passed' ? '✅' : '⚠️',
      },
    ];

    attachments[0].fields.push({
      title: 'QA Checks',
      value: checks.map((check) => `${check.icon} ${check.name}`).join('\n'),
      short: true,
    });

    // Agregar información de cobertura si está disponible
    if (this.qaResults.tests?.coverage) {
      const coverage = this.qaResults.tests.coverage;
      attachments[0].fields.push({
        title: 'Coverage',
        value: `${coverage.lines.pct}% lines`,
        short: true,
      });
    }

    // Agregar información de build size si está disponible
    if (this.qaResults.build?.size) {
      attachments[0].fields.push({
        title: 'Build Size',
        value: this.qaResults.build.size,
        short: true,
      });
    }

    return {
      channel: this.slackChannel,
      username: this.slackBotName,
      icon_emoji:
        status === 'error'
          ? ':x:'
          : status === 'warning'
            ? ':warning:'
            : ':white_check_mark:',
      text: `QA Report - ${this.projectName}`,
      attachments: attachments,
    };
  }

  /**
   * Envía el reporte a Slack
   */
  async sendToSlack(message) {
    if (!this.slackWebhookUrl) {
      console.error('❌ SLACK_WEBHOOK_URL no está configurado');
      console.log('💡 Configura SLACK_WEBHOOK_URL en tu archivo .env');
      return false;
    }

    try {
      const response = await axios.post(this.slackWebhookUrl, message, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('✅ Reporte QA enviado a Slack exitosamente');
        return true;
      } else {
        console.error(
          '❌ Error enviando a Slack:',
          response.status,
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Error enviando reporte QA a Slack:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      return false;
    }
  }

  /**
   * Guarda el reporte en archivo JSON
   */
  saveReport() {
    const reportPath = path.join(process.cwd(), 'qa-report.json');
    try {
      fs.writeFileSync(reportPath, JSON.stringify(this.qaResults, null, 2));
      console.log(`📄 Reporte guardado en: ${reportPath}`);
    } catch (error) {
      console.error('Error guardando reporte:', error.message);
    }
  }

  /**
   * Ejecuta el reporte completo de QA
   */
  async run() {
    console.log('🚀 Iniciando reporte completo de QA...');
    console.log(`📊 Environment: ${this.environment}`);
    console.log(`🌿 Branch: ${this.qaResults.branch}`);
    console.log(`📝 Commit: ${this.qaResults.commit.substring(0, 8)}`);

    // Ejecutar todos los checks
    await this.runTests();
    await this.runLinting();
    await this.runBuild();
    await this.runSecurityCheck();

    // Generar y enviar reporte
    const message = this.generateSlackMessage();

    // Guardar reporte local
    this.saveReport();

    // Mostrar resumen en consola
    console.log('\n📋 Resumen del QA:');
    console.log(`   Tests: ${this.qaResults.tests?.status || 'not run'}`);
    console.log(`   Lint: ${this.qaResults.lint?.status || 'not run'}`);
    console.log(`   Build: ${this.qaResults.build?.status || 'not run'}`);
    console.log(`   Security: ${this.qaResults.security?.status || 'not run'}`);
    console.log(`   Overall: ${this.getOverallStatus()}`);

    // Enviar a Slack
    await this.sendToSlack(message);

    console.log('\n🎉 Reporte QA completado');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const reporter = new QAReporter();
  reporter.run().catch((error) => {
    console.error('❌ Error ejecutando reporte QA:', error);
    process.exit(1);
  });
}

module.exports = QAReporter;
