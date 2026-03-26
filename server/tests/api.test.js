import request from 'supertest';
import app from '../index.js';

describe('API Health Check', () => {
  describe('GET /api/health', () => {
    it('should return health check message', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Server is running' });
    });

    it('should return valid JSON', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.type).toMatch(/json/);
    });
  });

  describe('Server Configuration', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/health');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
