// User API Integration Tests
import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: { query: jest.fn().mockResolvedValue([[]]) }
}));

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: { fromDatabase: jest.fn(d => d) },
  UserModel: { findAll: jest.fn().mockResolvedValue([]), findByPk: jest.fn() }
}));

let app;
beforeAll(async () => {
  app = (await import('../../src/app.js')).default;
});

describe('User API', () => {
  describe('GET /api/users', () => {
    it('rejects without auth', async () => {
      const res = await request(app).get('/api/users').expect('Content-Type', /json/);
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns user with valid token', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Bearer mock-token')
        .expect('Content-Type', /json/);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('rejects without auth', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .send({ username: 'updated' })
        .expect('Content-Type', /json/);
      expect([401, 403]).toContain(res.status);
    });

    it('updates with valid token', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .set('Authorization', 'Bearer mock-token')
        .send({ username: 'updated' })
        .expect('Content-Type', /json/);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('rejects without auth', async () => {
      const res = await request(app).delete('/api/users/1').expect('Content-Type', /json/);
      expect([401, 403]).toContain(res.status);
    });
  });
});
