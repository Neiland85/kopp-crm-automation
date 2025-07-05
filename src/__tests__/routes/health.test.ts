import request from 'supertest';
import app from '../../app';

describe('Health Route', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health');

    // Acepta tanto 200 (healthy) como 206 (degraded) como válidos
    expect([200, 206]).toContain(response.status);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('services');
  });

  it('should return version information', async () => {
    const response = await request(app)
      .get('/health');

    // Acepta tanto 200 (healthy) como 206 (degraded) como válidos
    expect([200, 206]).toContain(response.status);
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('uptime');
  });
});
