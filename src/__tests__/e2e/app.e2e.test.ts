/**
 * Tests E2E para la aplicación completa
 */

import request from 'supertest';
import app from '../../app-test';

describe('E2E Tests', () => {
  describe('Health Check', () => {
    it('should return healthy status for health endpoint', async () => {
      const response = await request(app).get('/health');

      // Accept both 200 (healthy) and 206 (degraded with unknown services)
      expect([200, 206]).toContain(response.status);

      expect(response.body).toHaveProperty('status');
      expect(['healthy', 'degraded']).toContain(response.body.status);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('metrics');
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
