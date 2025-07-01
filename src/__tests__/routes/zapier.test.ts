import request from 'supertest';
import app from '../../app';

describe('Zapier Routes - Basic Tests', () => {
  test('POST /zapier/hooks/hot-leads should respond', async () => {
    const response = await request(app)
      .post('/zapier/hooks/hot-leads')
      .send({ email: 'test@example.com' });
    
    expect(response.status).toBeLessThan(500);
  });

  test('POST /zapier/hooks/recompensas-escasez should respond', async () => {
    const response = await request(app)
      .post('/zapier/hooks/recompensas-escasez')
      .send({ user_id: '123' });
    
    expect(response.status).toBeLessThan(500);
  });

  test('POST /zapier/hooks/reputometro should respond', async () => {
    const response = await request(app)
      .post('/zapier/hooks/reputometro')
      .send({ business_id: '456' });
    
    expect(response.status).toBeLessThan(500);
  });
});
