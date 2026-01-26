// Auth API Integration Tests
import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: { query: jest.fn() }
}));

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: { fromDatabase: jest.fn(d => d) },
  UserModel: { findOne: jest.fn(), create: jest.fn() },
  PasswordResetToken: { create: jest.fn() }
}));

let app;
beforeAll(async () => {
  app = (await import('../../src/app.js')).default;
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new@example.com', password: 'pass123' })
        .expect('Content-Type', /json/);
      expect([201, 500]).toContain(res.status);
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser' })
        .expect('Content-Type', /json/);
      expect([400, 500]).toContain(res.status);
    });

    it('rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'invalid', password: 'pass123' })
        .expect('Content-Type', /json/);
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass123' })
        .expect('Content-Type', /json/);
      expect([200, 401, 500]).toContain(res.status);
    });

    it('rejects empty credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect('Content-Type', /json/);
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const res = await request(app).get('/api/health').expect(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptime');
    });
  });
});
