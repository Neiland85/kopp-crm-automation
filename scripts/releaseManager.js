#!/usr/bin/env node

/**
 * Script para gestionar releases automáticos
 * Incluye generación de changelog, tagging y notificaciones
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class ReleaseManager {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.slackChannel = process.env.SLACK_RELEASE_CHANNEL || '#anuncios-kopp';
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubRepo =
      process.env.GITHUB_REPOSITORY || 'kopp-stadium/kopp-crm-automation';
    this.projectName = 'Kopp CRM Automation';

    this.colors = {
      success: '#36a64f',
      warning: '#ff9500',
      error: '#ff0000',
      info: '#36a7db',
    };
  }

  /**
   * Obtiene la versión actual del package.json
   */
  getCurrentVersion() {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  }

  /**
   * Incrementa la versión basada en el tipo de release
   */
  incrementVersion(currentVersion, releaseType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (releaseType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        throw new Error(`Tipo de release inválido: ${releaseType}`);
    }
  }

  /**
   * Actualiza la versión en package.json
   */
  updatePackageVersion(newVersion) {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log(`📦 Versión actualizada a ${newVersion}`);
  }

  /**
   * Genera changelog basado en commits desde el último tag
   */
  generateChangelog() {
    try {
      // Obtener el último tag
      let lastTag;
      try {
        lastTag = execSync('git describe --tags --abbrev=0', {
          encoding: 'utf8',
        }).trim();
      } catch {
        lastTag = 'HEAD~10'; // Si no hay tags, usar últimos 10 commits
      }

      // Obtener commits desde el último tag
      const commits = execSync(
        `git log ${lastTag}..HEAD --pretty=format:"%h|%s|%an|%ad" --date=short`,
        { encoding: 'utf8' }
      )
        .split('\n')
        .filter((line) => line.trim());

      const changelog = {
        features: [],
        fixes: [],
        chores: [],
        breaking: [],
      };

      commits.forEach((commit) => {
        const [hash, subject, author, date] = commit.split('|');
        const entry = { hash, subject, author, date };

        if (subject.startsWith('feat:') || subject.startsWith('feature:')) {
          changelog.features.push(entry);
        } else if (
          subject.startsWith('fix:') ||
          subject.startsWith('bugfix:')
        ) {
          changelog.fixes.push(entry);
        } else if (
          subject.startsWith('BREAKING:') ||
          subject.includes('BREAKING CHANGE')
        ) {
          changelog.breaking.push(entry);
        } else {
          changelog.chores.push(entry);
        }
      });

      return changelog;
    } catch (error) {
      console.error('❌ Error generando changelog:', error.message);
      return null;
    }
  }

  /**
   * Formatea el changelog para markdown
   */
  formatChangelogMarkdown(changelog) {
    const sections = [];

    if (changelog.breaking.length > 0) {
      sections.push('## 🚨 Breaking Changes\n');
      changelog.breaking.forEach((entry) => {
        sections.push(`- ${entry.subject} (${entry.hash})`);
      });
      sections.push('');
    }

    if (changelog.features.length > 0) {
      sections.push('## ✨ Features\n');
      changelog.features.forEach((entry) => {
        sections.push(
          `- ${entry.subject.replace(/^feat:\s?/, '')} (${entry.hash})`
        );
      });
      sections.push('');
    }

    if (changelog.fixes.length > 0) {
      sections.push('## 🐛 Bug Fixes\n');
      changelog.fixes.forEach((entry) => {
        sections.push(
          `- ${entry.subject.replace(/^fix:\s?/, '')} (${entry.hash})`
        );
      });
      sections.push('');
    }

    if (changelog.chores.length > 0) {
      sections.push('## 🔧 Chores & Improvements\n');
      changelog.chores.forEach((entry) => {
        sections.push(`- ${entry.subject} (${entry.hash})`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Crea un tag de Git
   */
  createGitTag(version, changelog) {
    try {
      const tagMessage = `Release v${version}\n\n${this.formatChangelogMarkdown(changelog)}`;

      execSync(`git add package.json`);
      execSync(`git commit -m "chore: bump version to ${version}"`);
      execSync(`git tag -a v${version} -m "${tagMessage}"`);
      execSync(`git push origin main --tags`);

      console.log(`🏷️  Tag v${version} creado y pusheado`);
      return true;
    } catch (error) {
      console.error('❌ Error creando tag:', error.message);
      return false;
    }
  }

  /**
   * Crea un release en GitHub
   */
  async createGitHubRelease(version, changelog) {
    if (!this.githubToken) {
      console.log('⚠️  GITHUB_TOKEN no configurado, saltando GitHub release');
      return false;
    }

    try {
      const releaseBody = this.formatChangelogMarkdown(changelog);

      const response = await axios.post(
        `https://api.github.com/repos/${this.githubRepo}/releases`,
        {
          tag_name: `v${version}`,
          name: `Release v${version}`,
          body: releaseBody,
          draft: false,
          prerelease: version.includes('-'),
        },
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      console.log('✅ GitHub release creado:', response.data.html_url);
      return response.data;
    } catch (error) {
      console.error(
        '❌ Error creando GitHub release:',
        error.response?.data || error.message
      );
      return false;
    }
  }

  /**
   * Envía notificación a Slack sobre el release
   */
  async sendSlackNotification(version, changelog, githubRelease) {
    if (!this.slackWebhookUrl) {
      console.log(
        '⚠️  SLACK_WEBHOOK_URL no configurado, saltando notificación Slack'
      );
      return false;
    }

    const totalChanges =
      (changelog.features?.length || 0) +
      (changelog.fixes?.length || 0) +
      (changelog.breaking?.length || 0);

    const changesSummary = [
      changelog.features?.length
        ? `${changelog.features.length} nuevas features`
        : null,
      changelog.fixes?.length ? `${changelog.fixes.length} bug fixes` : null,
      changelog.breaking?.length
        ? `${changelog.breaking.length} breaking changes`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    const attachment = {
      color:
        changelog.breaking?.length > 0
          ? this.colors.warning
          : this.colors.success,
      title: `🚀 ${this.projectName} v${version}`,
      title_link: githubRelease ? githubRelease.html_url : null,
      fields: [
        {
          title: 'Version',
          value: `v${version}`,
          short: true,
        },
        {
          title: 'Changes',
          value: totalChanges.toString(),
          short: true,
        },
        {
          title: 'Summary',
          value: changesSummary || 'Mejoras menores',
          short: false,
        },
      ],
      footer: 'Kopp CRM Release',
      ts: Math.floor(Date.now() / 1000),
    };

    // Agregar sección de breaking changes si existen
    if (changelog.breaking?.length > 0) {
      attachment.fields.push({
        title: '🚨 Breaking Changes',
        value: changelog.breaking
          .slice(0, 3)
          .map((entry) => `• ${entry.subject}`)
          .join('\n'),
        short: false,
      });
    }

    const message = {
      channel: this.slackChannel,
      username: 'Kopp Release Bot',
      icon_emoji: ':rocket:',
      text: `🎉 Nueva release disponible: *${this.projectName} v${version}*`,
      attachments: [attachment],
    };

    try {
      const response = await axios.post(this.slackWebhookUrl, message);
      if (response.status === 200) {
        console.log('✅ Notificación Slack enviada');
        return true;
      }
    } catch (error) {
      console.error('❌ Error enviando notificación Slack:', error.message);
    }

    return false;
  }

  /**
   * Ejecuta el proceso completo de release
   */
  async createRelease(releaseType = 'patch') {
    console.log(`🚀 Iniciando proceso de release (${releaseType})...`);

    // Verificar que el workspace esté limpio
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.error('❌ El workspace tiene cambios sin commitear');
        console.log('💡 Commitea o haz stash de los cambios antes del release');
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando estado de Git:', error.message);
      return false;
    }

    // Obtener y incrementar versión
    const currentVersion = this.getCurrentVersion();
    const newVersion = this.incrementVersion(currentVersion, releaseType);

    console.log(`📈 ${currentVersion} → ${newVersion}`);

    // Generar changelog
    const changelog = this.generateChangelog();
    if (!changelog) {
      console.error('❌ No se pudo generar changelog');
      return false;
    }

    // Actualizar package.json
    this.updatePackageVersion(newVersion);

    // Crear tag de Git
    if (!this.createGitTag(newVersion, changelog)) {
      console.error('❌ No se pudo crear el tag de Git');
      return false;
    }

    // Crear GitHub release
    const githubRelease = await this.createGitHubRelease(newVersion, changelog);

    // Enviar notificación a Slack
    await this.sendSlackNotification(newVersion, changelog, githubRelease);

    console.log(`🎉 Release v${newVersion} completado exitosamente`);
    return true;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const releaseType = process.argv[2] || 'patch';

  if (!['major', 'minor', 'patch'].includes(releaseType)) {
    console.error('❌ Tipo de release inválido. Usa: major, minor, o patch');
    process.exit(1);
  }

  const releaseManager = new ReleaseManager();
  releaseManager
    .createRelease(releaseType)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Error en el proceso de release:', error);
      process.exit(1);
    });
}

module.exports = ReleaseManager;
