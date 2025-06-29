/**
 * 🧪 Tests para Dropout Positivo - Zapier CLI Integration
 *
 * Tests unitarios con Mocha/Chai y nock para mocking de APIs externas
 */

import { expect } from 'chai';
import nock from 'nock';
import { dropoutPositivoHandler } from '../../../src/zaps/dropout-positivo/handler';

describe('💫 Dropout Positivo Integration Tests', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    nock.cleanAll();
  });

  afterEach(() => {
    // Verificar que todos los mocks fueron utilizados
    if (!nock.isDone()) {
      console.error('Pending mocks:', nock.pendingMocks());
    }
    nock.cleanAll();
  });

  describe('✅ Casos de Éxito', () => {
    it('debe procesar correctamente un contact con dropout > 7 días', async () => {
      // Arrange
      const contactId = '12345';
      const email = 'usuario@example.com';
      const currentScore = 35;
      const scoreBoost = 30;
      const expectedNewScore = currentScore + scoreBoost;

      const config = {
        contactId,
        email,
        lastEngagementDate: '2025-06-22T00:00:00.000Z',
        hubspotApiKey: 'test-hubspot-key',
        slackBotToken: 'xoxb-test-slack-token',
        slackChannel: '#auditoria-sagrada',
        scoreBoost,
        thresholdDays: 7,
      };

      // Mock HubSpot GET (obtener contact)
      nock('https://api.hubapi.com')
        .get(`/crm/v3/objects/contacts/${contactId}`)
        .query({
          properties:
            'email,lead_influence_score,last_engagement_date,firstname,lastname',
        })
        .reply(200, {
          properties: {
            email,
            lead_influence_score: currentScore.toString(),
            last_engagement_date: '2025-06-22T00:00:00.000Z',
            firstname: 'Usuario',
            lastname: 'Test',
          },
        });

      // Mock HubSpot PATCH (actualizar score)
      nock('https://api.hubapi.com')
        .patch(`/crm/v3/objects/contacts/${contactId}`)
        .reply(200, { success: true });

      // Mock Slack API
      nock('https://slack.com').post('/api/chat.postMessage').reply(200, {
        ok: true,
        ts: '1234567890.123456',
        channel: 'C1234567890',
      });

      // Act
      const result = await dropoutPositivoHandler(config);

      // Assert
      expect(result).to.be.an('object');
      expect(result.success).to.be.true;
      expect(result.contactId).to.equal(contactId);
      expect(result.email).to.equal(email);
      expect(result.previousScore).to.equal(currentScore);
      expect(result.newScore).to.equal(expectedNewScore);
      expect(result.daysSinceEngagement).to.be.greaterThan(7);
      expect(result.slackMessageId).to.be.a('string');
      expect(result.processedAt).to.be.a('string');
    });

    it('debe calcular correctamente los días sin engagement', async () => {
      // Arrange
      const contactId = '12345';
      const email = 'test@example.com';
      const currentScore = 50;

      // Fecha de hace exactamente 10 días
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const config = {
        contactId,
        email,
        lastEngagementDate: tenDaysAgo.toISOString(),
        hubspotApiKey: 'test-hubspot-key',
        slackBotToken: 'xoxb-test-slack-token',
        slackChannel: '#auditoria-sagrada',
        thresholdDays: 7,
      };

      // Mock APIs
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email,
            lead_influence_score: currentScore.toString(),
            last_engagement_date: tenDaysAgo.toISOString(),
          },
        });

      nock('https://api.hubapi.com')
        .patch(/\/crm\/v3\/objects\/contacts\/\d+/)
        .reply(200, { success: true });

      nock('https://slack.com')
        .post('/api/chat.postMessage')
        .reply(200, { ok: true, ts: '1234567890.123456' });

      // Act
      const result = await dropoutPositivoHandler(config);

      // Assert
      expect(result.daysSinceEngagement).to.be.approximately(10, 1);
      expect(result.success).to.be.true;
    });

    it('debe generar un mensaje de Slack con formato correcto', async () => {
      // Arrange
      const contactId = '12345';
      const email = 'usuario@example.com';
      const currentScore = 25;

      const config = {
        contactId,
        email,
        lastEngagementDate: '2025-06-15T00:00:00.000Z',
        hubspotApiKey: 'test-hubspot-key',
        slackBotToken: 'xoxb-test-slack-token',
        slackChannel: '#auditoria-sagrada',
        scoreBoost: 30,
      };

      // Mock APIs
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email,
            lead_influence_score: currentScore.toString(),
            last_engagement_date: '2025-06-15T00:00:00.000Z',
          },
        });

      nock('https://api.hubapi.com')
        .patch(/\/crm\/v3\/objects\/contacts\/\d+/)
        .reply(200, { success: true });

      // Mock Slack con captura del mensaje
      let slackMessage: any;
      nock('https://slack.com')
        .post('/api/chat.postMessage', (body) => {
          slackMessage = body;
          return true;
        })
        .reply(200, { ok: true, ts: '1234567890.123456' });

      // Act
      await dropoutPositivoHandler(config);

      // Assert
      expect(slackMessage).to.be.an('object');
      expect(slackMessage.channel).to.equal('#auditoria-sagrada');
      expect(slackMessage.blocks).to.be.an('array');

      const messageText = slackMessage.blocks[0].text.text;
      expect(messageText).to.include('💫 *Dropout Emocional Positivo*');
      expect(messageText).to.include(`*Usuario:* ${email}`);
      expect(messageText).to.include('*Acción:* Reengagement aplicado');
    });
  });

  describe('❌ Casos de Error', () => {
    it('debe manejar errores de la API de HubSpot', async () => {
      // Arrange
      const config = {
        contactId: '12345',
        email: 'test@example.com',
        hubspotApiKey: 'invalid-key',
        slackBotToken: 'xoxb-test-token',
        slackChannel: '#auditoria-sagrada',
      };

      // Mock HubSpot error
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(401, {
          status: 'error',
          message: 'Authentication credentials not found',
        });

      // Act & Assert
      try {
        await dropoutPositivoHandler(config);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });

    it('debe manejar errores de la API de Slack', async () => {
      // Arrange
      const config = {
        contactId: '12345',
        email: 'test@example.com',
        hubspotApiKey: 'test-key',
        slackBotToken: 'invalid-token',
        slackChannel: '#auditoria-sagrada',
      };

      // Mock HubSpot success
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email: 'test@example.com',
            lead_influence_score: '35',
            last_engagement_date: '2025-06-15T00:00:00.000Z',
          },
        });

      nock('https://api.hubapi.com')
        .patch(/\/crm\/v3\/objects\/contacts\/\d+/)
        .reply(200, { success: true });

      // Mock Slack error
      nock('https://slack.com').post('/api/chat.postMessage').reply(401, {
        ok: false,
        error: 'invalid_auth',
      });

      // Act & Assert
      try {
        await dropoutPositivoHandler(config);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });

    it('debe saltear procesamiento si no cumple threshold', async () => {
      // Arrange
      const contactId = '12345';
      const email = 'recent@example.com';

      // Fecha de hace solo 3 días (menos que el threshold de 7)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const config = {
        contactId,
        email,
        lastEngagementDate: threeDaysAgo.toISOString(),
        hubspotApiKey: 'test-hubspot-key',
        slackBotToken: 'xoxb-test-slack-token',
        slackChannel: '#auditoria-sagrada',
        thresholdDays: 7,
      };

      // Mock solo HubSpot GET (no debería llamar PATCH ni Slack)
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email,
            lead_influence_score: '40',
            last_engagement_date: threeDaysAgo.toISOString(),
          },
        });

      // Act
      const result = await dropoutPositivoHandler(config);

      // Assert
      expect(result.success).to.be.false;
      expect(result.daysSinceEngagement).to.be.approximately(3, 1);
      expect(result.previousScore).to.equal(result.newScore); // Score no debería cambiar
      expect(result.slackMessageId).to.equal('');
    });
  });

  describe('🔄 Reintentos y Resilencia', () => {
    it('debe reintentar en caso de error temporal de HubSpot', async () => {
      // Arrange
      const config = {
        contactId: '12345',
        email: 'test@example.com',
        hubspotApiKey: 'test-key',
        slackBotToken: 'xoxb-test-token',
        slackChannel: '#auditoria-sagrada',
      };

      // Mock HubSpot GET - primer intento falla, segundo éxito
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(500, { error: 'Internal Server Error' });

      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email: 'test@example.com',
            lead_influence_score: '35',
            last_engagement_date: '2025-06-15T00:00:00.000Z',
          },
        });

      nock('https://api.hubapi.com')
        .patch(/\/crm\/v3\/objects\/contacts\/\d+/)
        .reply(200, { success: true });

      nock('https://slack.com')
        .post('/api/chat.postMessage')
        .reply(200, { ok: true, ts: '1234567890.123456' });

      // Act
      const result = await dropoutPositivoHandler(config);

      // Assert
      expect(result.success).to.be.true;
    });

    it('debe reintentar en caso de error temporal de Slack', async () => {
      // Arrange
      const config = {
        contactId: '12345',
        email: 'test@example.com',
        hubspotApiKey: 'test-key',
        slackBotToken: 'xoxb-test-token',
        slackChannel: '#auditoria-sagrada',
      };

      // Mock HubSpot success
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email: 'test@example.com',
            lead_influence_score: '35',
            last_engagement_date: '2025-06-15T00:00:00.000Z',
          },
        });

      nock('https://api.hubapi.com')
        .patch(/\/crm\/v3\/objects\/contacts\/\d+/)
        .reply(200, { success: true });

      // Mock Slack - primer intento falla, segundo éxito
      nock('https://slack.com')
        .post('/api/chat.postMessage')
        .reply(429, { error: 'rate_limited' });

      nock('https://slack.com')
        .post('/api/chat.postMessage')
        .reply(200, { ok: true, ts: '1234567890.123456' });

      // Act
      const result = await dropoutPositivoHandler(config);

      // Assert
      expect(result.success).to.be.true;
      expect(result.slackMessageId).to.equal('1234567890.123456');
    });
  });

  describe('📊 Validación de Datos', () => {
    it('debe validar correctamente contactId requerido', async () => {
      // Arrange
      const config = {
        contactId: '',
        email: 'test@example.com',
        hubspotApiKey: 'test-key',
        slackBotToken: 'xoxb-test-token',
        slackChannel: '#auditoria-sagrada',
      };

      // Act & Assert
      try {
        await dropoutPositivoHandler(config);
        expect.fail('Should have thrown an error for empty contactId');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });

    it('debe manejar contact sin fecha de engagement', async () => {
      // Arrange
      const config = {
        contactId: '12345',
        email: 'test@example.com',
        hubspotApiKey: 'test-key',
        slackBotToken: 'xoxb-test-token',
        slackChannel: '#auditoria-sagrada',
      };

      // Mock HubSpot sin last_engagement_date
      nock('https://api.hubapi.com')
        .get(/\/crm\/v3\/objects\/contacts\/\d+/)
        .query(true)
        .reply(200, {
          properties: {
            email: 'test@example.com',
            lead_influence_score: '35',
            // last_engagement_date: undefined
          },
        });

      nock('https://api.hubapi.com')
        .patch(/\/crm\/v3\/objects\/contacts\/\d+/)
        .reply(200, { success: true });

      nock('https://slack.com')
        .post('/api/chat.postMessage')
        .reply(200, { ok: true, ts: '1234567890.123456' });

      // Act
      const result = await dropoutPositivoHandler(config);

      // Assert
      expect(result.success).to.be.true;
      expect(result.daysSinceEngagement).to.equal(999); // Valor por defecto para sin fecha
    });
  });
});
