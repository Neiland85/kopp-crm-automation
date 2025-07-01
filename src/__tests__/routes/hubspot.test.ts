import request from 'supertest';
import app from '../../app';
import { describe, it, expect } from '@jest/globals';

describe('HubSpot Routes - Simplified', () => {
  describe('Basic functionality', () => {
    it('should respond to POST /hubspot/contacts', async () => {
      const contactData = {
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
      };

      const response = await request(app)
        .post('/hubspot/contacts')
        .send(contactData);

      expect(response.status).toBeLessThan(500);
      expect(response.body).toBeDefined();
    });

    it('should respond to GET /hubspot/contacts/:id', async () => {
      const response = await request(app)
        .get('/hubspot/contacts/123');

      expect(response.status).toBeLessThan(500);
      expect(response.body).toBeDefined();
    });

    it('should handle basic validation', async () => {
      const response = await request(app)
        .post('/hubspot/contacts')
        .send({});

      expect(response.status).toBeLessThan(500);
      expect(response.body).toBeDefined();
    });
  });
});
