#!/usr/bin/env node

/**
 * Script para configurar notificaciones de GitHub a Slack
 * Configura webhooks para commits, PRs, deployments, etc.
 */

const axios = require('axios');
require('dotenv').config();

class GitHubSlackNotifier {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.slackChannel = process.env.SLACK_GITHUB_CHANNEL || '#kopp-crm-dev';
    this.slackBotName = process.env.SLACK_BOT_NAME || 'GitHub Kopp Bot';
    this.projectName = 'Kopp CRM Automation';
    this.githubRepo =
      process.env.GITHUB_REPOSITORY || 'kopp-stadium/kopp-crm-automation';

    this.colors = {
      success: '#36a64f',
      warning: '#ff9500',
      error: '#ff0000',
      info: '#36a7db',
      purple: '#764FA5',
    };
  }

  /**
   * Procesa webhooks de GitHub y los formatea para Slack
   */
  async processGitHubWebhook(eventType, payload) {
    console.log(`📨 Procesando evento GitHub: ${eventType}`);

    switch (eventType) {
      case 'push':
        return await this.handlePushEvent(payload);

      case 'pull_request':
        return await this.handlePullRequestEvent(payload);

      case 'deployment':
        return await this.handleDeploymentEvent(payload);

      case 'deployment_status':
        return await this.handleDeploymentStatusEvent(payload);

      case 'release':
        return await this.handleReleaseEvent(payload);

      default:
        console.log(`⚠️  Evento no manejado: ${eventType}`);
        return null;
    }
  }

  /**
   * Maneja eventos de push (commits)
   */
  async handlePushEvent(payload) {
    const branch = payload.ref.replace('refs/heads/', '');
    const commits = payload.commits || [];

    // Solo notificar en ramas principales
    if (!['main', 'develop', 'staging'].includes(branch)) {
      console.log(`🔇 Silenciando push en rama: ${branch}`);
      return null;
    }

    const commitsText = commits
      .slice(0, 3)
      .map(
        (commit) =>
          `• <${commit.url}|${commit.id.substring(0, 7)}> ${commit.message} - ${commit.author.name}`
      )
      .join('\n');

    const attachment = {
      color: this.colors.info,
      title: `📦 Nueva actividad en ${branch}`,
      title_link: payload.compare,
      fields: [
        {
          title: 'Repository',
          value: `<${payload.repository.html_url}|${payload.repository.full_name}>`,
          short: true,
        },
        {
          title: 'Branch',
          value: branch,
          short: true,
        },
        {
          title: 'Commits',
          value: commits.length.toString(),
          short: true,
        },
        {
          title: 'Author',
          value: payload.pusher.name,
          short: true,
        },
      ],
      text: commits.length > 0 ? commitsText : 'No hay commits nuevos',
      footer: 'GitHub',
      ts: Math.floor(Date.now() / 1000),
    };

    if (commits.length > 3) {
      attachment.text += `\n... y ${commits.length - 3} commits más`;
    }

    return {
      channel: this.slackChannel,
      username: this.slackBotName,
      icon_emoji: ':octocat:',
      text: `Nuevos commits en \`${branch}\``,
      attachments: [attachment],
    };
  }

  /**
   * Maneja eventos de Pull Request
   */
  async handlePullRequestEvent(payload) {
    const pr = payload.pull_request;
    const action = payload.action;

    let color = this.colors.info;
    let emoji = ':git-pull-request:';
    let actionText = action;

    switch (action) {
      case 'opened':
        color = this.colors.success;
        emoji = '🔀';
        actionText = 'abierto';
        break;
      case 'closed':
        color = pr.merged ? this.colors.purple : this.colors.warning;
        emoji = pr.merged ? '✅' : '❌';
        actionText = pr.merged ? 'mergeado' : 'cerrado';
        break;
      case 'ready_for_review':
        color = this.colors.info;
        emoji = '👀';
        actionText = 'listo para revisión';
        break;
    }

    const attachment = {
      color: color,
      title: `${emoji} PR #${pr.number}: ${pr.title}`,
      title_link: pr.html_url,
      fields: [
        {
          title: 'Estado',
          value: actionText.toUpperCase(),
          short: true,
        },
        {
          title: 'Author',
          value: pr.user.login,
          short: true,
        },
        {
          title: 'Base → Head',
          value: `\`${pr.base.ref}\` ← \`${pr.head.ref}\``,
          short: true,
        },
        {
          title: 'Changes',
          value: `+${pr.additions} -${pr.deletions}`,
          short: true,
        },
      ],
      text: pr.body
        ? pr.body.substring(0, 300) + (pr.body.length > 300 ? '...' : '')
        : 'Sin descripción',
      footer: 'GitHub Pull Request',
      ts: Math.floor(Date.now() / 1000),
    };

    return {
      channel: this.slackChannel,
      username: this.slackBotName,
      icon_emoji: ':octocat:',
      text: `Pull Request ${actionText}: <${pr.html_url}|#${pr.number} ${pr.title}>`,
      attachments: [attachment],
    };
  }

  /**
   * Maneja eventos de deployment
   */
  async handleDeploymentEvent(payload) {
    const deployment = payload.deployment;

    const attachment = {
      color: this.colors.warning,
      title: `🚀 Deployment iniciado`,
      fields: [
        {
          title: 'Environment',
          value: deployment.environment,
          short: true,
        },
        {
          title: 'Ref',
          value: deployment.ref,
          short: true,
        },
        {
          title: 'Creator',
          value: deployment.creator.login,
          short: true,
        },
      ],
      text: deployment.description || 'Sin descripción',
      footer: 'GitHub Deployment',
      ts: Math.floor(Date.now() / 1000),
    };

    return {
      channel: this.slackChannel,
      username: this.slackBotName,
      icon_emoji: ':rocket:',
      text: `Deployment a \`${deployment.environment}\` iniciado`,
      attachments: [attachment],
    };
  }

  /**
   * Maneja eventos de deployment status
   */
  async handleDeploymentStatusEvent(payload) {
    const status = payload.deployment_status;
    const deployment = payload.deployment;

    let color = this.colors.info;
    let emoji = '⏳';

    switch (status.state) {
      case 'success':
        color = this.colors.success;
        emoji = '✅';
        break;
      case 'failure':
        color = this.colors.error;
        emoji = '❌';
        break;
      case 'error':
        color = this.colors.error;
        emoji = '💥';
        break;
    }

    const attachment = {
      color: color,
      title: `${emoji} Deployment ${status.state}`,
      title_link: status.target_url,
      fields: [
        {
          title: 'Environment',
          value: deployment.environment,
          short: true,
        },
        {
          title: 'Status',
          value: status.state.toUpperCase(),
          short: true,
        },
      ],
      text: status.description || `Deployment ${status.state}`,
      footer: 'GitHub Deployment',
      ts: Math.floor(Date.now() / 1000),
    };

    return {
      channel:
        deployment.environment === 'production'
          ? '#anuncios-kopp'
          : this.slackChannel,
      username: this.slackBotName,
      icon_emoji: ':rocket:',
      text: `Deployment a \`${deployment.environment}\`: ${status.state}`,
      attachments: [attachment],
    };
  }

  /**
   * Maneja eventos de release
   */
  async handleReleaseEvent(payload) {
    const release = payload.release;
    const action = payload.action;

    if (action !== 'published') {
      return null; // Solo notificar releases publicados
    }

    const attachment = {
      color: this.colors.success,
      title: `🎉 Nueva release: ${release.name || release.tag_name}`,
      title_link: release.html_url,
      fields: [
        {
          title: 'Tag',
          value: release.tag_name,
          short: true,
        },
        {
          title: 'Author',
          value: release.author.login,
          short: true,
        },
        {
          title: 'Prerelease',
          value: release.prerelease ? 'Sí' : 'No',
          short: true,
        },
      ],
      text: release.body
        ? release.body.substring(0, 500) +
          (release.body.length > 500 ? '...' : '')
        : 'Sin notas de release',
      footer: 'GitHub Release',
      ts: Math.floor(Date.now() / 1000),
    };

    return {
      channel: '#anuncios-kopp',
      username: this.slackBotName,
      icon_emoji: ':tada:',
      text: `🚀 Nueva release disponible: <${release.html_url}|${release.name || release.tag_name}>`,
      attachments: [attachment],
    };
  }

  /**
   * Envía mensaje a Slack
   */
  async sendToSlack(message) {
    if (!message) {
      console.log('🔇 Sin mensaje para enviar');
      return true;
    }

    if (!this.slackWebhookUrl) {
      console.error('❌ SLACK_WEBHOOK_URL no está configurado');
      return false;
    }

    try {
      const response = await axios.post(this.slackWebhookUrl, message, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('✅ Notificación enviada a Slack');
        return true;
      } else {
        console.error('❌ Error enviando a Slack:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error enviando notificación:', error.message);
      return false;
    }
  }

  /**
   * Procesa webhook de GitHub desde Express
   */
  async handleWebhook(req, res) {
    const eventType = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`📧 GitHub webhook recibido: ${eventType}`);

    try {
      const message = await this.processGitHubWebhook(eventType, payload);
      const sent = await this.sendToSlack(message);

      res.status(200).json({
        success: true,
        event: eventType,
        message_sent: sent,
      });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

// Función para configurar GitHub webhook programáticamente
async function setupGitHubWebhook() {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const webhookUrl = process.env.WEBHOOK_URL; // URL donde está desplegado el servicio

  if (!githubToken || !githubRepo || !webhookUrl) {
    console.error(
      '❌ Variables requeridas: GITHUB_TOKEN, GITHUB_REPOSITORY, WEBHOOK_URL'
    );
    return;
  }

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${githubRepo}/hooks`,
      {
        name: 'web',
        active: true,
        events: [
          'push',
          'pull_request',
          'deployment',
          'deployment_status',
          'release',
        ],
        config: {
          url: `${webhookUrl}/webhooks/github`,
          content_type: 'json',
          insecure_ssl: '0',
        },
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    console.log('✅ GitHub webhook configurado:', response.data.id);
  } catch (error) {
    console.error(
      '❌ Error configurando webhook:',
      error.response?.data || error.message
    );
  }
}

// Ejecutar setup si es llamado directamente
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'setup') {
    setupGitHubWebhook();
  } else {
    console.log('💡 Uso: node githubSlackNotifier.js setup');
  }
}

module.exports = GitHubSlackNotifier;
