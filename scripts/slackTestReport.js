#!/usr/bin/env node

/**
 * Script para enviar reportes de pruebas a Slack
 * Utiliza los resultados de Jest y los envía a un canal de Slack configurado
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class SlackTestReporter {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.slackChannel = process.env.SLACK_TEST_CHANNEL || '#kopp-crm-tests';
    this.slackBotName = process.env.SLACK_BOT_NAME || 'Kopp CRM QA Bot';
    this.projectName = 'Kopp CRM Automation';
    this.environment = process.env.NODE_ENV || 'development';

    // Configuración de colores para diferentes estados
    this.colors = {
      success: '#36a64f',
      warning: '#ff9500',
      error: '#ff0000',
      info: '#36a7db',
    };
  }

  /**
   * Lee el reporte de cobertura de Jest si existe
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
   * Lee el reporte de Jest results si existe
   */
  readTestResults() {
    const resultsPath = path.join(process.cwd(), 'test-results.json');

    try {
      if (fs.existsSync(resultsPath)) {
        return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading test results:', error.message);
    }

    return null;
  }

  /**
   * Genera el mensaje de Slack basado en los resultados
   */
  generateSlackMessage(testResults, coverage) {
    const gitBranch =
      process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || 'local';
    const gitCommit =
      process.env.GITHUB_SHA || process.env.GIT_COMMIT || 'unknown';
    const buildUrl =
      process.env.GITHUB_SERVER_URL &&
      process.env.GITHUB_REPOSITORY &&
      process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : null;

    // Determinar estado general
    const hasFailures =
      testResults &&
      (testResults.numFailedTests > 0 || testResults.numFailedTestSuites > 0);
    const status = hasFailures ? 'error' : 'success';
    const statusText = hasFailures ? '❌ FAILED' : '✅ PASSED';
    const color = this.colors[status];

    // Construir attachments
    const attachments = [
      {
        color: color,
        title: `${this.projectName} - Test Report`,
        title_link: buildUrl,
        fields: [
          {
            title: 'Environment',
            value: this.environment.toUpperCase(),
            short: true,
          },
          {
            title: 'Status',
            value: statusText,
            short: true,
          },
          {
            title: 'Branch',
            value: gitBranch,
            short: true,
          },
          {
            title: 'Commit',
            value: gitCommit.substring(0, 8),
            short: true,
          },
        ],
        footer: 'Kopp CRM QA',
        ts: Math.floor(Date.now() / 1000),
      },
    ];

    // Agregar información de tests si está disponible
    if (testResults) {
      attachments[0].fields.push(
        {
          title: 'Total Tests',
          value: testResults.numTotalTests.toString(),
          short: true,
        },
        {
          title: 'Passed',
          value: testResults.numPassedTests.toString(),
          short: true,
        },
        {
          title: 'Failed',
          value: testResults.numFailedTests.toString(),
          short: true,
        },
        {
          title: 'Test Suites',
          value: `${testResults.numPassedTestSuites}/${testResults.numTotalTestSuites}`,
          short: true,
        }
      );
    }

    // Agregar información de cobertura si está disponible
    if (coverage) {
      const coverageText = [
        `Lines: ${coverage.lines.pct}%`,
        `Functions: ${coverage.functions.pct}%`,
        `Branches: ${coverage.branches.pct}%`,
        `Statements: ${coverage.statements.pct}%`,
      ].join(' | ');

      attachments.push({
        color:
          coverage.lines.pct >= 80
            ? this.colors.success
            : coverage.lines.pct >= 60
              ? this.colors.warning
              : this.colors.error,
        title: 'Code Coverage',
        text: coverageText,
        fields: [
          {
            title: 'Lines',
            value: `${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.pct}%)`,
            short: true,
          },
          {
            title: 'Functions',
            value: `${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.pct}%)`,
            short: true,
          },
        ],
      });
    }

    return {
      channel: this.slackChannel,
      username: this.slackBotName,
      icon_emoji: hasFailures ? ':x:' : ':white_check_mark:',
      text: `Test Report - ${this.projectName}`,
      attachments: attachments,
    };
  }

  /**
   * Envía el mensaje a Slack
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
        console.log('✅ Reporte enviado a Slack exitosamente');
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
      console.error('❌ Error enviando reporte a Slack:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      return false;
    }
  }

  /**
   * Ejecuta el reporte completo
   */
  async run() {
    console.log('🚀 Generando reporte de pruebas para Slack...');

    const testResults = this.readTestResults();
    const coverage = this.readCoverageReport();

    if (!testResults && !coverage) {
      console.log('⚠️  No se encontraron resultados de pruebas o cobertura');
      console.log('💡 Ejecuta `npm run test:coverage` primero');
      return;
    }

    const message = this.generateSlackMessage(testResults, coverage);

    // Mostrar mensaje en consola para debug
    console.log('📋 Mensaje generado:', JSON.stringify(message, null, 2));

    await this.sendToSlack(message);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const reporter = new SlackTestReporter();
  reporter.run().catch((error) => {
    console.error('❌ Error ejecutando reporte:', error);
    process.exit(1);
  });
}

module.exports = SlackTestReporter;
