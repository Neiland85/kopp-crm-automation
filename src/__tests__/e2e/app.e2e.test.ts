/**
 * Tests E2E para la aplicación completa
 */

import request from 'supertest';
import app from '../../app-test';

describe('E2E Tests', () => {
  describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('API Endpoints', () => {
    it('should return 200 for test integrations endpoint', async () => {
      const response = await request(app)
        .get('/api/integrations/test')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});
